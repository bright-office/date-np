import { BS_MONTHS, type BS_MONTHS_KEYS } from "../data/constants";
import { convertFromADToBS, convertFromBSToAD } from "../utils/conversion";
import { isValidBSYear } from "../utils/validators";
import Errors from "../utils/Errors";

/**
 * NepaliDate class for handling Nepali (Bikram Sambat) dates
 * This class provides Date-like functionality but works with the Nepali calendar system
 */
export class NepaliDate {
  _year: number;
  _month: number; // 0-based like JavaScript Date
  _date: number;

  constructor();
  constructor(year: number, month: number, date?: number);
  constructor(adDate: Date);
  constructor(nepaliDate: NepaliDate);
  constructor(dateString: string);
  constructor(
    yearOrDate?: number | Date | NepaliDate | string,
    month?: number,
    date?: number
  ) {
    if (yearOrDate === undefined) {
      // Default constructor - convert current AD date to BS
      const today = new Date();
      const bsDate = convertFromADToBS(today);
      this._year = bsDate.getFullYear();
      this._month = bsDate.getMonth();
      this._date = bsDate.getDate();
    } else if (yearOrDate instanceof Date) {
      // Convert AD Date to BS
      const bsDate = convertFromADToBS(yearOrDate);
      this._year = bsDate.getFullYear();
      this._month = bsDate.getMonth();
      this._date = bsDate.getDate();
    } else if (yearOrDate instanceof NepaliDate) {
      // Copy constructor
      this._year = yearOrDate._year;
      this._month = yearOrDate._month;
      this._date = yearOrDate._date;
    } else if (typeof yearOrDate === "string") {
      // Constructor with date string (YYYY-MM-DD format)
      const parts = yearOrDate.split("-");
      if (parts.length !== 3) {
        throw new Error(
          "Invalid date string format. Expected format: YYYY-MM-DD"
        );
      }

      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const date = parseInt(parts[2], 10);

      if (isNaN(year) || isNaN(month) || isNaN(date)) {
        throw new Error(
          "Invalid date string format. All parts must be numbers"
        );
      }

      if (month < 1 || month > 12) {
        throw new Error("Month must be between 1 and 12");
      }

      this._year = year;
      this._month = month - 1; // Convert to 0-based month
      this._date = date;

      // Normalize the date if it's out of bounds
      this.normalize();
    } else if (typeof yearOrDate === "number") {
      // Constructor with year, month, date
      this._year = yearOrDate;
      this._month = month ?? 0;
      this._date = date ?? 1;

      // Normalize the date if it's out of bounds
      this.normalize();
    } else {
      throw new Error("Invalid constructor arguments");
    }
  }

  /**
   * Normalize the date to handle overflow/underflow of dates and months
   */
  private normalize(): void {
    // Handle negative months or months >= 12
    while (this._month < 0) {
      this._month += 12;
      this._year--;
    }
    while (this._month >= 12) {
      this._month -= 12;
      this._year++;
    }

    // Validate year
    if (!isValidBSYear(this._year)) {
      throw Errors.INVALID_BS_YEAR;
    }

    // Handle date overflow/underflow
    const monthDays = BS_MONTHS[this._year as BS_MONTHS_KEYS][this._month];

    while (this._date < 1) {
      this._month--;
      if (this._month < 0) {
        this._month = 11;
        this._year--;
      }
      if (!isValidBSYear(this._year)) {
        throw Errors.INVALID_BS_YEAR;
      }
      const prevMonthDays =
        BS_MONTHS[this._year as BS_MONTHS_KEYS][this._month];
      this._date += prevMonthDays;
    }

    while (this._date > monthDays) {
      this._date -= monthDays;
      this._month++;
      if (this._month >= 12) {
        this._month = 0;
        this._year++;
      }
      if (!isValidBSYear(this._year)) {
        throw Errors.INVALID_BS_YEAR;
      }
      const currentMonthDays =
        BS_MONTHS[this._year as BS_MONTHS_KEYS][this._month];
      // Update monthDays for the loop condition
      if (this._date <= currentMonthDays) break;
    }
  }

