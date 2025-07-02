import { useState, useCallback } from 'react';
import { NepaliDate } from '../../NepaliDate';

export interface UseEditableDateInputReturn {
    isValidInput: (input: string) => boolean;
    parseInputToDate: (input: string) => NepaliDate | null;
    handleInputChange: (input: string, type: 'start' | 'end') => void;
    errors: {
        start: string | null;
        end: string | null;
    };
    clearErrors: () => void;
}

export interface UseEditableDateInputProps {
    onStartDateChange: (date: NepaliDate | null) => void;
    onEndDateChange: (date: NepaliDate | null) => void;
    minDate?: Date | NepaliDate;
    maxDate?: Date | NepaliDate;
    currentStartDate?: Date | NepaliDate | null;
    currentEndDate?: Date | NepaliDate | null;
}

export const useEditableDateInput = ({
    onStartDateChange,
    onEndDateChange,
    minDate,
    maxDate,
    currentStartDate,
    currentEndDate
}: UseEditableDateInputProps): UseEditableDateInputReturn => {
    const [errors, setErrors] = useState<{ start: string | null; end: string | null }>({
        start: null,
        end: null,
    });

    // ISO format regex: YYYY-MM-DD (for Nepali dates like 2082-03-20)
    const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

    const isValidInput = useCallback((input: string): boolean => {
        if (!input.trim()) return false;
        return ISO_DATE_REGEX.test(input.trim());
    }, []);

    const parseInputToDate = useCallback((input: string): NepaliDate | null => {
        const trimmedInput = input.trim();
        
        if (!isValidInput(trimmedInput)) {
            return null;
        }

        try {
            const nepaliDate = new NepaliDate(trimmedInput);
            
            // Validate against min/max dates if provided
            if (minDate) {
                const minNepaliDate = minDate instanceof NepaliDate ? minDate : NepaliDate.fromADDate(minDate);
                if (nepaliDate.compare(minNepaliDate) < 0) {
                    return null;
                }
            }

            if (maxDate) {
                const maxNepaliDate = maxDate instanceof NepaliDate ? maxDate : NepaliDate.fromADDate(maxDate);
                if (nepaliDate.compare(maxNepaliDate) > 0) {
                    return null;
                }
            }

            return nepaliDate;
        } catch (error) {
            return null;
        }
    }, [minDate, maxDate, isValidInput]);

    const validateDateInput = useCallback((input: string, type: 'start' | 'end'): string | null => {
        const trimmedInput = input.trim();
        
        if (!trimmedInput) {
            return null; // Empty input is valid (allows clearing)
        }

        if (!isValidInput(trimmedInput)) {
            return 'Please enter date in YYYY-MM-DD format (e.g., 2082-03-20)';
        }

        const parsedDate = parseInputToDate(trimmedInput);
        if (!parsedDate) {
            if (minDate || maxDate) {
                const minStr = minDate ? (minDate instanceof NepaliDate ? minDate.toString() : NepaliDate.fromADDate(minDate).toString()) : '';
                const maxStr = maxDate ? (maxDate instanceof NepaliDate ? maxDate.toString() : NepaliDate.fromADDate(maxDate).toString()) : '';
                
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

        // Validate range logic
        if (type === 'start' && currentEndDate) {
            const endNepaliDate = currentEndDate instanceof NepaliDate ? currentEndDate : NepaliDate.fromADDate(currentEndDate);
            if (parsedDate.compare(endNepaliDate) > 0) {
                return 'Start date must be before end date';
            }
        } else if (type === 'end' && currentStartDate) {
            const startNepaliDate = currentStartDate instanceof NepaliDate ? currentStartDate : NepaliDate.fromADDate(currentStartDate);
            if (parsedDate.compare(startNepaliDate) < 0) {
                return 'End date must be after start date';
            }
        }

        return null;
    }, [isValidInput, parseInputToDate, minDate, maxDate, currentStartDate, currentEndDate]);

    const handleInputChange = useCallback((input: string, type: 'start' | 'end') => {
        const error = validateDateInput(input, type);
        
        setErrors(prev => ({
            ...prev,
            [type]: error,
        }));

        // If input is valid, parse and call the appropriate callback
        if (!error) {
            const parsedDate = input.trim() ? parseInputToDate(input) : null;
            
            if (type === 'start') {
                onStartDateChange(parsedDate);
            } else {
                onEndDateChange(parsedDate);
            }
        }
    }, [validateDateInput, parseInputToDate, onStartDateChange, onEndDateChange]);

    const clearErrors = useCallback(() => {
        setErrors({ start: null, end: null });
    }, []);

    return {
        isValidInput,
        parseInputToDate,
        handleInputChange,
        errors,
        clearErrors,
    };
};
