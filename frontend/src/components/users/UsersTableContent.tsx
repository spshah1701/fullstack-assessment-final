/*
Users table content component that handles data fetching, column definitions,
sorting, and rendering of users with their posts and post creation functionality
*/
import { memo, useState, useMemo, useCallback, useEffect } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useTableSorting } from "../../hooks/useTableSorting";
import { useMutation } from "@apollo/client/react";
import { SquarePlus } from "lucide-react";

import {
  GetUsersDocument,
  CreatePostDocument,
  type CreatePostMutation,
  type CreatePostMutationVariables,
  type GetUsersQuery,
  type UserFilters,
} from "../../__generated__/graphql";

import { GenericCell } from "../table/cells/GenericCell";
import { PostsHoverCell } from "../table/cells/PostsHoverCell";
import LoadingSpinner from "../ui/LoadingSpinner";
import { PostModal } from "../modals/PostModal";
import { BaseTable } from "../table/BaseTable";
import { useTableQuery } from "../../hooks/useTableQuery";

import { USERS_PER_PAGE } from "../../constants/constants";
import { stringSort } from "../../utils/sorting";

type User = NonNullable<NonNullable<GetUsersQuery["users"]>["data"]>[number];
const columnHelper = createColumnHelper<User>();

/*
Memoized component that renders the users table with filtering, pagination, and sorting.
Supports external sorting control and provides callbacks for pagination state management.
Includes functionality to create posts for users via modal.
*/

export const UsersTableContent = memo(
  ({
    filters,
    page,
    onDataCountChange,
    onHasNextPageChange,
    onTotalCountChange,
    sorting: externalSorting,
    onSortingChange: externalOnSortingChange,
  }: {
    filters: UserFilters;
    page: number;
    onDataCountChange: (count: number) => void;
    onHasNextPageChange?: (hasNext: boolean) => void;
    onTotalCountChange?: (count: number) => void;
    sorting?: SortingState;
    onSortingChange?: (sorting: SortingState) => void;
  }) => {
    // ----- State -----
    const { sorting, setSorting } = useTableSorting({
      externalSorting,
      externalOnSortingChange,
      defaultSorting: [{ id: "id", desc: false }],
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeUserId, setActiveUserId] = useState<number | null>(null);

    // ----- Mutations -----
    const [createPost] = useMutation<
      CreatePostMutation,
      CreatePostMutationVariables
    >(CreatePostDocument);

    // ----- Modal Handlers -----
    const openModal = useCallback((userId: number) => {
      setActiveUserId(userId);
      setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => setIsModalOpen(false), []);

    // ----- Query -----
    const dataExtractor = useCallback(
      (data: GetUsersQuery): User[] =>
        (data?.users?.data ?? []).filter(
          (u): u is NonNullable<User> => Boolean(u)
        ),
      []
    );

    const totalCountExtractor = useCallback(
      (data: GetUsersQuery): number | undefined => data?.users?.totalCount,
      []
    );

    const { data: users, loading, error, hasData, hasNextPage, refetch } = useTableQuery<
      GetUsersQuery,
      { filters: UserFilters },
      User
    >({
      query: GetUsersDocument,
      variables: { filters },
      page,
      pageSize: USERS_PER_PAGE,
      onDataCountChange,
      dataExtractor,
      totalCountExtractor,
      onTotalCountChange,
    });

    // Notify parent component of hasNextPage changes
    useEffect(() => {
      if (onHasNextPageChange) {
        onHasNextPageChange(hasNextPage);
      }
    }, [hasNextPage, onHasNextPageChange]);

    // Active user name for modal header
    const activeUserName = users.find((u) => u.id === activeUserId)?.name ?? "User";

    // ----- Table Columns -----
    const columns = useMemo(
      () => [
        columnHelper.accessor("id", {
          header: "ID",
          cell: (info) => (
            <GenericCell value={info.getValue()} type="number" />
          ),
        }),
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => (
            <GenericCell value={info.getValue()} type="string" />
          ),
          sortingFn: stringSort,
        }),
        columnHelper.accessor("age", {
          header: "Age",
          cell: (info) => (
            <GenericCell value={info.getValue()} type="number" />
          ),
        }),
        columnHelper.accessor("email", {
          header: "Email",
          cell: (info) => (
            <GenericCell value={info.getValue()} type="email" />
          ),
          sortingFn: stringSort,
        }),
        columnHelper.accessor("phone", {
          header: "Phone",
          cell: (info) => (
            <GenericCell value={info.getValue()} type="phone" />
          ),
        }),
        columnHelper.accessor("posts", {
          header: "Posts",
          cell: (info) => {
            const user = info.row.original;
            return (
              <div className="flex items-center justify-between gap-2">
                {/* Tooltip showing post previews */}

                <PostsHoverCell
                  posts={info.getValue() || []}
                  userName={user.name ?? undefined}
                  wrapperClassName={`inline-flex items-center justify-center w-8 h-7 rounded-md text-sm font-semibold select-none
    ${info.getValue()?.length > 0
                      ? "bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100"
                      : "bg-gray-100 text-gray-400 border border-gray-200"
                    }`}
                />

                {/* Add Post Button */}
                <button
                  onClick={() => openModal(user.id)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition"
                  title="Add Post"
                >
                  <SquarePlus size={20} strokeWidth={2} className="text-gray-500 hover:text-blue-600 transition" />
                </button>
              </div>
            );
          },
        }),
      ],
      [openModal]
    );

    // ----- Table Configuration -----
    const table = useReactTable({
      data: users,
      columns,
      state: { sorting },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
    });

    // Refetching indicator
    const refetchingIndicator = loading && hasData ? (
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-10">
        <LoadingSpinner />
      </div>
    ) : null;

    // ----- Render -----
    return (
      <>
        <BaseTable
          table={table}
          loading={loading}
          error={error}
          hasData={hasData}
          emptyMessage="No users found"
          refetchingIndicator={refetchingIndicator}
          getCellClassName={() => {
            return "px-2 sm:px-4 py-2 border-b whitespace-nowrap";
          }}
        />

        {/* ----- Add Post Modal ----- */}
        <PostModal
          mode="create"
          isOpen={isModalOpen}
          userName={activeUserName}
          onClose={closeModal}
          onSave={async (title, content) => {
            if (!activeUserId) return;
            try {
              await createPost({
                variables: { input: { userId: activeUserId, title, content } },
              });
              // Refetch the current query instead of using refetchQueries
              await refetch();
              closeModal();
            } catch (err) {
              console.error("Error creating post:", err);
            }
          }}
        />
      </>
    );
  }
);
