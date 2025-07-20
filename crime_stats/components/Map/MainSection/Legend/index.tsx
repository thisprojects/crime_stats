import { useState } from "react";
import useMapHelpers from "@/hooks/MapHelpers/useMapHelpers";
import { CrimeData } from "@/types/Crime/crime";

interface filteredDataProps {
  filteredData: CrimeData[];
}

const Legend = ({ filteredData }: filteredDataProps) => {
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(true);
  const { getCrimeColor } = useMapHelpers();
  return (
    filteredData &&
    filteredData.length > 0 && (
      <div className="hidden md:block absolute top-2 right-2 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border max-w-64 z-[1000]">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setIsLegendExpanded(!isLegendExpanded)}
        >
          <div className="flex gap-2 ">
            <h4 className="font-semibold text-sm">Crime Categories</h4>
            <span className="text-xs text-gray-500">
              (
              {
                Array.from(new Set(filteredData.map((crime) => crime.category)))
                  .length
              }{" "}
              types)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isLegendExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {isLegendExpanded && (
          <div className="mt-3 max-h-80 overflow-y-auto">
            {Array.from(
              new Set(filteredData.map((crime) => crime.category))
            ).map((category) => {
              const count = filteredData.filter(
                (crime) => crime.category === category
              ).length;

              return (
                <div key={category} className="flex items-center gap-2 p-1">
                  <div
                    className="w-3 h-3 rounded-full border border-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: getCrimeColor(category) }}
                  ></div>
                  <span className="capitalize text-xs">
                    {category.replace(/-/g, " ")} ({count})
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )
  );
};

export default Legend;
