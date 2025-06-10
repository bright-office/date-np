import { CALENDAR } from "../../../data/locale";
import { cn } from "../../../utils/clsx";
import { useRangePicker } from "../hooks/useRangePicker";
import { NepaliDate } from "../../NepaliDate";

interface RangeMonthProps {
    month: number;
    panel: "left" | "right";
    className?: string;
}

const RangeMonth = ({ month, panel, className }: RangeMonthProps) => {
    const { 
        rangePickerState, 
        updatePanelMonth, 
        updatePanelMode,
        getEffectiveMinDate,
        getEffectiveMaxDate
    } = useRangePicker();
    const { locale } = rangePickerState;
    const panelState = panel === "left" ? rangePickerState.leftPanel : rangePickerState.rightPanel;
    const { activeMonth, activeYear } = panelState;

    const monthName = locale === "en" 
        ? CALENDAR.AD.months[month]
        : CALENDAR.BS.months[month];

    const isActive = month === activeMonth;
    const isToday = (() => {
        const today = new Date();
        return month === today.getMonth() && activeYear === today.getFullYear();
    })();

    const isDisabled = (() => {
        const minDate = getEffectiveMinDate();
        const maxDate = getEffectiveMaxDate();
        
        // Create first and last day of the month to check if any day in the month is valid
        let firstDayOfMonth: Date;
        let lastDayOfMonth: Date;
        
        if (locale === "ne") {
            try {
                const nepaliFirst = new NepaliDate(activeYear, month, 1);
                const daysInMonth = nepaliFirst.getDaysInMonth();
                const nepaliLast = new NepaliDate(activeYear, month, daysInMonth);
                firstDayOfMonth = nepaliFirst.toADDate();
                lastDayOfMonth = nepaliLast.toADDate();
            } catch {
                // If month is invalid (e.g., early months in 2000), disable it
                return true;
            }
        } else {
            firstDayOfMonth = new Date(activeYear, month, 1);
            lastDayOfMonth = new Date(activeYear, month + 1, 0); // Last day of month
        }
        
        // Month is disabled if all days are outside the valid range
        return lastDayOfMonth.getTime() < minDate.getTime() || firstDayOfMonth.getTime() > maxDate.getTime();
    })();

    const handleClick = () => {
        if (!isDisabled) {
            updatePanelMonth(month, panel);
            updatePanelMode(panel, "date");
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
            {monthName}
        </button>
    );
};

export default RangeMonth;
