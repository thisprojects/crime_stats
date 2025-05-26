"use client";

import LeafletMap from "@/components/LeafletMap";
import Navigation from "@/components/Navigation";
import { useGeocode } from "@/hooks/GeoCodeHook/useGeocode";
import { useState } from "react";

const PostcodeSearch: React.FC = () => {
  const [postcode, setPostcode] = useState("");
  const { data, loading, error, geocodePostcode } = useGeocode();
  console.log("DATA", data);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode.trim()) return;

    try {
      await geocodePostcode(postcode.trim());
    } catch (error) {
      console.error("Geocoding failed:", error);
    }
  };

  return (
    <>
      <Navigation />
      <LeafletMap location={data} />
    </>
  );
};

export default PostcodeSearch;
