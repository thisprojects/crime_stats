"use client";

import { useEffect, useState } from "react";
import { LeafletMap } from "./Leaflet";
import { PostcodeResponse } from "@/types/GeoCode/geoCode";
import useCrimeData from "@/hooks/CrimeData/useCrimeData";
import { CrimeData } from "@/types/Crime/crime";

interface PostCodeMapSearchProps {
  location: PostcodeResponse | null;
}

const getCrimeColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "violent-crime":
      return "#dc2626";
    case "burglary":
      return "#ea580c";
    case "robbery":
      return "#d97706";
    case "theft-from-the-person":
      return "#ca8a04";
    case "vehicle-crime":
      return "#65a30d";
    case "other-theft":
      return "#059669";
    case "criminal-damage-arson":
      return "#0891b2";
    case "drugs":
      return "#7c3aed";
    case "public-order":
      return "#c026d3";
    case "anti-social-behaviour":
      return "#e11d48";
    default:
      return "#6b7280";
  }
};

export const PostcodeMapSearch = ({ location }: PostCodeMapSearchProps) => {
  const { data, loading, error, lastFetched, fetchCrimeData, reset } =
    useCrimeData();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [filteredData, setFilteredData] = useState<CrimeData[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [isLegendVisible, setIsLegendVisible] = useState(true);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Initialize selected categories when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      const allCategories = Array.from(
        new Set(data.map((crime) => crime.category))
      );
      setSelectedCategories(new Set(allCategories));
    }
  }, [data]);

  // Filter data based on selected categories
  useEffect(() => {
    if (data) {
      const filtered = data.filter((crime) =>
        selectedCategories.has(crime.category)
      );
      setFilteredData(filtered);
    }
  }, [data, selectedCategories]);

  const handleCategoryToggle = (category: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedCategories(newSelected);
  };

  const handleSelectAll = () => {
    if (data) {
      const allCategories = Array.from(
        new Set(data.map((crime) => crime.category))
      );
      setSelectedCategories(new Set(allCategories));
    }
  };

  const handleDeselectAll = () => {
    setSelectedCategories(new Set());
  };

  useEffect(() => {
    const fetchCrimes = async () => {
      if (location?.lat && location?.lon) {
        await fetchCrimeData({
          lat: location.lat,
          lng: location.lon,
        });
      }
    };

    fetchCrimes();
  }, [location]);

  const uniqueCategories = data
    ? Array.from(new Set(data.map((crime) => crime.category)))
    : [];

  return (
    <div className="mx-auto p-6 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Crime Filter */}
        {data && data.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Crime Data Summary</h3>
            <p className="text-sm text-gray-600">
              Showing {filteredData.length} of {data.length} crime incidents
            </p>
            {loading && (
              <p className="text-sm text-blue-600 mt-1">
                Loading additional data...
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && !data && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Loading crime data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">
              Error loading crime data: {error}
            </p>
          </div>
        )}

        {/* Map */}
        <div className="relative border border-gray-300 rounded-lg overflow-hidden">
          <LeafletMap
            location={location}
            crimeData={filteredData}
            height="600px"
            zoom={16}
            className="rounded-lg"
          />

          {/* Filter Toggle Button */}
          {data && data.length > 0 && (
            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className={`absolute top-20 left-2 border-gray-400 border-solid p-2 rounded-lg shadow-lg border-2 z-[1001] transition-colors ${
                isFilterVisible
                  ? "bg-green-100 hover:bg-green-200 border-green-200"
                  : "bg-white hover:bg-gray-50 border-gray-200"
              }`}
              title={isFilterVisible ? "Hide filters" : "Show filters"}
            >
              <svg
                className={`w-4 h-4 ${
                  isFilterVisible ? "text-green-600" : "text-gray-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </button>
          )}

          {/* Crime Filter - Positioned absolute over map */}
          {data && data.length > 0 && isFilterVisible && (
            <div className="absolute top-16 left-10 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border max-w-80 z-[1000]">
              <div
                className="flex items-center justify-between mb-3 cursor-pointer"
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">
                    Filter by Crime Type
                  </h4>
                  <span className="text-xs text-gray-500">
                    ({selectedCategories.size} of {uniqueCategories.length}{" "}
                    selected)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isFilterExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {isFilterExpanded && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {uniqueCategories.map((category) => {
                      const count = data.filter(
                        (crime) => crime.category === category
                      ).length;
                      const isSelected = selectedCategories.has(category);

                      return (
                        <label
                          key={category}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-white shadow-sm"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCategoryToggle(category)}
                            className="rounded"
                          />
                          <div
                            className="w-3 h-3 rounded-full border border-white shadow-sm flex-shrink-0"
                            style={{ backgroundColor: getCrimeColor(category) }}
                          ></div>
                          <span className="text-xs capitalize flex-1">
                            {category.replace(/-/g, " ")} ({count})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legend Toggle Button */}
          {filteredData && filteredData.length > 0 && (
            <button
              onClick={() => setIsLegendVisible(!isLegendVisible)}
              className={`absolute top-4 right-4 p-2 rounded-lg shadow-lg border z-[1001] transition-colors ${
                isLegendVisible
                  ? "bg-blue-100 hover:bg-blue-200 border-blue-200"
                  : "bg-white hover:bg-gray-50 border-gray-200"
              }`}
              title={isLegendVisible ? "Hide legend" : "Show legend"}
            >
              <svg
                className={`w-4 h-4 ${
                  isLegendVisible ? "text-blue-600" : "text-gray-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
          )}

          {/* Crime Legend - Positioned absolute over map */}
          {filteredData && filteredData.length > 0 && isLegendVisible && (
            <div className="absolute top-16 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border max-w-64 z-[1000]">
              <h4 className="font-semibold text-xs mb-2">Crime Categories</h4>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {Array.from(
                  new Set(filteredData.map((crime) => crime.category))
                ).map((category) => {
                  const count = filteredData.filter(
                    (crime) => crime.category === category
                  ).length;

                  return (
                    <div key={category} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border border-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: getCrimeColor(category) }}
                      ></div>
                      <span className="capitalize text-xs">
                        {category.replace(/-/g, " ")} ({count})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {!location && (
          <p className="text-gray-500 text-center mt-4">
            Enter a postcode above to see its location and crime data on the map
          </p>
        )}

        {/* No results message when all filters are unchecked */}
        {data && data.length > 0 && filteredData.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-700">
              No crimes to display. Please select at least one crime category
              from the filter above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
