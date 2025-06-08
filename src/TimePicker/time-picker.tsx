import { useRef, useEffect, type ComponentProps } from "react";
import { cn } from "../../utils/clsx";
import { TimePickerProvider, useTimePicker, type TimeFormat, type TimeValue } from "./hooks/useTimePicker";
import { TimePickerInput } from "./components/time-picker-input";
import { TimePickerBody } from "./components/time-picker-body";

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
    defaultTime?: Partial<TimeValue>;
    className?: string;
    onTimeChange?: (time: TimeValue) => void;
} & (TimePickerWithoutInput | TimePickerWithInput);

const TimePickerContent = ({
    className,
    shouldShowInput = true,
    inputProps,
    onTimeChange,
}: Omit<TimePickerProps, 'format' | 'defaultTime'>) => {
    const { timePickerState, setVisibility } = useTimePicker();
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setVisibility(false);
            }
        };

        if (timePickerState.isVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [timePickerState.isVisible, setVisibility]);

    // Handle time change callback
    useEffect(() => {
        if (onTimeChange) {
            onTimeChange(timePickerState.selectedTime);
        }
    }, [timePickerState.selectedTime, onTimeChange]);

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            {shouldShowInput && (
                <TimePickerInput {...inputProps} />
            )}
            
            {timePickerState.isVisible && (
                <div className={cn(
                    "absolute z-50 mt-2",
                    shouldShowInput ? "top-full left-0" : "top-0 left-0"
                )}>
                    <TimePickerBody />
                </div>
            )}
        </div>
    );
};

export const TimePicker = ({
    format = "am/pm",
    defaultTime,
    ...props
}: TimePickerProps) => {
    return (
        <TimePickerProvider format={format} defaultTime={defaultTime}>
            <TimePickerContent {...props} />
        </TimePickerProvider>
    );
};
