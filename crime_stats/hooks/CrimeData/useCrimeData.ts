// hooks/useCrimeData.ts

import { useState } from "react";
import {
  CrimeApiResponse,
  ApiErrorResponse,
  CrimeDataParams,
  CrimeData,
} from "@/types/Crime/crime";

function validateCrimeParams(params: Partial<CrimeDataParams>): {
  isValid: boolean;
  missingParams: string[];
  validParams?: CrimeDataParams;
} {
  const missingParams: string[] = [];

  if (!params.date) missingParams.push("date");
  if (params.lat === undefined || params.lat === null)
    missingParams.push("lat");
  if (params.lng === undefined || params.lng === null)
    missingParams.push("lng");

  if (missingParams.length > 0) {
    return { isValid: false, missingParams };
  }

  return {
    isValid: true,
    missingParams: [],
    validParams: params as CrimeDataParams,
  };
}

const useCrimeData = () => {
  const [data, setData] = useState<CrimeData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCrimeData = async (
    params: Partial<CrimeDataParams> = {}
  ): Promise<CrimeApiResponse | null> => {
    const requestParams: Partial<CrimeDataParams> = {
      date: params.date || "2025-01",
      lat: params.lat,
      lng: params.lng,
    };

    const validation = validateCrimeParams(requestParams);

    if (!validation.isValid) {
      const errorMessage = `Missing required parameters: ${validation.missingParams.join(
        ", "
      )}`;

      setError(errorMessage);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        date: validation.validParams!.date,
        lat: validation.validParams!.lat.toString(),
        lng: validation.validParams!.lng.toString(),
      });

      const response = await fetch(`/api/street_level_crime?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorData: ApiErrorResponse;

        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP error! status: ${response.status}` };
        }

        if (response.status === 429) {
          throw new Error(
            errorData.error || "Rate limit exceeded. Please try again later."
          );
        }

        if (response.status === 404) {
          throw new Error(
            errorData.error ||
              "No crime data found for the specified location and date."
          );
        }

        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result: CrimeApiResponse = await response.json();
      setData(result);

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch crime data";

      setError(errorMessage);
      console.error("Crime data fetch error:", err);

      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchCrimeData,
  };
};

export default useCrimeData;
