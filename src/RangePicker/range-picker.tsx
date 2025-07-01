import { useRef, useEffect, type ComponentProps } from "react";
import { cn } from "../../utils/clsx";
import DirectionAwareContainer from "../Components/helpers/direction-aware-container";
import RangePickerBody from "./Components/range-picker-body";
import RangePickerHeader from "./Components/range-picker-header";
import RangePickerInput from "./Components/range-picker-input";
import { RangePickerProvider, useRangePicker } from "./hooks/useRangePicker";
import { type tdirectionAwareContainerProps } from "../Components/helpers/direction-aware-container";
import { LocaleSwitcher } from "./Components/locale-switcher";
import { isInvalidDateRange } from "../../utils/validators";
import "../index.css";

type tRangePickerWithoutInput = {
  /**
   * Note:
   * You should have `shouldShowInput` set to true in order to
   * give input props
   */
  inputProps?: never;
  shouldShowInput?: false;
};

type tRangePickerWithInput = {
  /**
   * customize input with input specific props.
   * visit: #docs for more information on this.
   */
  inputProps?: ComponentProps<typeof RangePickerInput>;

  /**
   * Specify whether to show the picker input or not
   * @defaults to true
   */
  shouldShowInput?: boolean;
};

export type tRangePickerProps = {
  /**
   * className for styling the main picker
   */
  className?: string;

  /**
   * Provide individual styling to different components.
   */
  classNames?: {
    leftPanel?: string;
    rightPanel?: string;
    container?: string;
  };

  /**
   * Control how and where you show the Picker container
   */
  dAwareConProps?: tdirectionAwareContainerProps;

  /**
   * Callback function called when date range selection is complete
   */
  onRangeSelect?: (
    startDate: Date | import("../NepaliDate").NepaliDate,
    endDate: Date | import("../NepaliDate").NepaliDate
  ) => void;

  /**
   * Callback function called when the picker visibility changes
   */
  onVisibilityChange?: (isVisible: boolean) => void;

  /**
   * label for the range picker input
   */
  label?: string;

  /**
   * description for the range picker input
   */
  description?: string;

  /**
   * Minimum selectable date
   */
  minDate?: Date | import("../NepaliDate").NepaliDate;

  /**
   * Maximum selectable date
   */
  maxDate?: Date | import("../NepaliDate").NepaliDate;

  /**
   * Default start date for the range picker
   */
  startingDateRange?: Date | import("../NepaliDate").NepaliDate;

  /**
   * Default end date for the range picker
   */
  endingDateRange?: Date | import("../NepaliDate").NepaliDate;

  /**
   * Default locale for the picker
   * @default "AD"
   */
  defaultLocale?: "AD" | "BS";

  /**
   * shouldShowSinglePanel
   */
shouldShowSinglePanelProp?: boolean;

} & (tRangePickerWithInput | tRangePickerWithoutInput);

