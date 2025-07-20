"use client";

import LeafletMap from "@/components/Map";
import Navigation from "@/components/Navigation";
import { PostcodeResponse } from "@/types/GeoCode/geoCode";
import { useState } from "react";

const PostcodeSearch: React.FC = () => {
  const [location, setLocation] = useState<PostcodeResponse | null>(null);

  return (
    <>
      <Navigation setLocation={setLocation} />
      <LeafletMap location={location} />
    </>
  );
};

export default PostcodeSearch;
