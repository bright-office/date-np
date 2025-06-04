import React from "react";
import { cn } from "../../utils/clsx";
import "../index.css";
import { usePicker } from "../hooks/usePicker";

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
    const { isVisible } = pickerState;

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
                    "border-2 border-b-base rounded-md px-2.5 py-1 group",
                    "has-active:border-b-active has-active:outline-none",
                    "focus-within:border-b-active focus-within:outline-none focus-visible:outline-none has-focus-visible:outline-none",
                    className)
                }>
                <input
                    onClick={handleInputClick}
                    onFocus={handleInputClick}
                    required={required}
                    ref={ref}
                    className={cn("appearance-none")}
                    {...inputProps}
                />
            </div>
        </div >
    )
})

export default PickerInput;
