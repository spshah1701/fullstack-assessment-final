import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '../../components/table/Pagination';

describe('Pagination Component - User Interactions', () => {
  it('navigates to next page when Next button is clicked', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();

    render(
      <Pagination
        page={0}
        hasNextPage={true}
        onPrev={vi.fn()}
        onNext={onNext}
        onFirst={vi.fn()}
        onLast={vi.fn()}
      />
    );

    const nextButton = screen.getByTitle('Next page');
    await user.click(nextButton);

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('navigates to previous page when Previous button is clicked', async () => {
    const user = userEvent.setup();
    const onPrev = vi.fn();

    render(
      <Pagination
        page={2}
        hasNextPage={true}
        onPrev={onPrev}
        onNext={vi.fn()}
        onFirst={vi.fn()}
        onLast={vi.fn()}
      />
    );

    const prevButton = screen.getByTitle('Previous page');
    await user.click(prevButton);

    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('disables Previous and First buttons on first page', () => {
    render(
      <Pagination
        page={0}
        hasNextPage={true}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onFirst={vi.fn()}
        onLast={vi.fn()}
      />
    );

    const firstButton = screen.getByTitle('First page');
    const prevButton = screen.getByTitle('Previous page');

    expect(firstButton).toBeDisabled();
    expect(prevButton).toBeDisabled();
  });

  it('disables Next and Last buttons when there is no next page', () => {
    render(
      <Pagination
        page={5}
        hasNextPage={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onFirst={vi.fn()}
        onLast={vi.fn()}
      />
    );

    const nextButton = screen.getByTitle('Next page');
    const lastButton = screen.getByTitle('Last page');

    expect(nextButton).toBeDisabled();
    expect(lastButton).toBeDisabled();
  });

  it('navigates to first page when First button is clicked', async () => {
    const user = userEvent.setup();
    const onFirst = vi.fn();

    render(
      <Pagination
        page={3}
        hasNextPage={true}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onFirst={onFirst}
        onLast={vi.fn()}
      />
    );

    const firstButton = screen.getByTitle('First page');
    await user.click(firstButton);

    expect(onFirst).toHaveBeenCalledTimes(1);
  });

  it('displays correct page number', () => {
    render(
      <Pagination
        page={2}
        hasNextPage={true}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onFirst={vi.fn()}
        onLast={vi.fn()}
      />
    );

    expect(screen.getByText('Page 3')).toBeInTheDocument();
  });
});

