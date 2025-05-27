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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { loading, error, geocodePostcode } = useGeocode();

  const handleSubmit = async (
    e: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    if (!postcode.trim()) return;

    try {
      const postCodeResponse = await geocodePostcode(postcode.trim());
      setLocation(postCodeResponse);
    } catch (error) {
      console.error("Geocoding failed:", error);
    }
  };

  return (
    <>
      <nav className="bg-gray-800">
        <div className="px-2">
          {/* Grid Container */}
          <div className="flex flex-row justify-between items-center md:grid md:grid-cols-3  h-16 gap-4">
            
            {/* Left Section - Mobile Menu + Logo/Nav */}
            <div className="flex items-center justify-start">
              {/* Mobile menu button */}
              <div className="flex lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="rounded-md p-2 text-gray-400 hover:bg-gray-700"
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
              <div className="items-center gap-2 text-2xl hidden lg:flex text-gray-300 ml-2 sm:ml-0">
                <GoLaw color="white" size="30"/>
                <span className="text-sm xl:text-2xl">Crime Map</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex lg:ml-8">
                <div className="flex space-x-4">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      aria-current={item.current ? "page" : undefined}
                      className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Center Section - Search (takes maximum available space) */}
            <div className="flex">
              <div className="flex gap-2 w-full max-w-md">
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="UK Place or Postcode"
                  className="rounded-md border-gray-100 border-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2 flex-1 text-gray-900 bg-white"
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
                  className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex-shrink-0"
                >
                  {loading ? "..." : "Go"}
                </button>
              </div>
            </div>

            {/* Right Section - Notifications + Profile */}
            <div className="flex items-center justify-end gap-3">


              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none"
                >
                  <img
                    alt=""
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    className="h-8 w-8 rounded-full"
                  />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
          <div className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  className={`
                    ${
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }
                    block rounded-md px-3 py-2 text-base font-medium
                  `}
                >
                  {item.name}
                </a>
              ))}

              {/* Mobile search */}
              <div className="pt-4 pb-2 px-3">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="UK Postcode"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2 text-gray-900"
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
                    className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? "Searching..." : "Find Location"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Results Section */}
      {error && (
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 mt-4">
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
          </div>
        </div>
      )}
    </>
  );
}