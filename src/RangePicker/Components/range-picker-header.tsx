import { useMemo } from "react";
import { MAX_AD_YEAR, MAX_BS_YEAR, MIN_AD_YEAR, MIN_BS_YEAR } from "../../../data/constants";
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
        canNavigateToPreviousMonth,
        canNavigateToNextMonth,
        shouldShowSinglePanel
    } = useRangePicker();
    
    const { locale } = rangePickerState;
    const panelState = panel === "left" ? rangePickerState.leftPanel : rangePickerState.rightPanel;
    const otherPanelState = panel === "left" ? rangePickerState.rightPanel : rangePickerState.leftPanel;
    const { activeMonth, activeYear } = panelState;

    // Check for unsupported years that would cause validation errors
    const isUnsupportedYear = () => {
        if (locale === "en" && activeYear === MIN_AD_YEAR || activeYear === MAX_AD_YEAR) {
            return true; 
        }
        if (locale === "ne" && activeYear === MIN_BS_YEAR || activeYear === MAX_BS_YEAR) {
            return true; 
        }
        return false;
    };

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
    const isSinglePanel = shouldShowSinglePanel();
    const isRightArrowDisabled = useMemo(() => {
        // If in unsupported year, disable all navigation
        if (isUnsupportedYear()) return true;
        
        // If in single panel mode, disable all arrows
        if (isSinglePanel) return true;
        
        // Check min/max date constraints
        if (!canNavigateToNextMonth(panel)) return true;
        
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
    }, [panel, activeMonth, activeYear, otherPanelState.activeMonth, otherPanelState.activeYear, isSinglePanel, canNavigateToNextMonth]);

    const isLeftArrowDisabled = useMemo(() => {
        // If in unsupported year, disable all navigation
        if (isUnsupportedYear()) return true;
        
        // If in single panel mode, disable all arrows
        if (isSinglePanel) return true;
        
        // Check min/max date constraints
        if (!canNavigateToPreviousMonth(panel)) return true;
        
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
    }, [panel, activeMonth, activeYear, otherPanelState.activeMonth, otherPanelState.activeYear, isSinglePanel, canNavigateToPreviousMonth]);

    const handleMonthClick = () => {
        if (isUnsupportedYear()) return; // Disable interaction for unsupported years
        togglePanelMode(panel, "month", "date");
    };

    const handleYearClick = () => {
        if (isUnsupportedYear()) return; // Disable interaction for unsupported years
        togglePanelMode(panel, "year", "date");
    };

    const handlePrevMonth = () => {
        if (isUnsupportedYear() || isLeftArrowDisabled) return; // Disable for unsupported years
        incrementPanelMonth(panel, -1);
    };

    const handleNextMonth = () => {
        if (isUnsupportedYear() || isRightArrowDisabled) return; // Disable for unsupported years
        incrementPanelMonth(panel, 1);
    };

    const ArrowButton = ({ direction, onClick, disabled }: { direction: "left" | "right"; onClick: (e:React.MouseEvent) => void; disabled?: boolean }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "p-1 rounded transition-colors",
                disabled 
                    ? "text-gray-300" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:cursor-pointer"
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

    return (
        <div className="flex items-center justify-between w-full mb-2">
            {/* Left side - Previous month arrow */}
            <div className="w-8">
                <ArrowButton direction="left" onClick={(e)=>{
                    e.stopPropagation()
                    handlePrevMonth()
                }} disabled={isLeftArrowDisabled} />
            </div>

            {/* Month and Year */}
            <div className={cn(
                "flex items-center space-x-2",
                isUnsupportedYear() ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            )}>
                <span 
                    onClick={handleMonthClick} 
                    className={cn(
                        "font-medium text-gray-700",
                        !isUnsupportedYear() && "hover:underline"
                    )}
                >
                    {monthName}
                </span>
                <span 
                    onClick={handleYearClick} 
                    className={cn(
                        "font-medium text-gray-700",
                        !isUnsupportedYear() && "hover:underline"
                    )}
                >
                    {year}
                </span>
            </div>

            {/* Right side - Next month arrow and locale switcher */}
            <div className="flex justify-end items-center gap-1">
                <ArrowButton direction="right" onClick={(e)=>{
                    e.stopPropagation()
                    handleNextMonth()
                }} disabled={isRightArrowDisabled} />
            </div>
        </div>
    );
};

export default RangePickerHeader;
