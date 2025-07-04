### 🧪 Starter Template

Here's a ready-to-use starter template using **React** and **Tailwind CSS**, showcasing single-date picker, range picker, and time picker with formatting utilities.

#### 📦 Install Dependencies

```bash
npm install @brightsoftware/date-np
````

#### 🧩 Import Components

```tsx
import {
  Picker,
  RangePicker,
  TimePicker,
  format,
  formatISO,
  formatLong,
  formatShort,
  formatMedium,
  NepaliDate
} from "@brightsoftware/date-np";
```

---

### 🔘 Single Date Picker

```tsx
const [date, setDate] = useState<Date | NepaliDate>();

<Picker
  onSelect={(date) => setDate(date)}
  inputProps={{
    defaultValue: new NepaliDate(2080, 5, 14),
    dateFormat: "dd-MMMM-yyyy",
    defaultLocale: "BS",
    className: "your-tailwind-classes"
  }}
  shouldShowInput={true}
  label="Select Date"
  description="Choose your preferred date"
/>
```

---

### 🔁 Range Date Picker

```tsx
<RangePicker
  defaultLocale="BS"
  minDate={new Date(2025, 1, 1)}
  maxDate={new NepaliDate(2085, 11, 30)}
  startingDateRange={new NepaliDate(2080, 5, 14)}
  endingDateRange={new NepaliDate(2080, 6, 15)}
  shouldShowInput={true}
  onRangeSelect={(start, end) => {
    console.log("Selected Range:", start, end);
  }}
  inputProps={{
    placeholder: "Select date range...",
    dateFormat: "dd-MMMM-yyyy",
    className: "your-tailwind-classes"
  }}
/>
```

---

### ⏰ Time Picker

```tsx
<TimePicker
  format="am/pm"
  defaultTime={{ hours: 8, minutes: 30, seconds: 45, period: "PM" }}
  inputProps={{
    placeholder: "Select time...",
  }}
/>

<TimePicker
  format="24hr"
  defaultTime={{ hours: 20, minutes: 30, seconds: 45 }}
  inputProps={{
    placeholder: "Select time...",
  }}
/>
```

---

### 🗓 Format Dates

```tsx
const nepaliDate = new NepaliDate(2082, 2, 20); // Aashar 20, 2082
const englishDate = new Date(2025, 5, 3);       // June 3, 2025

format(nepaliDate, "yyyy");       // 2082
format(englishDate, "MMMM");      // June
formatISO(nepaliDate);            // 2082-03-20
formatLong(englishDate);          // June 3, 2025
formatMedium(nepaliDate);         // Aashar 20, 2082
```

---

