import { use, useEffect, useMemo, useRef, type ComponentProps } from "react";
import { cn } from "../utils/clsx";
import DirectionAwareContainer from "./Components/helpers/direction-aware-container";
import PickerBody from "./Components/picker-body";
import PickerHeader from "./Components/picker-header";
import PickerInput from "./Components/picker-input";
import { PickerProvider, usePicker } from "./hooks/usePicker";
import { type tdirectionAwareContainerProps } from "./Components/helpers/direction-aware-container";
import { isInvalidDateRange } from "../utils/validators";
import "./index.css";
import { NepaliDate } from "./NepaliDate";

type tpickerWithoutInput = {
  /**
   * Note:
   * You should have `shouldShowInput` set to true inorder to
   * give input props
   */
  inputProps?: never;
  shouldShowInput?: false;
};

type tpickerWithInput = {
  /**
   * customize input with input specific props.
   * visit: #docs for more information on this.
   */
  inputProps?: ComponentProps<typeof PickerInput>;

  /**
   * Specify whethere to show the picker input or not
   * @defaults to true
   */
  shouldShowInput?: boolean;
};

export type tpickerProps = {
  /**
   * visibility of the picker
   * @default false
   */
  isVisible?: boolean;

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
  bodyProps?: ComponentProps<typeof PickerBody>;

  /**
   * Header class names
   */
  headerProps?: ComponentProps<typeof PickerHeader>;

  /**
   * onSelect callback function called when date selection is complete
   */
  onSelect?: (
    selectedDate: Date | import("./NepaliDate").NepaliDate
  ) => void;

  /**
   * Control how and where you show the Picker containerp
   */
  dAwareConProps?: tdirectionAwareContainerProps;

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
    inputProps = {},
    dAwareConProps = {},
    onSelect,
    label,
    description,
    bodyProps,
    headerProps = {},
    isVisible = false,
  } = props;

  const pickerInputRef = inputProps?.ref ?? useRef<HTMLDivElement>(null);

  let PickerContent = () => {
    const { updatePickerVisiblity, pickerState, updatePickerDay } = usePicker();
    const shouldShowPicker = pickerState.isVisible;

    useEffect(() => {
      if (isVisible) 
        updatePickerVisiblity(true)
    }, []);

    useEffect(() => {
      if (inputProps?.defaultDate) updatePickerDay(inputProps?.defaultDate);
    }, [inputProps?.defaultDate]);

    // Check for invalid date range
    const hasInvalidDateRange =
      minPropDate &&
      maxPropDate &&
      isInvalidDateRange(minPropDate, maxPropDate);

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
        <div
          className={cn(
            "flex flex-col gap-0.5 w-72 h-max bg-white drop-shadow-sm p-2.5 rounded-md",
            className
          )}
        >
          {hasInvalidDateRange ? (
            <div className="flex items-center justify-center p-4 text-red-600 text-sm font-medium">
              Invalid date range: minimum date is greater than maximum date
            </div>
          ) : (
            <>
              <PickerHeader {...headerProps} />
              <PickerBody {...bodyProps} onSelect={onSelect} />
            </>
          )}
        </div>
      </DirectionAwareContainer>
    );
  };

  
  return (
    <PickerProvider
      minDate={minPropDate}
      maxDate={maxPropDate}
      defaultDate={inputProps?.defaultDate}
      defaultLocale={inputProps?.defaultLocale}
      onSelect={onSelect}
    >
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <span className="text-m font-medium text-gray-700 text-start">
            {label}
          </span>
        )}
        {shouldShowInput && (
          <PickerInput
            // @ts-ignore
            ref={pickerInputRef}
            {...inputProps}
          />
        )}

        <PickerContent />
        {description && (
          <span className="text-sm text-gray-500 text-start">
            {description}
          </span>
        )}
      </div>
    </PickerProvider>
  );
};

export default Picker;
