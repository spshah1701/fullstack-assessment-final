/**
 * Generic base table component that handles common table rendering logic
 */

import { type ReactNode } from "react";
import { flexRender, type Table as TanStackTable } from "@tanstack/react-table";
import LoadingSpinner from "../ui/LoadingSpinner";

/*
Props for the Base table component

table: The TanStack Table instance to render
loading: Whether the table is currently loading data
error: Any error that occurred during data fetching
hasData: Whether there is any data to display
emptyMessage: Message to show when there is no data
refetchingIndicator: Optional indicator to show when refetching data
onRowClick: Optional callback when a row is clicked
getCellClassName: Optional function to get custom class names for cells
getRowClassName: Optional function to get custom class names for rows

*/
interface BaseTableProps<TData> {
  table: TanStackTable<TData>;
  loading: boolean;
  error: Error | null;
  hasData: boolean;
  emptyMessage?: string;
  refetchingIndicator?: ReactNode;
  onRowClick?: (row: TData) => void;
  getCellClassName?: (columnId: string) => string;
  getRowClassName?: (row: TData) => string;
}

export function BaseTable<TData>({
  table,
  loading,
  error,
  hasData,
  emptyMessage = "No data found",
  refetchingIndicator,
  onRowClick,
  getCellClassName,
  getRowClassName,
}: BaseTableProps<TData>) {
  // Error state
  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  // Initial loading state
  if (loading && !hasData) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const isRefetching = loading && hasData;

  return (
    <div className="p-2 sm:p-4 sm:p-6 bg-white text-gray-900 rounded-lg shadow-md relative">
      {refetchingIndicator && isRefetching && refetchingIndicator}

      {/* Data Table */}
      <div className={`overflow-x-auto -mx-2 sm:-mx-4 sm:mx-0 ${isRefetching ? "" : ""}`}>
        <table className="min-w-[800px] w-full border-collapse border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      className={`px-2 sm:px-4 py-2 border-b border-gray-200 text-left font-semibold text-sm sm:text-base cursor-pointer select-none ${sortDir ? "text-blue-500" : "text-gray-700"
                        } ${canSort ? "cursor-pointer" : ""}`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {sortDir === "asc" && " ▲"}
                      {sortDir === "desc" && " ▼"}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => {
              const rowData = row.original;
              const rowClassName = getRowClassName
                ? getRowClassName(rowData)
                : "hover:bg-gray-50 transition";

              return (
                <tr
                  key={row.id}
                  className={`${rowClassName} ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={onRowClick ? () => onRowClick(rowData) : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const cellClassName = getCellClassName
                      ? getCellClassName(cell.column.id)
                      : "px-2 sm:px-4 py-2 border-b text-sm sm:text-base";

                    return (
                      <td key={cell.id} className={cellClassName}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {!hasData && (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  className="text-center py-6 text-sm sm:text-base text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

