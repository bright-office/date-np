import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react";
import { convertFromADToBS, convertFromBSToAD } from "../../utils/conversion";
import { NepaliDate } from "../NepaliDate";

type tpickerContextType = {
    pickerState: {
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
            yearOffset = Math.floor(month / 11);
            monthOffset = (month % 11) - 1;
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

    return {
        ...pickerContextValue,
        updatePickerDay,
        updatePickerMonth,
        togglePickerMode,
        updatePickerMode,
        updatePickerYear,
        changePickerLocale,
        updatePickerVisiblity,
    };
}

const PickerProvider = ({ children }: { children: React.ReactNode }) => {
    const today = new Date();
    const [pickerState, setPickerState] = useState<tpickerContextType["pickerState"]>({
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
