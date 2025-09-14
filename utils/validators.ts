import {
  MIN_BS_YEAR,
  MIN_AD_YEAR,
  type BS_MONTHS_KEYS,
  AD_MONTH,
  AD_MONTH_LEAP_YEAR,
  BS_MONTHS,
  MAX_BS_YEAR,
} from "../data/constants";
import { extractYear, type yearInput } from "./helpers";
import { NepaliDate } from "../src/NepaliDate";

/**
 * @categoryDescription validators
 * These are the validators for the date-np package.
 * @showCategories
 * @module
 */

/**
 * @category validators
 * Checks if the given date is a valid BS date.
 * @param {Date} yearInput - The date to be checked.
 * @returns {boolean} - True if the date is a valid BS date, false otherwise.
 *
 */
const isValidBSYear = (yearInput: yearInput): boolean => {
  const year = extractYear(yearInput);
  return year >= Number(MIN_BS_YEAR);
};

const isValidADYear = (yearInput: yearInput): boolean => {
  const year = extractYear(yearInput);
  return year >= Number(MIN_AD_YEAR);
};

const isADLeapYear = (yearInput: yearInput): boolean => {
  const year = extractYear(yearInput);

  let isLeapYear = year % 4 === 0;
  const isCenturialYear = year % 100 === 0;
  if (isCenturialYear) isLeapYear = year % 400 === 0;

  return isLeapYear;
};

/**
 * @category validators
 * Checks if the given date is a valid AD date.
 * @param {Date} AD_date - The date to be checked.
 * @returns {boolean} - True if the date is a valid AD date, false otherwise.
 */
const isValidADRange = (AD_date: Date): boolean => {
  const year = AD_date.getFullYear();
  const month = AD_date.getMonth();
  const day = AD_date.getDate();

  if (month < 0 || month > 11) return false;

  if (day < 1 || day > AD_MONTH[month]) return false;

  const isLeapYear = isADLeapYear(AD_date);
  if (isLeapYear && day > AD_MONTH_LEAP_YEAR[month]) return false;

  if (year < MIN_AD_YEAR || year > MAX_BS_YEAR) return false;

  return true;
};

/**
 * @category validators
 * Checks if the given date is a valid BS date.
 * The date before 2000 poush 17 is not valid as of now.
 * Will try to fix this later on. TODO: Fix this.
 *
 * @param {NepaliDate} BS_date - The date to be checked.
 * @returns {boolean} - True if the date is a valid BS date, false otherwise.
 */
const isValidBSRange = (BS_date: NepaliDate): boolean => {
  const year = BS_date.getFullYear();
  const month = BS_date.getMonth();
  const day = BS_date.getDate();

  if (month < 0 || month > 11) return false;

  if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) return false;

  if (day < 1 || day > BS_MONTHS[year as BS_MONTHS_KEYS][month]) return false;

  if (year === MIN_BS_YEAR && month === 8 && day < 17) return false;

  return true;
};

/**
 * Checks whether if two dates are equal or not.
 * Ignores there time and only checks the year month and date.
 * @param {Date | NepaliDate} date1 - The first date to be checked.
 * @param {Date | NepaliDate} date2 - The second date to be checked.
 *
 * @returns {boolean} - True if the dates are equal, false otherwise.
 */
const areDatesEqual = (
  date1: Date | NepaliDate,
  date2: Date | NepaliDate
): boolean => {
  // If both are NepaliDate, use the equals method
  if (date1 instanceof NepaliDate && date2 instanceof NepaliDate) {
    return date1.equals(date2);
  }

  // If both are Date, use the original logic
  if (date1 instanceof Date && date2 instanceof Date) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // If types are mixed, convert both to AD dates for comparison
  const adDate1 = date1 instanceof NepaliDate ? date1.toADDate() : date1;
  const adDate2 = date2 instanceof NepaliDate ? date2.toADDate() : date2;

  return (
    adDate1.getFullYear() === adDate2.getFullYear() &&
    adDate1.getMonth() === adDate2.getMonth() &&
    adDate1.getDate() === adDate2.getDate()
  );
};

/**
 * @category validators
 * Compare two dates for ordering. Returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 * @param {Date | NepaliDate} date1 - First date to compare
 * @param {Date | NepaliDate} date2 - Second date to compare
 * @returns {number} - Comparison result (-1, 0, or 1)
 */
const compareDates = (
  date1: Date | NepaliDate,
  date2: Date | NepaliDate
): number => {
  // If both are NepaliDate, use the compare method
  if (date1 instanceof NepaliDate && date2 instanceof NepaliDate) {
    return date1.compare(date2);
  }

  // If both are Date, compare same way like Nepali Date
  if (date1 instanceof Date && date2 instanceof Date) {
    const time1 = date1.getTime();
    const time2 = date2.getTime();

    return time1 < time2 ? -1 : time1 > time2 ? 1 : 0;
  }

  // If types are mixed, convert both to AD dates for comparison
  const adDate1 = date1 instanceof NepaliDate ? date1.toADDate() : date1;
  const adDate2 = date2 instanceof NepaliDate ? date2.toADDate() : date2;

  const time1 = adDate1.getTime();
  const time2 = adDate2.getTime();
  return time1 < time2 ? -1 : time1 > time2 ? 1 : 0;
};

/**
 * @category validators
 * Check if first date is before second date
 * @param {Date | NepaliDate} date1 - First date
 * @param {Date | NepaliDate} date2 - Second date
 * @returns {boolean} - True if date1 is before date2
 */
const isDateBefore = (
  date1: Date | NepaliDate,
  date2: Date | NepaliDate
): boolean => {
  return compareDates(date1, date2) < 0;
};

/**
 * @category validators
 * Check if first date is after second date
 * @param {Date | NepaliDate} date1 - First date
 * @param {Date | NepaliDate} date2 - Second date
 * @returns {boolean} - True if date1 is after date2
 */
const isDateAfter = (
  date1: Date | NepaliDate,
  date2: Date | NepaliDate
): boolean => {
  return compareDates(date1, date2) > 0;
};

/**
 * @category validators
 * Check if a date falls between two other dates (inclusive)
 * @param {Date | NepaliDate} date - Date to check
 * @param {Date | NepaliDate} startDate - Start of range
 * @param {Date | NepaliDate} endDate - End of range
 * @returns {boolean} - True if date is between startDate and endDate
 */
const isDateBetween = (
  date: Date | NepaliDate,
  startDate: Date | NepaliDate,
  endDate: Date | NepaliDate
): boolean => {
  return compareDates(date, startDate) >= 0 && compareDates(date, endDate) <= 0;
};

/**
 * @category validators
 * Check if minDate is greater than maxDate (invalid configuration)
 * @param {Date | NepaliDate} minDate - Minimum date
 * @param {Date | NepaliDate} maxDate - Maximum date
 * @returns {boolean} - True if minDate > maxDate (invalid), false otherwise
 */
const isInvalidDateRange = (
  minDate: Date | NepaliDate,
  maxDate: Date | NepaliDate
): boolean => {
  return compareDates(minDate, maxDate) > 0;
};

export {
  isValidBSYear,
  isValidADYear,
  isADLeapYear,
  isValidADRange,
  isValidBSRange,
  areDatesEqual,
  compareDates,
  isDateBefore,
  isDateAfter,
  isDateBetween,
  isInvalidDateRange,
};