const RangePicker = (props: tRangePickerProps) => {
  const {
    shouldShowInput = true,
    className,
    classNames = {},
    inputProps: rangePickerInputProps = {},
    dAwareConProps = {},
    onRangeSelect,
    onVisibilityChange,
    minDate,
    maxDate,
    startingDateRange,
    endingDateRange,
    defaultLocale = "AD",
    shouldShowSinglePanelProp = false,
  } = props;

  const rangePickerInputRef =
    rangePickerInputProps?.ref ?? useRef<HTMLDivElement>(null);

  let RangePickerContent = () => {
    const {
      rangePickerState,
      updateRangePickerVisibility,
      clearSelection,
      shouldShowSinglePanel,
      setDatePickerRange,
      setShouldShowSinglePanel
    } = useRangePicker();
    const { isVisible, startDate, endDate } = rangePickerState;

    useEffect(()=>{
        if(shouldShowSinglePanelProp)
            setShouldShowSinglePanel(true);
    },[])

    useEffect(() => {
      if (startingDateRange && endingDateRange) {
        setDatePickerRange(startingDateRange, endingDateRange);
      }
    }, [startingDateRange, endingDateRange]);

    useEffect(() => {
      if (onVisibilityChange) {
        onVisibilityChange(isVisible);
      }
    }, [isVisible, onVisibilityChange]);

    const handleOutsideClick = () => {
      updateRangePickerVisibility(false);
    };

    const handleClearSelection = () => {
      clearSelection();
    };

    let isSinglePanel = false;
    if (rangePickerState.shouldShowSinglePanel === undefined) {
      isSinglePanel = shouldShowSinglePanel();
    } else {
      isSinglePanel = rangePickerState.shouldShowSinglePanel;
    }

    // Check for invalid date range
    const hasInvalidDateRange =
      minDate && maxDate && isInvalidDateRange(minDate, maxDate);

    return (
      <DirectionAwareContainer
        direction="bottom"
        activateWith="ref"
        //@ts-ignore
        activatorRef={rangePickerInputRef}
        onOutsideClick={handleOutsideClick}
        centerAlignContainer
        active={isVisible}
        {...dAwareConProps}
      >
        <div
          className={cn(
            "flex flex-col gap-4 w-max h-max bg-white p-4 rounded-lg",
            "shadow-md",
            classNames.container,
            className
          )}
        >
          {hasInvalidDateRange ? (
            <div className="flex items-center justify-center p-4 text-red-600 text-sm font-medium">
              Invalid date range: minimum date is greater than maximum date
            </div>
          ) : (
            <>
              {/* Calendar Panels */}
              {isSinglePanel ? (
                /* Single Panel Mode */
                <div className="flex justify-center">
                  <div
                    className={cn(
                      "flex flex-col gap-2 w-72",
                      classNames.leftPanel
                    )}
                  >
                    <RangePickerHeader panel="left" />
                    <RangePickerBody panel="left" />
                  </div>
                </div>
              ) : (
                /* Dual Panel Mode */
                <div className="flex gap-4">
                  {/* Left Panel */}
                  <div
                    className={cn(
                      "flex flex-col gap-2 w-72",
                      classNames.leftPanel
                    )}
                  >
                    <RangePickerHeader panel="left" />
                    <RangePickerBody panel="left" />
                  </div>

                  {/* Divider */}
                  <div className="w-px bg-gray-200 my-2" />

                  {/* Right Panel */}
                  <div
                    className={cn(
                      "flex flex-col gap-2 w-72",
                      classNames.rightPanel
                    )}
                  >
                    <RangePickerHeader panel="right" />
                    <RangePickerBody panel="right" />
                  </div>
                </div>
              )}

              {/* Footer with actions: clear and toggle (AD/BS) left out currently. Need to move from left panel header to here. */}
              {
                <div className="flex justify-end pt-3 gap-2 ">
                  {startDate && endDate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearSelection();
                      }}
                      className={cn(
                        "px-3 py-1 text-xs rounded border hover:cursor-pointer",
                        "hover:bg-gray-50 transition-colors",
                        "text-gray-600 border-gray-300"
                      )}
                    >
                      Clear
                    </button>
                  )}
                  <LocaleSwitcher />
                </div>
              }
            </>
          )}
        </div>
      </DirectionAwareContainer>
    );
  };

  return (
    <RangePickerProvider
      minDate={minDate}
      maxDate={maxDate}
      startingDateRange={startingDateRange}
      endingDateRange={endingDateRange}
      defaultLocale={defaultLocale}
      onRangeSelect={onRangeSelect}
    >
      <div className="flex flex-col gap-1 w-full">
        {/* label */}
        {props.label && (
          <span className="text-m font-medium text-gray-700 text-start">
            {props.label}
          </span>
        )}
        {shouldShowInput && (
          <RangePickerInput
            // @ts-ignore
            ref={rangePickerInputRef}
            {...rangePickerInputProps}
          />
        )}
        <RangePickerContent />
        {/* description */}
        {props.description && (
          <span className="text-sm text-gray-500 text-start">
            {props.description}
          </span>
        )}
      </div>
    </RangePickerProvider>
  );
};

export default RangePicker;
