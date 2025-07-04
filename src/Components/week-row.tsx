import { usePicker } from "../hooks/usePicker";

export const WeekRow = () => {
    const { pickerState } = usePicker();
    const locale = pickerState.locale;

    const weekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]


    return (
        <>
            {weekNames.map((name, index) => {
                return (
                    <div key={index} className="w-full h-full grid place-items-center font-medium text-gray-500 text-sm tracking-wide">
                        {name}
                    </div>
                )
            })}
        </>
    )
}
