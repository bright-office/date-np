import type { HTMLAttributes, MouseEvent } from "react";
import { cn } from "../../utils/clsx";
import { usePicker } from "../hooks/usePicker";
import { areDatesEqual } from "../../utils/validators";
import { NepaliDate } from "../NepaliDate";
import { useMemo } from "react";

type tdayProps = {
    dateHover?: string,
    todayStyle?: string,
    selected?: string,
    date: Date | NepaliDate,
    disabled?: boolean,
    isToday?: boolean,
    onRangeSelect?: (date: Date | NepaliDate) => void | undefined,
} & HTMLAttributes<HTMLButtonElement>

const Day = (props: tdayProps) => {
    const {
        date: date,
        isToday = false,
        disabled = false,
        className,
        onRangeSelect,
        selected,
        todayStyle,
        ...rest
    } = props;


    const { updatePickerDay, pickerState, updatePickerMonth, isDateInRange } = usePicker();
    const { selectedDate: activeDate, activeMonth, activeYear, today } = pickerState;
    const isActive = activeDate ? areDatesEqual(date, activeDate) : false;

    const isTodayDate = useMemo(() => {
        if (date instanceof NepaliDate) {
            const todayBS = NepaliDate.fromADDate(today);
            return areDatesEqual(date, todayBS);
        }
        return areDatesEqual(date, today);
    }, [date, today]);

    const isDisabled = useMemo(() => {
        return disabled || !isDateInRange(date);
    }, [disabled, date, isDateInRange]);

    const handlDayClick = (e: MouseEvent<HTMLButtonElement>) => {
        if (isDisabled)
            return;

        e.stopPropagation();
    
        updatePickerDay(date);
        onRangeSelect?.(date);


        if (activeMonth !== date.getMonth()) {
            const yearOffset = date.getFullYear() - activeYear;
            updatePickerMonth(date.getMonth() + yearOffset * 12);
        }
    }

    return (
        <button
            className={cn(
                "text-center aspect-square rounded-sm items-center justify-center flex text-sm cursor-pointer",
                props.dateHover ? props.dateHover :
                    "hover:bg-gray-200",
                // Today styling - blue indicator when not selected and not disabled
                (isTodayDate && !isActive && !isDisabled) && todayStyle ? todayStyle : (isTodayDate && !isActive && !isDisabled) ? "bg-blue-50 text-blue-600 font-semibold" : "",
                // Active/selected styling
                isActive && !isDisabled && selected ? selected : isActive && !isDisabled ? "bg-gray-900 text-white hover:bg-gray-900" : "",
                // Disabled styling
                isDisabled && !isActive && "opacity-50 bg-gray-50 cursor-not-allowed hover:bg-gray-50",
                isDisabled && isActive && "bg-gray-700 text-white opacity-70 cursor-not-allowed",
                className,
            )}
            onClick={handlDayClick}
            disabled={isDisabled}
            {...rest}
        >
            {date.getDate()}
        </button>
    )
}
export default Day;
