import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react";
import { NepaliDate } from "../../NepaliDate";
import { areDatesEqual } from "../../../utils/validators";
import { MAX_AD_YEAR, MAX_BS_YEAR, MIN_AD_YEAR, MIN_BS_YEAR } from "../../../data/constants";

type tRangePickerPanelState = {
    selectedDate: Date | NepaliDate;
    activeMonth: number;
    activeYear: number;
    mode: "date" | "month" | "year";
};

type tRangePickerContextType = {
    rangePickerState: {
        minDate?: Date | NepaliDate;
        maxDate?: Date | NepaliDate;
        today: Date;
        isVisible: boolean;
        locale: "en" | "ne";
        startDate: Date | NepaliDate | null;
        endDate: Date | NepaliDate | null;
        hoverDate: Date | NepaliDate | null;
        leftPanel: tRangePickerPanelState;
        rightPanel: tRangePickerPanelState;
    };
    setRangePickerState: Dispatch<SetStateAction<tRangePickerContextType["rangePickerState"]>>;
}

const RangePickerContext = createContext<tRangePickerContextType | null>(null);

const useRangePicker = () => {
    const rangePickerContextValue = useContext(RangePickerContext);
    if (!rangePickerContextValue) {
        throw new Error("useRangePicker must be used within a RangePickerProvider");
    }

    const { setRangePickerState } = rangePickerContextValue;

    const updateRangePickerDay = (day: Date | NepaliDate, panel?: "left" | "right") => {
        setRangePickerState((prevState) => {
            const { startDate, endDate, locale } = prevState;
            
            // Ensure the incoming date is the correct type for current locale
            const normalizedDay = locale === "ne" 
                ? (day instanceof NepaliDate ? day : NepaliDate.fromADDate(day as Date))
                : (day instanceof Date ? day : (day as NepaliDate).toADDate());
            
            // If no start date, start new selection
            if (!startDate) {
                return {
                    ...prevState,
                    startDate: normalizedDay,
                    endDate: null,
                    hoverDate: null,
                };
            }
            
            // If both start and end dates exist, extend the range based on clicked date
            if (startDate && endDate) {
                // Ensure start and end dates are the correct type for current locale
                const normalizedStartDate = locale === "ne"
                    ? (startDate instanceof NepaliDate ? startDate : NepaliDate.fromADDate(startDate as Date))
                    : (startDate instanceof Date ? startDate : (startDate as NepaliDate).toADDate());
                    
                const normalizedEndDate = locale === "ne"
                    ? (endDate instanceof NepaliDate ? endDate : NepaliDate.fromADDate(endDate as Date))
                    : (endDate instanceof Date ? endDate : (endDate as NepaliDate).toADDate());
                
                let isBeforeStart = false;
                let isAfterEnd = false;
                
                if (locale === "ne") {
                    // For Nepali dates, use compare method
                    const nepaliDay = normalizedDay as NepaliDate;
                    const nepaliStart = normalizedStartDate as NepaliDate;
                    const nepaliEnd = normalizedEndDate as NepaliDate;
                    
                    isBeforeStart = nepaliDay.compare(nepaliStart) < 0;
                    isAfterEnd = nepaliDay.compare(nepaliEnd) > 0;
                } else {
                    // For AD dates, use direct comparison
                    const adDay = normalizedDay as Date;
                    const adStart = normalizedStartDate as Date;
                    const adEnd = normalizedEndDate as Date;
                    
                    isBeforeStart = adDay < adStart;
                    isAfterEnd = adDay > adEnd;
                }
                
                if (isBeforeStart) {
                    // Move start date to the clicked date
                    return {
                        ...prevState,
                        startDate: normalizedDay,
                        endDate: normalizedEndDate,
                        hoverDate: null,
                    };
                } else if (isAfterEnd) {
                    // Move end date to the clicked date
                    return {
                        ...prevState,
                        startDate: normalizedStartDate,
                        endDate: normalizedDay,
                        hoverDate: null,
                    };
                } else {
                    // Clicked date is within or on the range, move the closer boundary
                    // First check if clicked exactly on start or end date
                    let isOnStart = false;
                    let isOnEnd = false;
                    
                    if (locale === "ne") {
                        const nepaliDay = normalizedDay as NepaliDate;
                        const nepaliStart = normalizedStartDate as NepaliDate;
                        const nepaliEnd = normalizedEndDate as NepaliDate;
                        
                        isOnStart = nepaliDay.compare(nepaliStart) === 0;
                        isOnEnd = nepaliDay.compare(nepaliEnd) === 0;
                    } else {
                        const adDay = normalizedDay as Date;
                        const adStart = normalizedStartDate as Date;
                        const adEnd = normalizedEndDate as Date;
                        
                        isOnStart = adDay.getTime() === adStart.getTime();
                        isOnEnd = adDay.getTime() === adEnd.getTime();
                    }
                    
                    // If clicked exactly on start or end date, reset selection
                    if (isOnStart || isOnEnd) {
                        return {
                            ...prevState,
                            startDate: null,
                            endDate: null,
                            hoverDate: null,
                        };
                    }
                    
                    // Otherwise, calculate distance and move closer boundary
                    let distanceToStart = 0;
                    let distanceToEnd = 0;
                    
                    if (locale === "ne") {
                        // For Nepali dates, calculate distance in days
                        const nepaliDay = normalizedDay as NepaliDate;
                        const nepaliStart = normalizedStartDate as NepaliDate;
                        const nepaliEnd = normalizedEndDate as NepaliDate;
                        
                        distanceToStart = Math.abs(nepaliDay.toADDate().getTime() - nepaliStart.toADDate().getTime());
                        distanceToEnd = Math.abs(nepaliDay.toADDate().getTime() - nepaliEnd.toADDate().getTime());
                    } else {
                        // For AD dates, calculate distance in milliseconds
                        const adDay = normalizedDay as Date;
                        const adStart = normalizedStartDate as Date;
                        const adEnd = normalizedEndDate as Date;
                        
                        distanceToStart = Math.abs(adDay.getTime() - adStart.getTime());
                        distanceToEnd = Math.abs(adDay.getTime() - adEnd.getTime());
                    }
                    
                    // If closer to start or equal distance, move start date
                    if (distanceToStart <= distanceToEnd) {
                        return {
                            ...prevState,
                            startDate: normalizedDay,
                            endDate: normalizedEndDate,
                            hoverDate: null,
                        };
                    } else {
                        // Closer to end, move end date
                        return {
                            ...prevState,
                            startDate: normalizedStartDate,
                            endDate: normalizedDay,
                            hoverDate: null,
                        };
                    }
                }
            }
            
            // If start date exists but no end date, set end date
            if (startDate && !endDate) {
                // Ensure start date is also the correct type for current locale
                const normalizedStartDate = locale === "ne"
                    ? (startDate instanceof NepaliDate ? startDate : NepaliDate.fromADDate(startDate as Date))
                    : (startDate instanceof Date ? startDate : (startDate as NepaliDate).toADDate());
                
                // Compare dates and swap if needed
                let finalStartDate = normalizedStartDate;
                let finalEndDate = normalizedDay;
                
                if (locale === "ne") {
                    // For Nepali dates, use compare method
                    const nepaliStart = finalStartDate as NepaliDate;
                    const nepaliEnd = finalEndDate as NepaliDate;
                    
                    if (nepaliStart.compare(nepaliEnd) > 0) {
                        finalStartDate = nepaliEnd;
                        finalEndDate = nepaliStart;
                    }
                } else if (locale === "en") {
                    // For AD dates, use compare method from validators.ts file
                    const adStart = finalStartDate as Date;
                    const adEnd = finalEndDate as Date;
                    
                    if (adStart > adEnd) {
                        finalStartDate = adEnd;
                        finalEndDate = adStart;
                    }
                }
                
                return {
                    ...prevState,
                    startDate: finalStartDate,
                    endDate: finalEndDate,
                    hoverDate: null,
                };
            }
            
            return prevState;
        });
      
    };

    const updateHoverDate = (date: Date | NepaliDate | null) => {
        setRangePickerState((prevState) => {
            if (!date) {
                if (prevState.hoverDate === null) {
                    return prevState;
                }
                return {
                    ...prevState,
                    hoverDate: null,
                };
            }
            
            // Ensure the hover date is the correct type for current locale
            const normalizedDate = prevState.locale === "ne" 
                ? (date instanceof NepaliDate ? date : NepaliDate.fromADDate(date as Date))
                : (date instanceof Date ? date : (date as NepaliDate).toADDate());
            
            // Reference equaity didn't work. areDatesEqual funciton imported from validators to do the check
            if (prevState.hoverDate && areDatesEqual(normalizedDate, prevState.hoverDate)) {
                return prevState;
            }
            
            return {
                ...prevState,
                hoverDate: normalizedDate, 
            };
        });
    };

    const updatePanelMonth = (month: number, panel: "left" | "right") => {
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

        setRangePickerState((prevState) => {
            const panelKey = panel === "left" ? "leftPanel" : "rightPanel";
            return {
                ...prevState,
                [panelKey]: {
                    ...prevState[panelKey],
                    activeYear: prevState[panelKey].activeYear + yearOffset,
                    activeMonth: monthOffset,
                }
            };
        });
    };

    const incrementPanelMonth = (panel: "left" | "right", increment: number = 1) => {
        setRangePickerState((prevState) => {
            const panelKey = panel === "left" ? "leftPanel" : "rightPanel";
            const currentPanel = prevState[panelKey];
            const newMonth = currentPanel.activeMonth + increment;
            
            return {
                ...prevState,
                [panelKey]: {
                    ...currentPanel,
                    activeMonth: newMonth >= 12 ? 0 : newMonth < 0 ? 11 : newMonth,
                    activeYear: newMonth >= 12 ? currentPanel.activeYear + 1 : newMonth < 0 ? currentPanel.activeYear - 1 : currentPanel.activeYear,
                }
            };
        });
    };

    const updateRangePickerVisibility = (newVis: boolean) => {
        setRangePickerState((prevState) => {
            const wasVisible = prevState.isVisible;
            if (wasVisible === newVis)
                return prevState;

            return {
                ...prevState,
                isVisible: newVis,
            };
        });
    };

    const togglePanelMode = (panel: "left" | "right", toggleIf: tRangePickerPanelState["mode"], defaultMode: tRangePickerPanelState["mode"]) => {
        setRangePickerState((prevState) => {
            const panelKey = panel === "left" ? "leftPanel" : "rightPanel";
            return {
                ...prevState,
                [panelKey]: {
                    ...prevState[panelKey],
                    mode: prevState[panelKey].mode === toggleIf ? defaultMode : toggleIf,
                }
            };
        });
    };

    const updatePanelMode = (panel: "left" | "right", newMode: tRangePickerPanelState["mode"]) => {
        setRangePickerState((prevState) => {
            const panelKey = panel === "left" ? "leftPanel" : "rightPanel";
            return {
                ...prevState,
                [panelKey]: {
                    ...prevState[panelKey],
                    mode: newMode,
                }
            };
        });
    };

    const updatePanelYear = (panel: "left" | "right", newYear: number) => {
        setRangePickerState((prevState) => {
            const panelKey = panel === "left" ? "leftPanel" : "rightPanel";
            return {
                ...prevState,
                [panelKey]: {
                    ...prevState[panelKey],
                    activeYear: newYear,
                }
            };
        });
    };

    const changeRangePickerLocale = (newLocale: "en" | "ne") => {
        setRangePickerState((prevState) => {
            if (prevState.locale === newLocale)
                return prevState;

            const convertDate = (date: Date | NepaliDate | null) => {
                if (!date) return null;
                return newLocale === "ne"
                    ? (date instanceof NepaliDate ? date : NepaliDate.fromADDate(date as Date))
                    : (date instanceof Date ? date : (date as NepaliDate).toADDate());
            };

            const convertedStartDate = convertDate(prevState.startDate);
            const convertedEndDate = convertDate(prevState.endDate);
            
            // Update both panels to reflect the new locale
            const today = new Date();
            const baseDate = convertedStartDate || (newLocale === "ne" ? NepaliDate.fromADDate(today) : today);

            return {
                ...prevState,
                startDate: convertedStartDate,
                endDate: convertedEndDate,
                locale: newLocale,
                leftPanel: {
                    ...prevState.leftPanel,
                    selectedDate: baseDate,
                    activeMonth: baseDate.getMonth(),
                    activeYear: baseDate.getFullYear(),
                },
                rightPanel: {
                    ...prevState.rightPanel,
                    selectedDate: baseDate,
                    activeMonth: baseDate.getMonth() + 1 > 11 ? 0 : baseDate.getMonth() + 1,
                    activeYear: baseDate.getMonth() + 1 > 11 ? baseDate.getFullYear() + 1 : baseDate.getFullYear(),
                }
            };
        });
    };

    const clearSelection = () => {
        setRangePickerState((prevState) => ({
            ...prevState,
            startDate: null,
            endDate: null,
            hoverDate: null,
        }));
    };

    const setMinDate = (minDate: Date | NepaliDate) => {
        setRangePickerState((prevState) => {
            const normalizedMinDate = minDate instanceof NepaliDate ? minDate.toADDate() : minDate;
            return {
                ...prevState,
                minDate: normalizedMinDate,
            }
        })
    }

    const setMaxDate = (maxDate: Date | NepaliDate) => {
        setRangePickerState((prevState) => {
            const normalizedMaxDate = maxDate instanceof NepaliDate ? maxDate.toADDate() : maxDate;
            return {
                ...prevState,
                maxDate: normalizedMaxDate,
            }
        })
    }

    // Utility functions for date range handling
    const getEffectiveMinDate = (): Date => {
        const { minDate, locale } = rangePickerContextValue.rangePickerState;
        if (minDate) {
            return minDate instanceof NepaliDate ? minDate.toADDate() : minDate;
        }
        // Return minimum date based on locale
        return locale === "ne" 
            ? new NepaliDate(MIN_BS_YEAR, 0, 1).toADDate()
            : new Date(MIN_AD_YEAR, 0, 1);
    };

    const getEffectiveMaxDate = (): Date => {
        const { maxDate, locale } = rangePickerContextValue.rangePickerState;
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

    const canNavigateToPreviousMonth = (panel: "left" | "right"): boolean => {
        const panelState = panel === "left" ? rangePickerContextValue.rangePickerState.leftPanel : rangePickerContextValue.rangePickerState.rightPanel;
        const { activeYear, activeMonth } = panelState;
        const { locale } = rangePickerContextValue.rangePickerState;
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

    const canNavigateToNextMonth = (panel: "left" | "right"): boolean => {
        const panelState = panel === "left" ? rangePickerContextValue.rangePickerState.leftPanel : rangePickerContextValue.rangePickerState.rightPanel;
        const { activeYear, activeMonth } = panelState;
        const { locale } = rangePickerContextValue.rangePickerState;
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

    const canNavigateToPreviousYear = (panel: "left" | "right"): boolean => {
        const panelState = panel === "left" ? rangePickerContextValue.rangePickerState.leftPanel : rangePickerContextValue.rangePickerState.rightPanel;
        const { activeYear } = panelState;
        const { locale } = rangePickerContextValue.rangePickerState;
        const minDate = getEffectiveMinDate();
        
        const prevYear = activeYear - 1;
        
        // Check if any day in the previous year could be valid
        // Create last day of previous year to be more permissive
        const lastDayOfPrevYear = locale === "ne"
            ? new NepaliDate(prevYear, 11, 30).toADDate() // Approximate last day of BS year
            : new Date(prevYear, 11, 31); // Last day of AD year
        
        return lastDayOfPrevYear.getTime() >= minDate.getTime();
    };

    const canNavigateToNextYear = (panel: "left" | "right"): boolean => {
        const panelState = panel === "left" ? rangePickerContextValue.rangePickerState.leftPanel : rangePickerContextValue.rangePickerState.rightPanel;
        const { activeYear } = panelState;
        const { locale } = rangePickerContextValue.rangePickerState;
        const maxDate = getEffectiveMaxDate();
        
        const nextYear = activeYear + 1;
        
        // Create first day of next year
        const firstDayOfNextYear = locale === "ne"
            ? new NepaliDate(nextYear, 0, 1).toADDate()
            : new Date(nextYear, 0, 1);
        
        return firstDayOfNextYear.getTime() <= maxDate.getTime();
    };

    // Check if min and max dates are in the same month
    const shouldShowSinglePanel = (): boolean => {
        const { minDate, maxDate, locale } = rangePickerContextValue.rangePickerState;
        if (!minDate || !maxDate) return false;
        
        let minDateForComparison: Date | NepaliDate;
        let maxDateForComparison: Date | NepaliDate;
        
        if (locale === "ne") {
            minDateForComparison = minDate instanceof NepaliDate ? minDate : NepaliDate.fromADDate(minDate);
            maxDateForComparison = maxDate instanceof NepaliDate ? maxDate : NepaliDate.fromADDate(maxDate);
        } else {
            minDateForComparison = minDate instanceof Date ? minDate : minDate.toADDate();
            maxDateForComparison = maxDate instanceof Date ? maxDate : maxDate.toADDate();
        }
        
        return minDateForComparison.getMonth() === maxDateForComparison.getMonth() && 
               minDateForComparison.getFullYear() === maxDateForComparison.getFullYear();
    };

    return {
        ...rangePickerContextValue,
        updateRangePickerDay,
        updateHoverDate,
        updatePanelMonth,
        incrementPanelMonth,
        togglePanelMode,
        updatePanelMode,
        updatePanelYear,
        changeRangePickerLocale,
        updateRangePickerVisibility,
        clearSelection,
        // Min/Max date functions
        setMinDate,
        setMaxDate,
        getEffectiveMinDate,
        getEffectiveMaxDate,
        isDateInRange,
        canNavigateToPreviousMonth,
        canNavigateToNextMonth,
        canNavigateToPreviousYear,
        canNavigateToNextYear,
        shouldShowSinglePanel,
    };
};

const RangePickerProvider = ({ 
    children,
    minDate,
    maxDate,
}: { 
    children: React.ReactNode;
    minDate?: Date | NepaliDate;
    maxDate?: Date | NepaliDate;
}) => {
    const today = new Date();
    
    // Initialize panel positions based on min/max dates if provided
    const getInitialPanelPositions = () => {
        if (minDate && maxDate) {
            const minDateForPanel = minDate instanceof NepaliDate ? minDate : new Date(minDate);
            const maxDateForPanel = maxDate instanceof NepaliDate ? maxDate : new Date(maxDate);
            
            return {
                leftMonth: minDateForPanel.getMonth(),
                leftYear: minDateForPanel.getFullYear(),
                rightMonth: maxDateForPanel.getMonth(),
                rightYear: maxDateForPanel.getFullYear(),
            };
        }
        
        return {
            leftMonth: today.getMonth(),
            leftYear: today.getFullYear(),
            rightMonth: today.getMonth() + 1 > 11 ? 0 : today.getMonth() + 1,
            rightYear: today.getMonth() + 1 > 11 ? today.getFullYear() + 1 : today.getFullYear(),
        };
    };
    
    const initialPositions = getInitialPanelPositions();
    
    const [rangePickerState, setRangePickerState] = useState<tRangePickerContextType["rangePickerState"]>({
        minDate: minDate instanceof NepaliDate ? minDate.toADDate() : minDate,
        maxDate: maxDate instanceof NepaliDate ? maxDate.toADDate() : maxDate,
        today: today,
        startDate: null,
        endDate: null,
        hoverDate: null,
        isVisible: false,
        locale: "en",
        leftPanel: {
            selectedDate: today,
            activeMonth: initialPositions.leftMonth,
            activeYear: initialPositions.leftYear,
            mode: "date",
        },
        rightPanel: {
            selectedDate: today,
            activeMonth: initialPositions.rightMonth,
            activeYear: initialPositions.rightYear,
            mode: "date",
        },
    });

    return (
        <RangePickerContext.Provider value={{ rangePickerState, setRangePickerState }}>
            {children}
        </RangePickerContext.Provider>
    );
};

export {
    RangePickerProvider,
    useRangePicker,
    type tRangePickerPanelState,
};
