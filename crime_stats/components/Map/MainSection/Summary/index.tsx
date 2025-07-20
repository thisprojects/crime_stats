import { CrimeData } from "@/types/Crime/crime";

interface SummaryProps {
  data: CrimeData[] | null;
  filteredData: CrimeData[];
  loading: boolean;
}

const Summary = ({ data, filteredData, loading }: SummaryProps) =>
  data &&
  data.length > 0 && (
    <div className="absolute bottom-1 left-1  bg-white/95  px-3 py-2 rounded-lg shadow-lg border z-[1000]">
      <div className="text-center">
        <p className="text-xs text-gray-600">
          Showing {filteredData.length} of {data.length} crime incidents
        </p>
        {loading && (
          <p className="text-xs text-blue-600 mt-1">
            Loading additional data...
          </p>
        )}
      </div>
    </div>
  );

export default Summary;
