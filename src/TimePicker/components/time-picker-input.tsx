import { useState, useRef, useEffect } from "react";
import { cn } from "../../../utils/clsx";
import { useTimePicker } from "../hooks/useTimePicker";

export type TimePickerInputProps = {
    placeholder?: string;
    className?: string;
    inputClassName?: string;
};

export const TimePickerInput = ({ 
    placeholder = "Select Time", 
    className,
    inputClassName,
}: TimePickerInputProps) => {
    const { 
        timePickerState, 
        setVisibility, 
        getFormattedTime, 
        handleKeyInput, 
        setCurrentInputPosition,
        getFormattedTimeWithHighlight
    } = useTimePicker();

    const shouldInclude = timePickerState.shouldInclude
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (timePickerState.selectedTime) {
            setInputValue(getFormattedTime());
        }
    }, [timePickerState.selectedTime, timePickerState.format, getFormattedTime]);

    const handleInputClick = () => {
        // Only open the picker if it's currently closed
        // Let the outside click handler handle closing
        if (!timePickerState.isVisible) {
            setVisibility(true);
            if (shouldInclude.hours) {
                setCurrentInputPosition("hours");
            } else if (shouldInclude.minutes) {
                setCurrentInputPosition("minutes");
            } else if (shouldInclude.seconds) {
                setCurrentInputPosition("seconds");
            }
        }
        if (timePickerState.isVisible)
            setVisibility(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // This is primarily for manual editing - we'll keep it for compatibility
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            // Move to next position on Tab
            const { currentInputPosition } = timePickerState;
            if (currentInputPosition === "hours") {
                if (shouldInclude.minutes) {
                setCurrentInputPosition("minutes");
                } else if (shouldInclude.seconds) {
                    setCurrentInputPosition("seconds");
                }
            } else if (currentInputPosition === "minutes") {
                if (shouldInclude.seconds) {
                    setCurrentInputPosition("seconds");
                } else if (shouldInclude.hours) {
                    setCurrentInputPosition("hours");
                }
            } else if (currentInputPosition === "seconds") {
                if (shouldInclude.hours) {
                    setCurrentInputPosition("hours");
                } else if (shouldInclude.minutes) {
                    setCurrentInputPosition("minutes");
                }
            }
            return;
        }

        if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            const wasAccepted = handleKeyInput(e.key);
            if (wasAccepted) {
                // Update the input value immediately
                setInputValue(getFormattedTime());
            }
        }
    };

    const handleFocus = () => {
        // Only set input position if picker is already visible
        // Don't force visibility on focus to avoid conflicts with click handler
        if (timePickerState.isVisible) {
            if (shouldInclude.hours) {
            setCurrentInputPosition("hours");
            } else if (shouldInclude.minutes) {
            setCurrentInputPosition("minutes");
            }
            else if (shouldInclude.seconds) {
            setCurrentInputPosition("seconds");
            }
        }
    };

    // Create highlighted input display
    const createHighlightedDisplay = () => {
        const { display } = getFormattedTimeWithHighlight();
        const { currentInputPosition } = timePickerState;
        
        if (!timePickerState.isVisible) {
            return display;
        }

        // Create highlighted version based on current position
        let highlightStart = 0;
        let highlightEnd = 0;

        switch (currentInputPosition) {
            case "hours":
                highlightStart = 0;
                highlightEnd = 2;
                break;
            case "minutes":
                highlightStart = 3;
                highlightEnd = 5;
                break;
            case "seconds":
                highlightStart = 6;
                highlightEnd = 8;
                break;
        }

        return {
            before: display.slice(0, highlightStart),
            highlighted: display.slice(highlightStart, highlightEnd),
            after: display.slice(highlightEnd),
        };
    };

    const displayValue = createHighlightedDisplay();

    return (
        <div className={cn("relative", className)}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onClick={handleInputClick}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    placeholder={placeholder}
                    className={cn(
                        "w-full px-3 py-2 border border-gray-300 rounded-md",
                        "bg-white text-gray-900 placeholder-gray-500",
                        "focus:outline-none focus:border-b-1",
                        "cursor-text font-mono",
                        "caret-white",
                        inputClassName
                    )}
                />
                
                {/* Overlay for highlighting current position */}
                {timePickerState.isVisible && typeof displayValue === 'object' && (
                    <div className="absolute inset-0 px-3 py-2 pointer-events-none flex items-center font-mono">
                        <span className="text-transparent">
                            {displayValue.before}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-1 rounded">
                            {displayValue.highlighted}
                        </span>
                        <span className="text-transparent">
                            {displayValue.after}
                        </span>
                    </div>
                )}
            </div>
            
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg 
                    className="w-4 h-4 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                </svg>
            </div>
        </div>
    );
};
