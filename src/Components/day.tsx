import type { HTMLAttributes, MouseEvent } from "react";
import { cn } from "../../utils/clsx";
import { usePicker } from "../hooks/usePicker";
import { areDatesEqual } from "../../utils/validators";
import { NepaliDate } from "../NepaliDate";

type tdayProps = {
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
        ...rest
    } = props;


    const { updatePickerDay, pickerState, updatePickerMonth } = usePicker();
    const { selectedDate: activeDate, activeMonth, activeYear } = pickerState;
    const isActive = areDatesEqual(date, activeDate);

    const handlDayClick = (e: MouseEvent<HTMLButtonElement>) => {
        if (disabled)
            return;

        e.stopPropagation();

        onRangeSelect?.(date);
        updatePickerDay(date);


        if (activeMonth !== date.getMonth()) {
            const yearOffset = date.getFullYear() - activeYear;
            updatePickerMonth(date.getMonth() + yearOffset * 12);
        }
    }

    return (
        <button
            className={cn(
                "text-center aspect-square rounded-sm items-center justify-center flex text-sm cursor-pointer",
                "hover:bg-gray-200",
                isActive && !disabled && "bg-gray-900 text-white hover:bg-gray-900",
                disabled && !isActive && "opacity-50 bg-gray-50 cursor-not-allowed hover:bg-gray-50",
                disabled && isActive && "bg-gray-700 text-white opacity-70 cursor-not-allowed",
                className,
            )}
            onClick={handlDayClick}
            disabled={disabled}
            {...rest}
        >
            {date.getDate()}
        </button>
    )
}
export default Day;
