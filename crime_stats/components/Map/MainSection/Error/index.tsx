interface ErrorProps {
  error: string | null;
}

const DisplayError = ({ error }: ErrorProps) =>
  error && (
    <div className="mb-4 p-4 bg-red-50 rounded-lg">
      <p className="text-sm text-red-600">Error loading crime data: {error}</p>
    </div>
  );

export default DisplayError;
