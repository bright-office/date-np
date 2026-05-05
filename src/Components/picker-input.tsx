import React, { useState, useCallback, useRef, useEffect } from "react";
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

  /**
   * Prop to make the picker read only
   */
  disabled?: boolean;

  /**
   * Callback function to register the clearError function
   * Used to clear validation errors when clicking outside the picker
   */
  onRegisterClearError?: (clearErrorFn: () => void) => void;
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
    editable = true,
    onRegisterClearError,
    disabled,
    dateFormat,
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
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const applyMask = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    let masked = "";
    for (let i = 0; i < cleaned.length; i++) {
      if (i === 4 || i === 6) masked += "-";
      masked += cleaned[i];
    }
    return masked.slice(0, 10);
  };

  // Custom hook for handling editable date input (only if editable)
  const editableHook = useEditableDateInput({
    onDateChange: (date) => {
      if (date) {
        updatePickerDay(date, true);
      }
    },
    minDate,
    maxDate,
    currentDate: displayDate,
  });

  // Only use the hook results if editable is true
  const { handleInputChange, error, clearError } = editable
    ? editableHook
    : {
      handleInputChange: () => { },
      error: null,
      clearError: () => { },
    };

  // Create a function to handle clearing errors
  const handleClearError = useCallback(() => {
    if (editable) {
      clearError();
    }
  }, [editable, clearError]);

  // Register the clearError function with the parent component
  useEffect(() => {
    if (onRegisterClearError && editable) {
      onRegisterClearError(handleClearError);
    }
  }, [onRegisterClearError, editable, handleClearError]);

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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!editable) return;
      const target = e.target;
      const maskedValue = applyMask(target.value);
      setInputValue(maskedValue);
      // Determine target type based on locale
      const targetType = locale === "ne" ? "nepali" : "date";
      handleInputChange(maskedValue, targetType);
    },
    [handleInputChange, editable, locale]
  );

  const handleFocus = useCallback(() => {
    if (!editable) return;
    setIsEditing(true);
    if (displayDate) {
      // Set the content to ISO format for editing
      setInputValue(formatISO(displayDate));
    } else {
      setInputValue("");
    }
  }, [displayDate, editable]);

  const handleBlur = useCallback(() => {
    if (!editable) return;
    setIsEditing(false);
    // Clear error when blurring
    handleClearError();
  }, [editable, handleClearError]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!editable) return;
      if (e.key === "Enter") {
        e.preventDefault();
        e.currentTarget.blur();
      } else if (e.key === "Escape") {
        e.preventDefault();
        // Reset content and blur
        if (displayDate) {
          const isoDate = formatISO(displayDate);
          setInputValue(isoDate);
          handleInputChange(isoDate, locale === "ne" ? "nepali" : "date");
        } else {
          setInputValue("");
          handleInputChange("", locale === "ne" ? "nepali" : "date");
        }
        e.currentTarget.blur();
      }
    },
    [displayDate, editable, handleInputChange, locale]
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
    const { defaultLocale, defaultDate, ...rest } = inputProps;
    return (
      <div className="inputContainer" {...rest}>
        <div
          ref={ref}
          className={cn(
            "relative flex h-9.25 items-center justify-between",
            cn(
              "w-full rounded-md border border-gray-200 px-3 py-2",
              "cursor-pointer font-[450] text-gray-400 focus:outline-none",
              "bg-gray-100/40 text-sm transition-color",

              disabled &&
              "border-outline-neutral bg-neutral-100 text-gray-400/80  cursor-not-allowed"
            ),
            className
          )}
          onClick={handleInputClick}
        >
          <div className="flex items-center">
            {/* Date input field */}
            <input
              ref={inputRef}
              type="text"
              className={cn(
                "min-w-20 p-1 cursor-text bg-transparent",
                !displayDate && !isEditing && "text-gray-500",
                isEditing && "bg-blue-50 rounded-md text-gray-500",
                error && "bg-red-50 text-red-600 border-red-300"
              )}
              style={{ outline: "none" }}
              value={isEditing ? inputValue : (displayDate ? formatDate(displayDate) : "")}
              onChange={handleDateInput}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              aria-label="Date input"
              placeholder={inputProps.placeholder || "YYYY-MM-DD"}
            />
          </div>

          <svg
            className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            onClick={(e) => {
              e.stopPropagation();
              updatePickerVisiblity(true);
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>

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
    <div className="inputContainer" {...inputProps}>
      <div
        onClick={handleInputClick}
        ref={ref}
        className={cn(
          "appearance-none flex items-center justify-between",
          cn(
            disabled &&
            "border-outline-neutral bg-neutral-100 text-gray-400/80  cursor-not-allowed",
            "w-full rounded-md border border-gray-300 px-3 py-2",
            "cursor-pointer font-[450] text-gray-400 focus:outline-none",
            "bg-gray-100/40 text-sm transition-color"
          ),
          className
        )}
      >
        <span>{getDisplayContent()}</span>
        <svg
          className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          onClick={(e) => {
            e.stopPropagation();
            updatePickerVisiblity(true);
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );
});

export default PickerInput;
