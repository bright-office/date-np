import { forwardRef, useRef, useState, useCallback } from "react";
import { cn } from "../../../utils/clsx";
import { useRangePicker } from "../hooks/useRangePicker";
import { useEditableDateInput } from "../hooks/useEditableDateInput";
import { format, formatISO } from "../../format";
import { NepaliDate } from "../../NepaliDate";

export interface RangePickerInputProps {
  className?: string;
  placeholder?: string;
  dateFormat?: string;
  /**
   * Enable editable date input functionality
   * Allows users to type dates directly in ISO format (YYYY-MM-DD)
   * @default false
   */
  editable?: boolean;
}

const RangePickerInput = forwardRef<HTMLDivElement, RangePickerInputProps>(
  (
    { className, placeholder = "Select Date..", dateFormat, editable = false },
    ref
  ) => {
    const {
      rangePickerState,
      updateRangePickerVisibility,
      getDisplayDateRange,
      updateRangePickerDay,
    } = useRangePicker();
    const { isVisible, minDate, maxDate } = rangePickerState;

    // Get the dates to display - either selected dates or default dates as fallback
    const { startDate, endDate } = getDisplayDateRange();

    // State to track which input is being edited (only if editable)
    const [editingField, setEditingField] = useState<"start" | "end" | null>(
      null
    );
    const startInputRef = useRef<HTMLDivElement>(null);
    const endInputRef = useRef<HTMLDivElement>(null);

    // Custom hook for handling editable date input (only if editable)
    const editableHook = useEditableDateInput({
      onStartDateChange: (date) => {
        if (date) {
          updateRangePickerDay(date, "start");
        }
      },
      onEndDateChange: (date) => {
        if (date) {
          updateRangePickerDay(date, "end");
        }
      },
      minDate,
      maxDate,
      currentStartDate: startDate,
      currentEndDate: endDate,
    });

    // Only use the hook results if editable is true
    const { handleInputChange, errors } = editable
      ? editableHook
      : {
          handleInputChange: () => {},
          errors: { start: null, end: null },
        };

    const formatDate = (date: Date | NepaliDate) => {
      if (dateFormat) {
        return format(date, dateFormat);
      }
      return formatISO(date);
    };

    const handleInputClick = (e: React.MouseEvent) => {
      // Don't toggle visibility if clicking on editable content
      if (editable && editingField) {
        e.stopPropagation();
        return;
      }
      updateRangePickerVisibility(!isVisible);
    };

    // Editable-specific handlers (only used when editable is true)
    const handleStartDateInput = useCallback(
      (e: React.FormEvent<HTMLDivElement>) => {
        if (!editable) return;
        const target = e.currentTarget;
        const value = target.textContent || "";
        handleInputChange(value, "start");
      },
      [handleInputChange, editable]
    );

    const handleEndDateInput = useCallback(
      (e: React.FormEvent<HTMLDivElement>) => {
        if (!editable) return;
        const target = e.currentTarget;
        const value = target.textContent || "";
        handleInputChange(value, "end");
      },
      [handleInputChange, editable]
    );

    const handleStartFocus = useCallback(() => {
      if (!editable) return;
      setEditingField("start");
      if (startInputRef.current && startDate) {
        // Set the content to ISO format for editing
        startInputRef.current.textContent = formatISO(startDate);
      }
    }, [startDate, editable]);

    const handleEndFocus = useCallback(() => {
      if (!editable) return;
      setEditingField("end");
      if (endInputRef.current && endDate) {
        // Set the content to ISO format for editing
        endInputRef.current.textContent = formatISO(endDate);
      }
    }, [endDate, editable]);

    const handleStartBlur = useCallback(() => {
      if (!editable) return;
      setEditingField(null);
      // Reset to formatted display if there's a valid date
      if (startInputRef.current && startDate) {
        startInputRef.current.textContent = formatDate(startDate);
      }
    }, [startDate, formatDate, editable]);

    const handleEndBlur = useCallback(() => {
      if (!editable) return;
      setEditingField(null);
      // Reset to formatted display if there's a valid date
      if (endInputRef.current && endDate) {
        endInputRef.current.textContent = formatDate(endDate);
      }
    }, [endDate, formatDate, editable]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent, type: "start" | "end") => {
        if (!editable) return;
        if (e.key === "Enter") {
          e.preventDefault();
          const target = e.currentTarget as HTMLDivElement;
          target.blur();
        } else if (e.key === "Escape") {
          e.preventDefault();
          const target = e.currentTarget as HTMLDivElement;
          // Reset content and blur
          if (type === "start" && startDate) {
            target.textContent = formatDate(startDate);
          } else if (type === "end" && endDate) {
            target.textContent = formatDate(endDate);
          }
          target.blur();
        }
      },
      [startDate, endDate, formatDate, editable]
    );

    // Non-editable display function
    const getDisplayText = () => {
      if (!startDate && !endDate) {
        return "";
      }

      if (startDate && !endDate) {
        return `From: ${formatDate(startDate)}`;
      }

      if (startDate && endDate) {
        return `From: ${formatDate(startDate)} To: ${formatDate(endDate)}`;
      }

      return "";
    };

    // Render editable version
    if (editable) {
      return (
        <div
          ref={ref}
          className={cn(
            "relative",
            cn(
              "w-full px-3 py-2 border border-gray-300 rounded-md",
              "focus:outline-none cursor-pointer text-gray-400 font-[450]",
              "bg-gray-100/40 text-sm hover:border-gray-400 transition-colors"
            ),
            className
          )}
          onClick={handleInputClick}
        >
          <div className="flex items-center gap-1">
            {/* From label */}
            <span className="text-gray-700">From:</span>

            {/* Start date input */}
            <div
              ref={startInputRef}
              className={cn(
                "inline-block min-w-[100px] px-1 rounded border-0 outline-none focus:bg-blue-50 cursor-text",
                !startDate && "text-gray-500",
                errors.start && "bg-red-50 text-red-600"
              )}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={handleStartDateInput}
              onFocus={handleStartFocus}
              onBlur={handleStartBlur}
              onKeyDown={(e) => handleKeyDown(e, "start")}
              role="textbox"
              aria-label="Start date"
              data-placeholder={startDate ? undefined : "YYYY-MM-DD"}
            >
              {startDate ? formatDate(startDate) : "YYYY-MM-DD"}
            </div>

            {/* To label and end date input - only show if we have a start date or are editing */}
            {
              <>
                <span className="text-gray-700 ml-2">To:</span>

                {/* End date input */}
                <div
                  ref={endInputRef}
                  className={cn(
                    "inline-block min-w-[100px] px-1 rounded border-0 outline-none focus:bg-blue-50 cursor-text",
                    !endDate && "text-gray-500",
                    errors.end && "bg-red-50 text-red-600"
                  )}
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onInput={handleEndDateInput}
                  onFocus={handleEndFocus}
                  onBlur={handleEndBlur}
                  onKeyDown={(e) => handleKeyDown(e, "end")}
                  role="textbox"
                  aria-label="End date"
                  data-placeholder={endDate ? undefined : "YYYY-MM-DD"}
                >
                  {endDate ? formatDate(endDate) : "YYYY-MM-DD"}
                </div>
              </>
            }

            {/* Placeholder text when no dates are selected */}
            {!startDate &&
              !endDate &&
              editingField !== "start" &&
              editingField !== "end" && (
                <span className="text-gray-500">
                  {editable ? "" : placeholder}
                </span>
              )}
          </div>

          {/* Error messages */}
          {(errors.start || errors.end) && (
            <div className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-white border border-red-200 rounded px-2 py-1 shadow-sm z-10">
              {errors.start && <div>Start: {errors.start}</div>}
              {errors.end && <div>End: {errors.end}</div>}
            </div>
          )}
        </div>
      );
    }

    // Render non-editable version (original behavior)
    return (
      <div
        ref={ref}
        className={cn(
          className
            ? className
            : cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md",
                "focus:outline-none cursor-pointer text-gray-400 font-[450]",
                "bg-gray-100/40 text-sm hover:border-gray-400 transition-colors"
              )
        )}
        onClick={handleInputClick}
      >
        <span className={cn(!startDate && !endDate && "text-gray-500")}>
          {getDisplayText().length < 1 ? placeholder : getDisplayText()}
        </span>
      </div>
    );
  }
);

RangePickerInput.displayName = "RangePickerInput";

export default RangePickerInput;
