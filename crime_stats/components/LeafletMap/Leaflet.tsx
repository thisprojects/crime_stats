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
  preserveZoom?: boolean; // New prop to control zoom behavior
  autoFitBounds?: boolean; // New prop to control auto-fitting
}

interface GroupedCrime {
  lat: number;
  lng: number;
  crimes: CrimeData[];
  streetName: string;
}

// Group crimes by their lat/lng coordinates
const groupCrimesByLocation = (crimes: CrimeData[]): GroupedCrime[] => {
  const grouped: { [key: string]: GroupedCrime } = {};

  crimes.forEach((crime) => {
    const lat = parseFloat(crime.location.latitude);
    const lng = parseFloat(crime.location.longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      // Create a key from lat/lng rounded to 6 decimal places to handle minor coordinate differences
      const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;

      if (!grouped[key]) {
        grouped[key] = {
          lat,
          lng,
          crimes: [],
          streetName: crime.location.street.name,
        };
      }

      grouped[key].crimes.push(crime);
    }
  });

  return Object.values(grouped);
};

// Get the most severe crime category for coloring (you can adjust this priority)
const getCategoryPriority = (category: string): number => {
  switch (category.toLowerCase()) {
    case "violent-crime":
      return 1;
    case "robbery":
      return 2;
    case "burglary":
      return 3;
    case "theft-from-the-person":
      return 4;
    case "vehicle-crime":
      return 5;
    case "other-theft":
      return 6;
    case "criminal-damage-arson":
      return 7;
    case "drugs":
      return 8;
    case "public-order":
      return 9;
    case "anti-social-behaviour":
      return 10;
    default:
      return 11;
  }
};

const getMostSevereCategory = (crimes: CrimeData[]): string => {
  return crimes.reduce((mostSevere, crime) => {
    return getCategoryPriority(crime.category) <
      getCategoryPriority(mostSevere.category)
      ? crime
      : mostSevere;
  }).category;
};

// Create numbered icons for grouped crimes
const createGroupedCrimeIcon = (crimes: CrimeData[]) => {
  const count = crimes.length;
  const category = getMostSevereCategory(crimes);

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

  // Determine marker size based on count
  const getMarkerSize = (count: number) => {
    if (count === 1) return { size: 20, fontSize: "11px" };
    if (count < 10) return { size: 24, fontSize: "12px" };
    if (count < 100) return { size: 28, fontSize: "13px" };
    return { size: 32, fontSize: "14px" };
  };

  const { size, fontSize } = getMarkerSize(count);

  return L.divIcon({
    className: "custom-grouped-crime-marker",
    html: `<div style="
      background-color: ${getColor(category)};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: ${fontSize};
      font-family: Arial, sans-serif;
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Create popup content for grouped crimes
const createGroupedPopupContent = (groupedCrime: GroupedCrime): string => {
  const { crimes, streetName } = groupedCrime;
  const count = crimes.length;

  // Group crimes by category for better display
  const crimesByCategory: { [key: string]: CrimeData[] } = {};
  crimes.forEach((crime) => {
    if (!crimesByCategory[crime.category]) {
      crimesByCategory[crime.category] = [];
    }
    crimesByCategory[crime.category].push(crime);
  });

  const formatCategoryName = (category: string) => {
    return category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  let popupContent = `
    <div class="crime-popup" style="max-width: 300px; max-height: 400px; overflow-y: auto;">
      <h3 class="font-semibold text-base mb-2">${count} Crime${
    count > 1 ? "s" : ""
  } at ${streetName}</h3>
  `;

  Object.entries(crimesByCategory).forEach(([category, categorycrimes]) => {
    popupContent += `
      <div class="mb-3">
        <h4 class="font-medium text-sm mb-2 text-gray-700">${formatCategoryName(
          category
        )} (${categorycrimes.length})</h4>
        <div class="space-y-2">
    `;

    categorycrimes.forEach((crime, index) => {
      popupContent += `
        <div class="text-xs p-2 bg-gray-50 rounded border-l-2" style="border-left-color: ${getCrimeColor(
          crime.category
        )}">
          <p class="mb-1"><strong>Date:</strong> ${crime.month}</p>
          <p class="mb-1"><strong>Status:</strong> ${
            crime.outcome_status?.category || "Unknown"
          }</p>
          ${
            crime.outcome_status?.date
              ? `<p class="mb-1"><strong>Outcome Date:</strong> ${crime.outcome_status.date}</p>`
              : ""
          }
          ${
            crime.context ? `<p class="text-gray-600">${crime.context}</p>` : ""
          }
        </div>
      `;
    });

    popupContent += `
        </div>
      </div>
    `;
  });

  popupContent += `</div>`;
  return popupContent;
};

// Helper function to get crime color (same as in createGroupedCrimeIcon)
const getCrimeColor = (category: string): string => {
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

export const LeafletMap: React.FC<LeafletMapProps> = ({
  location,
  crimeData = [],
  height = "400px",
  width = "100%",
  zoom = 15,
  className = "",
  preserveZoom = true, // Default to preserving zoom
  autoFitBounds = false, // Default to not auto-fitting bounds
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const crimeMarkersRef = useRef<L.Marker[]>([]);
  const currentLocationRef = useRef<MapLocation | null>(null);

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
    const { lat, lon } = location;

    // Only center and zoom if this is a new location or if preserveZoom is false
    const isNewLocation =
      !currentLocationRef.current ||
      currentLocationRef.current.lat !== lat ||
      currentLocationRef.current.lon !== lon;

    if (isNewLocation || !preserveZoom) {
      map.setView([lat, lon], zoom);
      currentLocationRef.current = location;
    } else if (preserveZoom) {
      // Just center the map without changing zoom
      map.panTo([lat, lon]);
    }
  }, [location, zoom, preserveZoom]);

  // Handle crime data markers with grouping
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove existing crime markers
    crimeMarkersRef.current.forEach((marker) => {
      map.removeLayer(marker);
    });
    crimeMarkersRef.current = [];

    // Group crimes by location and add markers
    if (crimeData && crimeData.length > 0) {
      const groupedCrimes = groupCrimesByLocation(crimeData);

      groupedCrimes.forEach((groupedCrime) => {
        const marker = L.marker([groupedCrime.lat, groupedCrime.lng], {
          icon: createGroupedCrimeIcon(groupedCrime.crimes),
        }).addTo(map);

        // Create popup content with all crimes at this location
        const popupContent = createGroupedPopupContent(groupedCrime);
        marker.bindPopup(popupContent, {
          maxWidth: 350,
          className: "grouped-crime-popup",
        });

        crimeMarkersRef.current.push(marker);
      });

      // Only fit map to show all crime markers if autoFitBounds is true
      if (autoFitBounds && crimeMarkersRef.current.length > 0) {
        const group = new L.FeatureGroup(crimeMarkersRef.current);
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [crimeData, autoFitBounds]);

  return (
    <div
      ref={mapRef}
      style={{ height, width }}
      className={`leaflet-container ${className}`}
    />
  );
};
