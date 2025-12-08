import { useEffect, useRef } from 'react';
import { cn } from '../../../utils/clsx';
import { createPortal } from 'react-dom';
import { useOutsideClick } from '../../hooks/useOutsideClick';

export type tdirection = "bottom" | "right" | "top" | "left"
export type tdirectionAwareContainerProps = {
    children?: React.ReactNode;
    direction?: tdirection;
    // defaults to 10
    offset?: number;

    /** deafult to ["bottom", "right", "top", "left"] */
    directionPriority?: tdirection[];
    active?: boolean,
    onOutsideClick: () => void;
    centerAlignContainer?: boolean;
    className?: string;
} & ({
    activateWith: "ref";
    activatorRef: React.RefObject<HTMLElement | null>;
} | {
    activateWith: "position"
    activationPosition: {
        x: number,
        y: number
    };
})

/**
 * Borrowed from some of my old code will probably give a refactor before going public
 */
const DirectionAwareContainer = (props: tdirectionAwareContainerProps) => {
    const directionOffset = props.offset || 10;
    const directionPriority = props.directionPriority ?? ["bottom", "right", "top", "left"];
    const contentRef = useRef<HTMLDivElement | null>(null);

    const checkWillBeInsideViewPort = ({ x, y }: { x: number, y: number }) => {
        const viewportLeft = window.scrollX;
        const viewportRight = window.scrollX + window.innerWidth;
        const viewportTop = window.scrollY;
        const viewportBottom = window.scrollY + window.innerHeight;
        
        return x >= viewportLeft && x <= viewportRight && y >= viewportTop && y <= viewportBottom;
    }

    useEffect(() => {
        if (!props.active)
            return;

        let currentPriorityIndex = -1;

        // calculates the position of the element and then returns the position of the container.
        const calculatePosition = (direction: tdirectionAwareContainerProps['direction']) => {
            const contentElement = contentRef.current;
            const activatorElement = props.activateWith === "ref" && props?.activatorRef?.current;

            if (!contentElement) return;

            if ((!activatorElement && props.activateWith === "ref"))
                return;

            const triggerElementBounds = props.activateWith === "position" ?
                {
                    top: props.activationPosition.y + window.scrollY,
                    bottom: props.activationPosition.y + window.scrollY,
                    left: props.activationPosition.x + window.scrollX,
                    width: 0,
                    height: 0,
                    right: props.activationPosition.x + window.scrollX,
                    x: props.activationPosition.x + window.scrollX,
                    y: props.activationPosition.y + window.scrollY
                }
                : (() => {
                    const rect = props.activatorRef.current?.getBoundingClientRect() as DOMRect;
                    return {
                        top: rect.top + window.scrollY,
                        bottom: rect.bottom + window.scrollY,
                        left: rect.left + window.scrollX,
                        right: rect.right + window.scrollX,
                        x: rect.x + window.scrollX,
                        y: rect.y + window.scrollY,
                        width: rect.width,
                        height: rect.height
                    };
                })();

            const contentBounds = contentElement.getBoundingClientRect();
            let contentTransform = {
                x: 0,
                y: 0
            };
            let isInsideViewport = false;
            const isCenterAligned = props.centerAlignContainer || false;

            switch (direction) {
                case "top":
                    contentTransform.x = triggerElementBounds.x + (isCenterAligned
                        ? (triggerElementBounds.width / 2 - contentBounds.width / 2)
                        : (-triggerElementBounds.width - contentBounds.width)
                    );
                    contentTransform.y = triggerElementBounds.top - contentBounds.height - directionOffset;
                    isInsideViewport = checkWillBeInsideViewPort({ 
                        x: contentTransform.x + contentBounds.width, 
                        y: contentTransform.y 
                    });
                    break;
                case "left":
                    contentTransform.x = triggerElementBounds.left - contentBounds.width - directionOffset
                    contentTransform.y = triggerElementBounds.bottom - (isCenterAligned
                        ? (triggerElementBounds.height / 2)
                        : (triggerElementBounds.height - directionOffset))
                    isInsideViewport = checkWillBeInsideViewPort({ 
                        x: contentTransform.x, 
                        y: contentTransform.y + contentBounds.height 
                    });
                    break;

                case "right":
                    contentTransform.x = triggerElementBounds.right + directionOffset
                    contentTransform.y = triggerElementBounds.bottom - Math.abs(isCenterAligned
                        ? (triggerElementBounds.height / 2)
                        : (triggerElementBounds.height - directionOffset - contentBounds.height))

                    isInsideViewport = checkWillBeInsideViewPort({ 
                        x: contentTransform.x + contentBounds.width, 
                        y: contentTransform.y + contentBounds.height 
                    });
                    break;

                case "bottom":
                    contentTransform.x = triggerElementBounds.left + (isCenterAligned
                        ? (triggerElementBounds.width / 2 - contentBounds.width / 2)
                        : 0
                    )
                    contentTransform.y = triggerElementBounds.bottom + directionOffset
                    isInsideViewport = checkWillBeInsideViewPort({ 
                        x: contentTransform.x + contentBounds.width, 
                        y: contentTransform.y + contentBounds.height 
                    });
                    break;
            }

            if (isInsideViewport) {
                contentElement.style.transform = `translateX(${contentTransform.x}px) translateY(${contentTransform.y}px)`
                return;
            }

            currentPriorityIndex++;
            if (currentPriorityIndex > 4)
                return;
            calculatePosition(directionPriority[currentPriorityIndex] ?? "bottom");
        };

        calculatePosition(props.direction);
    }, [
        props.activateWith === "ref"
            ? props.activatorRef
            : props.activationPosition,
        props.active
    ]);

    useOutsideClick({
        ref: contentRef,
        callback: props.onOutsideClick,
        active: props.active || false
    });


    if (!props.active)
        return null

    return createPortal(
        (<div
            ref={contentRef}
            className={cn(
                props.className,
                "absolute z-100 top-0 left-0 pointer-events-auto"
            )}>
            {props.children}
        </div>),
        document.body);
};

export default DirectionAwareContainer;
