/*
Main users table component that manages pagination state
and coordinates between UsersTableContent and Pagination components
*/
import { UsersTableContent } from "./UsersTableContent";
import { Pagination } from "../table/Pagination";
import { USERS_PER_PAGE } from "../../constants/constants";
import type { UserFilters } from "../../__generated__/graphql";
import type { SortingState } from "@tanstack/react-table";
import { useTablePagination } from "../../hooks/useTablePagination";

const EMPTY_USER_FILTERS = {} as UserFilters;

export const UsersTable = ({
  filters,
  sorting,
  onSortingChange,
}: {
  filters?: UserFilters;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
}) => {
  const safeFilters = filters ?? EMPTY_USER_FILTERS;
  
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
    pageSize: USERS_PER_PAGE,
    filters: safeFilters,
  });

  return (
    <div className="flex flex-col gap-4">
      <UsersTableContent
        filters={safeFilters}
        page={page}
        onDataCountChange={() => {}} 
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
