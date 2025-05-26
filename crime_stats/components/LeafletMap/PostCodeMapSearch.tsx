// components/LeafletMap.tsx
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapLocation {
  lat: number;
  lon: number;
  display_name?: string;
}

interface LeafletMapProps {
  location: MapLocation | null;
  height?: string;
  width?: string;
  zoom?: number;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  location,
  height = "400px",
  width = "100%",
  zoom = 15,
  className = "",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [51.505, -0.09],
        10
      );

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      // Cleanup function to destroy map when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !location) return;

    const map = mapInstanceRef.current;
    const { lat, lon, display_name } = location;

    // Remove existing marker if any
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    // Add new marker
    markerRef.current = L.marker([lat, lon]).addTo(map);

    // Add popup with address if available
    if (display_name) {
      markerRef.current.bindPopup(display_name).openPopup();
    }

    // Center map on the location
    map.setView([lat, lon], zoom);
  }, [location, zoom]);

  return (
    <div
      ref={mapRef}
      style={{ height, width }}
      className={`leaflet-container ${className}`}
    />
  );
};

// Complete example component that combines geocoding with map display
import { useState } from "react";

interface PostcodeResponse {
  lat: number;
  lon: number;
  display_name: string;
}

export const PostcodeMapSearch: React.FC = () => {
  const [postcode, setPostcode] = useState("");
  const [location, setLocation] = useState<PostcodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/geocode?postcode=${encodeURIComponent(postcode.trim())}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to geocode postcode");
      }

      const data: PostcodeResponse = await response.json();
      setLocation(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      setLocation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPostcode("");
    setLocation(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">UK Postcode Map Search</h2>

        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label
              htmlFor="postcode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Enter UK Postcode
            </label>
            <input
              type="text"
              id="postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g. SW1A 1AA, M1 1AA, EH1 1YZ"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !postcode.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Searching..." : "Search"}
          </button>

          {location && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear
            </button>
          )}
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {location && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            <h3 className="font-semibold mb-2">Location Found:</h3>
            <p>
              <strong>Coordinates:</strong> {location.lat.toFixed(5)},{" "}
              {location.lon.toFixed(5)}
            </p>
            <p>
              <strong>Address:</strong> {location.display_name}
            </p>
          </div>
        )}
      </div>

      {/* Map Display */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Map View</h3>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <LeafletMap
            location={location}
            height="500px"
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
