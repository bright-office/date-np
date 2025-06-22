import type { ReactNode } from "react";
import { MAX_AD_YEAR, MAX_BS_YEAR, MIN_AD_YEAR, MIN_BS_YEAR } from "../../data/constants";
import { CALENDAR } from "../../data/locale";
import { cn } from "../../utils/clsx";
import {
    getEndingDayOfMonth,
    getStartingDayOfMonth,
    getTotalDaysInMonth
} from "../../utils/helpers";
import { areDatesEqual } from "../../utils/validators";
import { usePicker } from "../hooks/usePicker";
import Day from "./day";
import Month from "./month";
import { WeekRow } from "./week-row";
import { NepaliDate } from "../NepaliDate";

type pickerBodyProps = {
    onSelect?: (selectedDate: Date | NepaliDate) => void;
    /**
     * datehover class
     */
    dateHover?: string;

    /**
     * selected class
     */
    selected?: string;

    /**
     * today class
     */
    todayStyle?: string;


}

const PickerBody = (
    {
        onSelect,
        todayStyle,
        selected,
        dateHover
    }: pickerBodyProps) => {
    const { pickerState, updatePickerMonth, updatePickerMode, updatePickerYear, isDateInRange, updatePickerDay, changePickerLocale, setPickerState, resetToOriginalState } = usePicker();
    const { today, selectedDate, activeYear, activeMonth, locale, minDate, maxDate } = pickerState;

    // Check for unsupported years that would cause validation errors
    const isUnsupportedYear = (locale === "en" && activeYear === MIN_AD_YEAR) ||
        (locale === "ne" && activeYear === MIN_BS_YEAR) ||
        (locale === "en" && activeYear === MAX_AD_YEAR) ||
        (locale === "ne" && activeYear === MAX_BS_YEAR)
        ;

    // Handle manual reset when user clicks "Pick another"
    const handleResetToValidDate = () => {
        resetToOriginalState();
    };

    // If we're trying to display an unsupported year, show error message
    if (isUnsupportedYear) {
        return (
            <div className="flex items-center justify-center w-full h-72 text-center">
                <div className="text-gray-600">
                    <div className="text-lg font-medium mb-2">Date not supported</div>
                    <div className="text-sm text-gray-500 mb-4">
                        {locale === "en"
                            ? "Dates before 1945 are not supported"
                            : "Dates before 2001 are not supported"
                        }
                    </div>
                    <button
                        onClick={handleResetToValidDate}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        Pick another
                    </button>
                </div>
            </div>
        );
    }

    // Create appropriate date objects based on locale
    const createDate = (year: number, month: number, date?: number) => {
        if (locale === "ne") {
            return new NepaliDate(year, month, date || 1);
        } else {
            return new Date(year, month, date || 1);
        }
    };

    const currentMonthDate = createDate(activeYear, activeMonth, 1);
    const thisMonthtotalDays = getTotalDaysInMonth({ date: currentMonthDate, locale });
    const thisMonthStartDay = getStartingDayOfMonth({ date: currentMonthDate, locale });
    const thisMonthEndDate = createDate(activeYear, activeMonth, thisMonthtotalDays);
    const thisMonthEndDay = getEndingDayOfMonth({ date: thisMonthEndDate, locale });
    const prevMonthDate = createDate(activeYear, activeMonth - 1, 1);
    const prevMonthTotalDays = getTotalDaysInMonth({ date: prevMonthDate, locale });

    const plotablePrevMonthDays = thisMonthStartDay;

    const TrailingPrevMonthDays = () => {
        return [...Array(plotablePrevMonthDays)].map((_, index) => {
            const date = prevMonthTotalDays - (plotablePrevMonthDays - (index + 1));
            const dayDate = createDate(activeYear, activeMonth - 1, date);
            const isNotActive = !selectedDate || !areDatesEqual(dayDate, selectedDate);
            const isDisabled = !isDateInRange(dayDate);

            return <Day
                date={dayDate}
                key={index}
                disabled={isDisabled}
                className={cn(isNotActive && "bg-gray-50 opacity-50")}
            />
        })
    }

    const ThisMonthDays = () => {
        return [...Array(thisMonthtotalDays)].map((_, index) => {
            const dayDate = createDate(activeYear, activeMonth, index + 1);
            const isDisabled = !isDateInRange(dayDate);

            return <Day
                dateHover={dateHover}
                selected={selected}
                todayStyle={todayStyle}
                onRangeSelect={onSelect}
                date={dayDate}
                key={index}
                disabled={isDisabled}
            />
        })
    }

    const PrecidingNxtMonthDays = () => {
        // Calculate remaining cells needed to fill the 42-cell grid (7 columns × 6 rows)
        const totalCells = 42;
        const usedCells = plotablePrevMonthDays + thisMonthtotalDays;
        let PrecidingDays = totalCells - usedCells;

        // If the last row would be entirely next month days (7 days), don't render it
        if (PrecidingDays >= 7) {
            PrecidingDays = PrecidingDays - 7;
        }

        return [...Array(PrecidingDays)].map((_, index) => {
            const dayDate = createDate(activeYear, activeMonth + 1, index + 1);
            const isNotActive = !selectedDate || !areDatesEqual(dayDate, selectedDate);
            const isTodayDate = locale === "en" && index + 1 === today.getDate();
            const isDisabled = !isDateInRange(dayDate);

            return <Day
                date={dayDate}
                key={index}
                isToday={isTodayDate}
                disabled={isDisabled}
                className={cn(isNotActive && "bg-gray-50 opacity-50")}
            />
        })
    }

    /**
     * Conditionally render if mode is set to date.
     */
    const DatePickerBody = () => {
        if (pickerState.mode !== "date")
            return null;

        return (
            <Month>
                <WeekRow />
                <TrailingPrevMonthDays />
                <ThisMonthDays />
                <PrecidingNxtMonthDays />
            </Month>)
    }

    const MonthPickerBody = () => {
        if (pickerState.mode !== "month")
            return null

        const { getEffectiveMinDate, getEffectiveMaxDate } = usePicker();

        const effectiveMinDate = getEffectiveMinDate();
        const effectiveMaxDate = getEffectiveMaxDate();

        // Convert effective min/max dates to the current locale for comparison
        let minDateInCurrentLocale: Date | NepaliDate;
        let maxDateInCurrentLocale: Date | NepaliDate;

        if (pickerState.locale === "ne") {
            minDateInCurrentLocale = new NepaliDate(effectiveMinDate);
            maxDateInCurrentLocale = new NepaliDate(effectiveMaxDate);
        } else {
            minDateInCurrentLocale = effectiveMinDate;
            maxDateInCurrentLocale = effectiveMaxDate;
        }

        const minYear = minDateInCurrentLocale.getFullYear();
        const maxYear = maxDateInCurrentLocale.getFullYear();
        const minMonth = minDateInCurrentLocale.getMonth();
        const maxMonth = maxDateInCurrentLocale.getMonth();

        let monthsNames: string[] = [];
        let startMonth = 0;
        let endMonth = 11;

        // Determine which months to show based on the current active year and date range
        if (activeYear === minYear && activeYear === maxYear) {
            // Same year as both min and max
            startMonth = minMonth;
            endMonth = maxMonth;
        } else if (activeYear === minYear) {
            // Same year as min date
            startMonth = minMonth;
            endMonth = 11;
        } else if (activeYear === maxYear) {
            // Same year as max date
            startMonth = 0;
            endMonth = maxMonth;
        } else if (activeYear < minYear || activeYear > maxYear) {
            // Year is outside the allowed range, show no months
            startMonth = 0;
            endMonth = -1;
        }

        if (pickerState.locale === "en") {
            monthsNames = Object.values(CALENDAR.AD.months);
        } else {
            monthsNames = Object.values(CALENDAR.BS.months);
        }

        const handleMonthChange = (month: number) => {
            // changing the month
            updatePickerMonth(month);
            // changing the mode to date
            updatePickerMode("date");
        }

        return (
            <div className="grid grid-cols-2 grid-rows-6 gap-1 items-center w-full h-72 text-sm font-light">
                {monthsNames.map((month, index) => {
                    const isDisabled = index < startMonth || index > endMonth;

                    return <button
                        key={index}
                        tabIndex={0}
                        disabled={isDisabled}
                        className={cn(
                            "flex items-center justify-center text-sm rounded-sm px-2 bg-gray-50 h-full cursor-pointer",
                            "hover:bg-gray-100",
                            index === activeMonth && !isDisabled && "bg-gray-900 text-white hover:bg-gray-800",
                            isDisabled && "opacity-50 cursor-not-allowed bg-gray-50 hover:bg-gray-50",
                        )}
                        onClick={(e) => {
                            if (isDisabled) return;
                            e.stopPropagation()
                            handleMonthChange(index)
                        }}
                    >
                        {month}
                    </button>
                })}
            </div>
        )
    }

    const YearPickerBody = () => {
        if (pickerState.mode !== "year")
            return null

        const { getEffectiveMinDate, getEffectiveMaxDate } = usePicker();

        const minDate = getEffectiveMinDate();
        const maxDate = getEffectiveMaxDate();

        // Get year range from effective min/max dates instead of constants
        const minYear = pickerState.locale === "ne"
            ? new NepaliDate(minDate).getFullYear()
            : minDate.getFullYear();
        const maxYear = pickerState.locale === "ne"
            ? new NepaliDate(maxDate).getFullYear()
            : maxDate.getFullYear();

        const handleYearChange = (year: number) => {
            // changing the year
            updatePickerYear(year);

            // changing the mode to date
            updatePickerMode("month");
        }

        const yearsOptions: ReactNode[] = [];
        for (let i = minYear; i <= maxYear; i++) {
            const element = (
                <button
                    key={i}
                    tabIndex={0} className={cn(
                        "flex items-center justify-center text-sm rounded-sm px-2 bg-gray-50 h-10 cursor-pointer",
                        "hover:bg-gray-100",
                        i === activeYear && "bg-gray-900 text-white hover:bg-gray-800",
                    )}
                    onClick={(e) => {
                        e.stopPropagation()
                        handleYearChange(i)
                    }}
                >
                    {i}
                </button>
            )

            yearsOptions.push(element);
        }

        return (
            <div className="grid grid-cols-3 gap-1 items-center w-full h-72 text-sm font-light">
                {yearsOptions}
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between w-full min-h-72 overflow-auto">
            <DatePickerBody />
            <MonthPickerBody />
            <YearPickerBody />
        </div>
    )
}

export default PickerBody;
