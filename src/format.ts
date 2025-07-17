import { NepaliDate } from './NepaliDate';
import { CALENDAR } from '../data/locale';

/**
 * Format tokens and their descriptions:
 * - yyyy: 4-digit full year (e.g., 2025)
 * - yy: 2-digit year (e.g., 25)
 * - MMMM: Full month name (e.g., June/Baishak)
 * - MMM: Short month name (e.g., Jun/Bais)
 * - MM: 2-digit month (e.g., 06)
 * - M: Numeric month, no leading 0 (e.g., 6)
 * - dd: 2-digit day (e.g., 03)
 * - d: Day, no leading zero (e.g., 3)
 * - do: Ordinal day (e.g., 3rd)
 */

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;

    if (j === 1 && k !== 11) {
        return num + 'st';
    }
    if (j === 2 && k !== 12) {
        return num + 'nd';
    }
    if (j === 3 && k !== 13) {
        return num + 'rd';
    }
    return num + 'th';
}

/**
 * Get short month name by truncating the full month name
 */
function getShortMonthName(fullName: string): string {
    // For English months, use standard abbreviations
    const englishAbbreviations: { [key: string]: string } = {
        'January': 'Jan',
        'February': 'Feb', // Note: fixing the typo in CALENDAR
        'March': 'Mar',
        'April': 'Apr',
        'May': 'May',
        'June': 'Jun',
        'July': 'Jul',
        'August': 'Aug',
        'September': 'Sep',
        'October': 'Oct', // Note: fixing the typo in CALENDAR
        'November': 'Nov',
        'December': 'Dec'
    };

    // Check if it's an English month
    if (englishAbbreviations[fullName]) {
        return englishAbbreviations[fullName];
    }

    // For Nepali months, take first 3-4 characters
    const nepaliAbbreviations: { [key: string]: string } = {
        'Baisakh': 'Bais',
        'Jestha': 'Jest',
        'Ashadh': 'Aash',
        'Shrawan': 'Shra',
        'Bhadra': 'Bhad',
        'Ashwin': 'Ashw',
        'Kartik': 'Kart',
        'Mangsir': 'Mang',
        'Poush': 'Pous',
        'Magh': 'Magh',
        'Falgun': 'Falg',
        'Chaitra': 'Chai'
    };

    return nepaliAbbreviations[fullName] || fullName.substring(0, 3);
}

/**
 * Detect if the date is a Nepali date or English date
 */
function isNepaliDate(date: Date | NepaliDate): boolean {
    return date instanceof NepaliDate;
}

/**
 * Format a date using the specified format string
 * @param date - The date to format (Date or NepaliDate)
 * @param formatString - The format string with tokens
 * @returns Formatted date string
 * 
 * @example
 * // English date
 * format(new Date(2025, 5, 3), 'yyyy-MM-dd') // '2025-06-03'
 * format(new Date(2025, 5, 3), 'MMMM do, yyyy') // 'June 3rd, 2025'
 * 
 * // Nepali date
 * format(new NepaliDate(2082, 2, 20), 'yyyy-MM-dd') // '2082-03-20'
 * format(new NepaliDate(2082, 2, 20), 'MMMM do, yyyy') // 'Aashar 20th, 2082'
 */
export function format(date: Date | NepaliDate, formatString: string): string {
    const isNepali = isNepaliDate(date);

    // Get date components
    let year: number;
    let month: number; // 0-based
    let day: number;
    let monthNames: string[];

    if (isNepali) {
        const nepaliDate = date as NepaliDate;
        year = nepaliDate.getFullYear();
        month = nepaliDate.getMonth();
        day = nepaliDate.getDate();
        monthNames = CALENDAR.BS.months;
    } else {
        const regularDate = date as Date;
        year = regularDate.getFullYear();
        month = regularDate.getMonth();
        day = regularDate.getDate();
        monthNames = CALENDAR.AD.months;
    }

    // Create replacement map
    const replacements: { [key: string]: string } = {
        'yyyy': year.toString(),
        'yy': year.toString().slice(-2),
        'MMMM': monthNames[month],
        'MMM': getShortMonthName(monthNames[month]),
        'MM': (month + 1).toString().padStart(2, '0'), // Convert to 1-based and pad
        'M': (month + 1).toString(), // Convert to 1-based
        'dd': day.toString().padStart(2, '0'),
        'd': day.toString(),
        'do': getOrdinalSuffix(day)
    };

    // Replace tokens in format string using placeholders to avoid conflicts
    let result = formatString;

    // Sort tokens by length (longest first) to handle overlapping tokens correctly
    const tokens = Object.keys(replacements).sort((a, b) => b.length - a.length);
    const placeholderMap: { [key: string]: string } = {};

    // First pass: replace tokens with unique placeholders
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const placeholder = `__PLACEHOLDER_${i}__`;
        placeholderMap[placeholder] = replacements[token];

        // Escape special regex characters in the token
        const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedToken, 'g');
        result = result.replace(regex, placeholder);
    }

    // Second pass: replace placeholders with actual values
    for (const placeholder in placeholderMap) {
        result = result.replace(new RegExp(placeholder, 'g'), placeholderMap[placeholder]);
    }

    return result;
}

/**
 * Format a date as ISO string (yyyy-MM-dd)
 * @param date - The date to format
 * @returns ISO formatted date string
 */
export function formatISO(date: Date | NepaliDate): string {
    return format(date, 'yyyy-MM-dd');
}

/**
 * Format a date as a long date string (MMMM do, yyyy)
 * @param date - The date to format
 * @returns Long formatted date string
 */
export function formatLong(date: Date | NepaliDate): string {
    return format(date, 'MMMM do, yyyy');
}

/**
 * Format a date as a short date string (MM/dd/yyyy)
 * @param date - The date to format
 * @returns Short formatted date string
 */
export function formatShort(date: Date | NepaliDate): string {
    return format(date, 'MM/dd/yyyy');
}

/**
 * Format a date as a medium date string (MMM dd, yyyy)
 * @param date - The date to format
 * @returns Medium formatted date string
 */
export function formatMedium(date: Date | NepaliDate): string {
    return format(date, 'MMM dd, yyyy');
}


/** Time Picker Section */
import { type TimeValue } from './TimePicker';

export function convertToTimeValue(time: string): TimeValue | undefined {
    if (!time || typeof time !== 'string') {
        return undefined
    }
    const [hours, minutes] = time.split(':').map(Number);
    return {
        hours: hours || 0,
        minutes: minutes || 0,
        seconds: 0 // Default seconds to 0
    };
}

export const getCurrentTime = (hourOffset: number = 0): TimeValue => {
    const now = new Date();
    return {
        hours: now.getHours() + hourOffset,
        minutes: now.getMinutes(),
        seconds: now.getSeconds()
    };
}
