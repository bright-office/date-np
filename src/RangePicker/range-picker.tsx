import { useRef, useEffect, type ComponentProps } from "react";
import { cn } from "../../utils/clsx";
import DirectionAwareContainer from "../Components/helpers/direction-aware-container";
import RangePickerBody from "./Components/range-picker-body";
import RangePickerHeader from "./Components/range-picker-header";
import RangePickerInput from "./Components/range-picker-input";
import { RangePickerProvider, useRangePicker } from "./hooks/useRangePicker";
import { type tdirectionAwareContainerProps } from "../Components/helpers/direction-aware-container";
import { LocaleSwitcher } from "./Components/locale-switcher";

type tRangePickerWithoutInput = {
    /**
     * Note:
     * You should have `shouldShowInput` set to true in order to
     * give input props
     */
    inputProps?: never;
    shouldShowInput?: false;
}

type tRangePickerWithInput = {
    /**
     * customize input with input specific props.
     * visit: #docs for more information on this.
     */
    inputProps?: ComponentProps<typeof RangePickerInput>;

    /**
     * Specify whether to show the picker input or not
     * @defaults to true
     */
    shouldShowInput?: boolean;
}

export type tRangePickerProps = {
    /** 
     * className for styling the main picker
     */
    className?: string;

    /**
     * Provide individual styling to different components.
     */
    classNames?: {
        leftPanel?: string;
        rightPanel?: string;
        container?: string;
    };

    /**
     * Control how and where you show the Picker container
     */
    dAwareConProps?: tdirectionAwareContainerProps;

    /**
     * Callback function called when date range selection is complete
     */
    onRangeSelect?: (startDate: Date | import("../NepaliDate").NepaliDate | null, endDate: Date | import("../NepaliDate").NepaliDate | null) => void;

    /**
     * Callback function called when the picker visibility changes
     */
    onVisibilityChange?: (isVisible: boolean) => void;
} & (tRangePickerWithInput | tRangePickerWithoutInput);

const RangePicker = (props: tRangePickerProps) => {
    const {
        shouldShowInput = true,
        className,
        classNames = {},
        inputProps: rangePickerInputProps = {},
        dAwareConProps = {},
        onRangeSelect,
        onVisibilityChange,
    } = props;

    const rangePickerInputRef = rangePickerInputProps?.ref ?? useRef<HTMLDivElement>(null);

    let RangePickerContent = () => {
        const { rangePickerState, updateRangePickerVisibility, clearSelection } = useRangePicker();
        const { isVisible, startDate, endDate } = rangePickerState;

        // Call callbacks when state changes
        useEffect(() => {
            if (onRangeSelect && startDate && endDate) {
                onRangeSelect(startDate, endDate);
            }
        }, [startDate, endDate, onRangeSelect]);

        useEffect(() => {
            if (onVisibilityChange) {
                onVisibilityChange(isVisible);
            }
        }, [isVisible, onVisibilityChange]);

        const handleOutsideClick = () => {
            updateRangePickerVisibility(false);
        };

        const handleClearSelection = () => {
            clearSelection();
        };

        return (
            <DirectionAwareContainer
                direction="bottom"
                activateWith="ref"
                //@ts-ignore
                activatorRef={rangePickerInputRef}
                onOutsideClick={handleOutsideClick}
                centerAlignContainer
                active={isVisible}
                {...dAwareConProps}
            >
                <div className={cn(
                    "flex flex-col gap-4 w-max h-max bg-white p-4 rounded-lg",
                    "shadow-md",
                    classNames.container,
                    className
                )}>
                    {/* Calendar Panels */}
                    <div className="flex gap-4">
                        {/* Left Panel */}
                        <div className={cn(
                            "flex flex-col gap-2 w-72",
                            classNames.leftPanel
                        )}>
                            <RangePickerHeader panel="left" />
                            <RangePickerBody panel="left" />
                        </div>

                        {/* Divider */}
                        <div className="w-px bg-gray-200 my-2" />

                        {/* Right Panel */}
                        <div className={cn(
                            "flex flex-col gap-2 w-72",
                            classNames.rightPanel
                        )}>
                            <RangePickerHeader panel="right" />
                            <RangePickerBody panel="right" />
                        </div>
                    </div>

                    {/* Footer with actions: clear and toggle (AD/BS) left out currently. Need to move from left panel header to here. */}
                    { (
                        <div className="flex justify-end pt-3 gap-2 ">
                            {
                            startDate && endDate &&
                            <button
                                onClick={(e)=>{
                                    e.stopPropagation()
                                    handleClearSelection()
                                }}
                                className={cn(
                                    "px-3 py-1 text-xs rounded border hover:cursor-pointer",
                                    "hover:bg-gray-50 transition-colors",
                                    "text-gray-600 border-gray-300"
                                )}
                            >
                                Clear
                            </button>
                            }      
                            <LocaleSwitcher />
                        </div>
                    )}
                </div>
            </DirectionAwareContainer>
        );
    };

    return (
        <RangePickerProvider>
            {shouldShowInput && (
                <RangePickerInput
                    // @ts-ignore
                    ref={rangePickerInputRef}
                    {...rangePickerInputProps}
                />
            )}
            <RangePickerContent />
        </RangePickerProvider>
    );
};

export default RangePicker;
