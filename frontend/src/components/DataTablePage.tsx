// DataTablePage component that manages Users and Posts tables with tabs, search, and filters.

import { useState, useCallback } from "react";
import type { SortingState } from "@tanstack/react-table";

import { PostsTable } from "./posts";
import { UsersTable } from "./users";
import { SearchBar } from "./table/SearchBar";
import { Tabs } from "./table/Tabs";
import { useDataTableFilters } from "../hooks/useDataTableFilters";
import type { Tab } from "../types/filters";

export const DataTablePage = () => {
  // Manage active tab ("Users" or "Posts")
  const [activeTab, setActiveTab] = useState<Tab>("Users");

  // Preserve sorting state across tab switches
  const [usersSorting, setUsersSorting] = useState<SortingState>([
    { id: "id", desc: false },
  ]);
  const [postsSorting, setPostsSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  
  // This hook manages search and age filters for both Users and Posts tables.
  const {
    searchValue,
    setSearchValue,
    ageOp,
    setAgeOp,
    ageVal,
    setAgeVal,
    userFilters,
    postFilters,
    resetFilters,
  } = useDataTableFilters(activeTab);

  // Reset filters when switching tabs
  const handleTabChange = useCallback(
    (newTab: Tab) => {
      setActiveTab(newTab);
      resetFilters();
    },
    [resetFilters]
  );


  return (
    <div className="p-2 sm:p-4 sm:p-6 flex flex-col gap-4">
      {/* ----- Tabs and Search Bar ----- */}
      <div className="mx-auto w-full max-w-12xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-2 lg:gap-4">

          {/* ----- Tabs ----- */}
          <div className="flex w-full lg:col-span-4 justify-center lg:justify-start">
            <Tabs
              activeTab={activeTab}
              tabs={[
                { value: "Users" },
                { value: "Posts" },
              ]}
              onTabChange={handleTabChange}
              className="w-full lg:w-auto"
            />
          </div>



          {/* ----- Search bar ----- */}
          <div className="lg:col-span-8 lg:mt-0">
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-full lg:max-w-[1200px]">
                <SearchBar
                  searchValue={searchValue}
                  setSearchValue={setSearchValue}
                  onSearch={() => { }} // Filters update automatically via hook
                  onClear={resetFilters}
                  ageOp={activeTab === "Users" ? ageOp : undefined}
                  setAgeOp={activeTab === "Users" ? setAgeOp : undefined}
                  ageVal={activeTab === "Users" ? ageVal : undefined}
                  setAgeVal={activeTab === "Users" ? setAgeVal : undefined}
                  hideAgeFilter={activeTab === "Posts"}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      <hr className="flex-grow border-t border-gray-200" />

      {/* ----- Conditional Table Rendering ----- */}
      <div className="mt-2">
        {activeTab === "Users" ? (
          <UsersTable
            filters={userFilters}
            sorting={usersSorting}
            onSortingChange={setUsersSorting}
            key={`users-${JSON.stringify(userFilters)}`}
          />
        ) : (
          <PostsTable
            filters={postFilters}
            sorting={postsSorting}
            onSortingChange={setPostsSorting}
            key={`posts-${JSON.stringify(postFilters)}`}
          />
        )}
      </div>

    </div>
  );
};
