/*
Custom hook for handling GraphQL table queries with loading states
*/

import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import type { DocumentNode, OperationVariables } from "@apollo/client";

interface UseTableQueryOptions<TData, TVariables extends OperationVariables, TItem> {
  query: DocumentNode;
  variables: TVariables;
  page: number;
  pageSize: number;
  onDataCountChange: (count: number) => void; // Function for data count changes
  dataExtractor: (data: TData) => TItem[]; // Function to extract the data array from query result
  totalCountExtractor?: (data: TData) => number | undefined; // Function to extract totalCount from query result
  onTotalCountChange?: (count: number) => void; // Function for total count changes
  fetchPolicy?: useQuery.Options<TData, TVariables>["fetchPolicy"]; 
}

export function useTableQuery<TData, TVariables extends OperationVariables, TItem>({
  query,
  variables,
  page,
  pageSize,
  onDataCountChange,
  dataExtractor,
  totalCountExtractor,
  onTotalCountChange,
  fetchPolicy = "network-only",
}: UseTableQueryOptions<TData, TVariables, TItem>) {
  // useRef to track previous count to avoid unnecessary calls
  const prevCountRef = useRef<number>(-1);
  const prevTotalCountRef = useRef<number>(-1);

  // Fetch pageSize + 1 items to detect if there is a next page
  const { data, loading, error, refetch } = useQuery<TData, TVariables>(query, {
    variables: {
      ...variables,
      limit: pageSize + 1, // Fetch one extra to check for next page
      offset: page * pageSize,
    } as TVariables,
    fetchPolicy,
    notifyOnNetworkStatusChange: true,
  });

  // Extract data array from the query result
  const allData = useMemo(() => {
    if (!data) return [];
    return dataExtractor(data);
  }, [data, dataExtractor]);

  // Extract total count if extractor is provided
  const totalCount = useMemo(() => {
    if (!data || !totalCountExtractor) return undefined;
    return totalCountExtractor(data);
  }, [data, totalCountExtractor]);

  // Return only pageSize items, but track if there are more
  const tableData = useMemo(() => {
    return allData.slice(0, pageSize);
  }, [allData, pageSize]);

  // If there are more than pageSize items, there is a next page
  const hasNextPage = allData.length > pageSize;

  // Notify parent of data count changes (only when count actually changes)
  useEffect(() => {
    const currentCount = tableData.length;
    if (currentCount !== prevCountRef.current) {
      prevCountRef.current = currentCount;
      onDataCountChange(currentCount);
    }
  }, [tableData.length, onDataCountChange]);

  // Notify parent of total count changes (only when count actually changes)
  useEffect(() => {
    if (totalCount !== undefined && onTotalCountChange) {
      const currentTotalCount = totalCount;
      if (currentTotalCount !== prevTotalCountRef.current) {
        prevTotalCountRef.current = currentTotalCount;
        onTotalCountChange(currentTotalCount);
      }
    }
  }, [totalCount, onTotalCountChange]);

  const hasData = tableData.length > 0;

  return {
    data: tableData,
    loading,
    error: error || null,
    hasData,
    hasNextPage, // Expose whether there is a next page
    totalCount, // Expose total count if available
    rawData: data,
    refetch, // Expose refetch function for manual refetching
  };
}