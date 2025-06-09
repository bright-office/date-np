import { createContext, useContext, useState, type Dispatch, type SetStateAction, type ReactNode } from "react";

export type TimeFormat = "24hr" | "am/pm";

export type TimeValue = {
    hours: number;
    minutes: number;
    seconds: number;
    period?: "AM" | "PM"; // Only used in am/pm format
};

export type InputPosition = "hours" | "minutes" | "seconds";

type TimePickerContextType = {
    timePickerState: {
        isVisible: boolean;
        selectedTime: TimeValue;
        format: TimeFormat;
        currentInputPosition: InputPosition;
        inputBuffer: string; // Temporary buffer for typing
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

    const setCurrentInputPosition = (position: InputPosition) => {
        setTimePickerState((prevState) => ({
            ...prevState,
            currentInputPosition: position,
            inputBuffer: "", // Clear buffer when changing position
        }));
    };

    const handleKeyInput = (key: string): boolean => {
        // Only handle numeric input
        if (!/^\d$/.test(key)) return false;

        const digit = parseInt(key);
        const { currentInputPosition, inputBuffer, format } = timePickerState;

        switch (currentInputPosition) {
            case "hours": {
                const newBuffer = inputBuffer + digit;
                
                if (newBuffer.length === 1) {
                    // First digit of hours - implement smart placement
                    if (format === "24hr") {
                        // 24hr format: behave like minutes/seconds but bounded by 23
                        if (digit >= 0 && digit <= 2) {
                            // Smart placement: 0-2 as tens digit (X0)
                            const smartValue = digit * 10;
                            updateHours(smartValue);
                            setTimePickerState(prevState => ({
                                ...prevState,
                                inputBuffer: newBuffer,
                            }));
                            return true;
                        } else {
                            // 3-9: place as ones digit (0X), complete and advance
                            updateHours(digit);
                            setTimePickerState(prevState => ({
                                ...prevState,
                                currentInputPosition: "minutes",
                                inputBuffer: "",
                            }));
                            return true;
                        }
                    } else {
                        // 12hr format
                        if (digit === 0) {
                            // Show 0 immediately and wait for second digit
                            updateHours(digit);
                            setTimePickerState(prevState => ({
                                ...prevState,
                                inputBuffer: newBuffer,
                            }));
                            return true;
                        } else if (digit === 1) {
                            // Smart placement: 1 -> 10, wait for next digit (could be 10, 11, 12)
                            updateHours(10);
                            setTimePickerState(prevState => ({
                                ...prevState,
                                inputBuffer: newBuffer,
                            }));
                            return true;
                        } else {
                            // 2-9: use as direct hour, complete and advance
                            updateHours(digit);
                            setTimePickerState(prevState => ({
                                ...prevState,
                                currentInputPosition: "minutes",
                                inputBuffer: "",
                            }));
                            return true;
                        }
                    }
                } else if (newBuffer.length === 2) {
                    // Second digit of hours
                    const hours = parseInt(newBuffer);
                    
                    if (format === "24hr") {
                        if (hours <= 23) {
                            updateHours(hours);
                            setTimePickerState(prevState => ({
                                ...prevState,
                                currentInputPosition: "minutes",
                                inputBuffer: "",
                            }));
                            return true;
                        }
                    } else {
                        if (hours >= 1 && hours <= 12) {
                            updateHours(hours);
                            setTimePickerState(prevState => ({
                                ...prevState,
                                currentInputPosition: "minutes",
                                inputBuffer: "",
                            }));
                            return true;
                        }
                    }
                    // Invalid hour, reset buffer
                    setTimePickerState(prevState => ({
                        ...prevState,
                        inputBuffer: "",
                    }));
                    return false;
                }
                break;
            }

            case "minutes": {
                const newBuffer = inputBuffer + digit;
                
                if (newBuffer.length === 1) {
                    // First digit of minutes - implement smart placement
                    if (digit >= 0 && digit <= 5) {
                        // Smart placement: 0-5 as tens digit (X0)
                        const smartValue = digit * 10;
                        updateMinutes(smartValue);
                        setTimePickerState(prevState => ({
                            ...prevState,
                            inputBuffer: newBuffer,
                        }));
                        return true;
                    } else {
                        // 6-9: place as ones digit (0X), complete and advance
                        updateMinutes(digit);
                        setTimePickerState(prevState => ({
                            ...prevState,
                            currentInputPosition: "seconds",
                            inputBuffer: "",
                        }));
                        return true;
                    }
                } else if (newBuffer.length === 2) {
                    // Second digit of minutes
                    const minutes = parseInt(newBuffer);
                    
                    if (minutes <= 59) {
                        updateMinutes(minutes);
                        setTimePickerState(prevState => ({
                            ...prevState,
                            currentInputPosition: "seconds",
                            inputBuffer: "",
                        }));
                        return true;
                    }
                    // Invalid minute, reset buffer
                    setTimePickerState(prevState => ({
                        ...prevState,
                        inputBuffer: "",
                    }));
                    return false;
                }
                break;
            }

            case "seconds": {
                const newBuffer = inputBuffer + digit;
                
                if (newBuffer.length === 1) {
                    // First digit of seconds - implement smart placement
                    if (digit >= 0 && digit <= 5) {
                        // Smart placement: 0-5 as tens digit (X0)
                        const smartValue = digit * 10;
                        updateSeconds(smartValue);
                        setTimePickerState(prevState => ({
                            ...prevState,
                            inputBuffer: newBuffer,
                        }));
                        return true;
                    } else {
                        // 6-9: place as ones digit (0X), complete (stay on seconds)
                        updateSeconds(digit);
                        setTimePickerState(prevState => ({
                            ...prevState,
                            inputBuffer: "",
                        }));
                        return true;
                    }
                } else if (newBuffer.length === 2) {
                    // Second digit of seconds
                    const seconds = parseInt(newBuffer);
                    
                    if (seconds <= 59) {
                        updateSeconds(seconds);
                        setTimePickerState(prevState => ({
                            ...prevState,
                            inputBuffer: "",
                        }));
                        return true;
                    }
                    // Invalid second, reset buffer
                    setTimePickerState(prevState => ({
                        ...prevState,
                        inputBuffer: "",
                    }));
                    return false;
                }
                break;
            }
        }

        return false;
    };

    const getFormattedTimeWithHighlight = (): { display: string; highlightedPart: string } => {
        const { hours, minutes, seconds, period } = timePickerState.selectedTime;
        const { currentInputPosition } = timePickerState;
        
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        
        let highlightedPart = "";
        
        switch (currentInputPosition) {
            case "hours":
                highlightedPart = formattedHours;
                break;
            case "minutes":
                highlightedPart = formattedMinutes;
                break;
            case "seconds":
                highlightedPart = formattedSeconds;
                break;
        }
        
        let display = "";
        if (timePickerState.format === "am/pm") {
            display = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${period}`;
        } else {
            display = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        }
        
        return { display, highlightedPart };
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
        setCurrentInputPosition,
        handleKeyInput,
        getFormattedTimeWithHighlight,
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
        currentInputPosition: "hours",
        inputBuffer: "",
    });

    return (
        <TimePickerContext.Provider value={{ timePickerState, setTimePickerState }}>
            {children}
        </TimePickerContext.Provider>
    );
};
