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

interface RangePickerBodyProps {
    panel: "left" | "right";
}

const RangePickerBody = ({ panel }: RangePickerBodyProps) => {
    const { rangePickerState } = useRangePicker();
    const { today, locale } = rangePickerState;
    const panelState = panel === "left" ? rangePickerState.leftPanel : rangePickerState.rightPanel;
    const { activeYear, activeMonth, mode } = panelState;

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
        const thisMonthEndDay = getEndingDayOfMonth({ date: thisMonthEndDate, locale });
        const prevMonthDate = createDate(activeYear, activeMonth - 1, 1);
        const prevMonthTotalDays = getTotalDaysInMonth({ date: prevMonthDate, locale });

        const plotablePrevMonthDays = thisMonthStartDay;

        const TrailingPrevMonthDays = () => {
            return [...Array(plotablePrevMonthDays)].map((_, index) => {
                const date = prevMonthTotalDays - (plotablePrevMonthDays - (index + 1));
                const dayDate = createDate(activeYear, activeMonth - 1, date);

                return (
                    <RangeDay
                        date={dayDate}
                        key={index}
                        panel={panel}
                        className="bg-gray-50 opacity-50"
                    />
                );
            });
        };

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

        const TrailingNextMonthDays = () => {
            const plotableNextMonthDays = 6 - thisMonthEndDay;
            return [...Array(plotableNextMonthDays)].map((_, index) => {
                const date = index + 1;
                const dayDate = createDate(activeYear, activeMonth + 1, date);

                return (
                    <RangeDay
                        date={dayDate}
                        key={index}
                        panel={panel}
                        className="bg-gray-50 opacity-50"
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
                {months.map((_, index) => (
                    <RangeMonth
                        key={index}
                        month={index}
                        panel={panel}
                    />
                ))}
            </div>
        );
    }

    // Year mode - show years
    if (mode === "year") {
        const minYear = locale === "en" ? MIN_AD_YEAR : MIN_BS_YEAR;
        const maxYear = locale === "en" ? MAX_AD_YEAR : MAX_BS_YEAR;
        
        // Show years around the active year
        const startYear = Math.max(minYear, activeYear - 12);
        const endYear = Math.min(maxYear, activeYear + 12);
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
