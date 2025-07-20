import { CrimeData } from "@/types/Crime/crime";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import useMapHelpers from "@/hooks/MapHelpers/useMapHelpers";

interface FilterProps {
  data: CrimeData[] | null;
  selectedCategories: Set<string>;
  setSelectedCategories: Dispatch<SetStateAction<Set<string>>>;
}

const Filter = ({
  data,
  setSelectedCategories,
  selectedCategories,
}: FilterProps) => {
  const { getCrimeColor } = useMapHelpers();
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(true);

  // Initialize selected categories when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      const allCategories = Array.from(
        new Set(data.map((crime) => crime.category))
      );
      setSelectedCategories(new Set(allCategories));
    }
  }, [data]);

  const handleCategoryToggle = (category: string) => {
    const newSelected = new Set(selectedCategories);

    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }

    setSelectedCategories(newSelected);
  };

  const handleSelectAll = () => {
    if (data) {
      const allCategories = Array.from(
        new Set(data.map((crime) => crime.category))
      );

      setSelectedCategories(new Set(allCategories));
    }
  };

  const handleDeselectAll = () => {
    setSelectedCategories(new Set());
  };

  const uniqueCategories = data
    ? Array.from(new Set(data.map((crime) => crime.category)))
    : [];

  return (
    data &&
    data.length > 0 && (
      <div className="absolute top-2 left-15 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border max-w-80 z-[1000]">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Filter by Crime Type</h4>
            <span className="text-xs text-gray-500">
              ({selectedCategories.size} of {uniqueCategories.length} selected)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isFilterExpanded ? "rotate-180" : ""
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

        {isFilterExpanded && (
          <div className="space-y-3 mt-3">
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {uniqueCategories.map((category) => {
                const count = data.filter(
                  (crime) => crime.category === category
                ).length;
                const isSelected = selectedCategories.has(category);

                return (
                  <label
                    key={category}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      isSelected ? "bg-white shadow-sm" : "hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCategoryToggle(category)}
                      className="rounded"
                    />
                    <div
                      className="w-3 h-3 rounded-full border border-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: getCrimeColor(category) }}
                    ></div>
                    <span className="text-xs capitalize flex-1">
                      {category.replace(/-/g, " ")} ({count})
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default Filter;
