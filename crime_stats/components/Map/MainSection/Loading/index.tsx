interface LoadingProps {
  loading: boolean;
}

const Loading = ({ loading }: LoadingProps) =>
  loading && (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg absolute top-[50%] right-[50%] z-[1000]">
      <p className=" text-gray-600 text-2xl">Loading crime data...</p>
    </div>
  );

export default Loading;
