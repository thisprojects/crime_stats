// components/DynamicMap.tsx
import dynamic from "next/dynamic";

const DynamicPostcodeMapSearch = dynamic(
  () =>
    import("./MainSection").then((mod) => ({
      default: mod.PostcodeMapSearch,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
    ),
  }
);

export default DynamicPostcodeMapSearch;
