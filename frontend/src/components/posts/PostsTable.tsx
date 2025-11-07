/*
Main posts table component that manages pagination state
and coordinates between PostsTableContent and Pagination components
*/
import { PostsTableContent } from "./PostsTableContent";
import { Pagination } from "../table/Pagination";
import { POSTS_PER_PAGE } from "../../constants/constants";
import type { PostFilters } from "../../__generated__/graphql";
import type { SortingState } from "@tanstack/react-table";
import { useTablePagination } from "../../hooks/useTablePagination";

const EMPTY_POST_FILTERS = {} as PostFilters;

export const PostsTable = ({
  filters,
  sorting,
  onSortingChange,
}: {
  filters?: PostFilters;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
}) => {
  const safeFilters = filters ?? EMPTY_POST_FILTERS;
  
  const {
    page,
    hasNextPage,
    setHasNextPage,
    setTotalCount,
    handlePrev,
    handleNext,
    handleFirst,
    handleLastPage,
  } = useTablePagination({
    pageSize: POSTS_PER_PAGE,
    filters: safeFilters,
  });

  return (
    <div className="flex flex-col gap-4">
      <PostsTableContent
        filters={safeFilters}
        page={page}
        onDataCountChange={() => { }}
        onHasNextPageChange={setHasNextPage}
        onTotalCountChange={setTotalCount}
        sorting={sorting}
        onSortingChange={onSortingChange}
      />

      <Pagination
        page={page}
        hasNextPage={hasNextPage}
        onPrev={handlePrev}
        onNext={handleNext}
        onFirst={handleFirst}
        onLast={handleLastPage}
      />
    </div>
  );
};
