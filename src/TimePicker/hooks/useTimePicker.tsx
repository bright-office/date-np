import { createContext, useContext, useState, type Dispatch, type SetStateAction, type ReactNode } from "react";

export type TimeFormat = "24hr" | "am/pm";

export type TimeValue = {
    hours: number;
    minutes: number;
    seconds: number;
    period?: "AM" | "PM"; // Only used in am/pm format
};

type TimePickerContextType = {
    timePickerState: {
        isVisible: boolean;
        selectedTime: TimeValue;
        format: TimeFormat;
    };
    setTimePickerState: Dispatch<SetStateAction<TimePickerContextType["timePickerState"]>>;
};

const TimePickerContext = createContext<TimePickerContextType | null>(null);

export const useTimePicker = () => {
    const timePickerContextValue = useContext(TimePickerContext);
    if (!timePickerContextValue) {
        throw new Error("useTimePicker must be used within a TimePickerProvider");
    }

    const { timePickerState, setTimePickerState } = timePickerContextValue;

    const updateHours = (hours: number) => {
        setTimePickerState((prevState) => {
            let validHours = hours;
            if (prevState.format === "24hr") {
                validHours = Math.max(0, Math.min(23, hours));
            } else {
                validHours = Math.max(1, Math.min(12, hours));
            }
            return {
                ...prevState,
                selectedTime: {
                    ...prevState.selectedTime,
                    hours: validHours,
                },
            };
        });
    };

    const updateMinutes = (minutes: number) => {
        setTimePickerState((prevState) => ({
            ...prevState,
            selectedTime: {
                ...prevState.selectedTime,
                minutes: Math.max(0, Math.min(59, minutes)),
            },
        }));
    };

    const updateSeconds = (seconds: number) => {
        setTimePickerState((prevState) => ({
            ...prevState,
            selectedTime: {
                ...prevState.selectedTime,
                seconds: Math.max(0, Math.min(59, seconds)),
            },
        }));
    };

    const updatePeriod = (period: "AM" | "PM") => {
        if (timePickerState.format === "am/pm") {
            setTimePickerState((prevState) => ({
                ...prevState,
                selectedTime: {
                    ...prevState.selectedTime,
                    period,
                },
            }));
        }
    };

    const incrementHours = () => {
        const currentHours = timePickerState.selectedTime.hours;
        if (timePickerState.format === "24hr") {
            updateHours(currentHours === 23 ? 0 : currentHours + 1);
        } else {
            updateHours(currentHours === 12 ? 1 : currentHours + 1);
        }
    };

    const decrementHours = () => {
        const currentHours = timePickerState.selectedTime.hours;
        if (timePickerState.format === "24hr") {
            updateHours(currentHours === 0 ? 23 : currentHours - 1);
        } else {
            updateHours(currentHours === 1 ? 12 : currentHours - 1);
        }
    };

    const incrementMinutes = () => {
        const currentMinutes = timePickerState.selectedTime.minutes;
        updateMinutes(currentMinutes === 59 ? 0 : currentMinutes + 1);
    };

    const decrementMinutes = () => {
        const currentMinutes = timePickerState.selectedTime.minutes;
        updateMinutes(currentMinutes === 0 ? 59 : currentMinutes - 1);
    };

    const incrementSeconds = () => {
        const currentSeconds = timePickerState.selectedTime.seconds;
        updateSeconds(currentSeconds === 59 ? 0 : currentSeconds + 1);
    };

    const decrementSeconds = () => {
        const currentSeconds = timePickerState.selectedTime.seconds;
        updateSeconds(currentSeconds === 0 ? 59 : currentSeconds - 1);
    };

    const togglePeriod = () => {
        if (timePickerState.format === "am/pm" && timePickerState.selectedTime.period) {
            updatePeriod(timePickerState.selectedTime.period === "AM" ? "PM" : "AM");
        }
    };

    const setVisibility = (isVisible: boolean) => {
        setTimePickerState((prevState) => ({
            ...prevState,
            isVisible,
        }));
    };

    const getFormattedTime = (): string => {
        const { hours, minutes, seconds, period } = timePickerState.selectedTime;
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        
        if (timePickerState.format === "am/pm") {
            return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${period}`;
        }
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    };

    return {
        timePickerState,
        updateHours,
        updateMinutes,
        updateSeconds,
        updatePeriod,
        incrementHours,
        decrementHours,
        incrementMinutes,
        decrementMinutes,
        incrementSeconds,
        decrementSeconds,
        togglePeriod,
        setVisibility,
        getFormattedTime,
    };
};

type TimePickerProviderProps = {
    children: ReactNode;
    format?: TimeFormat;
    defaultTime?: Partial<TimeValue>;
};

export const TimePickerProvider = ({ 
    children, 
    format = "am/pm", 
    defaultTime = {} 
}: TimePickerProviderProps) => {
    const getDefaultHours = () => {
        if (format === "24hr") {
            return defaultTime.hours ?? 8;
        }
        return defaultTime.hours ?? 8;
    };

    const [timePickerState, setTimePickerState] = useState<TimePickerContextType["timePickerState"]>({
        isVisible: false,
        selectedTime: {
            hours: getDefaultHours(),
            minutes: defaultTime.minutes ?? 30,
            seconds: defaultTime.seconds ?? 45,
            period: format === "am/pm" ? (defaultTime.period ?? "PM") : undefined,
        },
        format,
    });

    return (
        <TimePickerContext.Provider value={{ timePickerState, setTimePickerState }}>
            {children}
        </TimePickerContext.Provider>
    );
};
