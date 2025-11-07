import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '../../components/table/Tabs';

describe('Tabs Component - User Interactions', () => {
  it('switches tabs when clicking on different tab buttons', async () => {
    const user = userEvent.setup();
    const handleTabChange = vi.fn();

    render(
      <Tabs
        activeTab="Users"
        tabs={[{ value: 'Users' }, { value: 'Posts' }]}
        onTabChange={handleTabChange}
      />
    );

    const postsTab = screen.getByRole('button', { name: 'Posts' });
    await user.click(postsTab);

    expect(handleTabChange).toHaveBeenCalledWith('Posts');
    expect(handleTabChange).toHaveBeenCalledTimes(1);
  });

  it('displays active tab with correct styling', () => {
    render(
      <Tabs
        activeTab="Posts"
        tabs={[{ value: 'Users' }, { value: 'Posts' }]}
        onTabChange={vi.fn()}
      />
    );

    const usersTab = screen.getByRole('button', { name: 'Users' });
    const postsTab = screen.getByRole('button', { name: 'Posts' });

    // Active tab should have white text - check the text span inside
    const postsTabText = postsTab.querySelector('span.font-bold');
    const usersTabText = usersTab.querySelector('span.font-bold');
    
    expect(postsTabText).toHaveClass('text-white');
    expect(usersTabText).toHaveClass('text-gray-700');
  });

  it('calls onTabChange when clicking the same tab', async () => {
    const user = userEvent.setup();
    const handleTabChange = vi.fn();

    render(
      <Tabs
        activeTab="Users"
        tabs={[{ value: 'Users' }, { value: 'Posts' }]}
        onTabChange={handleTabChange}
      />
    );

    const usersTab = screen.getByRole('button', { name: 'Users' });
    await user.click(usersTab);

    expect(handleTabChange).toHaveBeenCalledWith('Users');
  });
});

