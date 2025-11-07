import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { AgeOperator } from "../../types/filters";

/* 
Props for the search bar component

searchValue: The current value of the search input
setSearchValue: Function to update the search input value
onSearch: Function to call when the search button is clicked 
onClear: Optional function to call when the clear button is clicked
hideAgeFilter: Whether to hide the age filter inputs (for Posts tab)
ageOp: Current age operator value (for Users tab)
setAgeOp: Function to update the age operator (for Users tab)
ageVal: Current age value (for Users tab)
setAgeVal: Function to update the age value (for Users tab)

*/
interface SearchBarProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
  onSearch: () => void;
  onClear?: () => void;
  hideAgeFilter?: boolean;
  ageOp?: AgeOperator;
  setAgeOp?: (value: AgeOperator) => void;
  ageVal?: number | "";
  setAgeVal?: (value: number | "") => void;
}

export const SearchBar = ({
  searchValue,
  setSearchValue,
  onSearch,
  onClear,
  hideAgeFilter = false,
  ageOp,
  setAgeOp,
  ageVal,
  setAgeVal,
}: SearchBarProps) => {
  const [isAgeInvalid, setIsAgeInvalid] = useState<boolean>(false);

  // Validate age input (0-150 inclusive)
  const validateAge = (value: number | ""): boolean => {
    if (value === "" || value === null || value === undefined) {
      return false;
    }
    return value < 0 || value > 150;
  };

  // Prevent minus key and other invalid characters, handle arrow keys at boundaries
  const handleAgeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent minus, plus, and 'e' (scientific notation) keys
    if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
      e.preventDefault();
      return;
    }

    // Handle up arrow when value is already at max (150)
    if (e.key === "ArrowUp" && ageVal === 150) {
      e.preventDefault();
      toast.error("Valid age input is 0-150", { duration: 2000 });
      return;
    }

    // Handle down arrow when value is already at min (0)
    if (e.key === "ArrowDown" && ageVal === 0) {
      e.preventDefault();
      toast.error("Valid age input is 0-150", { duration: 2000 });
      return;
    }
  };

  // Handle age input change with validation
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!setAgeVal) return;

    const inputValue = e.target.value;

    // Allow empty input
    if (inputValue === "") {
      setAgeVal("");
      setIsAgeInvalid(false);
      return;
    }

    // Parse the number
    const numValue = Number(inputValue);

    // Check if it is a valid number
    if (isNaN(numValue)) {
      return; // Don't update if invalid number
    }

    // Check if value exceeds 150
    if (numValue > 150) {
      setAgeVal(150);
      toast.error("Valid age input is 0-150", { duration: 2000 });
      // Note: isAgeInvalid will be set to false by useEffect since 150 is valid
      return;
    }

    // Valid input (0-150)
    setAgeVal(numValue);
    setIsAgeInvalid(false);
  };

  // Validate age when ageVal changes (for external updates)
  useEffect(() => {
    if (ageVal !== "" && ageVal !== null && ageVal !== undefined) {
      const invalid = validateAge(ageVal);
      setIsAgeInvalid(invalid);
    } else {
      setIsAgeInvalid(false);
    }
  }, [ageVal]);

  const handleClear = () => {
    setSearchValue("");
    if (setAgeOp) setAgeOp("");
    if (setAgeVal) setAgeVal("");
    setIsAgeInvalid(false);

    // If parent wants to refetch on clear, call onClear; otherwise just do nothing.
    if (onClear) onClear();
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-full
                      flex flex-col sm:flex-row sm:flex-wrap
                      items-stretch sm:items-center justify-center gap-2 sm:gap-3
                      bg-gray-50 border border-gray-200 rounded-xl shadow-sm
                      p-3 sm:p-4">

        {/* Search input - First row on tablets */}
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }}
          placeholder={hideAgeFilter
            ? "Search posts by title or content..."
            : "Search users by name, phone, or email..."}
          className="flex-1 min-h-[48px] w-full sm:flex-1 md:flex-[1] lg:flex-[3] min-w-[280px] sm:min-w-[320px] md:min-w-0 h-12
                     bg-white text-gray-800 rounded-lg border border-gray-300 px-3 md:px-4
                     shadow-sm placeholder-gray-400 focus:outline-none
                     focus:ring-2 focus:ring-blue-500"
        />

        {/* Separator - Desktop only (lg and above) */}
        <div className="hidden lg:block h-7 w-px bg-gray-600/30 rounded" />

        {/* Filter by Age */}
        {!hideAgeFilter && (
          <>
            {/* Desktop/Tablet Filter by Age - First row on tablets */}
            <div className="hidden md:flex h-12 flex-row items-center gap-2 md:gap-3 w-auto flex-shrink-0">
              <div className="flex items-center gap-2 md:gap-3 bg-white border border-gray-200 rounded-lg px-2 md:px-3 lg:px-4 py-2 shadow-sm h-12">
                <span className="text-gray-700 text-xs md:text-sm font-medium whitespace-nowrap">
                  Filter by Age
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={ageOp}
                    onChange={(e) => {
                      if (setAgeOp) {
                        setAgeOp(e.target.value as AgeOperator);
                      }
                    }}
                    className="h-10 w-20 rounded-md border border-gray-300 px-2 text-sm
                               text-gray-700 focus:ring-2 focus:ring-blue-400 appearance-none
                               bg-white cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <option value="" disabled className="text-gray-400">Select</option>
                    <option value="=">=</option>
                    <option value=">=">≥</option>
                    <option value=">">&gt;</option>
                    <option value="<=">≤</option>
                    <option value="<">&lt;</option>
                  </select>

                  <input
                    type="number"
                    value={ageVal}
                    onChange={handleAgeChange}
                    onKeyDown={handleAgeKeyDown}
                    placeholder="Age"
                    min="0"
                    max="150"
                    disabled={!ageOp}
                    className={`h-10 w-20 rounded-md border px-3 text-sm
                               focus:ring-2 transition-all
                               ${isAgeInvalid
                        ? "border-red-500 focus:ring-red-400"
                        : ageOp
                          ? "border-gray-300 focus:ring-blue-400"
                          : "border-gray-200"
                      }
                               ${ageOp
                        ? "text-gray-800 placeholder-gray-400 bg-white"
                        : "text-gray-400 placeholder-gray-300 bg-gray-50 cursor-not-allowed"
                      }`}
                  />
                </div>
              </div>
            </div>

            {/* Separator - Desktop only (lg and above) */}
            <div className="hidden lg:block h-7 w-px bg-gray-600/30 rounded" />

            {/* Filter by Age */}
            <div className="flex md:hidden flex-col h-12 items-center gap-3 w-full">
              <div className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm w-full h-12">
                <span className="text-gray-700 text-md font-medium whitespace-nowrap">
                  Filter by Age
                </span>

                <div className="flex items-center gap-2 flex-grow justify-end">
                  <select
                    value={ageOp}
                    onChange={(e) => {
                      if (setAgeOp) {
                        setAgeOp(e.target.value as AgeOperator);
                      }
                    }}
                    className="h-10 w-20 rounded-md border border-gray-300 px-2 text-sm
                               text-gray-700 focus:ring-2 focus:ring-blue-400 appearance-none
                               bg-white cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <option value="" disabled className="text-gray-400">Select</option>
                    <option value="=">=</option>
                    <option value=">=">≥</option>
                    <option value=">">&gt;</option>
                    <option value="<=">≤</option>
                    <option value="<">&lt;</option>
                  </select>

                  <input
                    type="number"
                    value={ageVal}
                    onChange={handleAgeChange}
                    onKeyDown={handleAgeKeyDown}
                    placeholder="Age"
                    min="0"
                    max="150"
                    disabled={!ageOp}
                    className={`h-10 w-20 rounded-md border px-3 text-sm
                               focus:ring-2 transition-all
                               ${isAgeInvalid
                        ? "border-red-500 focus:ring-red-400"
                        : ageOp
                          ? "border-gray-300 focus:ring-blue-400"
                          : "border-gray-200"
                      }
                               ${ageOp
                        ? "text-gray-800 placeholder-gray-400 bg-white"
                        : "text-gray-400 placeholder-gray-300 bg-gray-50 cursor-not-allowed"
                      }`}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="w-full md:w-full lg:w-auto flex-shrink-0 md:flex md:justify-end">
          <div className="flex gap-2 md:gap-3 w-full md:w-auto justify-end">
            <button
              onClick={handleClear}
              className="flex-1 md:flex-none text-lg sm:flex-none h-12 px-3 md:px-4 lg:px-6 text-sm md:text-base lg:text-lg
                         text-gray-700 rounded-lg font-medium border border-gray-300
                         bg-gray-200 hover:bg-gray-300 active:bg-gray-200
                         focus:ring-2 focus:ring-gray-300 focus:outline-none transition-all whitespace-nowrap"
            >
              Clear
            </button>

            <button
              onClick={() => {
                onSearch();
              }}
              className="flex-1 md:flex-none text-lg sm:flex-none h-12 px-3 md:px-4 lg:px-6 text-sm md:text-base lg:text-lg
                         bg-blue-500 text-white rounded-lg font-medium
                         hover:bg-blue-600 active:bg-blue-700
                         focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
