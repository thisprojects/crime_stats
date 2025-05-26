"use client";

import { useEffect } from "react";
import { LeafletMap } from "./Leaflet";
import { PostcodeResponse } from "@/types/GeoCode/geoCode";
import useCrimeData from "@/hooks/CrimeData/useCrimeData";

interface PostCodeMapSearchProps {
  location: PostcodeResponse | null;
}

export const PostcodeMapSearch = ({ location }: PostCodeMapSearchProps) => {
  const { data, loading, error, lastFetched, fetchCrimeData, reset } =
    useCrimeData();

  useEffect(() => {
    const fetchCrimes = async () => {
      if (location?.lat && location?.lon) {
        const response = await fetchCrimeData({
          lat: location.lat,
          lng: location.lon,
        });
        console.log("RESPONSE", response);
      }
    };

    fetchCrimes();
  }, [location]);

  return (
    <div className="mx-auto p-6 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Crime Data Summary */}
        {data && data.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Crime Data Summary</h3>
            <p className="text-sm text-gray-600">
              Found {data.length} crime incidents in this area
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
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <LeafletMap
            location={location}
            crimeData={data || []}
            height="600px"
            zoom={16}
            className="rounded-lg"
          />
        </div>

        {!location && (
          <p className="text-gray-500 text-center mt-4">
            Enter a postcode above to see its location and crime data on the map
          </p>
        )}

        {/* Crime Legend */}
        {data && data.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-3">Crime Categories</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
              {Array.from(new Set(data.map((crime) => crime.category))).map(
                (category) => {
                  const count = data.filter(
                    (crime) => crime.category === category
                  ).length;
                  const getColor = (cat: string) => {
                    switch (cat.toLowerCase()) {
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

                  return (
                    <div key={category} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: getColor(category) }}
                      ></div>
                      <span className="capitalize">
                        {category.replace(/-/g, " ")} ({count})
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
