export interface PostcodeResponse {
  lat: number;
  lon: number;
  display_name: string;
}

export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  class: string;
  type: string;
  importance: number;
}

export interface GeocodeState {
  data: PostcodeResponse | null;
  loading: boolean;
  error: string | null;
}
