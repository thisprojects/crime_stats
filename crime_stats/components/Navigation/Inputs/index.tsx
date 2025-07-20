import React, { MouseEvent, useState, KeyboardEvent } from "react";

import { useGeocode } from "@/hooks/GeoCodeHook/useGeocode";
import { PostcodeResponse } from "@/types/GeoCode/geoCode";

const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

interface InputProps {
  handleSetLocation: (pcr: PostcodeResponse, date: string) => void;
}

const Inputs = ({ handleSetLocation }: InputProps) => {
  const [postcode, setPostcode] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("2025");

  const [selectedMonth, setSelectedMonth] = useState<string>("01");
  const { loading, geocodePostcode } = useGeocode();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);

  const handleSubmit = async (
    e: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    if (!postcode.trim()) return;

    try {
      const postCodeResponse = await geocodePostcode(postcode.trim());
      handleSetLocation(postCodeResponse, `${selectedYear}-${selectedMonth}`);
    } catch (error) {
      console.error("Geocoding failed:", error);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="flex gap-2 justify-start md:justify-center">
        <select
          value={selectedMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="rounded-lg border-slate-300 border shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-sm px-3 py-2  text-slate-900 bg-white"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(e.target.value)}
          className="rounded-lg border-slate-300 border shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-sm px-3 py-2  text-slate-900 bg-white"
        >
          {years.map((year) => (
            <option key={year} value={year.toString()}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="UK Place or Postcode"
          className="rounded-lg border-slate-300 border shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-sm px-4 py-2.5 text-slate-900 bg-white placeholder-slate-500 "
          disabled={loading}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSubmit(e);
            }
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !postcode.trim()}
          className="rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-sm font-medium text-white hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {loading ? "..." : "Go"}
        </button>
      </div>
    </div>
  );
};

export default Inputs;
