/*
Custom hook for managing data table filters
Handles search, age filtering, and filter state management
*/

import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "./useDebounce";
import type { UserFilters, PostFilters } from "../__generated__/graphql";
import type { AgeOperator, Tab } from "../types/filters";
import { buildPostFilters, buildUserFilters, isAgeFilterComplete } from "../utils/filterBuilders";

interface UseDataTableFiltersResult {
  // Search state
  searchValue: string;
  setSearchValue: (value: string) => void;
  debouncedSearchValue: string;

  // Age filter state (for users tab)
  ageOp: AgeOperator;
  setAgeOp: (value: AgeOperator) => void;
  ageVal: number | "";
  setAgeVal: (value: number | "") => void;

  // Filter objects
  userFilters: UserFilters;
  postFilters: PostFilters;

  // Actions
  resetFilters: () => void;
}

export function useDataTableFilters(
  activeTab: Tab
): UseDataTableFiltersResult {
  // Search state
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 400);

  // Filter state
  const [userFilters, setUserFilters] = useState<UserFilters>({});
  const [postFilters, setPostFilters] = useState<PostFilters>({});

  // Age filter state (only used for users tab)
  const [ageOp, setAgeOp] = useState<AgeOperator>("");
  const [ageVal, setAgeVal] = useState<number | "">("");

  // Builds and updates filters based on current search and age filter values
  const updateFilters = useCallback(() => {
    if (activeTab === "Posts") {
      const newFilters = buildPostFilters(debouncedSearchValue);
      setPostFilters(newFilters);
      return;
    }

    // For users tab, only update if age filter is complete or empty
    if (activeTab === "Users") {
      // Skip update if age filter is incomplete (operator set but no value)
      if (!isAgeFilterComplete(ageOp, ageVal) && ageOp !== "") {
        return; // Wait for user to complete the filter
      }

      const newFilters = buildUserFilters(debouncedSearchValue, ageOp, ageVal);
      setUserFilters(newFilters);
    }
  }, [activeTab, debouncedSearchValue, ageOp, ageVal]);

  // Automatically trigger filter update when debounced search value changes
  useEffect(() => {
    updateFilters();
  }, [debouncedSearchValue, updateFilters]);

  // Trigger filter update when age filter changes (only for users tab)
  useEffect(() => {
    if (activeTab === "Users") {
      updateFilters();
    }
  }, [ageOp, ageVal, activeTab, updateFilters]);

  // Reset all filters and search values
  const resetFilters = useCallback(() => {
    setSearchValue("");
    setAgeOp("");
    setAgeVal("");
    setUserFilters({});
    setPostFilters({});
  }, []);

  return {
    searchValue,
    setSearchValue,
    debouncedSearchValue,
    ageOp,
    setAgeOp,
    ageVal,
    setAgeVal,
    userFilters,
    postFilters,
    resetFilters,
  };
}

