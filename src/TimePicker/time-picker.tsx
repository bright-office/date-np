import { useRef, useEffect, type ComponentProps } from "react";
import { cn } from "../../utils/clsx";
import { TimePickerProvider, useTimePicker, type TimeFormat, type TimeValue } from "./hooks/useTimePicker";
import { TimePickerInput } from "./components/time-picker-input";
import { TimePickerBody } from "./components/time-picker-body";
import DirectionAwareContainer, { type tdirectionAwareContainerProps } from "../Components/helpers/direction-aware-container";
import Label from "../Components/label";
import label from "../Components/label";

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

    /**
     * body props
     */
    bodyProps?: ComponentProps<typeof TimePickerBody>;

    /**
     * label for the time picker 
     */
    label?: string;
} & (TimePickerWithoutInput | TimePickerWithInput);


const TimePickerContent = ({
    className,
    shouldShowInput = true,
    inputProps,
    onTimeChange,
    dAwareConProps,
    defaultTime,
    bodyProps = {},
    label
}: Omit<TimePickerProps, 'format'>) => {
    const { timePickerState, setVisibility, setTime } = useTimePicker();
    const timePickerInputRef = useRef<HTMLDivElement>(null);
    const {format} = timePickerState;
    const shouldInlcude = timePickerState.shouldInclude

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

    // calculate total width based on how many true values are in shouldInclude and time format
    // if all three are true, the width will be 24 * 3 = 72px for 24hr format or 82px for am/pm format
    // if only two are true, the width will be 24 * 2 = 48px for 24hr format or 58px for am/pm format
    // if only one is true, the width will be 24px for 24hr format or 38px for am/pm format
    // if none are true, the width will be 0px
    
    const totalWidth = Object.values(shouldInlcude).filter(Boolean).length * (format === "24hr" ? 24 : 30);
    return (
        <>
            {shouldShowInput && (
                <div className="relative" ref={timePickerInputRef}>
                    <TimePickerInput {...inputProps}  />
                </div>
            )}
            
            <DirectionAwareContainer {...directionAwareProps}>
                <div className={cn(
                    `w-[${totalWidth}px]`,
                    "bg-white",
                    "border border-gray-300 rounded-md drop-shadow-sm p-6",
                    !shouldShowInput && className
                )}>
                    <TimePickerBody {...bodyProps} />
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
        <TimePickerProvider format={format} defaultTime={defaultTime} shouldInclude={{
            hours: props.bodyProps?.shouldInclude?.hours ?? true,
            minutes: props.bodyProps?.shouldInclude?.minutes ?? true,
            seconds: props.bodyProps?.shouldInclude?.seconds ?? true,
        }}>
            <div className="flex flex-col gap-1 w-full">
                {props.label && <Label>{props.label}</Label>}
                <TimePickerContent {...props} />
            </div>
        </TimePickerProvider>
    );
};
