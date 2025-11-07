import { useState, useCallback } from "react";
import type { SortingState, Updater } from "@tanstack/react-table";

/*
External sorting state if controlled by parent component

Callback to notify parent when sorting changes
Default sorting applied when no external control is provided
*/ 
interface UseTableSortingOptions {
  externalSorting?: SortingState;
  externalOnSortingChange?: (sorting: SortingState) => void;
  defaultSorting: SortingState;
}

/*
Return type containing current sorting state and setter 

Current sorting state of the table
Function to update sorting, compatible with TanStack Updater API
*/
interface UseTableSortingResult {
  sorting: SortingState;
  setSorting: (updaterOrValue: Updater<SortingState>) => void;
}


/*
Custom hook for managing table sorting state with support for both controlled and uncontrolled modes.

Controlled mode (external sorting):
- Parent component manages sorting state via `externalSorting` prop
- Changes are handled by `externalOnSortingChange` callback
- Used when parent needs to track/sync sorting state

Uncontrolled mode (internal sorting):
- Component manages its own sorting state internally
- Uses `defaultSorting` as the initial state
- Used when parent doesn't need to control sorting

The `setSorting` callback handles both modes:
1. Accepts either a value or updater function (React Table pattern)
2. Resolves the updater function if needed to get the new sorting state
3. Routes the update to either external callback or internal state setter
*/

export function useTableSorting({
  externalSorting,
  externalOnSortingChange,
  defaultSorting,
}: UseTableSortingOptions): UseTableSortingResult {
  const [internalSorting, setInternalSorting] = useState<SortingState>(defaultSorting);

  const sorting = externalSorting ?? internalSorting;

  const setSorting = useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;
      if (externalOnSortingChange) {
        externalOnSortingChange(newSorting);
      } else {
        setInternalSorting(newSorting);
      }
    },
    [sorting, externalOnSortingChange]
  );

  return { sorting, setSorting };
}

