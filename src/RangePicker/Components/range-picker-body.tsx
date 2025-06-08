import { useEffect, useState } from "react";
import { MAX_AD_YEAR, MAX_BS_YEAR, MIN_AD_YEAR, MIN_BS_YEAR } from "../../../data/constants";
import { CALENDAR } from "../../../data/locale";
import {
    getEndingDayOfMonth,
    getStartingDayOfMonth,
    getTotalDaysInMonth
} from "../../../utils/helpers";
import { useRangePicker } from "../hooks/useRangePicker";
import RangeDay from "./range-day";
import RangeMonth from "./range-month";
import RangeYear from "./range-year";
import { RangeWeekRow } from "./range-week-row";
import { NepaliDate } from "../../NepaliDate";
import EmptyRangeDay from "./empty-range-day";

interface RangePickerBodyProps {
    panel: "left" | "right";
}

const RangePickerBody = ({ panel }: RangePickerBodyProps) => {
    const { rangePickerState, updatePanelMonth, updatePanelYear, resetToOriginalState } = useRangePicker();
    const { locale } = rangePickerState;
    const panelState = panel === "left" ? rangePickerState.leftPanel : rangePickerState.rightPanel;
    const otherPanelState = panel === "left" ? rangePickerState.rightPanel : rangePickerState.leftPanel;
    const { activeYear, activeMonth, mode } = panelState;

    // Check for unsupported years that would cause validation errors
    const isUnsupportedYear = (locale === "en" && activeYear === MIN_AD_YEAR) || 
                              (locale === "ne" && activeYear === MIN_BS_YEAR);

    // Handle manual reset when user clicks "Pick another"
    const handleResetToValidDate = () => {
        resetToOriginalState();
    };

    // If we're trying to display an unsupported year in date mode, show error message
    if (mode === "date" && isUnsupportedYear) {
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
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
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

    // Date mode - show calendar
    if (mode === "date") {
        const currentMonthDate = createDate(activeYear, activeMonth, 1);
        const thisMonthtotalDays = getTotalDaysInMonth({ date: currentMonthDate, locale });
        const thisMonthStartDay = getStartingDayOfMonth({ date: currentMonthDate, locale });
        const thisMonthEndDate = createDate(activeYear, activeMonth, thisMonthtotalDays);
        const prevMonthDate = createDate(activeYear, activeMonth - 1, 1);
        const thisMonthEndDay = getEndingDayOfMonth({ date: thisMonthEndDate, locale });
        const prevMonthTotalDays = getTotalDaysInMonth({ date: prevMonthDate, locale });
        const plotablePrevMonthDays = thisMonthStartDay;

        
        const CurrentMonthDays = () => {
            return [...Array(thisMonthtotalDays)].map((_, index) => {
                const date = index + 1;
                const dayDate = createDate(activeYear, activeMonth, date);
                
                return (
                    <RangeDay
                    date={dayDate}
                    key={index}
                    panel={panel}
                    />
                );
            });
        };
        
        // Trailing days from the original picker which is not used currently in Range picker
        const TrailingPrevMonthDays = () => {
            return [...Array(plotablePrevMonthDays)].map((_, index) => {
                const date = prevMonthTotalDays - (plotablePrevMonthDays - (index + 1));
                const dayDate = createDate(activeYear, activeMonth - 1, date);

                return (
                    <EmptyRangeDay
                        
                    />
                );
            });
        };

        const TrailingNextMonthDays = () => {
            const plotableNextMonthDays = 6 - thisMonthEndDay;
            return [...Array(plotableNextMonthDays)].map((_, index) => {
                const date = index + 1;
                const dayDate = createDate(activeYear, activeMonth + 1, date);

                return (
                    <EmptyRangeDay
                        
                    />
                );
            });
        };

        return (
            <div className="w-full">
                <div className="grid grid-cols-7 gap-1 mb-2">
                    <RangeWeekRow locale={locale} />
                </div>
                <div className="grid grid-cols-7 gap-1">
                    <TrailingPrevMonthDays />
                    <CurrentMonthDays />
                    <TrailingNextMonthDays />
                </div>
            </div>
        );
    }

    // Month mode - show months
    if (mode === "month") {
        const months = locale === "en" ? CALENDAR.AD.months : CALENDAR.BS.months;
        
        return (
            <div className="grid grid-cols-3 gap-2 p-2">
                {months.map((_, index) => {
                    // Filter months based on panel constraints
                    let shouldShow = true;
                    
                    if (panel === "left") {
                        // Left panel: don't show months greater than right panel's active month
                        // if they are in the same year
                        if (activeYear === otherPanelState.activeYear && index >= otherPanelState.activeMonth) {
                            shouldShow = false;
                        }
                        // If left panel year is greater than right panel year, don't show any months
                        if (activeYear > otherPanelState.activeYear) {
                            shouldShow = false;
                        }
                    } else {
                        // Right panel: don't show months less than left panel's active month
                        // if they are in the same year
                        if (activeYear === otherPanelState.activeYear && index <= otherPanelState.activeMonth) {
                            shouldShow = false;
                        }
                        // If right panel year is less than left panel year, don't show any months
                        if (activeYear < otherPanelState.activeYear) {
                            shouldShow = false;
                        }
                    }

                    if (!shouldShow) return null;

                    return (
                        <RangeMonth
                            key={index}
                            month={index}
                            panel={panel}
                        />
                    );
                })}
            </div>
        );
    }

    // Year mode - show years
    if (mode === "year") {
        const minYear = locale === "en" ? MIN_AD_YEAR : MIN_BS_YEAR;
        const maxYear = locale === "en" ? MAX_AD_YEAR : MAX_BS_YEAR;
        
        // Adjust year range based on panel constraints
        let startYear = minYear;
        let endYear = maxYear;
        
        if (panel === "left") {
            // Left panel: don't show years greater than right panel's active year
            endYear = Math.min(maxYear, otherPanelState.activeYear);
        } else {
            // Right panel: don't show years less than left panel's active year
            startYear = Math.max(minYear, otherPanelState.activeYear);
        }
        
        const years = [];
        
        for (let year = startYear; year <= endYear; year++) {
            years.push(year);
        }

        return (
            <div className="grid grid-cols-4 gap-2 p-2 max-h-60 overflow-y-auto">
                {years.map((year) => (
                    <RangeYear
                        key={year}
                        year={year}
                        panel={panel}
                    />
                ))}
            </div>
        );
    }

    return null;
};

export default RangePickerBody;
