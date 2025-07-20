// hooks/useGeocode.ts
import { GeocodeState, PostcodeResponse } from "@/types/GeoCode/geoCode";
import { useState } from "react";

export const useGeocode = () => {
  const [state, setState] = useState<GeocodeState>({
    data: null,
    loading: false,
    error: null,
  });

  const geocodePostcode = async (postcode: string) => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await fetch(
        `/api/geocode?postcode=${encodeURIComponent(postcode)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to geocode postcode");
      }

      const data: PostcodeResponse = await response.json();
      setState({ data, loading: false, error: null });

      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  };

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  return {
    ...state,
    geocodePostcode,
    reset,
  };
};
