export default function AdminLoading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-4">
      <div className="w-8 h-8 border-4 border-brand-forest-700 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium animate-pulse">Loading data...</p>
    </div>
  );
}
