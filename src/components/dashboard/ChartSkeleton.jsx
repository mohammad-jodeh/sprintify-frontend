/**
 * Loading skeleton for chart cards
 * Shows animated placeholder while charts are loading
 */
const ChartSkeleton = ({ height = "h-80" }) => {
  return (
    <div className={`${height} bg-white dark:bg-gradient-card rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse`}>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
      <div className="flex items-center justify-center h-full space-x-4">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
};

export default ChartSkeleton;
