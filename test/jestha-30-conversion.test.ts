import { expect, test, describe } from "vitest";
import { NepaliDate } from "../src/NepaliDate";

describe("Jestha 30 Conversion Test", () => {
    test("NepaliDate(2082, 1, 30) should convert to Date(2025, 5, 13)", () => {
        // Create Jestha 30, 2082 BS (month 1 is Jestha, 0-indexed)
        const nepaliDate = new NepaliDate(2082, 1, 30);
        
        // Convert to AD date
        const adDate = nepaliDate.toADDate();
        
        // Expected: June 13, 2025 (month 5 is June, 0-indexed)
        const expectedDate = new Date(2025, 5, 13);
        
        // Check year, month, and date separately for clearer debugging
        expect(adDate.getFullYear()).toBe(2025);
        expect(adDate.getMonth()).toBe(5); // June (0-indexed)
        expect(adDate.getDate()).toBe(13);
        
        // Also check the full date equality
        expect(adDate.getFullYear()).toBe(expectedDate.getFullYear());
        expect(adDate.getMonth()).toBe(expectedDate.getMonth());
        expect(adDate.getDate()).toBe(expectedDate.getDate());
    });

    test("Verify Jestha 30 is valid in 2082", () => {
        // First verify that Jestha 30 is a valid date in 2082
        const nepaliDate = new NepaliDate(2082, 1, 30);
        
        expect(nepaliDate.getFullYear()).toBe(2082);
        expect(nepaliDate.getMonth()).toBe(1); // Jestha (0-indexed)
        expect(nepaliDate.getDate()).toBe(30);
        
        // Check that Jestha has at least 30 days in 2082
        const daysInJestha = nepaliDate.getDaysInMonth();
        expect(daysInJestha).toBeGreaterThanOrEqual(30);
    });

    test("Round-trip conversion: BS -> AD -> BS", () => {
        // Start with Jestha 30, 2082
        const originalNepali = new NepaliDate(2082, 1, 30);
        
        // Convert to AD
        const adDate = originalNepali.toADDate();
        
        // Convert back to BS
        const convertedBackNepali = NepaliDate.fromADDate(adDate);
        
        // Should get back the original date
        expect(convertedBackNepali.getFullYear()).toBe(originalNepali.getFullYear());
        expect(convertedBackNepali.getMonth()).toBe(originalNepali.getMonth());
        expect(convertedBackNepali.getDate()).toBe(originalNepali.getDate());
        
        // Also test using equals method
        expect(convertedBackNepali.equals(originalNepali)).toBe(true);
    });

    test("Debug: Check days in Jestha 2082", () => {
        const nepaliDate = new NepaliDate(2082, 1, 1); // Jestha 1, 2082
        const daysInJestha = nepaliDate.getDaysInMonth();
        
        console.log(`Days in Jestha 2082: ${daysInJestha}`);
        expect(daysInJestha).toBeGreaterThan(0);
        
        // Test that we can create all valid days in Jestha 2082
        for (let day = 1; day <= daysInJestha; day++) {
            const testDate = new NepaliDate(2082, 1, day);
            expect(testDate.getDate()).toBe(day);
        }
    });
});
