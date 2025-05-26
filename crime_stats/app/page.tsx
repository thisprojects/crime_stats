"use client";

import LeafletMap from "@/components/LeafletMap";
import Navigation from "@/components/Navigation";
import { useGeocode } from "@/hooks/GeoCodeHook/useGeocode";
import { PostcodeResponse } from "@/types/GeoCode/geoCode";
import { useState } from "react";

const PostcodeSearch: React.FC = () => {
  const [postcode, setPostcode] = useState("");
  const [location, setLocation] = useState<PostcodeResponse | null>(null);

  return (
    <>
      <Navigation setLocation={setLocation} />
      <LeafletMap location={location} />
    </>
  );
};

export default PostcodeSearch;
