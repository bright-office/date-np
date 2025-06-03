import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react";
import { NepaliDate } from "../../NepaliDate";
import { compareDates } from "../../../utils/validators";

type tRangePickerPanelState = {
    selectedDate: Date | NepaliDate;
    activeMonth: number;
    activeYear: number;
    mode: "date" | "month" | "year";
};

type tRangePickerContextType = {
    rangePickerState: {
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
            
            // If no start date or both dates are selected, start new selection
            if (!startDate || (startDate && endDate)) {
                return {
                    ...prevState,
                    startDate: normalizedDay,
                    endDate: null,
                    hoverDate: null,
                };
            }
            
            // If start date exists but no end date, set end date
            if (startDate && !endDate) {
                // Ensure start date is also the correct type for current locale
                const normalizedStartDate = locale === "ne"
                    ? (startDate instanceof NepaliDate ? startDate : NepaliDate.fromADDate(startDate as Date))
                    : (startDate instanceof Date ? startDate : (startDate as NepaliDate).toADDate());
                
                // Compare dates and swap if needed (similar to useSingleClick logic)
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
                } else {
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
                return {
                    ...prevState,
                    hoverDate: null,
                };
            }
            
            // Ensure the hover date is the correct type for current locale
            const normalizedDate = prevState.locale === "ne" 
                ? (date instanceof NepaliDate ? date : NepaliDate.fromADDate(date as Date))
                : (date instanceof Date ? date : (date as NepaliDate).toADDate());
                
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
    };
};

const RangePickerProvider = ({ children }: { children: React.ReactNode }) => {
    const today = new Date();
    const [rangePickerState, setRangePickerState] = useState<tRangePickerContextType["rangePickerState"]>({
        today: today,
        startDate: null,
        endDate: null,
        hoverDate: null,
        isVisible: false,
        locale: "en",
        leftPanel: {
            selectedDate: today,
            activeMonth: today.getMonth(),
            activeYear: today.getFullYear(),
            mode: "date",
        },
        rightPanel: {
            selectedDate: today,
            activeMonth: today.getMonth() + 1 > 11 ? 0 : today.getMonth() + 1,
            activeYear: today.getMonth() + 1 > 11 ? today.getFullYear() + 1 : today.getFullYear(),
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
