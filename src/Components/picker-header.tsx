import { useMemo, type ReactNode } from "react";
import { CALENDAR } from "../../data/locale";
import { cn } from "../../utils/clsx";
import { convertFromADToBS } from "../../utils/conversion";
import { usePicker } from "../hooks/usePicker";
import { NepaliDate } from "../NepaliDate";

const PickerHeader = () => {
    const { pickerState, togglePickerMode } = usePicker();
    const { activeMonth, selectedDate, activeYear, locale } = pickerState;

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
        togglePickerMode("month", "date");
    }

    const handleYearClick = () => {
        togglePickerMode("year", "date");
    }

    return (
        <div className="flex items-center justify-between w-full">
            {monthSwitcher().previous}
            <div className="wrapper space-x-2 cursor-pointer">
                <span onClick={handleMonthClick} className="hover:underline">
                    {monthName}
                </span>
                <span onClick={handleYearClick} className="hover:underline">
                    {year}
                </span>
            </div>
            {monthSwitcher().next}
            <AD_BS_Switcher />
        </div>
    )
}

const monthSwitcher = (): {
    previous: ReactNode,
    next: ReactNode
} => {
    const { 
        pickerState, 
        updatePickerMonth, 
        updatePickerYear,
        canNavigateToPreviousMonth, 
        canNavigateToNextMonth,
        canNavigateToPreviousYear,
        canNavigateToNextYear 
    } = usePicker();
    const { activeMonth, activeYear, mode } = pickerState;

    // Determine navigation type based on mode
    const isYearMode = mode === "year";
    const isMonthMode = mode === "month";
    
    // For year mode, we navigate years
    // For date and month modes, we navigate months but use specialized validation for month mode
    let canGoPrevious: boolean;
    let canGoNext: boolean;
    
    if (isYearMode) {
        canGoPrevious = canNavigateToPreviousYear();
        canGoNext = canNavigateToNextYear();
    } else {
        // Both date and month modes use month navigation
        canGoPrevious = canNavigateToPreviousMonth();
        canGoNext = canNavigateToNextMonth();
    }

    const handleNavigation = (changeDirection: "next" | "previous") => {
        if ((changeDirection === "previous" && !canGoPrevious) || 
            (changeDirection === "next" && !canGoNext)) {
            return;
        }

        if (isYearMode) {
            // Navigate years (for year picker mode)
            const newYear = changeDirection === "next"
                ? activeYear + 1
                : activeYear - 1;
            updatePickerYear(newYear);
        } else {
            // Navigate months (for date and month picker modes)
            const newMonth = changeDirection === "next"
                ? activeMonth + 1
                : activeMonth - 1;
            updatePickerMonth(newMonth);
        }
    }

    return {
        previous: (
            <div
                className={cn(
                    "left h-8 w-8 rounded-sm cursor-pointer hover:bg-gray-200 flex items-center justify-center",
                    !canGoPrevious && "opacity-50 cursor-not-allowed hover:bg-transparent"
                )}
                onClick={() => handleNavigation("previous")} >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </div>),
        next: (
            <div
                className={cn(
                    "right h-8 w-8 rounded-sm cursor-pointer hover:bg-gray-200 flex items-center justify-center",
                    !canGoNext && "opacity-50 cursor-not-allowed hover:bg-transparent"
                )}
                onClick={() => handleNavigation("next")} >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6" /></svg>
            </div>)
    }
}

const AD_BS_Switcher = () => {
    const { pickerState, changePickerLocale } = usePicker();
    const { locale } = pickerState;

    return (
        <div className="flex items-center bg-gray-100 rounded-md h-6 w-16 text-sm">
            <span
                onClick={() => { changePickerLocale("en") }}
                className={cn(
                    "cursor-pointer h-8 w-8 grid place-items-center  rounded-md",
                    locale === "en"
                        ? "bg-white drop-shadow-sm"
                        : "bg-transparent opacity-60"
                )}>
                AD
            </span>

            <span
                onClick={() => { changePickerLocale("ne") }}
                className={cn(
                    "cursor-pointer h-8 w-8 grid place-items-center  rounded-md",
                    locale === "ne"
                        ? "bg-white drop-shadow-sm"
                        : "bg-transparent opacity-60"
                )}>
                BS
            </span>
        </div>
    )
}

export default PickerHeader;
