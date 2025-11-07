/*
Posts table content component that handles data fetching, column definitions,
sorting, and rendering of posts with author information and edit status
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

import {
  GetPostsDocument,
  type GetPostsQuery,
  type PostFilters,
} from "../../__generated__/graphql";

import { GenericCell } from "../table/cells/GenericCell";
import { BaseTable } from "../table/BaseTable";
import { useTableQuery } from "../../hooks/useTableQuery";
import { stringSort } from "../../utils/sorting";
import { PostModal } from "../modals/PostModal";
import { POSTS_PER_PAGE } from "../../constants/constants";

type Post = NonNullable<NonNullable<GetPostsQuery["posts"]>["data"]>[number];
const columnHelper = createColumnHelper<Post>();

/*
Memoized component that renders the posts table with filtering, pagination, and sorting.
Supports external sorting control and provides callbacks for pagination state management.
Displays posts with author information and edit status, with modal view functionality.
*/

export const PostsTableContent = memo(
  ({
    filters,
    page,
    onDataCountChange,
    onHasNextPageChange,
    onTotalCountChange,
    sorting: externalSorting,
    onSortingChange: externalOnSortingChange,
  }: {
    filters: PostFilters;
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
      defaultSorting: [{ id: "createdAt", desc: true }],
    });

    // Selected post for modal view
    const [selectedPost, setSelectedPost] =
      useState<Post | null>(null);

    // ----- Query -----
    const dataExtractor = useCallback(
      (data: GetPostsQuery): Post[] =>
        (data?.posts?.data ?? []).filter(
          (p): p is NonNullable<Post> => Boolean(p)
        ),
      []
    );

    // Extract total count of posts from query result
    const totalCountExtractor = useCallback(
      (data: GetPostsQuery): number | undefined => data?.posts?.totalCount,
      []
    );

    // Fetch posts data with pagination and filters
    const { data: posts, loading, error, hasData, hasNextPage } = useTableQuery<
      GetPostsQuery,
      { filters: PostFilters },
      Post
    >({
      query: GetPostsDocument,
      variables: { filters },
      page,
      pageSize: POSTS_PER_PAGE,
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

    // ----- Columns -----
    const columns = useMemo(
      () => [
        columnHelper.accessor("id", {
          header: "ID",
          cell: (info) => (
            <GenericCell value={info.getValue()} type="number" />
          ),
        }),
        columnHelper.accessor("title", {
          header: "Title",
          cell: (info) => (
            <GenericCell
              value={info.getValue() ?? "Untitled"}
              type="string"
            />
          ),
          sortingFn: stringSort,
        }),
        columnHelper.accessor("content", {
          header: "Content",
          cell: (info) => (
            <GenericCell
              value={info.getValue()}
              type="string"
              multiline
            />
          ),
          sortingFn: stringSort,
        }),
        columnHelper.accessor("user.name", {
          header: "Author",
          cell: (info) => (
            <GenericCell
              value={info.getValue() ?? "Unknown"}
              type="string"
            />
          ),
          sortingFn: stringSort,
        }),
        columnHelper.accessor("createdAt", {
          header: "Created",
          cell: (info) => (
            <GenericCell type="date" value={info.getValue() ?? null} />
          ),
          sortingFn: "datetime",
        }),
        columnHelper.display({
          id: "edited",
          header: "Edited",
          cell: (info) => {
            const row = info.row.original;
            const isEdited =
              row.updatedAt &&
              row.createdAt &&
              row.updatedAt !== row.createdAt;
            return <GenericCell value={isEdited} type="boolean" />;
          },
        }),
      ],
      []
    );

    // ----- Table Configuration -----
    const table = useReactTable({
      data: posts,
      columns,
      state: { sorting },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
    });

    // Refetching indicator
    const refetchingIndicator = loading && hasData ? (
      <div className="flex justify-end -mb-2">
        <span className="text-sm text-gray-400">
          Updating…
        </span>
      </div>
    ) : null;

    return (
      <>
        <BaseTable
          table={table}
          loading={loading}
          error={error}
          hasData={hasData}
          emptyMessage="No posts found"
          refetchingIndicator={refetchingIndicator}
          onRowClick={(row) => setSelectedPost(row)}
          getRowClassName={() => "hover:bg-gray-50 transition cursor-pointer"}
        />

        {/* Post Modal */}
        {selectedPost && (
          <PostModal
            mode="view"
            isOpen={!!selectedPost}
            userName={selectedPost.user?.name ?? "Unknown"}
            post={{
              title: selectedPost.title,
              content: selectedPost.content,
              createdAt: selectedPost.createdAt,
              updatedAt: selectedPost.updatedAt,
            }}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </>
    );
  }
);
