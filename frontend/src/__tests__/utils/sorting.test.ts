import { describe, it, expect } from 'vitest';
import { stringSort } from '../../utils/sorting';
import type { Row } from '@tanstack/react-table';

// Minimal mock of TanStack Row
// This simulates how the table provides values for each column
function rowOf(value: Record<string, unknown>, columnId: string): Row<Record<string, unknown>> {
  const mock = {
    getValue: <TValue = unknown>(id: string) =>
      (id === columnId ? value[columnId] : undefined) as TValue,
  } satisfies Pick<Row<Record<string, unknown>>, 'getValue'>;

  return mock as Row<Record<string, unknown>>;
}

describe('stringSort', () => {
  //  Should ignore case and whitespace when comparing strings
  it('sorts case-insensitively and trims values', () => {
    const a = rowOf({ name: '  Alice ' }, 'name');
    const b = rowOf({ name: 'alice' }, 'name');
    expect(stringSort<Record<string, unknown>>(a, b, 'name')).toBe(0);
  });

  // Should handle undefined/null gracefully (treat as empty string)
  it('handles undefined/null by treating as empty string', () => {
    const a = rowOf({ name: undefined }, 'name');
    const b = rowOf({ name: 'b' }, 'name');
    // undefined (- '') < 'b', so result should be negative
    expect(stringSort<Record<string, unknown>>(a, b, 'name')).toBeLessThan(0);
  });

  // Should compare alphabetically regardless of letter casing
  it('orders different strings alphabetically regardless of case', () => {
    const a = rowOf({ name: 'banana' }, 'name');
    const b = rowOf({ name: 'Apple' }, 'name');
    // 'banana' > 'apple' alphabetically should be result positive
    expect(stringSort<Record<string, unknown>>(a, b, 'name')).toBeGreaterThan(0);
  });

  //  Should treat numeric-like strings as plain text, not numbers
  it('treats numeric-like values as strings', () => {
    const a = rowOf({ name: '10' }, 'name');
    const b = rowOf({ name: '2' }, 'name');
    // Lexicographically, '10' < '2' because '1' < '2'
    expect(stringSort<Record<string, unknown>>(a, b, 'name')).toBeLessThan(0);
  });

  //  Should trim spaces before comparing (whitespace shouldn’t affect equality)
  it('trims both sides so leading/trailing spaces do not affect order', () => {
    const a = rowOf({ name: '  Bob' }, 'name');
    const b = rowOf({ name: 'Bob   ' }, 'name');
    // Both trimmed - 'Bob' === 'Bob'
    expect(stringSort<Record<string, unknown>>(a, b, 'name')).toBe(0);
  });

  //  Should convert non-string values (like numbers) to strings before comparing
  it('coerces non-string values via toString', () => {
    const a = rowOf({ name: 123 }, 'name');
    const b = rowOf({ name: 45 }, 'name');
    // After toString - '123' vs '45', and '1' < '4' - result negative
    expect(stringSort<Record<string, unknown>>(a, b, 'name')).toBeLessThan(0);
  });

  //  Should rely on localeCompare to handle Unicode characters 
  it('handles Unicode and accents with localeCompare', () => {
    const a = rowOf({ name: 'café' }, 'name');
    const b = rowOf({ name: 'cafe' }, 'name');
    // localeCompare returns a number (<0, 0, >0)
    const res = stringSort<Record<string, unknown>>(a, b, 'name');
    expect(typeof res).toBe('number');
  });
});
