import React, { useState, useCallback, useRef } from "react";
import { cn } from "../../utils/clsx";
import { usePicker } from "../hooks/usePicker";
import { useEditableDateInput } from "../hooks/useEditableDateInput";
import { format, formatISO } from "../format";
import { NepaliDate } from "../NepaliDate";

type tpickerInputProps = {
  label?: string;
  className?: string;
  required?: boolean;

  /**
   * default date for the picker
   * by default, the selected date is null
   */
  defaultDate?: Date | import("../NepaliDate").NepaliDate;

  /**
   * format for the date input
   * @default ISO
   */
  dateFormat?: string;

  /**
   * default mode for the picker
   * @default "ad"
   */
  defaultLocale?: "AD" | "BS";

  /**
   * Enable editable date input functionality
   * Allows users to type dates directly in ISO format (YYYY-MM-DD)
   * @default false
   */
  editable?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

type tpickerInputImperativeProps = {} & HTMLInputElement;

const PickerInput = React.forwardRef<
  tpickerInputImperativeProps,
  tpickerInputProps
>((props, ref) => {
  const {
    required = false,
    className,
    label,
    name,
    editable = false,
    ...inputProps
  } = props;

  const {
    updatePickerVisiblity,
    pickerState,
    getDisplayDate,
    updatePickerDay,
  } = usePicker();
  const { isVisible, minDate, maxDate, locale } = pickerState;

  // Get the date to display - either selectedDate or defaultDate as fallback
  const displayDate = getDisplayDate();

  // State for tracking if we're currently editing (only if editable)
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  // Custom hook for handling editable date input (only if editable)
  const editableHook = useEditableDateInput({
    onDateChange: (date) => {
      if (date) {
        updatePickerDay(date);
      }
    },
    minDate,
    maxDate,
    currentDate: displayDate,
  });

  // Only use the hook results if editable is true
  const { handleInputChange, error } = editable
    ? editableHook
    : {
        handleInputChange: () => {},
        error: null,
      };

  const formatDate = (date: Date | NepaliDate) => {
    if (props.dateFormat) {
      return format(date, props.dateFormat);
    }
    return formatISO(date);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    // Don't toggle visibility if clicking on editable content and currently editing
    if (editable && isEditing) {
      e.stopPropagation();
      return;
    }
    updatePickerVisiblity(!isVisible);
  };

  // Editable-specific handlers (only used when editable is true)
  const handleDateInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      if (!editable) return;
      const target = e.currentTarget;
      const value = target.textContent || "";
      // Determine target type based on locale
      const targetType = locale === "ne" ? "nepali" : "date";
      handleInputChange(value, targetType);
    },
    [handleInputChange, editable, locale]
  );

  const handleFocus = useCallback(() => {
    if (!editable) return;
    setIsEditing(true);
    if (inputRef.current && displayDate) {
      // Set the content to ISO format for editing
      inputRef.current.textContent = formatISO(displayDate);
    }
  }, [displayDate, editable]);

  const handleBlur = useCallback(() => {
    if (!editable) return;
    setIsEditing(false);
    // Reset to formatted display if there's a valid date
    if (inputRef.current && displayDate) {
      inputRef.current.textContent = formatDate(displayDate);
    }
  }, [displayDate, formatDate, editable]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!editable) return;
      if (e.key === "Enter") {
        e.preventDefault();
        const target = e.currentTarget as HTMLDivElement;
        target.blur();
      } else if (e.key === "Escape") {
        e.preventDefault();
        const target = e.currentTarget as HTMLDivElement;
        // Reset content and blur
        if (displayDate) {
          target.textContent = formatDate(displayDate);
        }
        target.blur();
      }
    },
    [displayDate, formatDate, editable]
  );

  // Get display content based on editing state and editable prop
  const getDisplayContent = () => {
    if (!displayDate) {
      return inputProps.placeholder || "Select a date";
    }

    if (editable && isEditing) {
      return formatISO(displayDate);
    }

    return formatDate(displayDate);
  };

  // Render editable version
  if (editable) {
    return (
      <div className="inputContainer">
        <div
          ref={ref}
          className={cn(
            "relative flex h-[37px] items-center",
            cn(
              "w-full rounded-md border border-gray-300 px-3 py-2",
              "cursor-pointer font-[450] text-gray-400 focus:outline-none",
              "bg-gray-100/40 text-sm transition-color"
            ),
            className
          )}
          onClick={handleInputClick}
        >
          <div className="flex items-center">
            {/* Date input field */}
            <div
              ref={inputRef}
              className={cn(
                "min-w-[80px] p-1 cursor-text",
                !displayDate && "text-gray-500",
                isEditing && "bg-blue-50 rounded-md text-gray-500",
                error && "bg-red-50 text-red-600 border-red-300"
              )}
              style={{ outline: "none" }}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={handleDateInput}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              aria-label="Date input"
              data-placeholder={displayDate ? undefined : "YYYY-MM-DD"}
            >
              {displayDate
                ? formatDate(displayDate)
                : inputProps.placeholder || "YYYY-MM-DD"}
            </div>
          </div>

          {/* Error message tooltip */}
          {error && (
            <div className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-white border border-red-200 rounded px-2 py-1 shadow-sm z-10">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render non-editable version (original behavior)
  return (
    <div className="inputContainer">
      <div
        onClick={handleInputClick}
        ref={ref}
        className={cn("appearance-none", className)}
        {...inputProps}
      >
        {getDisplayContent()}
      </div>
    </div>
  );
});

export default PickerInput;
