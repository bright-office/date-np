import { expect, test, describe } from 'vitest';
import { format, formatISO, formatLong, formatShort, formatMedium } from '../src/format';
import { NepaliDate } from '../src/NepaliDate';

describe('Date Formatting', () => {
    describe('English Date Formatting', () => {
        const testDate = new Date(2025, 5, 3); // June 3, 2025
        
        test('should format yyyy token', () => {
            expect(format(testDate, 'yyyy')).toBe('2025');
        });
        
        test('should format yy token', () => {
            expect(format(testDate, 'yy')).toBe('25');
        });
        
        test('should format MMMM token', () => {
            expect(format(testDate, 'MMMM')).toBe('June');
        });
        
        test('should format MMM token', () => {
            expect(format(testDate, 'MMM')).toBe('Jun');
        });
        
        test('should format MM token', () => {
            expect(format(testDate, 'MM')).toBe('06');
        });
        
        test('should format M token', () => {
            expect(format(testDate, 'M')).toBe('6');
        });
        
        test('should format dd token', () => {
            expect(format(testDate, 'dd')).toBe('03');
        });
        
        test('should format d token', () => {
            expect(format(testDate, 'd')).toBe('3');
        });
        
        test('should format do token', () => {
            expect(format(testDate, 'do')).toBe('3rd');
        });
        
        test('should format complex date patterns', () => {
            expect(format(testDate, 'yyyy-MM-dd')).toBe('2025-06-03');
            expect(format(testDate, 'MMMM do, yyyy')).toBe('June 3rd, 2025');
            expect(format(testDate, 'MMM dd, yyyy')).toBe('Jun 03, 2025');
            expect(format(testDate, 'M/d/yy')).toBe('6/3/25');
        });
    });
    
    describe('Nepali Date Formatting', () => {
        const testDate = new NepaliDate(2082, 2, 20); // Aashar 20, 2082
        
        test('should format yyyy token', () => {
            expect(format(testDate, 'yyyy')).toBe('2082');
        });
        
        test('should format yy token', () => {
            expect(format(testDate, 'yy')).toBe('82');
        });
        
        test('should format MMMM token', () => {
            expect(format(testDate, 'MMMM')).toBe('Aashar');
        });
        
        test('should format MMM token', () => {
            expect(format(testDate, 'MMM')).toBe('Aash');
        });
        
        test('should format MM token', () => {
            expect(format(testDate, 'MM')).toBe('03');
        });
        
        test('should format M token', () => {
            expect(format(testDate, 'M')).toBe('3');
        });
        
        test('should format dd token', () => {
            expect(format(testDate, 'dd')).toBe('20');
        });
        
        test('should format d token', () => {
            expect(format(testDate, 'd')).toBe('20');
        });
        
        test('should format do token', () => {
            expect(format(testDate, 'do')).toBe('20th');
        });
        
        test('should format complex date patterns', () => {
            expect(format(testDate, 'yyyy-MM-dd')).toBe('2082-03-20');
            expect(format(testDate, 'MMMM do, yyyy')).toBe('Aashar 20th, 2082');
            expect(format(testDate, 'MMM dd, yyyy')).toBe('Aash 20, 2082');
        });
    });
    
    describe('Ordinal number formatting', () => {
        const testCases = [
            { day: 1, expected: '1st' },
            { day: 2, expected: '2nd' },
            { day: 3, expected: '3rd' },
            { day: 4, expected: '4th' },
            { day: 11, expected: '11th' },
            { day: 12, expected: '12th' },
            { day: 13, expected: '13th' },
            { day: 21, expected: '21st' },
            { day: 22, expected: '22nd' },
            { day: 23, expected: '23rd' },
            { day: 31, expected: '31st' }
        ];
        
        testCases.forEach(({ day, expected }) => {
            test(`should format day ${day} as ${expected}`, () => {
                const testDate = new Date(2025, 0, day);
                expect(format(testDate, 'do')).toBe(expected);
            });
        });
    });
    
    describe('Convenience formatting functions', () => {
        const englishDate = new Date(2025, 5, 3);
        const nepaliDate = new NepaliDate(2082, 2, 20);
        
        test('formatISO should format as yyyy-MM-dd', () => {
            expect(formatISO(englishDate)).toBe('2025-06-03');
            expect(formatISO(nepaliDate)).toBe('2082-03-20');
        });
        
        test('formatLong should format as MMMM do, yyyy', () => {
            expect(formatLong(englishDate)).toBe('June 3rd, 2025');
            expect(formatLong(nepaliDate)).toBe('Aashar 20th, 2082');
        });
        
        test('formatShort should format as MM/dd/yyyy', () => {
            expect(formatShort(englishDate)).toBe('06/03/2025');
            expect(formatShort(nepaliDate)).toBe('03/20/2082');
        });
        
        test('formatMedium should format as MMM dd, yyyy', () => {
            expect(formatMedium(englishDate)).toBe('Jun 03, 2025');
            expect(formatMedium(nepaliDate)).toBe('Aash 20, 2082');
        });
    });
});
