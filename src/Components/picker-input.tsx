import React from "react";
import { cn } from "../../utils/clsx";
import { usePicker } from "../hooks/usePicker";
import { format } from "../format";

type tpickerInputProps = {
    label?: string,
    className?: string
    required?: boolean
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

    const { updatePickerVisiblity, pickerState } = usePicker();
    const { isVisible, selectedDate } = pickerState;

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
                className={cn(
                    "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    "cursor-pointer bg-white text-sm",
                    "hover:border-gray-400 transition-colors",
                )
                }>
                <div
                    onClick={
                            handleInputClick
                        }  
                    ref={ref}
                    className={cn("appearance-none")}
                    {...inputProps}
                >
                    <span className="text-sm text-gray-500 text-start">
                        {selectedDate ? selectedDate instanceof Date ? format(selectedDate, 'yyyy/MM/dd') : selectedDate.toString() : "Select a date"}
                        </span>
                    </div>
                
            </div>
        </div >
    )
})

export default PickerInput;
