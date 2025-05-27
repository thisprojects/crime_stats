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
  const [isLegendExpanded, setIsLegendExpanded] = useState(true);
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

          {/* Crime Filter - Positioned absolute over map */}
          {data && data.length > 0 && (
            <div className="absolute top-2 left-15 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border max-w-80 z-[1000]">
              <div
                className="flex items-center gap-2 cursor-pointer"
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
                <div className="space-y-3 mt-3">
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

          {/* Crime Data Summary - Positioned absolute at bottom of map */}
          {data && data.length > 0 && (
            <div className="absolute bottom-1 left-1  bg-white/95  px-3 py-2 rounded-lg shadow-lg border z-[1000]">
              <div className="text-center">
                <p className="text-xs text-gray-600">
                  Showing {filteredData.length} of {data.length} crime incidents
                </p>
                {loading && (
                  <p className="text-xs text-blue-600 mt-1">
                    Loading additional data...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Crime Legend - Positioned absolute over map with collapse/expand */}
          {filteredData && filteredData.length > 0 && (
            <div className="hidden md:block absolute top-2 right-2 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border max-w-64 z-[1000]">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsLegendExpanded(!isLegendExpanded)}
              >
                <div className="flex gap-2 ">
                  <h4 className="font-semibold text-sm">Crime Categories</h4>
                  <span className="text-xs text-gray-500">
                    (
                    {
                      Array.from(
                        new Set(filteredData.map((crime) => crime.category))
                      ).length
                    }{" "}
                    types)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isLegendExpanded ? "rotate-180" : ""
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

              {isLegendExpanded && (
                <div className="mt-3 max-h-80 overflow-y-auto">
                  {Array.from(
                    new Set(filteredData.map((crime) => crime.category))
                  ).map((category) => {
                    const count = filteredData.filter(
                      (crime) => crime.category === category
                    ).length;

                    return (
                      <div
                        key={category}
                        className="flex items-center gap-2 p-1"
                      >
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
              )}
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
