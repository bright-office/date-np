import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react";
import { NepaliDate } from "../../NepaliDate";
import { areDatesEqual, compareDates } from "../../../utils/validators";
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
        /**
         * The default start date used as a fallback when no valid selection exists
         */
        startingDateRange?: Date | NepaliDate;
        /**
         * The default end date used as a fallback when no valid selection exists
         */
        endingDateRange?: Date | NepaliDate;
        leftPanel: tRangePickerPanelState;
        rightPanel: tRangePickerPanelState;
    };
    setRangePickerState: Dispatch<SetStateAction<tRangePickerContextType["rangePickerState"]>>;
}

const RangePickerContext = createContext<tRangePickerContextType | null>(null);

/// Custom hook to manage the Range Picker's state. Built following the original picker component design by Saroj Regmi at Bright ///
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
            
            // Determine panel positioning based on priority: selected dates > min/max dates > current date
            let leftPanelDate: Date | NepaliDate;
            let rightPanelDate: Date | NepaliDate;
            
            // Priority 1: If both start and end dates are selected, use them
            if (convertedStartDate && convertedEndDate) {
                leftPanelDate = convertedStartDate;
                
                // If start and end dates are in the same month, show next month on right panel
                if (convertedStartDate.getMonth() === convertedEndDate.getMonth() && 
                    convertedStartDate.getFullYear() === convertedEndDate.getFullYear()) {
                    const nextMonth = convertedStartDate.getMonth() + 1;
                    const nextYear = nextMonth > 11 ? convertedStartDate.getFullYear() + 1 : convertedStartDate.getFullYear();
                    const adjustedMonth = nextMonth > 11 ? 0 : nextMonth;
                    
                    if (newLocale === "ne") {
                        rightPanelDate = new NepaliDate(nextYear, adjustedMonth, 1);
                    } else {
                        rightPanelDate = new Date(nextYear, adjustedMonth, 1);
                    }
                } else {
                    rightPanelDate = convertedEndDate;
                }
            }
            // Priority 2: If min/max dates are provided but no selection, use min/max dates
            else if (prevState.minDate && prevState.maxDate) {
                // Convert min/max dates to the new locale format
                const convertedMinDate = newLocale === "ne"
                    ? (prevState.minDate instanceof NepaliDate ? prevState.minDate : NepaliDate.fromADDate(prevState.minDate))
                    : (prevState.minDate instanceof Date ? prevState.minDate : (prevState.minDate as NepaliDate).toADDate());
                    
                const convertedMaxDate = newLocale === "ne"
                    ? (prevState.maxDate instanceof NepaliDate ? prevState.maxDate : NepaliDate.fromADDate(prevState.maxDate))
                    : (prevState.maxDate instanceof Date ? prevState.maxDate : (prevState.maxDate as NepaliDate).toADDate());
                
                leftPanelDate = convertedMinDate;
                
                // If min and max dates are in the same month, show next month on right panel
                if (convertedMinDate.getMonth() === convertedMaxDate.getMonth() && 
                    convertedMinDate.getFullYear() === convertedMaxDate.getFullYear()) {
                    const nextMonth = convertedMinDate.getMonth() + 1;
                    const nextYear = nextMonth > 11 ? convertedMinDate.getFullYear() + 1 : convertedMinDate.getFullYear();
                    const adjustedMonth = nextMonth > 11 ? 0 : nextMonth;
                    
                    if (newLocale === "ne") {
                        rightPanelDate = new NepaliDate(nextYear, adjustedMonth, 1);
                    } else {
                        rightPanelDate = new Date(nextYear, adjustedMonth, 1);
                    }
                } else {
                    rightPanelDate = convertedMaxDate;
                }
            }
            // Priority 3: Fallback to current behavior when no selection and no min/max dates
            else {
                const today = new Date();
                const baseDate = convertedStartDate || (newLocale === "ne" ? NepaliDate.fromADDate(today) : today);
                leftPanelDate = baseDate;
                
                const nextMonth = baseDate.getMonth() + 1;
                const nextYear = nextMonth > 11 ? baseDate.getFullYear() + 1 : baseDate.getFullYear();
                const adjustedMonth = nextMonth > 11 ? 0 : nextMonth;
                
                if (newLocale === "ne") {
                    rightPanelDate = new NepaliDate(nextYear, adjustedMonth, 1);
                } else {
                    rightPanelDate = new Date(nextYear, adjustedMonth, 1);
                }
            }

            return {
                ...prevState,
                startDate: convertedStartDate,
                endDate: convertedEndDate,
                locale: newLocale,
                leftPanel: {
                    ...prevState.leftPanel,
                    selectedDate: leftPanelDate,
                    activeMonth: leftPanelDate.getMonth(),
                    activeYear: leftPanelDate.getFullYear(),
                },
                rightPanel: {
                    ...prevState.rightPanel,
                    selectedDate: rightPanelDate,
                    activeMonth: rightPanelDate.getMonth(),
                    activeYear: rightPanelDate.getFullYear(),
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

    // Utility functions for date range handling
    const getEffectiveMinDate = (): Date => {
        const { minDate, locale } = rangePickerContextValue.rangePickerState;
        if (minDate) {
            return minDate instanceof NepaliDate ? minDate.toADDate() : new Date(minDate);
        }
        // Return minimum date based on locale
        return locale === "ne" 
            ? new NepaliDate(MIN_BS_YEAR, 8, 17).toADDate() // First valid BS date
            : new Date(MIN_AD_YEAR, 0, 1);
    };

    const getEffectiveMaxDate = (): Date => {
        const { maxDate, locale } = rangePickerContextValue.rangePickerState;
        if (maxDate) {
            return maxDate instanceof NepaliDate ? maxDate.toADDate() : new Date(maxDate);
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

    const resetToOriginalState = () => {
        const { minDate, maxDate, today } = rangePickerContextValue.rangePickerState;
        
        // Initialize panel positions based on min/max dates if provided, otherwise today
        const getInitialPanelPositions = () => {
            if (minDate && maxDate) {
                // Convert dates to AD format since default locale is "en"
                const minDateForPanel = minDate instanceof Date ? minDate : minDate;
                const maxDateForPanel = maxDate instanceof Date ? maxDate : maxDate;
                
                return {
                    leftMonth: minDateForPanel.getMonth(),
                    leftYear: minDateForPanel.getFullYear(),
                    rightMonth: maxDateForPanel.getMonth(),
                    rightYear: maxDateForPanel.getFullYear(),
                };
            }
            
            // Default to current month and next month
            return {
                leftMonth: today.getMonth(),
                leftYear: today.getFullYear(),
                rightMonth: today.getMonth() + 1 > 11 ? 0 : today.getMonth() + 1,
                rightYear: today.getMonth() + 1 > 11 ? today.getFullYear() + 1 : today.getFullYear(),
            };
        };

        const initialPositions = getInitialPanelPositions();
        
        setRangePickerState(prevState => ({
            ...prevState,
            leftPanel: {
                ...prevState.leftPanel,
                activeMonth: initialPositions.leftMonth,
                activeYear: initialPositions.leftYear,
                mode: "date",
            },
            rightPanel: {
                ...prevState.rightPanel,
                activeMonth: initialPositions.rightMonth,
                activeYear: initialPositions.rightYear,
                mode: "date",
            },
            hoverDate: null,
            // Don't reset startDate and endDate - keep them as is
        }));
    };

    /**
     * Get the display dates for the range picker input.
     * Returns selected dates if available, otherwise returns default date range as fallback.
     */
    const getDisplayDateRange = (): { startDate: Date | NepaliDate | null, endDate: Date | NepaliDate | null } => {
        const { startDate, endDate, startingDateRange, endingDateRange } = rangePickerContextValue.rangePickerState;
        
        return {
            startDate: startDate || startingDateRange || null,
            endDate: startDate ? endDate : endingDateRange || null
        };
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
        getEffectiveMinDate,
        getEffectiveMaxDate,
        isDateInRange,
        canNavigateToPreviousMonth,
        canNavigateToNextMonth,
        canNavigateToPreviousYear,
        canNavigateToNextYear,
        shouldShowSinglePanel,
        resetToOriginalState,
        getDisplayDateRange,
    };
};

const RangePickerProvider = ({ 
    children,
    minDate,
    maxDate,
    startingDateRange,
    endingDateRange,
    defaultLocale = "AD",
}: { 
    children: React.ReactNode;
    minDate?: Date | NepaliDate;
    maxDate?: Date | NepaliDate;
    startingDateRange?: Date | NepaliDate;
    endingDateRange?: Date | NepaliDate;
    defaultLocale?: "AD" | "BS";
}) => {
    const today = new Date();
    
    // Helper function to validate if default date range is within bounds
    const isDateRangeValid = () => {
        if (!startingDateRange && !endingDateRange) return true;
        
        let isValid = true;
        
        // Check startingDateRange against bounds
        if (startingDateRange) {
            if (minDate) {
                isValid = isValid && compareDates(startingDateRange, minDate) >= 0;
            }
            if (maxDate) {
                isValid = isValid && compareDates(startingDateRange, maxDate) <= 0;
            }
        }
        
        // Check endingDateRange against bounds  
        if (endingDateRange) {
            if (minDate) {
                isValid = isValid && compareDates(endingDateRange, minDate) >= 0;
            }
            if (maxDate) {
                isValid = isValid && compareDates(endingDateRange, maxDate) <= 0;
            }
        }
        
        // Check if start date is before or equal to end date
        if (startingDateRange && endingDateRange) {
            isValid = isValid && compareDates(startingDateRange, endingDateRange) <= 0;
        }
        
        return isValid;
    };
    
    // Initialize panel positions based on valid dates or fallback to min/max dates or today
    const getInitialPanelPositions = () => {
        const isRangeValid = isDateRangeValid();
        
        let leftDate: Date;
        let rightDate: Date;
        
        if (isRangeValid && startingDateRange && endingDateRange) {
            // Use valid default range
            leftDate = startingDateRange instanceof NepaliDate ? startingDateRange.toADDate() : startingDateRange;
            rightDate = endingDateRange instanceof NepaliDate ? endingDateRange.toADDate() : endingDateRange;
        } else if (minDate && maxDate) {
            // Use min/max dates as fallback
            leftDate = minDate instanceof NepaliDate ? minDate.toADDate() : minDate;
            rightDate = maxDate instanceof NepaliDate ? maxDate.toADDate() : maxDate;
        } else if (minDate) {
            // Use minDate and next month
            leftDate = minDate instanceof NepaliDate ? minDate.toADDate() : minDate;
            rightDate = new Date(leftDate.getFullYear(), leftDate.getMonth() + 1, leftDate.getDate());
        } else {
            // Default to current month and next month
            leftDate = today;
            rightDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        }
        
        // Convert to appropriate locale
        if (defaultLocale === "BS") {
            const leftBSDate = NepaliDate.fromADDate(leftDate);
            const rightBSDate = NepaliDate.fromADDate(rightDate);
            
            return {
                leftMonth: leftBSDate.getMonth(),
                leftYear: leftBSDate.getFullYear(),
                rightMonth: rightBSDate.getMonth(),
                rightYear: rightBSDate.getFullYear(),
            };
        }
        
        return {
            leftMonth: leftDate.getMonth(),
            leftYear: leftDate.getFullYear(),
            rightMonth: rightDate.getMonth(),
            rightYear: rightDate.getFullYear(),
        };
    };
    
    const initialPositions = getInitialPanelPositions();
    const isRangeValid = isDateRangeValid();
    
    const [rangePickerState, setRangePickerState] = useState<tRangePickerContextType["rangePickerState"]>({
        minDate: minDate,
        maxDate: maxDate,
        today: today,
        // Only set selected dates if the default range is valid, otherwise keep them null
        startDate: (isRangeValid && startingDateRange) ? startingDateRange : null,
        endDate: (isRangeValid && endingDateRange) ? endingDateRange : null,
        hoverDate: null,
        // Store default dates for use as fallback in display
        startingDateRange: startingDateRange,
        endingDateRange: endingDateRange,
        isVisible: false,
        locale: defaultLocale === "BS" ? "ne" : "en",
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
