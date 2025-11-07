import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataTableFilters } from '../../hooks/useDataTableFilters';
import * as builders from '../../utils/filterBuilders';
import type { PostFilters } from '../../__generated__/graphql';

describe('useDataTableFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('builds post filters when activeTab is Posts', () => {
    const spy = vi
      .spyOn(builders, 'buildPostFilters')
      .mockReturnValue({ or: [] } satisfies PostFilters);
    const { result } = renderHook(() => useDataTableFilters('Posts'));

    // update search (debounced hook will call buildPostFilters via effect)
    act(() => {
      result.current.setSearchValue('hello');
    });

    // advance timers to flush debounce and effect
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('updates user filters only when age filter is complete', () => {
    const buildUserSpy = vi.spyOn(builders, 'buildUserFilters');

    const { result } = renderHook(() => useDataTableFilters('Users'));

    act(() => {
      result.current.setSearchValue('john');
    });
    // Initial debounce may trigger buildUserFilters with empty age; ignore it
    act(() => {
      vi.advanceTimersByTime(400);
    });
    buildUserSpy.mockClear();

    // Set operator only; since value missing, it should not trigger
    act(() => {
      result.current.setAgeOp('>=');
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(buildUserSpy).not.toHaveBeenCalled();

    act(() => {
      result.current.setAgeVal(30);
    });

    // Now age filter is complete; effect will trigger build after debounce
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(buildUserSpy).toHaveBeenCalled();
    buildUserSpy.mockRestore();
  });

  it('resetFilters clears state', () => {
    const { result } = renderHook(() => useDataTableFilters('Users'));
    act(() => {
      result.current.setSearchValue('x');
      result.current.setAgeOp('>');
      result.current.setAgeVal(10);
      result.current.resetFilters();
    });
    expect(result.current.searchValue).toBe('');
    expect(result.current.ageOp).toBe('');
    expect(result.current.ageVal).toBe('');
    expect(result.current.userFilters).toEqual({});
    expect(result.current.postFilters).toEqual({});
  });
});


