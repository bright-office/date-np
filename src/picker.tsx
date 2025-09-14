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
import Label from "./Components/label";
import { formatISO } from "./format";

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
  onSelect?: (selectedDate: Date | import("./NepaliDate").NepaliDate) => void;

  /**
   * Control how and where you show the Picker containerp
   */
  dAwareConProps?: Partial<tdirectionAwareContainerProps>;

  /**
   * label for the picker
   */
  label?: string;

  /**
   * description for the picker
   */
  description?: string;

  /**
   * required prop for the picker
   */
  required?: boolean;

  /**
   * onInputClick
   */
  onInputClick?: () => void;
} & (tpickerWithInput | tpickerWithoutInput);

const Picker = (props: tpickerProps) => {
  const {
    minDate: minPropDate,
    maxDate: maxPropDate,
    shouldShowInput = true,
    className,
    inputProps,
    dAwareConProps = {},
    onSelect,
    label,
    description,
    bodyProps,
    headerProps = {},
    isVisible,
    required = false,
    onInputClick,
  } = props;

  const pickerInputRef = inputProps?.ref ?? useRef<HTMLDivElement>(null);

  // Create a ref to hold the clearError function
  const clearErrorRef = useRef<(() => void) | null>(null);

  let PickerContent = () => {
    const {
      updatePickerVisiblity,
      pickerState,
      updatePickerDay,
      setMinDate,
      setMaxDate,
    } = usePicker();
    const shouldShowPicker = pickerState.isVisible;

    useEffect(() => {
      updatePickerDay(inputProps?.defaultDate ? inputProps.defaultDate : null);
    }, [
      inputProps?.defaultDate ? formatISO(inputProps?.defaultDate) : undefined,
    ]);

    useEffect(() => {
      if (minPropDate) {
        setMinDate(minPropDate);
      }
    }, [minPropDate ? formatISO(minPropDate) : undefined]);

    useEffect(() => {
      if (maxPropDate) {
        setMaxDate(maxPropDate);
      }
    }, [maxPropDate ? formatISO(maxPropDate) : undefined]);

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
        onOutsideClick={() => {
          updatePickerVisiblity(false);
          // Clear errors when clicking outside if editable is enabled
          if (clearErrorRef.current) {
            clearErrorRef.current();
          }
        }}
        centerAlignContainer
        active={isVisible ?? shouldShowPicker}
        className="mt-2"
        {...dAwareConProps}
      >
        <div
          className={cn(
            "flex flex-col gap-0.5 w-72 h-max bg-white drop-shadow-sm p-2.5 rounded-md"
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
      <div className={cn("flex flex-col gap-0.5 w-full mt-0.5", className)}>
        {label && <Label required={required}>{label}</Label>}
        {shouldShowInput && (
          <PickerInput
            onClick={onInputClick}
            // @ts-ignore
            ref={pickerInputRef}
            {...inputProps}
            onRegisterClearError={
              inputProps?.editable
                ? (clearErrorFn) => {
                    clearErrorRef.current = clearErrorFn;
                  }
                : undefined
            }
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
