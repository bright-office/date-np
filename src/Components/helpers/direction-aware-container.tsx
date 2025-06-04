import { useEffect, useRef } from 'react';
import { cn } from '../../../utils/clsx.ts';
import { createPortal } from 'react-dom';
import { useOutsideClick } from '../../hooks/useOutsideClick.ts';

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

    const checkWillBeInsideViewPort = ({ x, y }: { x: number, y: number }) => x < innerWidth && x > 0 && y < innerHeight && y > 0

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
                    top: props.activationPosition.y,
                    bottom: props.activationPosition.y,
                    left: props.activationPosition.x,
                    width: 0,
                    height: 0,
                    right: props.activationPosition.x,
                    x: props.activationPosition.x,
                    y: props.activationPosition.y
                }
                : props.activatorRef.current?.getBoundingClientRect() as DOMRect;

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
                    isInsideViewport = checkWillBeInsideViewPort({ x: contentTransform.x - contentBounds.width, y: contentTransform.y });
                    break;
                case "left":
                    contentTransform.x = triggerElementBounds.left - contentBounds.width - directionOffset
                    contentTransform.y = triggerElementBounds.bottom - (isCenterAligned
                        ? (triggerElementBounds.height / 2)
                        : (triggerElementBounds.height - directionOffset))
                    isInsideViewport = checkWillBeInsideViewPort({ x: contentTransform.x, y: contentTransform.y + contentBounds.height });
                    break;

                case "right":
                    contentTransform.x = triggerElementBounds.right + directionOffset
                    contentTransform.y = triggerElementBounds.bottom - Math.abs(isCenterAligned
                        ? (triggerElementBounds.height / 2)
                        : (triggerElementBounds.height - directionOffset - contentBounds.height))

                    isInsideViewport = checkWillBeInsideViewPort({ x: contentTransform.x + contentBounds.width, y: contentTransform.y + contentBounds.height });
                    break;

                case "bottom":
                    contentTransform.x = triggerElementBounds.left + (isCenterAligned
                        ? (triggerElementBounds.width / 2 - contentBounds.width / 2)
                        : (triggerElementBounds.width + directionOffset)
                    )
                    contentTransform.y = triggerElementBounds.bottom + directionOffset
                    isInsideViewport = checkWillBeInsideViewPort({ x: contentTransform.x + contentBounds.width, y: contentTransform.y + contentBounds.height });
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
                "fixed z-50 top-0 left-0"
            )}>
            {props.children}
        </div>),
        document.body);
};

export default DirectionAwareContainer;
