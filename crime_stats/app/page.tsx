"use client";

import { LeafletMap } from "@/components/LeafletMap/PostCodeMapSearch";
import { useGeocode } from "@/hooks/GeoCodeHook/useGeocode";
import { useState } from "react";

const PostcodeSearch: React.FC = () => {
  const [postcode, setPostcode] = useState("");
  const { data, loading, error, geocodePostcode } = useGeocode();
  console.log("DATA", data);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode.trim()) return;

    try {
      await geocodePostcode(postcode.trim());
    } catch (error) {
      console.error("Geocoding failed:", error);
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="postcode"
              className="block text-sm font-medium text-gray-700"
            >
              UK Postcode
            </label>
            <input
              type="text"
              id="postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g. SW1A 1AA"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !postcode.trim()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Find Location"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
          </div>
        )}

        {data && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <h3 className="font-semibold">Location Found:</h3>
            <p>
              <strong>Coordinates:</strong> {data.lat}, {data.lon}
            </p>
            <p>
              <strong>Address:</strong> {data.display_name}
            </p>
          </div>
        )}
      </div>
      <LeafletMap location={data} />
    </>
  );
};

export default PostcodeSearch;
