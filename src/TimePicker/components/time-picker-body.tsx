import { cn } from "../../../utils/clsx";
import { useTimePicker } from "../hooks/useTimePicker";
import { TimeColumn } from "./time-column";
import { useEffect, useRef } from "react";

export type TimePickerBodyProps = {
    className?: string;
};

export const TimePickerBody = ({ className }: TimePickerBodyProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const {
        timePickerState,
        incrementHours,
        decrementHours,
        incrementMinutes,
        decrementMinutes,
        incrementSeconds,
        decrementSeconds,
        togglePeriod,
    } = useTimePicker();

    const { selectedTime, format } = timePickerState;

    // Add native wheel event listener to prevent document scrolling
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleNativeWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        container.addEventListener('wheel', handleNativeWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleNativeWheel);
        };
    }, []);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Also prevent the native wheel event to ensure document doesn't scroll
        if (e.nativeEvent) {
            e.nativeEvent.preventDefault();
            e.nativeEvent.stopImmediatePropagation();
        }
    };

    return (
        <div 
            ref={containerRef}
            className={cn(
                "bg-white rounded-lg shadow-lg border border-gray-200 p-6",
                "flex flex-col items-center space-y-4",
                className
            )}
            onWheel={handleWheel}
        >
            {/* Title */}
            <div className="text-lg font-semibold text-gray-900 mb-2">
                Select Time
            </div>

        
            {/* Time Columns */}
            <div className="flex items-center space-x-8">
                {/* Hours */}
                <TimeColumn
                    label="Hours"
                    value={selectedTime.hours}
                    onIncrement={incrementHours}
                    onDecrement={decrementHours}
                    format={format}
                    isHours={true}
                />

                {/* Minutes */}
                <TimeColumn
                    label="Minutes"
                    value={selectedTime.minutes}
                    onIncrement={incrementMinutes}
                    onDecrement={decrementMinutes}
                    format={format}
                    isHours={false}
                />

                {/* Seconds */}
                <TimeColumn
                    label="Seconds"
                    value={selectedTime.seconds}
                    onIncrement={incrementSeconds}
                    onDecrement={decrementSeconds}
                    format={format}
                    isHours={false}
                />

                {/* AM/PM */}
                {format === "am/pm" && selectedTime.period && (
                    <TimeColumn
                        label="AM/PM"
                        value={selectedTime.period}
                        onIncrement={togglePeriod}
                        onDecrement={togglePeriod}
                        format={format}
                        isHours={false}
                    />
                )}
            </div>
        </div>
    );
};
