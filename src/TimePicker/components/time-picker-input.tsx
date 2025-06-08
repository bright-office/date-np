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
    inputClassName 
}: TimePickerInputProps) => {
    const { timePickerState, setVisibility, getFormattedTime } = useTimePicker();
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (timePickerState.selectedTime) {
            setInputValue(getFormattedTime());
        }
    }, [timePickerState.selectedTime, timePickerState.format, getFormattedTime]);

    const handleInputClick = () => {
        setVisibility(!timePickerState.isVisible);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    return (
        <div className={cn("relative", className)}>
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onClick={handleInputClick}
                placeholder={placeholder}
                readOnly
                className={cn(
                    "w-full px-3 py-2 border border-gray-300 rounded-md",
                    "bg-white text-gray-900 placeholder-gray-500",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    "cursor-pointer",
                    inputClassName
                )}
            />
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
