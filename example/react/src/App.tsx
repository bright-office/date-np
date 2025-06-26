import {
  format,
  formatISO,
  formatLong,
  formatShort,
  formatMedium,
} from "@brightsoftware/date-np/core";
import { NepaliDate } from "@brightsoftware/date-np/core";
import { Picker } from "@brightsoftware/date-np/ui";
import { RangePicker } from "@brightsoftware/date-np/ui";
import { TimePicker } from "@brightsoftware/date-np/ui";

function App() {
  const nepaliDate = new NepaliDate(2082, 2, 20); // Aashar 20, 2082
  const englishDate = new Date(2025, 5, 3); // June 3, 2025

  const formatExamples = [
    {
      label: "Full Year",
      code: "yyyy",
      nepali: format(nepaliDate, "yyyy"),
      english: format(englishDate, "yyyy"),
    },
    {
      label: "Short Year",
      code: "yy",
      nepali: format(nepaliDate, "yy"),
      english: format(englishDate, "yy"),
    },
    {
      label: "Full Month",
      code: "MMMM",
      nepali: format(nepaliDate, "MMMM"),
      english: format(englishDate, "MMMM"),
    },
    {
      label: "Short Month",
      code: "MMM",
      nepali: format(nepaliDate, "MMM"),
      english: format(englishDate, "MMM"),
    },
    {
      label: "Month Number",
      code: "MM",
      nepali: format(nepaliDate, "MM"),
      english: format(englishDate, "MM"),
    },
    {
      label: "Month No Leading Zero",
      code: "M",
      nepali: format(nepaliDate, "M"),
      english: format(englishDate, "M"),
    },
    {
      label: "Day with Zero",
      code: "dd",
      nepali: format(nepaliDate, "dd"),
      english: format(englishDate, "dd"),
    },
    {
      label: "Day No Leading Zero",
      code: "d",
      nepali: format(nepaliDate, "d"),
      english: format(englishDate, "d"),
    },
    {
      label: "Ordinal Day",
      code: "do",
      nepali: format(nepaliDate, "do"),
      english: format(englishDate, "do"),
    },
    {
      label: "ISO Format",
      code: "formatISO()",
      nepali: formatISO(nepaliDate),
      english: formatISO(englishDate),
    },
    {
      label: "Long Format",
      code: "formatLong()",
      nepali: formatLong(nepaliDate),
      english: formatLong(englishDate),
    },
    {
      label: "Short Format",
      code: "formatShort()",
      nepali: formatShort(nepaliDate),
      english: formatShort(englishDate),
    },
    {
      label: "Medium Format",
      code: "formatMedium()",
      nepali: formatMedium(nepaliDate),
      english: formatMedium(englishDate),
    },
    {
      label: "Custom Format",
      code: "do MMMM, yyyy",
      nepali: format(nepaliDate, "do MMMM, yyyy"),
      english: format(englishDate, "do MMMM, yyyy"),
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Date-NP Demo
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive Nepali and English date formatting and calendar
            picking library
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 max-w-2xl mx-auto">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-900 mb-1">
                Sample Dates Used
              </h4>
              <p className="text-xs text-green-700 mb-2">
                <strong>Nepali:</strong> 2082/03/20 (Aashar 20, 2082)
              </p>
              <p className="text-xs text-green-700">
                <strong>English:</strong> 2025/06/03 (June 3, 2025)
              </p>
            </div>
          </div>
        </div>
        {/* Date Pickers Row */}
        {/* Header */}
        <div className="text-start">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Calendar Date & Time Pickers
          </h1>
          <p className="text-lg text-gray-600">
            Robust date and time pickers for picking single/range dates and time, converting BS/AD dates
            seamlessly
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Single Date Picker */}
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto w-full">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Single Date Picker
              </h3>
              <p className="text-gray-600 text-sm">Select a single date</p>
            </div>

            <Picker
              inputProps={{
                dateFormat: "dd-MMMM-yyyy",
                defaultLocale: "BS",
                className:
                  "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm " +
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
                  "cursor-pointer bg-white text-sm " +
                  "hover:border-gray-400 transition-colors"
              }}
              shouldShowInput={true}
              label="Select Date"
              description="Choose your preferred date"
              bodyClassNames={{
                dateHover: "hover:bg-blue-400",
                selected: "bg-green-500 text-white",
                todayStyle: "bg-cyan-400 text-white",
              }}
              headerClassNames={{
                yearLabel: "hover:bg-blue-400 hover:text-white text-black p-2 rounded-xl",
                monthLabel: "hover:bg-blue-400 hover:text-white text-black p-2 rounded-xl",
                arrowIcon: {
                  arrowIconLeft: <div>left</div>,
                  arrowIconRight: <div>right</div>
                }
              }}
            />
          </div>

          {/* Range Date Picker */}
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto w-full">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Range Date Picker
              </h3>
              <p className="text-gray-600 text-sm">Select a date range</p>
            </div>

            <RangePicker
              defaultLocale="BS"
              minDate={new Date(2025, 1, 1)} // BS date
              maxDate={new NepaliDate(2085, 11, 30)} // BS date
              startingDateRange={new NepaliDate(2080, 5, 14)} // BS date
              endingDateRange={new NepaliDate(2080, 6, 15)} // BS date
              shouldShowInput={true}
              onRangeSelect={(start, end) => {
                console.log("Selected Range:", start, end);
              }}
              label="Select Date Range"
              description="Choose your date range"
              inputProps={{
                placeholder: "Select date range...",
                dateFormat: "dd-MMMM-yyyy",
                className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm " +
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
                  "cursor-pointer bg-white text-sm " +
                  "hover:border-gray-400 transition-colors"
              }}
            />
          </div>

          {/* Time Picker */}
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto w-full">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Time Picker
              </h3>
              <p className="text-gray-600 text-sm">Select time with AM/PM or 24hr format</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AM/PM Format
                </label>
                <TimePicker
                  format="am/pm"
                  defaultTime={{ hours: 8, minutes: 30, seconds: 45, period: "PM" }}
                  inputProps={{
                    placeholder: "Select time...",
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  24 Hour Format
                </label>
                <TimePicker
                  format="24hr"
                  defaultTime={{ hours: 20, minutes: 30, seconds: 45 }}
                  inputProps={{
                    placeholder: "Select time...",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Format Examples Table */}
        {/* Header */}
        <div className="text-start">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Format Function
          </h1>
          <p className="text-lg text-gray-600">
            Complete date string formatting made to specially work with both
            Bikram Sambat and Gregorian calendar
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">
              Format Function Examples
            </h2>
            <p className="text-indigo-100 mt-1">
              Comparing Nepali (BS) and English (AD) date formats
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Format Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Token
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-600">
                    Nepali
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-600">
                    English
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formatExamples.map((example, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {example.label}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono bg-gray-50">
                      {example.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-indigo-700 font-mono bg-indigo-50">
                      {example.nepali}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-700 font-mono bg-blue-50">
                      {example.english}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div >
  );
}

export default App;
