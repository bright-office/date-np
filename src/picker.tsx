import { use, useEffect, useRef, type ComponentProps } from "react";
import { cn } from "../utils/clsx";
import DirectionAwareContainer from "./Components/helpers/direction-aware-container";
import PickerBody from "./Components/picker-body";
import PickerHeader from "./Components/picker-header";
import PickerInput from "./Components/picker-input";
import { PickerProvider, usePicker } from "./hooks/usePicker";
import { type tdirectionAwareContainerProps } from "./Components/helpers/direction-aware-container";
import "./index.css";

type tpickerWithoutInput = {
    /**
     * Note:
     * You should have `shouldShowInput` set to true inorder to
     * give input props
     */
    inputProps?: never;
    shouldShowInput?: false
}

type tpickerWithInput = {
    /**
     * customize input with input specific props.
     * visit: #docs for more information on this.
     */
    inputProps?: ComponentProps<typeof PickerInput>

    /**
     * Specify whethere to show the picker input or not
     * @defaults to true
     */
    shouldShowInput?: boolean
}

export type tpickerProps = {

    /**
     * min date for the picker
     */
    minDate?: Date | import("./NepaliDate").NepaliDate;

    /**
     * max date for the picker
     */
    maxDate?: Date | import("./NepaliDate").NepaliDate;

    /** 
     * className for styling the main picker
     */
    className?: string;

    /**
     * Provide individual styling to different components.
     */
    classNames?: {
    }
    /**
     * onSelect callback function called when date selection is complete 
     */
    onSelect?: (selectedDate: Date | import("./NepaliDate").NepaliDate | null) => void;

    /**
     * Control how and where you show the Picker container
     */
    dAwareConProps?: tdirectionAwareContainerProps,

    /**
     * label for the picker
     */
    label?: string;

    /**
     * description for the picker
     */
    description?: string;

} & (tpickerWithInput | tpickerWithoutInput);

const Picker = (props: tpickerProps) => {
    const {
        minDate: minPropDate,
        maxDate: maxPropDate,
        shouldShowInput = true,
        className,
        inputProps: pickerInputProps = {},
        dAwareConProps = {},
        onSelect,
        label,
        description,
    } = props

    const pickerInputRef = pickerInputProps?.ref ?? useRef<HTMLDivElement>(null);


    let PickerContent = () => {

        const { updatePickerVisiblity, pickerState, setMinDate, setMaxDate } = usePicker();
        const shouldShowPicker = pickerState.isVisible;
        const {selectedDate, minDate, maxDate} = pickerState;

        if (minPropDate || maxPropDate){
            useEffect(()=>{
                if (minPropDate) {
                    setMinDate(minPropDate);
                }
                if (maxPropDate) {
                    setMaxDate(maxPropDate);
                }
            },[minPropDate, maxPropDate])
            
        }


        return (
            <DirectionAwareContainer
                direction="bottom"
                activateWith="ref"
                //@ts-ignore
                activatorRef={pickerInputRef}
                onOutsideClick={() => updatePickerVisiblity(false)}
                centerAlignContainer
                active={shouldShowPicker}
                className="mt-2"
                {...dAwareConProps}
            >
                <div className={cn(
                    "flex flex-col gap-0.5 w-72 h-max bg-white drop-shadow-sm p-2.5 rounded-md",
                    className)}>
                    <PickerHeader />
                    <PickerBody
                        onSelect={onSelect}
                    />
                </div>
            </DirectionAwareContainer>
        )
    }
    return (
        <PickerProvider>
            <div className="flex flex-col gap-1 w-full">
                {label && <span className="text-m font-medium text-gray-700 text-start">{label}</span>}
            {shouldShowInput
                && <PickerInput
                    // @ts-ignore
                    ref={pickerInputRef}
                    {...pickerInputProps}
                />
                }

             <PickerContent />
            {description && <span className="text-sm text-gray-500 text-start">{description}</span>}
            </div>
        </PickerProvider>
    )
}




export default Picker;
