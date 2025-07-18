import { cn } from "../../../utils/clsx";
import { useTimePicker, type TimeValue } from "../hooks/useTimePicker";
import { TimeColumn } from "./time-column";
import { useEffect, useRef } from "react";

export type TimePickerBodyProps = {
  className?: string;
  /**
   * shouldInclude: object that contains the colums to include in the TimePickerBody
   * e.g. { hours: true, minutes: true, seconds: true, period: true }
   * If not provided, all columns will be included
   */
  shouldInclude?: {
    hours?: boolean;
    minutes?: boolean;
    seconds?: boolean;
  };
  onTimeChange?: (time: TimeValue) => void;
  onSave?: (time: TimeValue) => void;
  buttonClassname?: string;

  // Customization props
  titleClassName?: string;
  titleText?: string;
  columnsContainerClassName?: string;

  // Time column customization
  timeColumnProps?: {
    hours?: {
      label?: string;
      className?: string;
      labelClassName?: string;
      currentValueClassName?: string;
      adjacentValueClassName?: string;
      arrowButtonClassName?: string;
      columnContainerClassName?: string;
    };
    minutes?: {
      label?: string;
      className?: string;
      labelClassName?: string;
      currentValueClassName?: string;
      adjacentValueClassName?: string;
      arrowButtonClassName?: string;
      columnContainerClassName?: string;
    };
    seconds?: {
      label?: string;
      className?: string;
      labelClassName?: string;
      currentValueClassName?: string;
      adjacentValueClassName?: string;
      arrowButtonClassName?: string;
      columnContainerClassName?: string;
    };
    period?: {
      label?: string;
      className?: string;
      labelClassName?: string;
      currentValueClassName?: string;
      adjacentValueClassName?: string;
      arrowButtonClassName?: string;
      columnContainerClassName?: string;
    };
  };
};

export const TimePickerBody = ({ className, ...props }: TimePickerBodyProps) => {
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

  const { selectedTime, format, shouldInclude } = timePickerState;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    container.addEventListener("wheel", handleNativeWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleNativeWheel);
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
      className={cn("flex flex-col items-center space-y-4", className)}
      onWheel={handleWheel}
    >
      <div className="flex justify-between w-full items-center">
        {/* Title */}
        <div className={cn("text-lg font-semibold text-gray-900", props.titleClassName)}>
          {props.titleText || "Select Time"}
        </div>
        <button
          onClick={(e) => props.onSave && props.onSave(selectedTime)}
          className={
            cn("px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400",
              props.buttonClassname
            )}
        >
          Save
        </button>
      </div>

      {/* Time Columns */}
      <div className={cn("flex items-center space-x-8", props.columnsContainerClassName)}>
        {/* Hours */}
        {shouldInclude.hours && (
          <TimeColumn
            label={props.timeColumnProps?.hours?.label || "Hours"}
            value={selectedTime.hours}
            onIncrement={incrementHours}
            onDecrement={decrementHours}
            format={format}
            isHours={true}
            className={props.timeColumnProps?.hours?.className}
            labelClassName={props.timeColumnProps?.hours?.labelClassName}
            currentValueClassName={props.timeColumnProps?.hours?.currentValueClassName}
            adjacentValueClassName={props.timeColumnProps?.hours?.adjacentValueClassName}
            arrowButtonClassName={props.timeColumnProps?.hours?.arrowButtonClassName}
            columnContainerClassName={props.timeColumnProps?.hours?.columnContainerClassName}
          />
        )}
        {/* Minutes */}
        {shouldInclude.minutes && (
          <TimeColumn
            label={props.timeColumnProps?.minutes?.label || "Minutes"}
            value={selectedTime.minutes}
            onIncrement={incrementMinutes}
            onDecrement={decrementMinutes}
            format={format}
            isHours={false}
            className={props.timeColumnProps?.minutes?.className}
            labelClassName={props.timeColumnProps?.minutes?.labelClassName}
            currentValueClassName={props.timeColumnProps?.minutes?.currentValueClassName}
            adjacentValueClassName={props.timeColumnProps?.minutes?.adjacentValueClassName}
            arrowButtonClassName={props.timeColumnProps?.minutes?.arrowButtonClassName}
            columnContainerClassName={props.timeColumnProps?.minutes?.columnContainerClassName}
          />
        )}
        {/* Seconds */}
        {shouldInclude.seconds && (
          <TimeColumn
            label={props.timeColumnProps?.seconds?.label || "Seconds"}
            value={selectedTime.seconds}
            onIncrement={incrementSeconds}
            onDecrement={decrementSeconds}
            format={format}
            isHours={false}
            className={props.timeColumnProps?.seconds?.className}
            labelClassName={props.timeColumnProps?.seconds?.labelClassName}
            currentValueClassName={props.timeColumnProps?.seconds?.currentValueClassName}
            adjacentValueClassName={props.timeColumnProps?.seconds?.adjacentValueClassName}
            arrowButtonClassName={props.timeColumnProps?.seconds?.arrowButtonClassName}
            columnContainerClassName={props.timeColumnProps?.seconds?.columnContainerClassName}
          />
        )}
        {/* AM/PM */}
        {format === "am/pm" && selectedTime.period && (
          <TimeColumn
            label={props.timeColumnProps?.period?.label || "AM/PM"}
            value={selectedTime.period}
            onIncrement={togglePeriod}
            onDecrement={togglePeriod}
            format={format}
            isHours={false}
            className={props.timeColumnProps?.period?.className}
            labelClassName={props.timeColumnProps?.period?.labelClassName}
            currentValueClassName={props.timeColumnProps?.period?.currentValueClassName}
            adjacentValueClassName={props.timeColumnProps?.period?.adjacentValueClassName}
            arrowButtonClassName={props.timeColumnProps?.period?.arrowButtonClassName}
            columnContainerClassName={props.timeColumnProps?.period?.columnContainerClassName}
          />
        )}
      </div>
    </div>
  );
};
