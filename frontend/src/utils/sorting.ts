import type { Row } from "@tanstack/react-table";

// Sorts string values (case-insensitive)
export const stringSort = <T extends object>(
  rowA: Row<T>,
  rowB: Row<T>,
  columnId: string
): number => {
  const a = (rowA.getValue(columnId) || "").toString().trim().toLowerCase();
  const b = (rowB.getValue(columnId) || "").toString().trim().toLowerCase();
  return a.localeCompare(b);
};
