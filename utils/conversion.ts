import { MIN_AD_YEAR } from "../data/constants";
import Errors from "./Errors";
import { addDaysToMinBSDate, calcTotalDaysFromMinAD, calcTotalDaysFromMinBS } from "./helpers";
import { isValidADRange, isValidBSRange } from "./validators";

const convertFromBSToAD = (BS_date: Date): Date => {
    const isValid = isValidBSRange(BS_date);
    if (!isValid)
        throw Errors.INVALID_BS_DATE_RANGE;

    const differenceDays = calcTotalDaysFromMinBS(BS_date);
    const AD_date = new Date(MIN_AD_YEAR, 1, differenceDays);

    return AD_date;
};

const convertFromADToBS = (date: Date) => {
    const isValid = isValidADRange(date);
    if (!isValid)
        throw Errors.INVALID_AD_DATE_RANGE;

    const differenceDays = calcTotalDaysFromMinAD(date);
    const BS_date = addDaysToMinBSDate(differenceDays)

    return BS_date
};

export {
    convertFromADToBS,
    convertFromBSToAD
}
