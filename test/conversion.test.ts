import { assert, expect, test } from "vitest";
import { convertFromADToBS, convertFromBSToAD } from "../utils/conversion";
import { areDatesEqual, compareDates } from "../utils/validators";

const BSToADCASES = [
    {
        inputDate: new Date(2080, 0, 4),
        outputDate: new Date(2023, 3, 17),
    },
    {
        inputDate: new Date(2080, 1, 4),
        outputDate: new Date(2023, 4, 18),
    },
    {
        inputDate: new Date(2080, 2, 4),
        outputDate: new Date(2023, 5, 19),
    },
    {
        inputDate: new Date(2080, 3, 4),
        outputDate: new Date(2023, 6, 20),
    },
    {
        inputDate: new Date(2080, 4, 4),
        outputDate: new Date(2023, 7, 21),
    },
    {
        inputDate: new Date(2080, 5, 4),
        outputDate: new Date(2023, 8, 21),
    },
    {
        inputDate: new Date(2080, 6, 4),
        outputDate: new Date(2023, 9, 21),
    },
    {
        inputDate: new Date(2080, 7, 4),
        outputDate: new Date(2023, 10, 20),
    },
    {
        inputDate: new Date(2080, 8, 4),
        outputDate: new Date(2023, 11, 20),
    },
    {
        inputDate: new Date(2080, 9, 4),
        outputDate: new Date(2024, 0, 18),
    },
    {
        inputDate: new Date(2080, 10, 4),
        outputDate: new Date(2024, 1, 16),
    },
    {
        inputDate: new Date(2080, 11, 4),
        outputDate: new Date(2024, 2, 17),
    },
    {
        inputDate: new Date(2081, 8, 9),
        outputDate: new Date(2024, 11, 24)
    },
    {
        inputDate: new Date(2082, 1, 28),
        outputDate: new Date(2025, 5, 11)
    },
    {
        inputDate: new Date(2082, 1, 29),
        outputDate: new Date(2025, 5, 1)
    }

];

const EqualDatesEnglish = [
    {
        inputDate: new Date(2023, 0, 1),
        outputDate: new Date(2023, 0, 1),
    },
    {
        inputDate: new Date(2024, 5, 15),
        outputDate: new Date(2024, 5, 15),
    },
    {
        inputDate: new Date(2025, 11, 31),
        outputDate: new Date(2025, 11, 31),
    },
]

const ADToBSCASES = [
    {
        inputDate: new Date(2023, 2, 17),
        outputDate: new Date(2079, 11, 3),
    },
    {
        inputDate: new Date(2023, 10, 25),
        outputDate: new Date(2080, 7, 9),
    },
    {
        inputDate: new Date(2024, 0, 1),
        outputDate: new Date(2080, 8, 16),
    },
    {
        inputDate: new Date(2024, 4, 15),
        outputDate: new Date(2081, 1, 2),
    },
    {
        inputDate: new Date(2025, 1, 21),
        outputDate: new Date(2081, 10, 9),
    },
    {
        inputDate: new Date(2022, 0, 1),
        outputDate: new Date(2078, 8, 17),
    },
    {
        inputDate: new Date(2025, 8, 21),
        outputDate: new Date(2082, 5, 5),
    },
    {
        inputDate: new Date(2020, 4, 15),
        outputDate: new Date(2077, 1, 2),
    }
];

// compareDates tests
const CompareDatesEnglish = [
    {
        inputDate: new Date(2023, 0, 1),
        outputDate: new Date(2023, 0, 2),
    },
    {
        inputDate: new Date(2024, 5, 14),
        outputDate: new Date(2024, 5, 15),
    },
    {
        inputDate: new Date(2025, 11, 30),
        outputDate: new Date(2025, 11, 31),
    },
    {
        inputDate: new Date(2023, 0, 1),
        outputDate: new Date(2023, 0, 2),
    },
    {
        inputDate: new Date(2024, 5, 14),
        outputDate: new Date(2024, 5, 15),
    },
];

// compareDates tests
for (const { inputDate, outputDate } of CompareDatesEnglish) {
    test(`Compare Dates ${inputDate.toLocaleString().split(',')[0]}`, () => {
        const output = compareDates(inputDate, outputDate);
        expect(output).toBe(-1);
    });
}

// Equal dates tests without converting to Nepali
for (const { inputDate, outputDate } of EqualDatesEnglish) {
    test(`Equal Dates ${inputDate.toLocaleString().split(',')[0]}`, () => {
        const output = areDatesEqual(inputDate, outputDate);
        expect(output).toBe(true);
    });
}


// BS to AD conversion tests
for (const { inputDate, outputDate } of BSToADCASES) {
    test(`BS to AD ${inputDate.toLocaleString().split(',')[0]}`, () => {
        const output = convertFromBSToAD(inputDate);
        expect(output).toEqual(outputDate);
    });
}

// AD to BS conversion tests
for (const { inputDate, outputDate } of ADToBSCASES) {
    test(`AD to BS ${inputDate.toLocaleString().split(',')[0]}`, () => {
        const output = convertFromADToBS(inputDate);
        expect(output).toEqual(outputDate);
    });
}

// Bidirectional conversion tests (using BSToADCASES for round-trip testing)
for (const { inputDate, outputDate } of BSToADCASES) {
    test(`Round-trip conversion BS->AD->BS ${inputDate.toLocaleString().split(',')[0]}`, () => {
        const adDate = convertFromBSToAD(inputDate);
        const backToBs = convertFromADToBS(adDate);
        expect(backToBs).toEqual(inputDate);
    });
}

