import React, {
  MouseEvent,
  useState,
  KeyboardEvent,
  Dispatch,
  SetStateAction,
} from "react";
import { useGeocode } from "@/hooks/GeoCodeHook/useGeocode";
import { PostcodeResponse } from "@/types/GeoCode/geoCode";
import { GoLaw } from "react-icons/go";

const navigation = [
  { name: "Dashboard", href: "#", current: true },
  { name: "Team", href: "#", current: false },
];

interface NavigationWithSearchProps {
  setLocation: Dispatch<SetStateAction<PostcodeResponse | null>>;
}

export default function NavigationWithSearch({
  setLocation,
}: NavigationWithSearchProps) {
  const [postcode, setPostcode] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("01");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { loading, error, geocodePostcode } = useGeocode();

  // Generate years (current year and 10 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);

  // Months array
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

  const handleSubmit = async (
    e: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    if (!postcode.trim()) return;

    try {
      const postCodeResponse = await geocodePostcode(postcode.trim());
      setLocation({
        ...postCodeResponse,
        date: `${selectedYear}-${selectedMonth}`,
      });
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
    <>
      <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl border-b border-slate-700">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Grid Container */}
          <div className="flex flex-row justify-between items-center md:grid md:grid-cols-3 p-5 gap-6">
            {/* Left Section - Mobile Menu + Logo/Nav */}
            <div className="flex items-center justify-start">
              {/* Mobile menu button */}
              <div className="flex lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors duration-200"
                >
                  <svg
                    className={`block h-6 w-6 ${
                      mobileMenuOpen ? "hidden" : "block"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                  <svg
                    className={`h-6 w-6 ${mobileMenuOpen ? "block" : "hidden"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Logo */}
              <div className="items-center gap-3 text-2xl hidden lg:flex text-white ml-4 sm:ml-0">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg">
                  <GoLaw color="white" size="32" />
                </div>
                <span className="text-xl xl:text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Crime Map
                </span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex lg:ml-12">
                <div className="flex space-x-2">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      aria-current={item.current ? "page" : undefined}
                      className={`${
                        item.current
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      } rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:shadow-md`}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Center Section - Search */}
            <div>
              <div className="flex flex-col md:flex-row gap-3 w-full max-w-md">
                {/* Date Selectors */}
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
                {/* Search Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="UK Place or Postcode"
                    className="w-full rounded-lg border-slate-300 border shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-sm px-4 py-2.5 text-slate-900 bg-white placeholder-slate-500 "
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
            </div>

            {/* Right Section - Profile */}
            <div className="flex items-center justify-end">
              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="relative flex rounded-full bg-slate-700 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800 focus:outline-none hover:bg-slate-600 transition-colors duration-200 p-1"
                >
                  <img
                    alt="Profile"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    className="h-10 w-10 rounded-full border-2 border-slate-600"
                  />
                </button>

                {profileMenuOpen && (
                  <div className="z-[1000] absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-200">
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                    >
                      Your Profile
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                    >
                      Settings
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                    >
                      Sign out
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-700">
            <div className="space-y-1 px-4 pt-4 pb-3">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  className={`
                    ${
                      item.current
                        ? "bg-indigo-600 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }
                    block rounded-lg px-3 py-2 text-base font-medium transition-colors duration-200
                  `}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Results Section */}
      {error && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
