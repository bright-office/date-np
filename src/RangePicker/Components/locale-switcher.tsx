import { MAX_AD_YEAR, MIN_AD_YEAR, MIN_BS_YEAR } from "../../../data/constants";
import { cn } from "../../../utils/clsx";
import { useRangePicker } from "../hooks/useRangePicker"

const LocaleSwitcher = () => {
    const { 
        rangePickerState, 
        changeRangePickerLocale 
    } = useRangePicker();
    
    const { locale } = rangePickerState;
    
    // Check for unsupported years that would cause validation errors
    const isUnsupportedYear = () => {
        const leftPanelYear = rangePickerState.leftPanel.activeYear;
        const rightPanelYear = rangePickerState.rightPanel.activeYear;
        
        if (locale === "en" && (leftPanelYear === MIN_AD_YEAR || rightPanelYear === MIN_AD_YEAR || leftPanelYear === MAX_AD_YEAR || rightPanelYear === MAX_AD_YEAR)) {
            return true; // 1944 AD is not fully supported
        }
        if (locale === "ne" && (leftPanelYear === MIN_BS_YEAR || rightPanelYear === MIN_BS_YEAR)) {
            return true; // 2000 BS is not fully supported 
        }
        return false;
    };
    
    const handleLocaleChange = () => {
        if (isUnsupportedYear()) return; // Disable locale switching for unsupported years
        changeRangePickerLocale(locale === 'en' ? 'ne' : 'en');
    };
    
    return <div className={cn(
        "flex items-center bg-gray-100 rounded-md h-6 w-16 text-sm",
        isUnsupportedYear() && "opacity-50 cursor-not-allowed"
    )}>
        <span
            onClick={handleLocaleChange}
            className={cn(
                "h-8 w-8 grid place-items-center rounded-md",
                !isUnsupportedYear() && "cursor-pointer",
                locale === "en"
                    ? "bg-white drop-shadow-sm"
                    : "bg-transparent opacity-60"
            )}>
            AD
        </span>

        <span
            onClick={handleLocaleChange}
            className={cn(
                "h-8 w-8 grid place-items-center rounded-md",
                !isUnsupportedYear() && "cursor-pointer",
                locale === "ne"
                    ? "bg-white drop-shadow-sm"
                    : "bg-transparent opacity-60"
            )}>
            BS
        </span>
    </div>
}

export {LocaleSwitcher}