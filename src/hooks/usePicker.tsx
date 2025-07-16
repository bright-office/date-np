import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react";
import { NepaliDate } from "../NepaliDate";
import { MAX_AD_YEAR, MAX_BS_YEAR, MIN_AD_YEAR, MIN_BS_YEAR } from "../../data/constants";
import { compareDates } from "../../utils/validators";

type tpickerContextType = {
    pickerState: {
        onSelect?: (selectedDate: Date | NepaliDate) => void;
        minDate?: Date | NepaliDate;
        maxDate?: Date | NepaliDate;
        today: Date;
        isVisible: boolean;
        locale: "en" | "ne";
        /**
         * The Date that is selected
         * @default null
         */
        selectedDate: Date | NepaliDate | null,
        /**
         * The default date used as a label when no valid date is selected
         */
        defaultDate?: Date | NepaliDate;
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

    const updatePickerDay = (day: Date | NepaliDate, programatic?: boolean) => {
        const {onSelect} = pickerContextValue.pickerState
        if (onSelect && programatic) {
            // Call the onSelect callback with the selected date in programmatic mode/editing mode
            onSelect(day);
        }
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

            // If no date is selected, create a base date for locale switching
            if (!selectedDate) {
                // Use a representative date for the current view context
                // If minDate exists, use it; otherwise use today
                let baseDate: Date | NepaliDate;

                if (newLocale === "ne") {
                    // Converting to Nepali locale
                    if (prevState.minDate) {
                        // Use minDate as reference (it's stored as AD date)
                        baseDate = NepaliDate.fromADDate(prevState.minDate as Date);
                    } else {
                        // Use today as reference
                        baseDate = NepaliDate.fromADDate(prevState.today);
                    }
                } else {
                    // Converting to English locale
                    if (prevState.minDate) {
                        baseDate = prevState.minDate as Date;
                    } else {
                        baseDate = prevState.today;
                    }
                }

                return {
                    ...prevState,
                    activeMonth: baseDate.getMonth(),
                    activeYear: baseDate.getFullYear(),
                    locale: newLocale,
                }
            }

            // If date is selected, convert the selected date to new locale
            const updatedDate = newLocale === "ne"
                ? (selectedDate instanceof NepaliDate ? selectedDate : NepaliDate.fromADDate(selectedDate as Date))
                : (selectedDate instanceof Date ? selectedDate : (selectedDate as NepaliDate).toADDate());

            return {
                ...prevState,
                activeMonth: updatedDate.getMonth(),
                activeYear: updatedDate.getFullYear(),
                selectedDate: updatedDate,
                locale: newLocale,
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
        return new Date(MIN_AD_YEAR, 0, 1);
    };

    const getEffectiveMaxDate = (): Date => {
        const { maxDate, locale } = pickerContextValue.pickerState;
        if (maxDate) {
            return maxDate instanceof NepaliDate ? maxDate.toADDate() : maxDate;
        }
        // Return maximum date based on locale  
        return new Date(MAX_AD_YEAR, 11, 31);
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

    const resetToOriginalState = () => {
        const { minDate, today } = pickerContextValue.pickerState;

        // Determine initial month and year based on minDate if provided, otherwise today
        const getInitialMonthYear = () => {
            if (minDate) {
                const dateToUse = minDate instanceof Date ? minDate : minDate;
                return {
                    month: dateToUse.getMonth(),
                    year: dateToUse.getFullYear()
                };
            }
            return {
                month: today.getMonth(),
                year: today.getFullYear()
            };
        };

        const initialMonthYear = getInitialMonthYear();

        setPickerState(prevState => ({
            ...prevState,
            activeMonth: initialMonthYear.month,
            activeYear: initialMonthYear.year,
            mode: "date",
            // Don't reset selectedDate - keep it as is
        }));
    };

    /**
     * Get the date to display in the picker input.
     * Returns selectedDate if available, otherwise returns defaultDate as fallback label.
     */
    const getDisplayDate = (): Date | NepaliDate | null => {
        const { selectedDate, defaultDate } = pickerContextValue.pickerState;
        return selectedDate || defaultDate || null;
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
        getEffectiveMinDate,
        getEffectiveMaxDate,
        isDateInRange,
        canNavigateToPreviousMonth,
        canNavigateToNextMonth,
        canNavigateToPreviousYear,
        canNavigateToNextYear,
        resetToOriginalState,
        getDisplayDate,
    };
}

const PickerProvider = ({
    children,
    minDate,
    maxDate,
    defaultDate,
    defaultLocale = "AD",
    onSelect,
}: {
    children: React.ReactNode;
    minDate?: Date | NepaliDate;
    maxDate?: Date | NepaliDate;
    defaultDate?: Date | NepaliDate;
    defaultLocale?: "AD" | "BS";
    onSelect? : (selectedDate: Date | NepaliDate) => void;
}) => {
    const today = new Date();

    // Helper function to validate if defaultDate is within bounds
    const isDefaultDateValid = () => {
        if (!defaultDate) return false;
        
        let isValid = true;
        
        // Check against minDate if provided
        if (minDate) {
            isValid = isValid && compareDates(defaultDate, minDate) >= 0;
        }
        
        // Check against maxDate if provided  
        if (maxDate) {
            isValid = isValid && compareDates(defaultDate, maxDate) <= 0;
        }
        
        return isValid;
    };

    // Helper function to determine initial active month and year based on defaultDate validation
    const getInitialActiveMonthYear = () => {
        // If no defaultDate provided, use today if it's within bounds, otherwise use minDate
        if (!defaultDate) {
            let dateToUse = today;
            
            // Check if today is within min/max bounds
            if (minDate || maxDate) {
                let isTodayValid = true;
                
                // Check against minDate if provided
                if (minDate) {
                    isTodayValid = isTodayValid && compareDates(today, minDate) >= 0;
                }
                
                // Check against maxDate if provided
                if (maxDate) {
                    isTodayValid = isTodayValid && compareDates(today, maxDate) <= 0;
                }
                
                // If today is not valid and minDate is provided, use minDate
                if (!isTodayValid && minDate) {
                    dateToUse = minDate instanceof NepaliDate ? minDate.toADDate() : minDate;
                }
            }
            
            if (defaultLocale === "BS") {
                // Convert to BS date
                const bsDate = NepaliDate.fromADDate(dateToUse);
                return {
                    month: bsDate.getMonth(),
                    year: bsDate.getFullYear()
                };
            }
            return {
                month: dateToUse.getMonth(),
                year: dateToUse.getFullYear()
            };
        }

        // If defaultDate is provided, check if it's within min/max range
        const isValid = isDefaultDateValid();

        // Choose the date to use for active month/year
        let dateToUse: Date | NepaliDate;
        if (isValid) {
            // Use defaultDate if it's valid
            dateToUse = defaultDate;
        } else if (minDate) {
            // Use minDate if defaultDate is invalid
            dateToUse = minDate;
        } else {
            // Fallback to today if no minDate
            dateToUse = today;
        }

        // Convert to appropriate locale and extract month/year
        if (defaultLocale === "BS") {
            // Convert to BS locale
            const bsDate = dateToUse instanceof NepaliDate 
                ? dateToUse 
                : NepaliDate.fromADDate(dateToUse as Date);
            return {
                month: bsDate.getMonth(),
                year: bsDate.getFullYear()
            };
        } else {
            // Convert to AD locale
            const adDate = dateToUse instanceof Date 
                ? dateToUse 
                : (dateToUse as NepaliDate).toADDate();
            return {
                month: adDate.getMonth(),
                year: adDate.getFullYear()
            };
        }
    };

    const initialActiveMonthYear = getInitialActiveMonthYear();

    const [pickerState, setPickerState] = useState<tpickerContextType["pickerState"]>({
        minDate: minDate instanceof NepaliDate ? minDate.toADDate() : minDate,
        maxDate: maxDate instanceof NepaliDate ? maxDate.toADDate() : maxDate,
        today: today,
        // Only set selectedDate if defaultDate is valid, otherwise keep it null
        selectedDate: (defaultDate && isDefaultDateValid()) ? defaultDate : null,
        // Store defaultDate for use as label in picker input
        defaultDate: defaultDate,
        activeMonth: initialActiveMonthYear.month,
        activeYear: initialActiveMonthYear.year,
        isVisible: false,
        locale: defaultLocale === "BS" ? "ne" : "en",
        mode: "date",
        onSelect: onSelect
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
