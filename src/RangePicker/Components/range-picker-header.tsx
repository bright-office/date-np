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
    const otherPanelState = panel === "left" ? rangePickerState.rightPanel : rangePickerState.leftPanel;
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

    // Check if navigation should be disabled
    const isRightArrowDisabled = useMemo(() => {
        if (panel === "left") {
            // Left panel: disable right arrow if moving forward would make it equal to or greater than right panel
            const nextMonth = activeMonth + 1;
            const nextYear = nextMonth > 11 ? activeYear + 1 : activeYear;
            const adjustedNextMonth = nextMonth > 11 ? 0 : nextMonth;
            
            // Check if next month would be >= right panel's month in same year
            if (nextYear === otherPanelState.activeYear && adjustedNextMonth >= otherPanelState.activeMonth) {
                return true;
            }
            // Check if next year would be > right panel's year
            if (nextYear > otherPanelState.activeYear) {
                return true;
            }
        }
        return false;
    }, [panel, activeMonth, activeYear, otherPanelState.activeMonth, otherPanelState.activeYear]);

    const isLeftArrowDisabled = useMemo(() => {
        if (panel === "right") {
            // Right panel: disable left arrow if moving backward would make it equal to or less than left panel
            const prevMonth = activeMonth - 1;
            const prevYear = prevMonth < 0 ? activeYear - 1 : activeYear;
            const adjustedPrevMonth = prevMonth < 0 ? 11 : prevMonth;
            
            // Check if previous month would be <= left panel's month in same year
            if (prevYear === otherPanelState.activeYear && adjustedPrevMonth <= otherPanelState.activeMonth) {
                return true;
            }
            // Check if previous year would be < left panel's year
            if (prevYear < otherPanelState.activeYear) {
                return true;
            }
        }
        return false;
    }, [panel, activeMonth, activeYear, otherPanelState.activeMonth, otherPanelState.activeYear]);

    const handleMonthClick = () => {
        togglePanelMode(panel, "month", "date");
    };

    const handleYearClick = () => {
        togglePanelMode(panel, "year", "date");
    };

    const handlePrevMonth = () => {
        if (!isLeftArrowDisabled) {
            incrementPanelMonth(panel, -1);
        }
    };

    const handleNextMonth = () => {
        if (!isRightArrowDisabled) {
            incrementPanelMonth(panel, 1);
        }
    };

    const handleLocaleChange = () => {
        changeRangePickerLocale(locale === "en" ? "ne" : "en");
    };

    const ArrowButton = ({ direction, onClick, disabled }: { direction: "left" | "right"; onClick: () => void; disabled?: boolean }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "p-1 rounded transition-colors",
                disabled 
                    ? "text-gray-300 cursor-not-allowed" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
                <ArrowButton direction="left" onClick={handlePrevMonth} disabled={isLeftArrowDisabled} />
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
                <ArrowButton direction="right" onClick={handleNextMonth} disabled={isRightArrowDisabled} />
            </div>
        </div>
    );
};

export default RangePickerHeader;
