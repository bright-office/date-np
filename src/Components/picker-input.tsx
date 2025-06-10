import React from "react";
import { cn } from "../../utils/clsx";
import { usePicker } from "../hooks/usePicker";
import { format, formatISO } from "../format";

type tpickerInputProps = {
    label?: string,
    className?: string
    required?: boolean
    
    /**
     * default date for the picker
     * by default, the selected date is null
     */
    defaultDate?: Date | import("../NepaliDate").NepaliDate;
    
    /**
     * format for the date input
     * @default ISO
     */
    dateFormat?: string;

    /**
     * default mode for the picker
     * @default "ad"
     */
    defaultLocale?: "AD" | "BS";

} & React.InputHTMLAttributes<HTMLInputElement>;

type tpickerInputImperativeProps = {
} & HTMLInputElement

const PickerInput = React.forwardRef<tpickerInputImperativeProps, tpickerInputProps>((props, ref) => {
    const {
        required = false,
        className,
        label,
        name,
        ...inputProps
    } = props;

    const { updatePickerVisiblity, pickerState, getDisplayDate } = usePicker();
    const { isVisible } = pickerState;

    // Get the date to display - either selectedDate or defaultDate as fallback
    const displayDate = getDisplayDate();

    /*
     * This can be seperated into a seperate component but should not be done.
     * since, the dev using this package may have custom label components that 
     * may polute their imports and mistakenly import this component instead of their own.
     */
    const Label = () => {
        if (!label)
            return null;

        if (typeof label === "string")
            return (
                <label htmlFor={name}>
                    {label}
                    <span className="requiredIndicator">
                        {required ? "*" : null}
                    </span>
                </label>
            )
    }
     const handleInputClick = () => {
            updatePickerVisiblity(!isVisible);
        };
  
    return (
        <div className="inputContainer">
            <Label />

                <div
                    onClick={
                            handleInputClick
                        }  
                    ref={ref}
                    className={cn("appearance-none",className)}
                    {...inputProps}
                >
                        {displayDate ? props.dateFormat ? format(displayDate, props.dateFormat) : formatISO(displayDate) : "Select a date"}
                    </div>
                
            </div>
    )
})

export default PickerInput;
