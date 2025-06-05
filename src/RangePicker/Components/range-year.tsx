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
            const nepaliFirst = new NepaliDate(year, 0, 1);
            const nepaliLast = new NepaliDate(year, 11, 30); // Approximate last day of BS year
            firstDayOfYear = nepaliFirst.toADDate();
            lastDayOfYear = nepaliLast.toADDate();
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
