import { describe, it, expect, vi } from 'vitest';
import type { Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTableQuery } from '../../hooks/useTableQuery';
import type { DocumentNode } from 'graphql';

// Mock Apollo useQuery
vi.mock('@apollo/client/react', async () => {
    return {
        useQuery: vi.fn(),
    };
});

import { useQuery } from '@apollo/client/react';

describe('useTableQuery', () => {
    it('slices data to pageSize and computes hasNextPage', () => {
        (useQuery as unknown as Mock).mockReturnValue({
            data: { items: [1, 2, 3, 4] },
            loading: false,
            error: null,
            refetch: vi.fn(),
        });

        const query = {} as DocumentNode;

        const { result } = renderHook(() =>
            useTableQuery<{ items: number[] }, { foo: string }, number>({
                query,
                variables: { foo: 'bar' },
                page: 0,
                pageSize: 3,
                onDataCountChange: () => { },
                dataExtractor: (d) => d.items,
            })
        );

        expect(result.current.data).toEqual([1, 2, 3]);
        expect(result.current.hasNextPage).toBe(true); // 4 items > pageSize 3
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('computes totalCount and triggers onTotalCountChange only when changed', () => {
        const refetch = vi.fn();
        const mockReturn = {
            data: { items: [1, 2], total: 10 },
            loading: false,
            error: null,
            refetch,
        };
        (useQuery as unknown as Mock).mockReturnValue(mockReturn);

        const onTotalCountChange = vi.fn();
        const onDataCountChange = vi.fn();

        const query = {} as DocumentNode;

        const { result, rerender } = renderHook(() =>
            useTableQuery<{ items: number[]; total: number }, Record<string, never>, number>({
                query,
                variables: {},
                page: 0,
                pageSize: 2,
                onDataCountChange,
                dataExtractor: (d) => d.items,
                totalCountExtractor: (d) => d.total,
                onTotalCountChange,
            }),
            { initialProps: { total: 10 } }
        );

        expect(result.current.totalCount).toBe(10);
        expect(onTotalCountChange).toHaveBeenCalledWith(10);
        expect(onDataCountChange).toHaveBeenCalledWith(2);

        // Rerender with same total should not call again
        (useQuery as unknown as Mock).mockReturnValue(mockReturn);
        rerender({ total: 10 });
        expect(onTotalCountChange).toHaveBeenCalledTimes(1);
    });

    it('does not call callbacks again when counts stay the same but data changes', () => {
        // First run: 2 items, total 10
        const refetch1 = vi.fn();
        const first = {
            data: { items: [1, 2], total: 10 },
            loading: false,
            error: null,
            refetch: refetch1,
        };
        // Second run: different items, same lengths and total
        const refetch2 = vi.fn();
        const second = {
            data: { items: [99, 100], total: 10 },
            loading: false,
            error: null,
            refetch: refetch2,
        };

        (useQuery as unknown as Mock).mockReset();
        (useQuery as unknown as Mock)
            .mockReturnValueOnce(first)
            .mockReturnValueOnce(second);

        const onTotalCountChange = vi.fn();
        const onDataCountChange = vi.fn();

        const query = {} as DocumentNode;

        const { rerender } = renderHook(() =>
            useTableQuery<{ items: number[]; total: number }, Record<string, never>, number>({
                query,
                variables: {},
                page: 0,
                pageSize: 2,
                onDataCountChange,
                dataExtractor: (d) => d.items,
                totalCountExtractor: (d) => d.total,
                onTotalCountChange,
            })
        );

        // After first render
        expect(onDataCountChange).toHaveBeenCalledWith(2);
        expect(onTotalCountChange).toHaveBeenCalledWith(10);
        onDataCountChange.mockClear();
        onTotalCountChange.mockClear();

        // Rerender (mock provides different items but same counts)
        rerender({});
        expect(onDataCountChange).not.toHaveBeenCalled();
        expect(onTotalCountChange).not.toHaveBeenCalled();
    });

    it('calls callbacks when refetch changes counts', async () => {
        // Initial data: 2 items, total 10
        const refetch = vi.fn();
        const first = {
            data: { items: [1, 2], total: 10 },
            loading: false,
            error: null,
            refetch,
        };

        // After refetch: 3 items, total 12
        const second = {
            data: { items: [1, 2, 3], total: 12 },
            loading: false,
            error: null,
            refetch: vi.fn(),
        };

        (useQuery as unknown as Mock).mockReset();
        (useQuery as unknown as Mock)
            .mockReturnValueOnce(first) // initial render
            .mockReturnValueOnce(second); // after refetch + rerender

        const onTotalCountChange = vi.fn();
        const onDataCountChange = vi.fn();

        const query = {} as DocumentNode;

        const { result, rerender } = renderHook(() =>
            useTableQuery<{ items: number[]; total: number }, Record<string, never>, number>({
                query,
                variables: {},
                page: 0,
                pageSize: 3,
                onDataCountChange,
                dataExtractor: (d) => d.items,
                totalCountExtractor: (d) => d.total,
                onTotalCountChange,
            })
        );

        // Initial notifications
        expect(onDataCountChange).toHaveBeenCalledWith(2);
        expect(onTotalCountChange).toHaveBeenCalledWith(10);
        onDataCountChange.mockClear();
        onTotalCountChange.mockClear();

        // Trigger refetch and rerender with the new mocked result
        await result.current.refetch();
        rerender({});

        expect(onDataCountChange).toHaveBeenCalledWith(3);
        expect(onTotalCountChange).toHaveBeenCalledWith(12);
    });
});


