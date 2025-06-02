import { useMemo } from "react";
import { CALENDAR } from "../../../data/locale";
import { cn } from "../../../utils/clsx";
import { useRangePicker } from "../hooks/useRangePicker";
import { NepaliDate } from "../../NepaliDate";

interface RangePickerHeaderProps {
    panel: "left" | "right";
}

const RangePickerHeader = ({ panel }: RangePickerHeaderProps) => {
    const { 
        rangePickerState, 
        togglePanelMode, 
        incrementPanelMonth,
        changeRangePickerLocale 
    } = useRangePicker();
    
    const { locale } = rangePickerState;
    const panelState = panel === "left" ? rangePickerState.leftPanel : rangePickerState.rightPanel;
    const { activeMonth, activeYear } = panelState;

    // Create the appropriate date object based on locale
    const currentMonthDate = useMemo(() => {
        if (locale === "ne") {
            return new NepaliDate(activeYear, activeMonth, 15); // Use 15th as middle date
        } else {
            return new Date(activeYear, activeMonth, 15);
        }
    }, [activeYear, activeMonth, locale]);

    const monthName = locale === "en"
        ? CALENDAR.AD.months[currentMonthDate.getMonth()]
        : CALENDAR.BS.months[currentMonthDate.getMonth()];

    const year = currentMonthDate.getFullYear();

    const handleMonthClick = () => {
        togglePanelMode(panel, "month", "date");
    };

    const handleYearClick = () => {
        togglePanelMode(panel, "year", "date");
    };

    const handlePrevMonth = () => {
        incrementPanelMonth(panel, -1);
    };

    const handleNextMonth = () => {
        incrementPanelMonth(panel, 1);
    };

    const handleLocaleChange = () => {
        changeRangePickerLocale(locale === "en" ? "ne" : "en");
    };

    const ArrowButton = ({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) => (
        <button
            onClick={onClick}
            className={cn(
                "p-1 rounded hover:bg-gray-100 transition-colors",
                "text-gray-600 hover:text-gray-900"
            )}
        >
            {direction === "left" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            )}
        </button>
    );

    const LocaleSwitcher = () => (
        <button
            onClick={handleLocaleChange}
            className={cn(
                "px-2 py-1 text-xs rounded border",
                "hover:bg-gray-50 transition-colors",
                "text-gray-600 border-gray-300"
            )}
        >
            {locale === "en" ? "नेपाली" : "English"}
        </button>
    );

    return (
        <div className="flex items-center justify-between w-full mb-2">
            {/* Left side - Previous month arrow */}
            <div className="w-8">
                <ArrowButton direction="left" onClick={handlePrevMonth} />
            </div>

            {/* Month and Year */}
            <div className="flex items-center space-x-2 cursor-pointer">
                <span 
                    onClick={handleMonthClick} 
                    className="hover:underline font-medium text-gray-700"
                >
                    {monthName}
                </span>
                <span 
                    onClick={handleYearClick} 
                    className="hover:underline font-medium text-gray-700"
                >
                    {year}
                </span>
            </div>

            {/* Right side - Next month arrow and locale switcher */}
            <div className="flex justify-end items-center gap-1">
                {panel === "left" && <LocaleSwitcher />}
                <ArrowButton direction="right" onClick={handleNextMonth} />
            </div>
        </div>
    );
};

export default RangePickerHeader;
