import { MIN_AD_YEAR, BS_MONTHS, MIN_BS_YEAR, MAX_BS_YEAR, type BS_MONTHS_KEYS } from "../data/constants";
import { NepaliDate } from "../src/NepaliDate";
import Errors from "./Errors";
import { calcTotalDaysFromMinAD } from "./helpers";
import { isValidADRange } from "./validators";

/**
 * Internal helper to validate BS date without circular dependency
 */
const isValidBSDateInternal = (year: number, month: number, date: number): boolean => {
    if (month < 0 || month > 11) return false;
    if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) return false;
    if (date < 1 || date > BS_MONTHS[year as BS_MONTHS_KEYS][month]) return false;
    if (year === MIN_BS_YEAR && month === 8 && date < 17) return false;
    return true;
};

/**
 * Internal helper to calculate total days from MIN_BS_YEAR without circular dependency
 */
const calcTotalDaysFromMinBSInternal = (year: number, month: number, date: number): number => {
    let totalDays = date;

    if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) {
        throw Errors.INVALID_BS_YEAR;
    }

    // Add days from current month
    for (let i = 0; i < month; i++) {
        totalDays += BS_MONTHS[year as BS_MONTHS_KEYS][i];
    }

    if (year === Number(MIN_BS_YEAR)) {
        return totalDays;
    }

    // Add days from previous years
    for (let i = MIN_BS_YEAR; i < year; i++) {
        for (let j = 0; j < 12; j++) {
            totalDays += BS_MONTHS[i as BS_MONTHS_KEYS][j];
        }
    }

    // Temporary fix for the offset
    return totalDays - (275 + 18);
};

/**
 * Internal helper to add days to minimum BS date without circular dependency
 */
const addDaysToMinBSDateInternal = (days: number): { year: number; month: number; date: number } => {
    let BS_year = MIN_BS_YEAR as BS_MONTHS_KEYS;
    let BS_month = 9;
    let BS_day = 18;
    let month_end = BS_MONTHS[BS_year][BS_month];

    for (let i = 0; i < days; i++) {
        BS_day++;
        if (BS_day <= month_end) {
            continue;
        }

        if (BS_month != 11) {
            BS_month++;
        } else {
            BS_month = 0;
            BS_year++;
        }

        if (BS_year > MAX_BS_YEAR) {
            break;
        }

        month_end = BS_MONTHS[BS_year as BS_MONTHS_KEYS][BS_month];
        BS_day = 1;
    }

    return { year: BS_year, month: BS_month, date: BS_day };
};

const convertFromBSToAD = (BS_date: NepaliDate): Date => {
    const year = BS_date.getFullYear();
    const month = BS_date.getMonth();
    const date = BS_date.getDate();

    if (!isValidBSDateInternal(year, month, date)) {
        throw Errors.INVALID_BS_DATE_RANGE;
    }

    const differenceDays = calcTotalDaysFromMinBSInternal(year, month, date);
    const AD_date = new Date(MIN_AD_YEAR, 1, differenceDays);

    return AD_date;
};

const convertFromADToBS = (date: Date): NepaliDate => {
    const isValid = isValidADRange(date);
    if (!isValid) {
        throw Errors.INVALID_AD_DATE_RANGE;
    }

    const differenceDays = calcTotalDaysFromMinAD(date);
    const bsDateComponents = addDaysToMinBSDateInternal(differenceDays);

    return new NepaliDate(bsDateComponents.year, bsDateComponents.month, bsDateComponents.date);
};

export {
    convertFromADToBS,
    convertFromBSToAD
}
