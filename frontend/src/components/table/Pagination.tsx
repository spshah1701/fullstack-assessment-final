import React from "react";

/*

Props for the pagination component 

page: current page number
hasNextPage: whether there is a next page available
onPrev: callback function when previous page button is clicked
onNext: callback function when next page button is clicked
onFirst: callback function when first page button is clicked
onLast: callback function when last page button is clicked

*/
interface PaginationProps {
  page: number;
  hasNextPage: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  hasNextPage,
  onPrev,
  onNext,
  onFirst,
  onLast,
}) => {
  const canPrev = page > 0;
  const canNext = hasNextPage;

  return (
    <div className="flex flex-row flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 mt-6 mb-8">
      {/* First Page Button */}
      <button
        onClick={onFirst}
        disabled={!canPrev}
        className="h-10 w-10 inline-flex items-center justify-center px-2 bg-gray-200 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-300 disabled:bg-white disabled:text-gray-300 disabled:border disabled:border-gray-200 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-300 transition whitespace-nowrap"
        title="First page"
      >
        «
      </button>

      {/* Previous Button */}
      <button
        onClick={onPrev}
        disabled={!canPrev}
        className="h-10 w-10 inline-flex items-center justify-center px-2 bg-gray-200 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-300 disabled:bg-white disabled:text-gray-300 disabled:border disabled:border-gray-200 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-300 transition whitespace-nowrap"
        title="Previous page"
      >
        ‹
      </button>

      {/* Page Indicator */}
      <span className="h-10 inline-flex items-center justify-center text-gray-700 text-sm font-medium bg-gray-100 px-3 sm:px-4 rounded-md shadow-sm whitespace-nowrap">
        Page {page + 1}
      </span>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!canNext}
        className="h-10 w-10 inline-flex items-center justify-center px-2 bg-gray-200 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-300 disabled:bg-white disabled:text-gray-300 disabled:border disabled:border-gray-200 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-300 transition whitespace-nowrap"
        title="Next page"
      >
        ›
      </button>

      {/* Last Page Button */}
      <button
        onClick={onLast}
        disabled={!canNext}
        className="h-10 w-10 inline-flex items-center justify-center px-2 bg-gray-200 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-300 disabled:bg-white disabled:text-gray-300 disabled:border disabled:border-gray-200 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-300 transition whitespace-nowrap"
        title="Last page"
      >
        »
      </button>
    </div>
  );
};