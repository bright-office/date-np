import { useState, useCallback } from 'react';
import { NepaliDate } from '../NepaliDate';

export interface UseEditableDateInputReturn {
    isValidInput: (input: string) => boolean;
    parseInputToDate: (input: string, targetType: 'date' | 'nepali') => Date | NepaliDate | null;
    handleInputChange: (input: string, targetType: 'date' | 'nepali') => void;
    error: string | null;
    clearError: () => void;
}

export interface UseEditableDateInputProps {
    onDateChange: (date: Date | NepaliDate | null) => void;
    minDate?: Date | NepaliDate;
    maxDate?: Date | NepaliDate;
    currentDate?: Date | NepaliDate | null;
}

export const useEditableDateInput = ({
    onDateChange,
    minDate,
    maxDate,
    currentDate
}: UseEditableDateInputProps): UseEditableDateInputReturn => {
    const [error, setError] = useState<string | null>(null);

    // ISO format regex: YYYY-MM-DD (works for both AD and BS dates)
    const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

    const isValidInput = useCallback((input: string): boolean => {
        if (!input.trim()) return false;
        return ISO_DATE_REGEX.test(input.trim());
    }, []);

    const parseInputToDate = useCallback((input: string, targetType: 'date' | 'nepali'): Date | NepaliDate | null => {
        const trimmedInput = input.trim();
        
        if (!isValidInput(trimmedInput)) {
            return null;
        }

        try {
            let parsedDate: Date | NepaliDate;

            if (targetType === 'nepali') {
                parsedDate = new NepaliDate(trimmedInput);
            } else {
                // Parse as English date (AD)
                const [year, month, day] = trimmedInput.split('-').map(Number);
                parsedDate = new Date(year, month - 1, day); // month is 0-based in Date
            }

            // Validate against min/max dates if provided
            if (minDate) {
                const minDateToCompare = targetType === 'nepali' 
                    ? (minDate instanceof NepaliDate ? minDate : NepaliDate.fromADDate(minDate))
                    : (minDate instanceof Date ? minDate : minDate.toADDate());

                const isBeforeMin = targetType === 'nepali'
                    ? (parsedDate as NepaliDate).compare(minDateToCompare as NepaliDate) < 0
                    : (parsedDate as Date).getTime() < (minDateToCompare as Date).getTime();

                if (isBeforeMin) {
                    return null;
                }
            }

            if (maxDate) {
                const maxDateToCompare = targetType === 'nepali'
                    ? (maxDate instanceof NepaliDate ? maxDate : NepaliDate.fromADDate(maxDate))
                    : (maxDate instanceof Date ? maxDate : maxDate.toADDate());

                const isAfterMax = targetType === 'nepali'
                    ? (parsedDate as NepaliDate).compare(maxDateToCompare as NepaliDate) > 0
                    : (parsedDate as Date).getTime() > (maxDateToCompare as Date).getTime();

                if (isAfterMax) {
                    return null;
                }
            }

            return parsedDate;
        } catch (error) {
            return null;
        }
    }, [minDate, maxDate, isValidInput]);

    const validateDateInput = useCallback((input: string, targetType: 'date' | 'nepali'): string | null => {
        const trimmedInput = input.trim();
        
        if (!trimmedInput) {
            return null; // Empty input is valid (allows clearing)
        }

        if (!isValidInput(trimmedInput)) {
            return `Please enter date in YYYY-MM-DD format (e.g., ${targetType === 'nepali' ? '2082-03-20' : '2025-07-02'})`;
        }

        const parsedDate = parseInputToDate(trimmedInput, targetType);
        if (!parsedDate) {
            if (minDate || maxDate) {
                const getDateString = (date: Date | NepaliDate) => {
                    if (targetType === 'nepali') {
                        const nepaliDate = date instanceof NepaliDate ? date : NepaliDate.fromADDate(date);
                        return nepaliDate.toString();
                    } else {
                        const adDate = date instanceof Date ? date : date.toADDate();
                        return adDate.toISOString().split('T')[0];
                    }
                };

                const minStr = minDate ? getDateString(minDate) : '';
                const maxStr = maxDate ? getDateString(maxDate) : '';
                
                if (minDate && maxDate) {
                    return `Date must be between ${minStr} and ${maxStr}`;
                } else if (minDate) {
                    return `Date must be after ${minStr}`;
                } else if (maxDate) {
                    return `Date must be before ${maxStr}`;
                }
            }
            return 'Invalid date';
        }

        return null;
    }, [isValidInput, parseInputToDate, minDate, maxDate]);

    const handleInputChange = useCallback((input: string, targetType: 'date' | 'nepali') => {
        const validationError = validateDateInput(input, targetType);
        
        setError(validationError);

        // If input is valid, parse and call the callback
        if (!validationError) {
            const parsedDate = input.trim() ? parseInputToDate(input, targetType) : null;
            
            // Check if the parsed date is different from current date to avoid unnecessary updates
            if (currentDate && parsedDate) {
                const isSame = targetType === 'nepali'
                    ? (parsedDate as NepaliDate).equals(currentDate as NepaliDate)
                    : (parsedDate as Date).getTime() === (currentDate as Date).getTime();
                
                if (isSame) {
                    return;
                }
            }
            
            onDateChange(parsedDate);
        }
    }, [validateDateInput, parseInputToDate, onDateChange, currentDate]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isValidInput,
        parseInputToDate,
        handleInputChange,
        error,
        clearError,
    };
};
