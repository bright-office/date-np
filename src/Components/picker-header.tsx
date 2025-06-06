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
    const { pickerState, updatePickerMonth } = usePicker();
    const { activeMonth } = pickerState;

    const handleMonthChange = (changeDirection: "next" | "previous") => {
        const newMonth = changeDirection === "next"
            ? activeMonth + 1
            : activeMonth - 1;

        updatePickerMonth(newMonth);
    }

    return {
        previous: (
            <div
                className="left h-8 w-8 rounded-sm cursor-pointer hover:bg-gray-200 flex items-center justify-center"
                onClick={() => handleMonthChange("previous")} >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </div>),
        next: (
            <div
                className="right h-8 w-8 rounded-sm cursor-pointer hover:bg-gray-200 flex items-center justify-center"
                onClick={() => handleMonthChange("next")} >
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
