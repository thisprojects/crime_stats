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

interface CrimeData {
  category: string;
  location_type: string;
  location: {
    latitude: string;
    street: {
      id: number;
      name: string;
    };
    longitude: string;
  };
  context: string;
  outcome_status: {
    category: string;
    date: string;
  };
  persistent_id: string;
  id: number;
  location_subtype: string;
  month: string;
}

interface LeafletMapProps {
  location: MapLocation | null;
  crimeData?: CrimeData[];
  height?: string;
  width?: string;
  zoom?: number;
  className?: string;
}

// Create different colored icons for different crime categories
const createCrimeIcon = (category: string) => {
  const getColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "violent-crime":
        return "#dc2626"; // red
      case "burglary":
        return "#ea580c"; // orange
      case "robbery":
        return "#d97706"; // amber
      case "theft-from-the-person":
        return "#ca8a04"; // yellow
      case "vehicle-crime":
        return "#65a30d"; // lime
      case "other-theft":
        return "#059669"; // emerald
      case "criminal-damage-arson":
        return "#0891b2"; // cyan
      case "drugs":
        return "#7c3aed"; // violet
      case "public-order":
        return "#c026d3"; // fuchsia
      case "anti-social-behaviour":
        return "#e11d48"; // rose
      default:
        return "#6b7280"; // gray
    }
  };

  return L.divIcon({
    className: "custom-crime-marker",
    html: `<div style="
      background-color: ${getColor(category)};
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  location,
  crimeData = [],
  height = "400px",
  width = "100%",
  zoom = 15,
  className = "",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const crimeMarkersRef = useRef<L.Marker[]>([]);

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

  // Handle main location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !location) return;

    const map = mapInstanceRef.current;
    const { lat, lon} = location;

    // Center map on the location
    map.setView([lat, lon], zoom);
  }, [location, zoom]);

  // Handle crime data markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove existing crime markers
    crimeMarkersRef.current.forEach((marker) => {
      map.removeLayer(marker);
    });
    crimeMarkersRef.current = [];

    // Add crime markers
    if (crimeData && crimeData.length > 0) {
      crimeData.forEach((crime) => {
        const lat = parseFloat(crime.location.latitude);
        const lng = parseFloat(crime.location.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = L.marker([lat, lng], {
            icon: createCrimeIcon(crime.category),
          }).addTo(map);

          // Create popup content with crime details
          const popupContent = `
            <div class="crime-popup">
              <h3 class="font-semibold text-sm mb-2">${crime.category
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}</h3>
              <p class="text-xs mb-1"><strong>Location:</strong> ${
                crime?.location?.street.name
              }</p>
              <p class="text-xs mb-1"><strong>Date:</strong> ${crime?.month}</p>
              <p class="text-xs mb-1"><strong>Status:</strong> ${
                crime?.outcome_status?.category
              }</p>
              ${
                crime?.outcome_status?.date
                  ? `<p class="text-xs"><strong>Outcome Date:</strong> ${crime?.outcome_status?.date}</p>`
                  : ""
              }
            </div>
          `;

          marker.bindPopup(popupContent);
          crimeMarkersRef.current.push(marker);
        }
      });

      // Fit map to show all crime markers if we have them
      if (crimeMarkersRef.current.length > 0) {
        const group = new L.FeatureGroup(crimeMarkersRef.current);
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [crimeData]);

  return (
    <div
      ref={mapRef}
      style={{ height, width }}
      className={`leaflet-container ${className}`}
    />
  );
};
