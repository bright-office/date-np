import { cn } from "../../../utils/clsx";
import { useRangePicker } from "../hooks/useRangePicker"

const LocaleSwitcher = () => {
    const { 
        rangePickerState, 
        changeRangePickerLocale 
    } = useRangePicker();
    
    const { locale } = rangePickerState;
    const handleLocaleChange = () => {
        changeRangePickerLocale(locale === 'en' ? 'ne' : 'en')
    }
       return <div className="flex items-center bg-gray-100 rounded-md h-6 w-16 text-sm">
            <span
                onClick={handleLocaleChange}
                className={cn(
                    "cursor-pointer h-8 w-8 grid place-items-center  rounded-md",
                    locale === "en"
                        ? "bg-white drop-shadow-sm"
                        : "bg-transparent opacity-60"
                )}>
                AD
            </span>

            <span
                onClick={handleLocaleChange}
                className={cn(
                    "cursor-pointer h-8 w-8 grid place-items-center  rounded-md",
                    locale === "ne"
                        ? "bg-white drop-shadow-sm"
                        : "bg-transparent opacity-60"
                )}>
                BS
            </span>
        </div>
}

export {LocaleSwitcher}