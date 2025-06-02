import { cn } from "../../../utils/clsx";
import { useRangePicker } from "../hooks/useRangePicker";

interface RangeYearProps {
    year: number;
    panel: "left" | "right";
    className?: string;
}

const RangeYear = ({ year, panel, className }: RangeYearProps) => {
    const { rangePickerState, updatePanelYear, updatePanelMode } = useRangePicker();
    const panelState = panel === "left" ? rangePickerState.leftPanel : rangePickerState.rightPanel;
    const { activeYear } = panelState;

    const isActive = year === activeYear;
    const isToday = (() => {
        const today = new Date();
        return year === today.getFullYear();
    })();

    const handleClick = () => {
        updatePanelYear(panel, year);
        updatePanelMode(panel, "month");
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                "w-full h-10 flex items-center justify-center text-sm rounded-md",
                "hover:bg-gray-100 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                isActive && "bg-black text-white font-semibold",
                isToday && !isActive && "bg-blue-50 text-blue-600 font-semibold",
                className
            )}
        >
            {year}
        </button>
    );
};

export default RangeYear;
