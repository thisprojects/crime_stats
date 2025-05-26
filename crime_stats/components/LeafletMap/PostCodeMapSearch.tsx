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
      const response = await fetchCrimeData({
        lat: location?.lat,
        lng: location?.lon,
      });
      console.log("RESPONSE", response);
    };

    fetchCrimes();
  }, [location]);
  return (
    <div className="mx-auto p-6 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <LeafletMap
            location={location}
            height="600px"
            zoom={16}
            className="rounded-lg"
          />
        </div>
        {!location && (
          <p className="text-gray-500 text-center mt-4">
            Enter a postcode above to see its location on the map
          </p>
        )}
      </div>
    </div>
  );
};
