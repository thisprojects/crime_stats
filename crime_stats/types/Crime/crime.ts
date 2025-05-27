export interface CrimeLocation {
  latitude: string;
  street: {
    id: number;
    name: string;
  };
  longitude: string;
}

export interface CrimeData {
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

export interface CrimeApiResponse extends Array<CrimeData> {}

export interface ApiErrorResponse {
  error: string;
  retryAfter?: number;
}

// Hook parameter interfaces
export interface CrimeDataParams {
  date: string;
  lat: number;
  lng: number;
}

export interface UseCrimeDataOptions extends Partial<CrimeDataParams> {
  enabled?: boolean;
}

export interface CrimeDataState {
  data: CrimeApiResponse | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

export interface CrimeDataActions {
  fetchCrimeData: (
    params?: Partial<CrimeDataParams>
  ) => Promise<CrimeApiResponse | null>;
  retry: () => void;
  reset: () => void;
}

export interface CrimeDataComputed {
  isEmpty: boolean;
  hasData: boolean;
}

export type UseCrimeDataReturn = CrimeDataState &
  CrimeDataActions &
  CrimeDataComputed;

// Multiple requests interfaces
export interface CrimeRequestState {
  loading: boolean;
  data: CrimeApiResponse | null;
  error: string | null;
  params: CrimeDataParams;
  lastFetched?: Date;
}
