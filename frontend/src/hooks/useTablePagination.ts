import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from "react";

/* 
UseTablePaginationOptions defines configuration inputs like page size and filters.
pageSize: Number of items to display per page
filters: Active filters applied to the table
*/
interface UseTablePaginationOptions {
  pageSize: number;                 
  filters: unknown;                 
}

/*
UseTablePaginationResult defines state values and navigation handlers for the table.

currentPage: Current page index (0-based)
setCurrentPage: Updates the current page
hasNextPage: Indicates if another page exists
setHasNextPage: Updates the next-page availability flag
totalCount: Total number of items across all pages
setTotalCount: Updates the total item count
lastPage: Index of the last available page
handleLastPage: Navigate to the last page
handlePrev: Navigate to the previous page
handleNext: Navigate to the next page
handleFirst: Navigate to the first page
*/

interface UseTablePaginationResult {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  hasNextPage: boolean;
  setHasNextPage: Dispatch<SetStateAction<boolean>>;
  totalCount: number;
  setTotalCount: Dispatch<SetStateAction<number>>;
  lastPage: number;
  handleLastPage: () => void;
  handlePrev: () => void;
  handleNext: () => void;
  handleFirst: () => void;
}



/*
Custom hook for managing table pagination state.
Handles page navigation, total count tracking, and resets page when filters change.
*/
export function useTablePagination({
  pageSize,
  filters,
}: UseTablePaginationOptions): UseTablePaginationResult {
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const lastPage = totalCount > 0 ? Math.ceil(totalCount / pageSize) - 1 : 0;

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
    setHasNextPage(false);
    setTotalCount(0);
  }, [filters]);

  const handleLastPage = useCallback(() => {
    setPage(lastPage);
  }, [lastPage]);

  const handlePrev = useCallback(() => {
    setPage((p) => Math.max(p - 1, 0));
  }, []);

  const handleNext = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const handleFirst = useCallback(() => {
    setPage(0);
  }, []);

  return {
    page,
    setPage,
    hasNextPage,
    setHasNextPage,
    totalCount,
    setTotalCount,
    lastPage,
    handleLastPage,
    handlePrev,
    handleNext,
    handleFirst,
  };
}

