import { useRef, useEffect, type ComponentProps } from "react";
import { cn } from "../../utils/clsx";
import { TimePickerProvider, useTimePicker, type TimeFormat, type TimeValue } from "./hooks/useTimePicker";
import { TimePickerInput } from "./components/time-picker-input";
import { TimePickerBody } from "./components/time-picker-body";
import DirectionAwareContainer, { type tdirectionAwareContainerProps } from "../Components/helpers/direction-aware-container";

type TimePickerWithoutInput = {
    inputProps?: never;
    shouldShowInput?: false;
};

type TimePickerWithInput = {
    inputProps?: ComponentProps<typeof TimePickerInput>;
    shouldShowInput?: boolean;
};

export type TimePickerProps = {
    format?: TimeFormat;
    defaultTime?: TimeValue;
    className?: string;
    onTimeChange?: (time: TimeValue) => void;
    
    /**
     * Control how and where you show the TimePicker container
     */
    dAwareConProps?: tdirectionAwareContainerProps;
} & (TimePickerWithoutInput | TimePickerWithInput);


const TimePickerContent = ({
    className,
    shouldShowInput = true,
    inputProps,
    onTimeChange,
    dAwareConProps,
    defaultTime
}: Omit<TimePickerProps, 'format'>) => {
    const { timePickerState, setVisibility, setTime } = useTimePicker();
    const timePickerInputRef = useRef<HTMLDivElement>(null);
    const {format} = timePickerState;

    // Handle time change callback
    useEffect(() => {
        if (onTimeChange) {
            onTimeChange(timePickerState.selectedTime);
        }
    }, [timePickerState.selectedTime]);

    useEffect(() =>{
        if (defaultTime)
        setTime(defaultTime);
    },[defaultTime])

    // Merge default props with user props, giving priority to user props
    const baseProps = {
        onOutsideClick: () => setVisibility(false),
        centerAlignContainer: true,
        active: timePickerState.isVisible,
        className: shouldShowInput ? "" : "mt-2",
        direction: "bottom" as const,
        offset: shouldShowInput ? 0 : 10,
        ...dAwareConProps,
    };

    const directionAwareProps: tdirectionAwareContainerProps = shouldShowInput 
        ? {
            ...baseProps,
            activateWith: "ref" as const,
            activatorRef: timePickerInputRef as React.RefObject<HTMLElement | null>,
          }
        : {
            ...baseProps,
            activateWith: "position" as const,
            activationPosition: { x: 0, y: 0 },
          };

    return (
        <>
            {shouldShowInput && (
                <div className="relative" ref={timePickerInputRef}>
                    <TimePickerInput {...inputProps} />
                </div>
            )}
            
            <DirectionAwareContainer {...directionAwareProps}>
                <div className={cn(
                    format === "24hr" ? "w-72" : "w-82",
                    "bg-white",
                    shouldShowInput 
                        ? "border-l border-r border-b border-t border-gray-300 rounded-b-md shadow-lg p-6" 
                        : "border border-gray-300 rounded-md drop-shadow-sm p-6",
                    !shouldShowInput && className
                )}>
                    <TimePickerBody />
                </div>
            </DirectionAwareContainer>
        </>
    );
};
export const TimePicker = ({
    format = "am/pm",
    defaultTime,
    ...props
}: TimePickerProps) => {
    return (
        <TimePickerProvider format={format} defaultTime={defaultTime}>
            <div className="flex flex-col gap-1 w-full">
                <TimePickerContent {...props} />
            </div>
        </TimePickerProvider>
    );
};
