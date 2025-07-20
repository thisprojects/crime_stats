import React, { Dispatch, SetStateAction } from "react";
import { PostcodeResponse } from "@/types/GeoCode/geoCode";
import Logo from "./Logo";
import Inputs from "./Inputs";

interface NavigationWithSearchProps {
  setLocation: Dispatch<SetStateAction<PostcodeResponse | null>>;
}

export default function NavigationWithSearch({
  setLocation,
}: NavigationWithSearchProps) {
  const handleSetLocation = (locations: PostcodeResponse, date: string) => {
    setLocation({
      ...locations,
      date,
    });
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl border-b border-slate-700 w-full">
        <div className="px-0 md:px-8 w-full">
          <div className="flex flex-row justify-between items-center md:grid md:grid-cols-3 p-5 md:gap-6 gap-2">
            <Logo />
            <Inputs handleSetLocation={handleSetLocation} />
          </div>
        </div>
      </nav>
    </>
  );
}
