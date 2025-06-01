import type { HTMLAttributes, MouseEvent } from "react";
import { cn } from "../../utils/clsx";
import { usePicker } from "../hooks/usePicker";
import { areDatesEqual } from "../../utils/validators";
import { NepaliDate } from "../NepaliDate";

type tdayProps = {
    date: Date | NepaliDate,
    disabled?: boolean,
    isToday?: boolean,
    onClick?: (date: Date | NepaliDate, e: MouseEvent<HTMLButtonElement>) => void,
} & HTMLAttributes<HTMLButtonElement>

const Day = (props: tdayProps) => {
    const {
        date: date,
        isToday = false,
        disabled = false,
        className,
        onClick,
        ...rest
    } = props;


    const { updatePickerDay, pickerState, updatePickerMonth } = usePicker();
    const { selectedDate: activeDate, activeMonth, activeYear } = pickerState;
    const isActive = areDatesEqual(date, activeDate);

    const handlDayClick = (e: MouseEvent<HTMLButtonElement>) => {
        if (disabled)
            return;

        onClick?.(date, e);
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
                isActive && "bg-gray-900 text-white hover:bg-gray-900",
                disabled && "opacity-50 bg-gray-50",
                className,
            )}
            onClick={handlDayClick}
            {...rest}
        >
            {date.getDate()}
        </button>
    )
}
export default Day;
