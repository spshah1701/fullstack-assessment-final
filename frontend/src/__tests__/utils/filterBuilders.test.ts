import { describe, it, expect } from 'vitest';
import { buildAgeCondition, buildPostFilters, buildUserFilters, isAgeFilterComplete } from '../../utils/filterBuilders';

describe('filterBuilders', () => {
  it('buildAgeCondition maps operators correctly', () => {
    expect(buildAgeCondition('=', 10)).toEqual({ equals: 10 });
    expect(buildAgeCondition('>=', 10)).toEqual({ gte: 10 });
    expect(buildAgeCondition('>', 10)).toEqual({ gt: 10 });
    expect(buildAgeCondition('<=', 10)).toEqual({ lte: 10 });
    expect(buildAgeCondition('<', 10)).toEqual({ lt: 10 });
    expect(buildAgeCondition('', 10)).toBeNull();
  });

  it('buildPostFilters returns empty for blank search', () => {
    expect(buildPostFilters('')).toEqual({});
    expect(buildPostFilters('   ')).toEqual({});
  });

  it('buildPostFilters returns OR filter for title and content', () => {
    expect(buildPostFilters('hello')).toEqual({
      or: [
        { title: { containsInsensitive: 'hello' } },
        { content: { containsInsensitive: 'hello' } },
      ],
    });
  });

  it('buildPostFilters trims whitespace in search', () => {
    expect(buildPostFilters('  news  ')).toEqual({
      or: [
        { title: { containsInsensitive: 'news' } },
        { content: { containsInsensitive: 'news' } },
      ],
    });
  });

  it('buildUserFilters combines search and age with AND when both present', () => {
    const result = buildUserFilters('john', '>=', 30);
    expect(result).toEqual({
      and: [
        { age: { gte: 30 } },
        {
          or: [
            { name: { containsInsensitive: 'john' } },
            { email: { containsInsensitive: 'john' } },
            { phone: { containsInsensitive: 'john' } },
          ],
        },
      ],
    });
  });

  it('buildUserFilters returns only age when search missing', () => {
    expect(buildUserFilters('', '>', 20)).toEqual({ age: { gt: 20 } });
  });

  it('buildUserFilters returns only search when age missing/incomplete', () => {
    expect(buildUserFilters('abc', '', '')).toEqual({
      or: [
        { name: { containsInsensitive: 'abc' } },
        { email: { containsInsensitive: 'abc' } },
        { phone: { containsInsensitive: 'abc' } },
      ],
    });
  });

  it('buildUserFilters returns empty object when both search and age missing', () => {
    expect(buildUserFilters('', '', '')).toEqual({});
    expect(buildUserFilters('   ', undefined, undefined)).toEqual({});
  });

  it('buildUserFilters trims search input', () => {
    expect(buildUserFilters('  john  ', undefined, undefined)).toEqual({
      or: [
        { name: { containsInsensitive: 'john' } },
        { email: { containsInsensitive: 'john' } },
        { phone: { containsInsensitive: 'john' } },
      ],
    });
  });

  // Coerces string numbers to numeric age
  it('buildUserFilters accepts string age numbers by coercion', () => {
    const result = buildUserFilters('john', '>=', '30' as unknown as number);
    expect(result).toEqual({
      and: [
        { age: { gte: 30 } },
        {
          or: [
            { name: { containsInsensitive: 'john' } },
            { email: { containsInsensitive: 'john' } },
            { phone: { containsInsensitive: 'john' } },
          ],
        },
      ],
    });
  });

  it('buildUserFilters ignores non-numeric age values', () => {
    // non-numeric string should be ignored; search filter remains
    expect(buildUserFilters('john', '>=', 'abc' as unknown as number)).toEqual({
      or: [
        { name: { containsInsensitive: 'john' } },
        { email: { containsInsensitive: 'john' } },
        { phone: { containsInsensitive: 'john' } },
      ],
    });
  });

  it('isAgeFilterComplete validates operator and value presence', () => {
    expect(isAgeFilterComplete('>=', 10)).toBe(true);
    expect(isAgeFilterComplete('', 10)).toBe(false);
    expect(isAgeFilterComplete('>=', '')).toBe(false);
  });

  // Boundary tests for age range
  describe('Age filter boundary testing', () => {
    describe('Boundary value equality tests (6 cases)', () => {
      it('rejects -1 (below minimum)', () => {
        // -1 should be rejected and not create an age filter
        const result = buildUserFilters('', '=', -1);
        expect(result).toEqual({});
      });

      it('accepts 0 (minimum valid)', () => {
        // 0 should be accepted
        const result = buildUserFilters('', '=', 0);
        expect(result).toEqual({ age: { equals: 0 } });
      });

      it('accepts 1 (above minimum)', () => {
        // 1 should be accepted
        const result = buildUserFilters('', '=', 1);
        expect(result).toEqual({ age: { equals: 1 } });
      });

      it('accepts 149 (below maximum)', () => {
        // 149 should be accepted
        const result = buildUserFilters('', '=', 149);
        expect(result).toEqual({ age: { equals: 149 } });
      });

      it('accepts 150 (maximum valid)', () => {
        // 150 should be accepted
        const result = buildUserFilters('', '=', 150);
        expect(result).toEqual({ age: { equals: 150 } });
      });

      it('rejects 151 (above maximum)', () => {
        // 151 should be rejected and not create an age filter
        const result = buildUserFilters('', '=', 151);
        expect(result).toEqual({});
      });
    });

    describe('Boundary values with search query', () => {
      it('combines valid boundary value (0) with search', () => {
        const result = buildUserFilters('john', '>=', 0);
        expect(result).toEqual({
          and: [
            { age: { gte: 0 } },
            {
              or: [
                { name: { containsInsensitive: 'john' } },
                { email: { containsInsensitive: 'john' } },
                { phone: { containsInsensitive: 'john' } },
              ],
            },
          ],
        });
      });

      it('combines valid boundary value (150) with search', () => {
        const result = buildUserFilters('john', '<=', 150);
        expect(result).toEqual({
          and: [
            { age: { lte: 150 } },
            {
              or: [
                { name: { containsInsensitive: 'john' } },
                { email: { containsInsensitive: 'john' } },
                { phone: { containsInsensitive: 'john' } },
              ],
            },
          ],
        });
      });

    });
  });
});


