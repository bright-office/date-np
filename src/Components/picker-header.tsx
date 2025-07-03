import { useMemo, type ReactNode } from "react";
import {
  MAX_AD_YEAR,
  MAX_BS_YEAR,
  MIN_AD_YEAR,
  MIN_BS_YEAR,
} from "../../data/constants";
import { CALENDAR } from "../../data/locale";
import { cn } from "../../utils/clsx";
import { convertFromADToBS } from "../../utils/conversion";
import { usePicker } from "../hooks/usePicker";
import { NepaliDate } from "../NepaliDate";

type tpickerHeaderProps = {
  /**
   * arrowicon
   */
  arrowIcon?: {
    arrowIconLeft: React.ReactNode;
    arrowIconRight: React.ReactNode;
  };

  /**
   * year label class
   */
  yearLabel?: string;

  /**
   * month label class
   */
  monthLabel?: string;

  /**
   * lock locale
   */
  lockLocale?: boolean;
};

const PickerHeader = ({
  monthLabel,
  yearLabel,
  arrowIcon,
  lockLocale = false,
}: tpickerHeaderProps) => {
  const { pickerState, togglePickerMode } = usePicker();
  const { activeMonth, activeYear, locale } = pickerState;

  // Check for unsupported years that would cause validation errors
  const isUnsupportedYear =
    (locale === "en" && activeYear === MIN_AD_YEAR) ||
    (locale === "ne" && activeYear === MIN_BS_YEAR) ||
    (locale === "en" && activeYear === MAX_AD_YEAR) ||
    (locale === "ne" && activeYear === MAX_BS_YEAR);

  // Create the appropriate date object based on locale
  const currentMonthDate = useMemo(() => {
    if (locale === "ne") {
      return new NepaliDate(activeYear, activeMonth, 15); // Use 15th as middle date
    } else {
      return new Date(activeYear, activeMonth, 15);
    }
  }, [activeYear, activeMonth, locale]);

  const monthName =
    locale === "en"
      ? CALENDAR.AD.months[currentMonthDate.getMonth()]
      : CALENDAR.BS.months[currentMonthDate.getMonth()];

  const year = currentMonthDate.getFullYear();

  const handleMonthClick = () => {
    if (isUnsupportedYear) return; // Disable interaction for unsupported years
    togglePickerMode("month", "date");
  };

  const handleYearClick = () => {
    if (isUnsupportedYear) return; // Disable interaction for unsupported years
    togglePickerMode("year", "date");
  };

  return (
    <div className="flex items-center justify-between w-full">
      {
        monthSwitcher({
          arrowIconLeft: arrowIcon?.arrowIconLeft,
          arrowIconRight: arrowIcon?.arrowIconRight,
        }).previous
      }
      <div
        className={cn(
          "wrapper space-x-2",
          isUnsupportedYear ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        )}
      >
        <span
          onClick={handleMonthClick}
          className={cn(
            !isUnsupportedYear
              ? monthLabel
                ? monthLabel
                : "hover:underline"
              : ""
          )}
        >
          {monthName}
        </span>
        <span
          onClick={handleYearClick}
          className={cn(
            !isUnsupportedYear
              ? yearLabel
                ? yearLabel
                : "hover:underline"
              : ""
          )}
        >
          {year}
        </span>
      </div>
      {
        monthSwitcher({
          arrowIconLeft: arrowIcon?.arrowIconLeft,
          arrowIconRight: arrowIcon?.arrowIconRight,
        }).next
      }
      {!lockLocale &&
      <AD_BS_Switcher />
      }
    </div>
  );
};
type monthSwitcherProps = {
  arrowIconLeft?: ReactNode;
  arrowIconRight?: ReactNode;
};

