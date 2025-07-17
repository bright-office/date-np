type calendarType = "AD" | "BS"

/**
 * Types of available calendar
 */
export type tcalendar = Record<calendarType, {
    months: string[],
    days: string[],
}>

export const CALENDAR: tcalendar = {
    BS: {
        months: ["Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"],
        days: ["Aaitabaar", "Sombaar", "Mangalbaar", "Budhabaar", "Bihibaar", "Shukrabaar", "Shanibaar"],
    },
    AD: {
        months: ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },
}