  /**
   * Get the year (BS)
   */
  getFullYear(): number {
    return this._year;
  }

  /**
   * Get the month (0-based, like JavaScript Date)
   */
  getMonth(): number {
    return this._month;
  }

  /**
   * Get the date
   */
  getDate(): number {
    return this._date;
  }

  /**
   * Get the day of the week (0 = Sunday, 6 = Saturday)
   * This converts to AD date to get the correct day
   */
  getDay(): number {
    const adDate = convertFromBSToAD(this);
    return adDate.getDay();
  }

  /**
   * Set the year
   */
  setFullYear(year: number): void {
    this._year = year;
    this.normalize();
  }

  /**
   * Set the month (0-based)
   */
  setMonth(month: number): void {
    this._month = month;
    this.normalize();
  }

  /**
   * Set the date
   */
  setDate(date: number): void {
    this._date = date;
    this.normalize();
  }

  /**
   * Get the number of days in the current month
   */
  getDaysInMonth(): number {
    if (!isValidBSYear(this._year)) {
      throw Errors.INVALID_BS_YEAR;
    }
    return BS_MONTHS[this._year as BS_MONTHS_KEYS][this._month];
  }

  /**
   * Get the number of days in a specific month of the current year
   */
  getDaysInMonthOf(month: number): number {
    if (!isValidBSYear(this._year)) {
      throw Errors.INVALID_BS_YEAR;
    }
    if (month < 0 || month > 11) {
      throw new Error("Month must be between 0 and 11");
    }
    return BS_MONTHS[this._year as BS_MONTHS_KEYS][month];
  }

  /**
   * Create a new NepaliDate with the first day of the current month
   */
  getFirstDayOfMonth(): NepaliDate {
    return new NepaliDate(this._year, this._month, 1);
  }

  /**
   * Create a new NepaliDate with the last day of the current month
   */
  getLastDayOfMonth(): NepaliDate {
    const daysInMonth = this.getDaysInMonth();
    return new NepaliDate(this._year, this._month, daysInMonth);
  }

  /**
   * Add days to the current date
   */
  addDays(days: number): NepaliDate {
    const newDate = new NepaliDate(this);
    newDate._date += days;
    newDate.normalize();
    return newDate;
  }

  /**
   * Add months to the current date
   */
  addMonths(months: number): NepaliDate {
    const newDate = new NepaliDate(this);
    newDate._month += months;
    newDate.normalize();
    return newDate;
  }

  /**
   * Add years to the current date
   */
  addYears(years: number): NepaliDate {
    const newDate = new NepaliDate(this);
    newDate._year += years;
    newDate.normalize();
    return newDate;
  }

  /**
   * Check if this date equals another date
   */
  equals(other: NepaliDate): boolean {
    return (
      this._year === other._year &&
      this._month === other._month &&
      this._date === other._date
    );
  }

  /**
   * Compare this date with another date
   * Returns: -1 if this < other, 0 if equal, 1 if this > other
   */
  compare(other: NepaliDate): number {
    if (this._year !== other._year) {
      return this._year < other._year ? -1 : 1;
    }
    if (this._month !== other._month) {
      return this._month < other._month ? -1 : 1;
    }
    if (this._date !== other._date) {
      return this._date < other._date ? -1 : 1;
    }
    return 0;
  }

  /**
   * Convert to AD Date
   */
  toADDate(): Date {
    return convertFromBSToAD(this);
  }

  /**
   * Create NepaliDate from AD Date
   */
  static fromADDate(adDate: Date): NepaliDate {
    return new NepaliDate(adDate);
  }

  /**
   * Get today's Nepali date
   */
  static today(): NepaliDate {
    return new NepaliDate();
  }

  /**
   * String representation
   */
  toString(): string {
    return `${this._year}/${String(this._month + 1).padStart(2, "0")}/${String(
      this._date
    ).padStart(2, "0")}`;
  }

  /**
   * Create a clone of this date
   */
  clone(): NepaliDate {
    return new NepaliDate(this);
  }
}
