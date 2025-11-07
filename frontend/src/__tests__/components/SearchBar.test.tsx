import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../../components/table/SearchBar';

describe('SearchBar Component - User Interactions', () => {
  it('updates search input value as user types', async () => {
    const user = userEvent.setup();
    const setSearchValue = vi.fn();

    render(
      <SearchBar
        searchValue=""
        setSearchValue={setSearchValue}
        onSearch={vi.fn()}
        onClear={vi.fn()}
        hideAgeFilter={true}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search posts by title/i);
    await user.type(searchInput, 'test query');

    expect(setSearchValue).toHaveBeenCalledTimes(10); // Called for each character
  });

  it('clears search and filters when Clear button is clicked', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const setSearchValue = vi.fn();
    const setAgeOp = vi.fn();
    const setAgeVal = vi.fn();

    render(
      <SearchBar
        searchValue="test query"
        setSearchValue={setSearchValue}
        onSearch={vi.fn()}
        onClear={onClear}
        ageOp=">="
        setAgeOp={setAgeOp}
        ageVal={25}
        setAgeVal={setAgeVal}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(setSearchValue).toHaveBeenCalledWith('');
    expect(setAgeOp).toHaveBeenCalledWith('');
    expect(setAgeVal).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('updates age filter operator when selecting from dropdown', async () => {
    const user = userEvent.setup();
    const setAgeOp = vi.fn();

    render(
      <SearchBar
        searchValue=""
        setSearchValue={vi.fn()}
        onSearch={vi.fn()}
        onClear={vi.fn()}
        ageOp=""
        setAgeOp={setAgeOp}
        ageVal=""
        setAgeVal={vi.fn()}
      />
    );

    const ageOperatorSelects = screen.getAllByRole('combobox');
    const ageOperatorSelect = ageOperatorSelects[0];
    await user.selectOptions(ageOperatorSelect, '>=');

    expect(setAgeOp).toHaveBeenCalledWith('>=');
  });

  it('validates age input and prevents invalid values', async () => {
    const user = userEvent.setup();
    const setAgeVal = vi.fn();

    render(
      <SearchBar
        searchValue=""
        setSearchValue={vi.fn()}
        onSearch={vi.fn()}
        onClear={vi.fn()}
        ageOp=">="
        setAgeOp={vi.fn()}
        ageVal=""
        setAgeVal={setAgeVal}
      />
    );

    // The SearchBar component has TWO age inputs for responsive design:
    // 1. Desktop/Tablet version (hidden md:flex) - visible on medium+ screens
    // 2. Mobile version (flex md:hidden) - visible on small screens
    // Both are rendered in the DOM during tests, so 2 elements are found
    const ageInputs = screen.getAllByPlaceholderText('Age');
    
    // Both inputs share the same state, so either one can be used
    // Use the first enabled input (both should be enabled when ageOp is set)
    const ageInput = ageInputs.find(input => !(input as HTMLInputElement).disabled) || ageInputs[0];
    
    // Type an invalid age (e.g., 180)
    await user.type(ageInput, '180');

    // The component caps values at 150 
    // Check that setAgeVal was called and the last call is <= 150
    expect(setAgeVal).toHaveBeenCalled();
    const calls = setAgeVal.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toBeLessThanOrEqual(150);
  });
});

