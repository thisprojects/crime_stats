import { PostcodeResponse } from "@/types/GeoCode/geoCode";
import { LeafletMap } from "../../LeafletComponents";
import { CrimeData } from "@/types/Crime/crime";

interface LeafletMapProps {
  location: PostcodeResponse | null;
  filteredData: CrimeData[];
}

const MapComponent = ({ location, filteredData }: LeafletMapProps) => (
  <LeafletMap
    location={location}
    crimeData={filteredData}
    height="100%"
    zoom={16}
    className="rounded-lg"
  />
);

export default MapComponent;
