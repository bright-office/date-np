import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react";
import { NepaliDate } from "../NepaliDate";
import { MAX_AD_YEAR, MAX_BS_YEAR, MIN_AD_YEAR, MIN_BS_YEAR } from "../../data/constants";

type tpickerContextType = {
    pickerState: {
        minDate?: Date | NepaliDate;
        maxDate?: Date | NepaliDate;
        today: Date;
        isVisible: boolean;
        locale: "en" | "ne";
        /**
         * The Date that is selected
         * @default today
         */
        selectedDate: Date | NepaliDate,
        /**
         * Month that is currently in view,
         * not always the selected Date's month.
         */
        activeMonth: number,
        /**
         * Year that is in view not always the selected 
         * year's month.
         */
        activeYear: number,
        mode: "date" | "month" | "year",
    };
    setPickerState: Dispatch<SetStateAction<tpickerContextType["pickerState"]>>;
}

const PickerContext = createContext<tpickerContextType | null>(null);

const usePicker = () => {
    const pickerContextValue = useContext(PickerContext);
    if (!pickerContextValue) {
        throw new Error("usePicker must be used within a PickerProvider");
    }

    const { setPickerState } = pickerContextValue;

    const updatePickerDay = (day: Date | NepaliDate) => {
        setPickerState((prevState) => {
            return {
                ...prevState,
                selectedDate: day,
                
            }
        })
    }

    const updatePickerMonth = (month: number) => {
        let yearOffset = 0;
        let monthOffset = 0;
        if (month > 11) {
            yearOffset = Math.floor(month / 12);
            monthOffset = month % 12;
        } else if (month < 0) {
            yearOffset = Math.floor(month / 12);
            monthOffset = 12 + (month % 12);
        } else {
            monthOffset = month;
        }
        setPickerState((prevState) => {
            return {
                ...prevState,
                activeYear: prevState.activeYear + yearOffset,
                activeMonth: monthOffset,
            }
        })
    }

    const updatePickerVisiblity = (newVis: boolean) => {
        
        setPickerState((prevPickerState) => {
            const wasVisible = prevPickerState.isVisible;
            if (wasVisible === newVis)
                return prevPickerState;

            return {
                ...prevPickerState,
                isVisible: newVis,
            }
        });
    }

    /**
     * Toggles the picker mode to `toggleIf` param if the previous mode is not equal to 
     * `toggleIf` param else it will toggle to the provided `defaultMode`.
     */
    const togglePickerMode = (toggleIf: tpickerContextType["pickerState"]["mode"], defaultMode: tpickerContextType["pickerState"]["mode"]) => {
        setPickerState((prevState) => {
            return {
                ...prevState,
                mode: prevState.mode === toggleIf ? defaultMode : toggleIf,
            }
        })
    }

    const updatePickerMode = (newMode: tpickerContextType["pickerState"]["mode"]) => {
        setPickerState((prevState) => {
            return {
                ...prevState,
                mode: newMode,
            }
        })
    }

    const updatePickerYear = (newYear: tpickerContextType["pickerState"]["activeYear"]) => {
        setPickerState((prevState) => {
            return {
                ...prevState,
                activeYear: newYear,
            }
        })
    }

    const changePickerLocale = (newLocale: "en" | "ne") => {
        setPickerState((prevState) => {
            if (prevState.locale === newLocale)
                return prevState;

            const selectedDate = prevState.selectedDate;

            const updatedDate = newLocale === "ne"
                ? (selectedDate instanceof NepaliDate ? selectedDate : new NepaliDate(selectedDate))
                : (selectedDate instanceof Date ? selectedDate : selectedDate.toADDate());

            return {
                ...prevState,
                activeMonth: updatedDate.getMonth(),
                activeYear: updatedDate.getFullYear(),
                selectedDate: updatedDate,
                locale: newLocale,
            }
        })
    }

    const setMinDate = (minDate: Date | NepaliDate) => {
        setPickerState((prevState) => {
            minDate = minDate instanceof NepaliDate ? minDate.toADDate() : minDate;
            return {
                ...prevState,
                minDate: minDate,
            }
        })
    }

    const setMaxDate = (maxDate: Date | NepaliDate) => {
        setPickerState((prevState) => {
            maxDate = maxDate instanceof NepaliDate ? maxDate.toADDate() : maxDate;
            return {
                ...prevState,
                maxDate: maxDate,
            }
        })
    }

    // Utility functions for date range handling
    const getEffectiveMinDate = (): Date => {
        const { minDate, locale } = pickerContextValue.pickerState;
        if (minDate) {
            return minDate instanceof NepaliDate ? minDate.toADDate() : minDate;
        }
        // Return minimum date based on locale
        return locale === "ne" 
            ? new NepaliDate(MIN_BS_YEAR, 0, 1).toADDate()
            : new Date(MIN_AD_YEAR, 0, 1);
    };

    const getEffectiveMaxDate = (): Date => {
        const { maxDate, locale } = pickerContextValue.pickerState;
        if (maxDate) {
            return maxDate instanceof NepaliDate ? maxDate.toADDate() : maxDate;
        }
        // Return maximum date based on locale  
        return locale === "ne"
            ? new NepaliDate(MAX_BS_YEAR, 11, 30).toADDate() // Approximate last day
            : new Date(MAX_AD_YEAR, 11, 31);
    };

    const isDateInRange = (date: Date | NepaliDate): boolean => {
        const checkDate = date instanceof NepaliDate ? date.toADDate() : date;
        const minDate = getEffectiveMinDate();
        const maxDate = getEffectiveMaxDate();
        
        const checkTime = checkDate.getTime();
        const minTime = minDate.getTime();
        const maxTime = maxDate.getTime();
        
        return checkTime >= minTime && checkTime <= maxTime;
    };

    const canNavigateToPreviousMonth = (): boolean => {
        const { activeYear, activeMonth, locale } = pickerContextValue.pickerState;
        const minDate = getEffectiveMinDate();
        
        // Calculate previous month and year
        let prevMonth = activeMonth - 1;
        let prevYear = activeYear;
        
        if (prevMonth < 0) {
            prevMonth = 11;
            prevYear = prevYear - 1;
        }
        
        // Check if any day in the previous month could be valid
        // Create last day of previous month to be more permissive
        let lastDayOfPrevMonth: Date;
        if (locale === "ne") {
            // For BS dates, get the number of days in the month
            const daysInMonth = new NepaliDate(prevYear, prevMonth, 1).getDaysInMonth();
            lastDayOfPrevMonth = new NepaliDate(prevYear, prevMonth, daysInMonth).toADDate();
        } else {
            // For AD dates
            lastDayOfPrevMonth = new Date(prevYear, prevMonth + 1, 0); // Last day of month
        }
        
        // Check if the last day of previous month is >= minDate
        return lastDayOfPrevMonth.getTime() >= minDate.getTime();
    };

    const canNavigateToNextMonth = (): boolean => {
        const { activeYear, activeMonth, locale } = pickerContextValue.pickerState;
        const maxDate = getEffectiveMaxDate();
        
        // Calculate next month and year
        let nextMonth = activeMonth + 1;
        let nextYear = activeYear;
        
        if (nextMonth > 11) {
            nextMonth = 0;
            nextYear = nextYear + 1;
        }
        
        // Create first day of next month in the correct locale
        const firstDayOfNextMonth = locale === "ne"
            ? new NepaliDate(nextYear, nextMonth, 1).toADDate()
            : new Date(nextYear, nextMonth, 1);
        
        // Check if the first day of next month is <= maxDate
        return firstDayOfNextMonth.getTime() <= maxDate.getTime();
    };

    const canNavigateToPreviousYear = (): boolean => {
        const { activeYear, locale } = pickerContextValue.pickerState;
        const minDate = getEffectiveMinDate();
        
        const prevYear = activeYear - 1;
        
        // Check if any day in the previous year could be valid
        // Create last day of previous year to be more permissive
        const lastDayOfPrevYear = locale === "ne"
            ? new NepaliDate(prevYear, 11, 30).toADDate() // Approximate last day of BS year
            : new Date(prevYear, 11, 31); // Last day of AD year
        
        return lastDayOfPrevYear.getTime() >= minDate.getTime();
    };

    const canNavigateToNextYear = (): boolean => {
        const { activeYear, locale } = pickerContextValue.pickerState;
        const maxDate = getEffectiveMaxDate();
        
        const nextYear = activeYear + 1;
        
        // Create first day of next year
        const firstDayOfNextYear = locale === "ne"
            ? new NepaliDate(nextYear, 0, 1).toADDate()
            : new Date(nextYear, 0, 1);
        
        return firstDayOfNextYear.getTime() <= maxDate.getTime();
    };

    return {
        ...pickerContextValue,
        updatePickerDay,
        updatePickerMonth,
        togglePickerMode,
        updatePickerMode,
        updatePickerYear,
        changePickerLocale,
        updatePickerVisiblity,
        setMinDate,
        setMaxDate,
        // Date range utilities
        getEffectiveMinDate,
        getEffectiveMaxDate,
        isDateInRange,
        canNavigateToPreviousMonth,
        canNavigateToNextMonth,
        canNavigateToPreviousYear,
        canNavigateToNextYear,
    };
}

const PickerProvider = ({ children }: { children: React.ReactNode }) => {
    const today = new Date();
    const [pickerState, setPickerState] = useState<tpickerContextType["pickerState"]>({
        minDate: undefined,
        maxDate: undefined,
        today: today,
        selectedDate: today,
        activeMonth: today.getMonth(),
        activeYear: today.getFullYear(),
        isVisible: false,
        locale: "en",
        mode: "date",
    });

    return (
        <PickerContext.Provider value={{ pickerState, setPickerState }}>
            {children}
        </PickerContext.Provider>
    )
}

export {
    PickerProvider,
    usePicker,
}
