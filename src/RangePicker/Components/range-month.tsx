import { CALENDAR } from "../../../data/locale";
import { cn } from "../../../utils/clsx";
import { useRangePicker } from "../hooks/useRangePicker";

interface RangeMonthProps {
    month: number;
    panel: "left" | "right";
    className?: string;
}

const RangeMonth = ({ month, panel, className }: RangeMonthProps) => {
    const { rangePickerState, updatePanelMonth, updatePanelMode } = useRangePicker();
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

    const handleClick = () => {
        updatePanelMonth(month, panel);
        updatePanelMode(panel, "date");
    };

    return (
        <button
            onClick={(e)=>{
                e.stopPropagation()
                handleClick()
            }}
            className={cn(
                "w-full h-10 flex items-center justify-center text-sm rounded-md",
                "hover:bg-gray-100 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                isActive && "bg-black text-white font-semibold",
                isToday && !isActive && "bg-blue-50 text-blue-600 font-semibold",
                className
            )}
        >
            {monthName}
        </button>
    );
};

export default RangeMonth;
