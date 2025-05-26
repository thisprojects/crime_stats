import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

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