const monthSwitcher = ({
  arrowIconLeft,
  arrowIconRight,
}: monthSwitcherProps): {
  previous: ReactNode;
  next: ReactNode;
} => {
  const {
    pickerState,
    updatePickerMonth,
    updatePickerYear,
    canNavigateToPreviousMonth,
    canNavigateToNextMonth,
    canNavigateToPreviousYear,
    canNavigateToNextYear,
  } = usePicker();
  const { activeMonth, activeYear, mode, locale } = pickerState;
  // Check for unsupported years that would cause validation errors
  const isUnsupportedYear =
    (locale === "en" && activeYear === MIN_AD_YEAR) ||
    (locale === "ne" && activeYear === MIN_BS_YEAR) ||
    (locale === "en" && activeYear === MAX_AD_YEAR) ||
    (locale === "ne" && activeYear === MAX_BS_YEAR);

  // Determine navigation type based on mode
  const isYearMode = mode === "year";

  // For year mode, we navigate years
  // For date and month modes, we navigate months but use specialized validation for month mode
  let canGoPrevious: boolean;
  let canGoNext: boolean;

  if (isUnsupportedYear) {
    // Disable all navigation for unsupported years
    canGoPrevious = false;
    canGoNext = false;
  } else if (isYearMode) {
    canGoPrevious = canNavigateToPreviousYear();
    canGoNext = canNavigateToNextYear();
  } else {
    // Both date and month modes use month navigation
    canGoPrevious = canNavigateToPreviousMonth();
    canGoNext = canNavigateToNextMonth();
  }

  const handleNavigation = (changeDirection: "next" | "previous") => {
    if (isUnsupportedYear) return; // Disable navigation for unsupported years

    if (
      (changeDirection === "previous" && !canGoPrevious) ||
      (changeDirection === "next" && !canGoNext)
    ) {
      return;
    }

    if (isYearMode) {
      // Navigate years (for year picker mode)
      const newYear =
        changeDirection === "next" ? activeYear + 1 : activeYear - 1;
      updatePickerYear(newYear);
    } else {
      // Navigate months (for date and month picker modes)
      const newMonth =
        changeDirection === "next" ? activeMonth + 1 : activeMonth - 1;
      updatePickerMonth(newMonth);
    }
  };

  return {
    previous: (
      <div
        className={cn(
          "left h-8 w-8 rounded-sm cursor-pointer hover:bg-gray-200 flex items-center justify-center",
          !canGoPrevious && "opacity-50 cursor-not-allowed hover:bg-transparent"
        )}
        onClick={() => handleNavigation("previous")}
      >
        {arrowIconLeft ? (
          arrowIconLeft
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        )}
      </div>
    ),
    next: (
      <div
        className={cn(
          "right h-8 w-8 rounded-sm cursor-pointer hover:bg-gray-200 flex items-center justify-center",
          !canGoNext && "opacity-50 cursor-not-allowed hover:bg-transparent"
        )}
        onClick={() => handleNavigation("next")}
      >
        {arrowIconRight ? (
          arrowIconRight
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-right"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        )}
      </div>
    ),
  };
};

const AD_BS_Switcher = () => {
  const { pickerState, changePickerLocale } = usePicker();
  const { locale, activeYear } = pickerState;

  // Check for unsupported years that would cause validation errors
  const isUnsupportedYear =
    (locale === "en" && activeYear === MIN_AD_YEAR) ||
    (locale === "ne" && activeYear === MIN_BS_YEAR) ||
    (locale === "en" && activeYear === MAX_AD_YEAR) ||
    (locale === "ne" && activeYear === MAX_BS_YEAR);

  const handleLocaleChange = (newLocale: "en" | "ne") => {
    if (isUnsupportedYear) return; // Disable locale switching for unsupported years
    changePickerLocale(newLocale);
  };

  return (
    <div
      className={cn(
        "flex items-center bg-gray-100 rounded-md h-6 w-16 text-sm",
        isUnsupportedYear && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        onClick={() => handleLocaleChange("en")}
        className={cn(
          "h-8 w-8 grid place-items-center rounded-md",
          !isUnsupportedYear && "cursor-pointer",
          locale === "en"
            ? "bg-white drop-shadow-sm"
            : "bg-transparent opacity-60"
        )}
      >
        AD
      </span>

      <span
        onClick={() => handleLocaleChange("ne")}
        className={cn(
          "h-8 w-8 grid place-items-center rounded-md",
          !isUnsupportedYear && "cursor-pointer",
          locale === "ne"
            ? "bg-white drop-shadow-sm"
            : "bg-transparent opacity-60"
        )}
      >
        BS
      </span>
    </div>
  );
};

export default PickerHeader;
