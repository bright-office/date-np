import { useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "../../../utils/clsx";
import { areDatesEqual, compareDates, isDateBetween } from "../../../utils/validators";
import { useRangePicker } from "../hooks/useRangePicker";
import { NepaliDate } from "../../NepaliDate";

interface RangeDayProps {
    date: Date | NepaliDate;
    className?: string;
    panel: "left" | "right";
}

const RangeDay = ({ date, className, panel }: RangeDayProps) => {
    const { 
        rangePickerState, 
        updateRangePickerDay, 
        updateHoverDate,
        isDateInRange
    } = useRangePicker();

    const { startDate, endDate, hoverDate, today, onRangeSelect } = rangePickerState;
    const buttonRef = useRef<HTMLButtonElement>(null);

    const isToday = useMemo(() => {
        if (date instanceof NepaliDate) {
            const todayBS = NepaliDate.fromADDate(today);
            return areDatesEqual(date, todayBS);
        }
        return areDatesEqual(date, today);
    }, [date, today]);

    const isSelected = useMemo(() => {
        if (!startDate && !endDate) return false;
        
        if (startDate && areDatesEqual(date, startDate)) return true;
        if (endDate && areDatesEqual(date, endDate)) return true;
        
        return false;
    }, [date, startDate, endDate]);

    const isInRange = useMemo(() => {
        if (!startDate || !endDate) {
            // If we have a start date and hovering, show preview range
            if (startDate && hoverDate && !endDate) {
                const rangeStart = compareDates(startDate, hoverDate) <= 0 ? startDate : hoverDate;
                const rangeEnd = compareDates(startDate, hoverDate) <= 0 ? hoverDate : startDate;
                
                return compareDates(date, rangeStart) > 0 && compareDates(date, rangeEnd) < 0;
            }
            return false;
        }
        
        return compareDates(date, startDate) > 0 && compareDates(date, endDate) < 0;
    }, [date, startDate, endDate, hoverDate]);

    const isDisabled = useMemo(() => {
        return !isDateInRange(date);
    }, [date, isDateInRange]);

    const handleClick = () => {
        return updateRangePickerDay(date);       
    };

    const handleMouseEnter = useCallback(() => {
        if (!isDisabled && startDate && !endDate) {
            updateHoverDate(date);
        }
    }, [startDate, endDate, date, updateHoverDate, isDisabled]);

    return (
        <button
            ref={buttonRef}
            disabled={isDisabled}
            onClick={(e)=>{
                e.stopPropagation()
                const {latestStartDate, latestEndDate }= handleClick();
                
                if (onRangeSelect && latestStartDate && latestEndDate){
                    onRangeSelect(latestStartDate, latestEndDate);
                }
            }}
            onMouseEnter={handleMouseEnter}
            className={cn(
                "w-8 h-8 flex items-center justify-center text-sm rounded-md",
                "hover:cursor-pointer",
                !isSelected && !isDisabled && "hover:bg-gray-300 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                // Disabled styling
                isDisabled && "text-gray-300 cursor-not-allowed",
                // Today styling
                isToday && !isSelected && !isDisabled && "bg-blue-50 text-blue-600 font-semibold",
                // Range styling
                isInRange && !isDisabled && "bg-gray-200",
                // Selected dates (start and end)
                isSelected && !isDisabled && "bg-black text-white font-semibold",
                className
            )}
        >
            {date.getDate()}
        </button>
    );
};

export default RangeDay;
