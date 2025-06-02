import { forwardRef } from "react";
import { cn } from "../../../utils/clsx";
import { useRangePicker } from "../hooks/useRangePicker";
import { CALENDAR } from "../../../data/locale";

export interface RangePickerInputProps {
    className?: string;
    placeholder?: string;
}

const RangePickerInput = forwardRef<HTMLDivElement, RangePickerInputProps>(
    ({ className, placeholder = "Select date range..." }, ref) => {
        const { rangePickerState, updateRangePickerVisibility } = useRangePicker();
        const { startDate, endDate, locale, isVisible } = rangePickerState;

        const formatDate = (date: Date | import("../../NepaliDate").NepaliDate) => {
            const monthNames = locale === "en" 
                ? CALENDAR.AD.months 
                : CALENDAR.BS.months;
            
            return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        };

        const getDisplayText = () => {
            if (!startDate && !endDate) {
                return placeholder;
            }
            
            if (startDate && !endDate) {
                return `From: ${formatDate(startDate)}`;
            }
            
            if (startDate && endDate) {
                return `From: ${formatDate(startDate)} To: ${formatDate(endDate)}`;
            }
            
            return placeholder;
        };

        const handleInputClick = () => {
            updateRangePickerVisibility(!isVisible);
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    "cursor-pointer bg-white text-sm",
                    "hover:border-gray-400 transition-colors",
                    className
                )}
                onClick={handleInputClick}
            >
                <span className={cn(
                    (!startDate && !endDate) && "text-gray-500"
                )}>
                    {getDisplayText()}
                </span>
            </div>
        );
    }
);

RangePickerInput.displayName = "RangePickerInput";

export default RangePickerInput;
