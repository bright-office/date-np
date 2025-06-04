import { useRef, type ComponentProps } from "react";
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
     * className for styling the main picker
     */
    className?: string;

    /**
     * Provide individual styling to different components.
     */
    classNames?: {
    }

    /**
     * Control how and where you show the Picker container
     */
    dAwareConProps?: tdirectionAwareContainerProps,

} & (tpickerWithInput | tpickerWithoutInput);

const Picker = (props: tpickerProps) => {
    const {
        shouldShowInput = true,
        className,
        inputProps: pickerInputProps = {},
        dAwareConProps = {},
    } = props

    const pickerInputRef = pickerInputProps?.ref ?? useRef<HTMLDivElement>(null);

    let PickerContent = () => {
        const { updatePickerVisiblity, pickerState } = usePicker();
        const shouldShowPicker = pickerState.isVisible;
        console.log("State of visibility:", pickerState.isVisible);

        return (
            <DirectionAwareContainer
                direction="bottom"
                activateWith="ref"
                //@ts-ignore
                activatorRef={pickerInputRef}
                onOutsideClick={() => updatePickerVisiblity(false)}
                centerAlignContainer
                active={shouldShowPicker}
                {...dAwareConProps}
            >
                <div className={cn(
                    "flex flex-col gap-0.5 w-72 h-max bg-white drop-shadow-sm p-2.5 rounded-md",
                    className)}>
                    <PickerHeader />
                    <PickerBody />
                </div>
            </DirectionAwareContainer>
        )
    }
    return (
        <PickerProvider>
            {shouldShowInput
                && <PickerInput
                    // @ts-ignore
                    ref={pickerInputRef}
                    
                    {...pickerInputProps}
                />
                }
             <PickerContent />
        </PickerProvider>
    )
}




export default Picker;
