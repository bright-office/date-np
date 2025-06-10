import { cn } from "../../../utils/clsx";
import { useRangePicker } from "../hooks/useRangePicker";
import { NepaliDate } from "../../NepaliDate";

interface RangeYearProps {
    year: number;
    panel: "left" | "right";
    className?: string;
}

const RangeYear = ({ year, panel, className }: RangeYearProps) => {
    const { 
        rangePickerState, 
        updatePanelYear, 
        updatePanelMode,
        getEffectiveMinDate,
        getEffectiveMaxDate
    } = useRangePicker();
    const { locale } = rangePickerState;
    const panelState = panel === "left" ? rangePickerState.leftPanel : rangePickerState.rightPanel;
    const { activeYear } = panelState;

    const isActive = year === activeYear;
    const isToday = (() => {
        const today = new Date();
        return year === today.getFullYear();
    })();

    const isDisabled = (() => {
        const minDate = getEffectiveMinDate();
        const maxDate = getEffectiveMaxDate();
        
        // Create first and last day of the year to check if any day in the year is valid
        let firstDayOfYear: Date;
        let lastDayOfYear: Date;
        
        if (locale === "ne") {
            try {
                // Try to create first day of year
                const nepaliFirst = new NepaliDate(year, 0, 1);
                firstDayOfYear = nepaliFirst.toADDate();
            } catch {
                // If first day is invalid, try with month 8 (when 2000 starts to be valid)
                try {
                    const nepaliFirst = new NepaliDate(year, 8, 17); // First valid date for MIN_BS_YEAR
                    firstDayOfYear = nepaliFirst.toADDate();
                } catch {
                    // If still invalid, year is completely disabled
                    return true;
                }
            }
            
            try {
                // Try to create last day of year  
                const nepaliLast = new NepaliDate(year, 11, 30); // Approximate last day of BS year
                lastDayOfYear = nepaliLast.toADDate();
            } catch {
                // If last day is invalid, try with month 8 again
                try {
                    const nepaliLast = new NepaliDate(year, 8, 17);
                    lastDayOfYear = nepaliLast.toADDate();
                } catch {
                    // If still invalid, year is completely disabled
                    return true;
                }
            }
        } else {
            firstDayOfYear = new Date(year, 0, 1);
            lastDayOfYear = new Date(year, 11, 31); // Last day of AD year
        }
        
        // Year is disabled if all days are outside the valid range
        return lastDayOfYear.getTime() < minDate.getTime() || firstDayOfYear.getTime() > maxDate.getTime();
    })();

    const handleClick = () => {
        if (!isDisabled) {
            updatePanelYear(panel, year);
            updatePanelMode(panel, "month");
        }
    };

    return (
        <button
            disabled={isDisabled}
            onClick={(e)=>{
                e.stopPropagation()
                handleClick()
            }}
            className={cn(
                "w-full h-10 flex items-center justify-center text-sm rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                !isDisabled && "hover:bg-gray-100 transition-colors",
                isDisabled && "text-gray-300 cursor-not-allowed",
                isActive && !isDisabled && "bg-black text-white font-semibold",
                isToday && !isActive && !isDisabled && "bg-blue-50 text-blue-600 font-semibold",
                className
            )}
        >
            {year}
        </button>
    );
};

export default RangeYear;
