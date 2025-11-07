import React from "react";

// LoadingSpinner component to indicate loading state with a spinning animation.
const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <div
        className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
      <span className="ml-3 text-blue-600 text-sm font-medium">
        Loading...
      </span>
    </div>
  );
};

export default LoadingSpinner;