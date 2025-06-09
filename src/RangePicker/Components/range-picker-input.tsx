import { forwardRef } from "react";
import { cn } from "../../../utils/clsx";
import { useRangePicker } from "../hooks/useRangePicker";
import { format, formatISO } from "../../format";

export interface RangePickerInputProps {
    className?: string;
    placeholder?: string;
    dateFormat?: string;
}

const RangePickerInput = forwardRef<HTMLDivElement, RangePickerInputProps>(
    ({ className, placeholder = "Select date range...", dateFormat }, ref) => {
        const { rangePickerState, updateRangePickerVisibility, getDisplayDateRange } = useRangePicker();
        const { isVisible } = rangePickerState;

        // Get the dates to display - either selected dates or default dates as fallback
        const { startDate, endDate } = getDisplayDateRange();

        const formatDate = (date: Date | import("../../NepaliDate").NepaliDate) => {
            if (dateFormat) {
                return format(date, dateFormat);
            }
            return formatISO(date);
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
