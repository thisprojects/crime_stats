"use client";

import { useEffect, useState } from "react";
import { PostcodeResponse } from "@/types/GeoCode/geoCode";
import useCrimeData from "@/hooks/CrimeData/useCrimeData";
import { CrimeData } from "@/types/Crime/crime";
import Loading from "./Loading";
import DisplayError from "./Error";
import MapComponent from "./LeafletMap";
import Summary from "./Summary";
import Legend from "./Legend";
import Filter from "./Filter";

interface PostCodeMapSearchProps {
  location: PostcodeResponse | null;
}

export const PostcodeMapSearch = ({ location }: PostCodeMapSearchProps) => {
  const { data, loading, error, fetchCrimeData } = useCrimeData();
  const [filteredData, setFilteredData] = useState<CrimeData[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );

  // Filter data based on selected categories
  useEffect(() => {
    if (data) {
      const filtered = data.filter((crime) =>
        selectedCategories.has(crime.category)
      );
      setFilteredData(filtered);
    }
  }, [data, selectedCategories]);

  useEffect(() => {
    const fetchCrimes = async () => {
      if (location?.lat && location?.lon && location?.date) {
        await fetchCrimeData({
          lat: location.lat,
          lng: location.lon,
          date: location.date,
        });
      }
    };

    fetchCrimes();
  }, [location]);

  return (
    <div className="mx-auto p-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="bg-white rounded-lg shadow-md flex-1 flex flex-col relative">
        <Loading loading={loading} />
        <DisplayError error={error} />

        <div className="relative border border-gray-300 rounded-lg overflow-hidden flex-1">
          <MapComponent location={location} filteredData={filteredData} />
          <Filter
            data={data}
            setSelectedCategories={setSelectedCategories}
            selectedCategories={selectedCategories}
          />
          <Summary data={data} filteredData={filteredData} loading={loading} />
          <Legend filteredData={filteredData} />
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
