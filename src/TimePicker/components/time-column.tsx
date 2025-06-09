import { useRef, useEffect } from "react";
import { cn } from "../../../utils/clsx";

export type TimeColumnProps = {
    label: string;
    value: number | string;
    onIncrement: () => void;
    onDecrement: () => void;
    className?: string;
    format?: "24hr" | "am/pm";
    isHours?: boolean;
};

export const TimeColumn = ({ 
    label, 
    value, 
    onIncrement, 
    onDecrement, 
    className,
    format = "am/pm",
    isHours = false
}: TimeColumnProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Add native wheel event listener to prevent document scrolling
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleNativeWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Handle the time adjustment
            if (e.deltaY > 0) {
                onIncrement();
            } else {
                onDecrement();
            }
        };

        container.addEventListener('wheel', handleNativeWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleNativeWheel);
        };
    }, [onIncrement, onDecrement]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY > 0) {
            onIncrement();
        } else {
            onDecrement();
        }
    };

    const formatValue = (val: number | string): string => {
        if (typeof val === 'string') return val;
        return val.toString().padStart(2, '0');
    };

    const getPreviousValue = (): string => {
        if (typeof value === 'string') {
            return value === 'AM' ? 'PM' : 'AM';
        }
        
        if (isHours) {
            if (format === "24hr") {
                return formatValue(value === 0 ? 23 : value - 1);
            } else {
                return formatValue(value === 1 ? 12 : value - 1);
            }
        }
        
        return formatValue(value === 0 ? 59 : value - 1);
    };

    const getNextValue = (): string => {
        if (typeof value === 'string') {
            return value === 'AM' ? 'PM' : 'AM';
        }
        
        if (isHours) {
            if (format === "24hr") {
                return formatValue(value === 23 ? 0 : value + 1);
            } else {
                return formatValue(value === 12 ? 1 : value + 1);
            }
        }
        
        return formatValue(value === 59 ? 0 : value + 1);
    };

    return (
        <div className={cn("flex flex-col items-center", className)}>
            <div className="text-sm text-gray-500 mb-2 font-medium">
                {label}
            </div>
            <div 
                ref={containerRef}
                className="flex flex-col items-center select-none"
                onWheel={handleWheel}
            >
                {/* Up Arrow */}
                <button
                    onClick={onDecrement}
                    className="hover:cursor-pointer w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                    type="button"
                >
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                        <path 
                            d="M6 1L11 6L1 6L6 1Z" 
                            fill="currentColor" 
                            stroke="currentColor" 
                            strokeWidth="1"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                {/* Previous Value */}
                <div 
                    className="text-lg text-gray-300 h-8 flex items-center font-mono cursor-pointer hover:text-gray-500 transition-colors"
                    onClick={onDecrement}
                >
                    {getPreviousValue()}
                </div>

                {/* Current Value */}
                <div className="text-2xl font-bold text-black h-12 flex items-center font-mono bg-gray-50 px-3 rounded">
                    {formatValue(value)}
                </div>

                {/* Next Value */}
                <div 
                    className="text-lg text-gray-300 h-8 flex items-center font-mono cursor-pointer hover:text-gray-500 transition-colors"
                    onClick={onIncrement}
                >
                    {getNextValue()}
                </div>

                {/* Down Arrow */}
                <button
                    onClick={onIncrement}
                    className="hover:cursor-pointer w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                    type="button"
                >
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                        <path 
                            d="M6 7L1 2L11 2L6 7Z" 
                            fill="currentColor" 
                            stroke="currentColor" 
                            strokeWidth="1"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};
