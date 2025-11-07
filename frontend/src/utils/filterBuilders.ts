/**
 * Utility functions for building GraphQL filter objects
 */

import type { UserFilters, PostFilters, IntFilter } from "../__generated__/graphql";
import type { AgeOperator } from "../types/filters";

/**
 * Builds an IntFilter condition based on the selected operator and value
 */
export function buildAgeCondition(
  op: AgeOperator,
  value: number
): IntFilter | null {
  switch (op) {
    case "=":
      return { equals: value };
    case ">=":
      return { gte: value };
    case ">":
      return { gt: value };
    case "<=":
      return { lte: value };
    case "<":
      return { lt: value };
    default:
      return null;
  }
}

/**
 * Builds PostFilters from search query
 * Searches in both title and content fields
 */
export function buildPostFilters(searchQuery: string): PostFilters {
  const trimmedQuery = searchQuery.trim();
  
  if (!trimmedQuery) {
    return {};
  }

  return {
    or: [
      { title: { containsInsensitive: trimmedQuery } },
      { content: { containsInsensitive: trimmedQuery } },
    ],
  };
}

/**
 * Builds UserFilters from search query and optional age filter
 */
export function buildUserFilters(
  searchQuery: string,
  ageOperator?: AgeOperator,
  ageValue?: number | ""
): UserFilters {
  const trimmedQuery = searchQuery.trim();
  
  // Build search filter for name, email, or phone
  const searchFilter: UserFilters | null = trimmedQuery
    ? {
        or: [
          { name: { containsInsensitive: trimmedQuery } },
          { email: { containsInsensitive: trimmedQuery } },
          { phone: { containsInsensitive: trimmedQuery } },
        ],
      }
    : null;

  // Build age filter if both operator and value are provided
  let ageFilter: UserFilters | null = null;
  if (ageOperator && ageValue !== "" && ageValue !== null && ageValue !== undefined) {
    const numericValue = typeof ageValue === "string" ? Number(ageValue) : ageValue;
    
    // Validate age is within valid range (0-150)
    if (!isNaN(numericValue) && typeof numericValue === "number" && numericValue >= 0 && numericValue <= 150) {
      const ageCondition = buildAgeCondition(ageOperator, numericValue);
      if (ageCondition) {
        ageFilter = { age: ageCondition };
      }
    }
  }

  // Combine filters: if both exist, use AND; otherwise use whichever exists
  if (ageFilter && searchFilter) {
    return { and: [ageFilter, searchFilter] };
  }
  
  if (ageFilter) {
    return ageFilter;
  }
  
  if (searchFilter) {
    return searchFilter;
  }

  return {};
}

/**
 * Validates if age filter is complete (operator and value both set)
 */
export function isAgeFilterComplete(
  operator: AgeOperator,
  value: number | ""
): boolean {
  return operator !== "" && value !== "" && value !== null && value !== undefined;
}

