import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GitHubIssueDetailPanel } from './GitHubIssueDetailPanel';
import {
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../mocks/panelContext';
import type { GitHubIssue } from '../types/github';

// Mock issue data
const mockIssue: GitHubIssue = {
  id: 1,
  number: 128,
  title: 'Improve login flow UX',
  state: 'open',
  body: `The current login flow is confusing for new users. We should:

## Problems

1. Error messages are not clear enough
2. OAuth failures don't show retry options
3. No loading state during authentication

## Proposed Solution

- Add clearer error messages with specific guidance
- Implement a retry button for OAuth failures
- Show loading state during authentication

## Acceptance Criteria

- [ ] Error messages are user-friendly
- [ ] Retry button appears on OAuth failure
- [ ] Loading spinner shows during auth

This will help reduce support tickets related to login issues.`,
  html_url: 'https://github.com/acme/web-app/issues/128',
  created_at: '2024-12-10T10:30:00Z',
  updated_at: '2024-12-11T14:00:00Z',
  labels: [
    { id: 1, name: 'enhancement', color: 'a2eeef' },
    { id: 2, name: 'ux', color: '7057ff' },
    { id: 3, name: 'priority: medium', color: 'fbca04' },
  ],
  comments: 3,
  user: {
    login: 'johndoe',
    avatar_url: 'https://avatars.githubusercontent.com/u/1234567',
  },
  assignees: [
    {
      login: 'janedoe',
      avatar_url: 'https://avatars.githubusercontent.com/u/7654321',
    },
    {
      login: 'bobsmith',
      avatar_url: 'https://avatars.githubusercontent.com/u/9876543',
    },
  ],
};

const closedIssue: GitHubIssue = {
  ...mockIssue,
  id: 2,
  number: 125,
  title: 'Update documentation for API v2',
  state: 'closed',
  body: 'Documentation needs to be updated to reflect the changes in API v2.\n\nThis includes updating all endpoint descriptions and adding new examples.',
  labels: [{ id: 6, name: 'documentation', color: '0075ca' }],
  comments: 2,
  assignees: [],
};

// Wrapper component that emits issue:selected event on mount
const IssueDetailWithSelectedIssue: React.FC<{
  issue: GitHubIssue;
  owner: string;
  repo: string;
  context: ReturnType<typeof createMockContext>;
  actions: ReturnType<typeof createMockActions>;
  events: ReturnType<typeof createMockEvents>;
}> = ({ issue, owner, repo, context, actions, events }) => {
  useEffect(() => {
    // Emit issue:selected event after a short delay to ensure component has mounted
    const timer = setTimeout(() => {
      events.emit({
        type: 'issue:selected',
        source: 'storybook',
        timestamp: Date.now(),
        payload: { issue, owner, repo },
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [issue, owner, repo, events]);

  return <GitHubIssueDetailPanel context={context} actions={actions} events={events} />;
};

/**
 * GitHubIssueDetailPanel displays detailed information about a selected GitHub issue.
 * It listens for 'issue:selected' events from other panels (like GitHubIssuesPanel).
 */
const meta = {
  title: 'Panels/GitHubIssueDetailPanel',
  component: GitHubIssueDetailPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A panel for viewing detailed GitHub issue information. Works with GitHubIssuesPanel via events.

**Features:**
- Shows issue title, status, and metadata (author, date, comments)
- Displays all labels
- Renders issue body with markdown support
- Shows assignees
- Link to view on GitHub

**Events listened:**
- \`issue:selected\` - When user selects an issue in GitHubIssuesPanel

**Events emitted:**
- \`issue:deselected\` - When user clicks back button
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', background: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GitHubIssueDetailPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultMocks = {
  context: createMockContext(),
  actions: createMockActions(),
  events: createMockEvents(),
};

/**
 * Empty state - no issue selected
 */
export const EmptyState: Story = {
  args: {
    context: createMockContext(),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Open issue with full details
 */
export const OpenIssue: Story = {
  args: defaultMocks,
  render: (args) => (
    <IssueDetailWithSelectedIssue
      issue={mockIssue}
      owner="acme"
      repo="web-app"
      context={args.context}
      actions={args.actions}
      events={args.events}
    />
  ),
};

/**
 * Closed issue
 */
export const ClosedIssue: Story = {
  args: defaultMocks,
  render: (args) => (
    <IssueDetailWithSelectedIssue
      issue={closedIssue}
      owner="acme"
      repo="web-app"
      context={args.context}
      actions={args.actions}
      events={args.events}
    />
  ),
};

/**
 * Issue without body
 */
export const NoBody: Story = {
  args: defaultMocks,
  render: (args) => (
    <IssueDetailWithSelectedIssue
      issue={{ ...mockIssue, body: null }}
      owner="acme"
      repo="web-app"
      context={args.context}
      actions={args.actions}
      events={args.events}
    />
  ),
};

/**
 * Issue without assignees
 */
export const NoAssignees: Story = {
  args: defaultMocks,
  render: (args) => (
    <IssueDetailWithSelectedIssue
      issue={{ ...mockIssue, assignees: [] }}
      owner="acme"
      repo="web-app"
      context={args.context}
      actions={args.actions}
      events={args.events}
    />
  ),
};

/**
 * Issue with many labels
 */
export const ManyLabels: Story = {
  args: defaultMocks,
  render: (args) => (
    <IssueDetailWithSelectedIssue
      issue={{
        ...mockIssue,
        labels: [
          { id: 1, name: 'enhancement', color: 'a2eeef' },
          { id: 2, name: 'ux', color: '7057ff' },
          { id: 3, name: 'priority: medium', color: 'fbca04' },
          { id: 4, name: 'needs-review', color: '0e8a16' },
          { id: 5, name: 'frontend', color: '1d76db' },
          { id: 6, name: 'v2.0', color: 'd4c5f9' },
          { id: 7, name: 'breaking-change', color: 'd73a4a' },
        ],
      }}
      owner="acme"
      repo="web-app"
      context={args.context}
      actions={args.actions}
      events={args.events}
    />
  ),
};

/**
 * Compact layout (narrow panel)
 */
export const CompactLayout: Story = {
  args: defaultMocks,
  render: (args) => (
    <IssueDetailWithSelectedIssue
      issue={mockIssue}
      owner="acme"
      repo="web-app"
      context={args.context}
      actions={args.actions}
      events={args.events}
    />
  ),
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '350px', background: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Wide layout
 */
export const WideLayout: Story = {
  args: defaultMocks,
  render: (args) => (
    <IssueDetailWithSelectedIssue
      issue={mockIssue}
      owner="acme"
      repo="web-app"
      context={args.context}
      actions={args.actions}
      events={args.events}
    />
  ),
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '800px', background: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
};
