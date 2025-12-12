import type { Meta, StoryObj } from '@storybook/react-vite';
import { GitHubIssuesPanel } from './GitHubIssuesPanel';
import {
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../mocks/panelContext';
import type { DataSlice } from '../types';
import type { GitHubIssuesSliceData, GitHubIssue } from '../types/github';

// Mock issue data
const mockIssues: GitHubIssue[] = [
  {
    id: 1,
    number: 128,
    title: 'Improve login flow UX',
    state: 'open',
    body: 'The current login flow is confusing for new users. We should:\n\n1. Add clearer error messages\n2. Implement a retry button for OAuth failures\n3. Show loading state during authentication\n\nThis will help reduce support tickets related to login issues.',
    html_url: 'https://github.com/acme/web-app/issues/128',
    created_at: '2024-12-10T10:30:00Z',
    updated_at: '2024-12-11T14:00:00Z',
    labels: [
      { id: 1, name: 'enhancement', color: 'a2eeef' },
      { id: 2, name: 'ux', color: '7057ff' },
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
    ],
  },
  {
    id: 2,
    number: 127,
    title: 'Fix memory leak in dashboard component',
    state: 'open',
    body: 'Memory usage increases over time when the dashboard is open. Suspected cause is event listeners not being cleaned up properly.',
    html_url: 'https://github.com/acme/web-app/issues/127',
    created_at: '2024-12-09T16:45:00Z',
    updated_at: '2024-12-10T09:00:00Z',
    labels: [
      { id: 3, name: 'bug', color: 'd73a4a' },
      { id: 4, name: 'priority: high', color: 'b60205' },
    ],
    comments: 5,
    user: {
      login: 'alice',
      avatar_url: 'https://avatars.githubusercontent.com/u/2345678',
    },
    assignees: [],
  },
  {
    id: 3,
    number: 126,
    title: 'Add dark mode support',
    state: 'open',
    body: 'Users have requested dark mode support for the application. This should respect system preferences and allow manual override.',
    html_url: 'https://github.com/acme/web-app/issues/126',
    created_at: '2024-12-08T11:00:00Z',
    updated_at: '2024-12-08T11:00:00Z',
    labels: [
      { id: 1, name: 'enhancement', color: 'a2eeef' },
      { id: 5, name: 'good first issue', color: '7ee57e' },
    ],
    comments: 12,
    user: {
      login: 'bob',
      avatar_url: 'https://avatars.githubusercontent.com/u/3456789',
    },
    assignees: [],
  },
  {
    id: 4,
    number: 125,
    title: 'Update documentation for API v2',
    state: 'closed',
    body: 'Documentation needs to be updated to reflect the changes in API v2.',
    html_url: 'https://github.com/acme/web-app/issues/125',
    created_at: '2024-12-01T09:00:00Z',
    updated_at: '2024-12-07T17:30:00Z',
    labels: [
      { id: 6, name: 'documentation', color: '0075ca' },
    ],
    comments: 2,
    user: {
      login: 'charlie',
      avatar_url: 'https://avatars.githubusercontent.com/u/4567890',
    },
    assignees: [
      {
        login: 'charlie',
        avatar_url: 'https://avatars.githubusercontent.com/u/4567890',
      },
    ],
  },
  {
    id: 5,
    number: 124,
    title: 'Implement rate limiting',
    state: 'closed',
    body: 'Add rate limiting to prevent API abuse.',
    html_url: 'https://github.com/acme/web-app/issues/124',
    created_at: '2024-11-25T14:00:00Z',
    updated_at: '2024-12-05T10:00:00Z',
    labels: [
      { id: 7, name: 'security', color: 'd93f0b' },
    ],
    comments: 8,
    user: {
      login: 'johndoe',
      avatar_url: 'https://avatars.githubusercontent.com/u/1234567',
    },
    assignees: [],
  },
];

/**
 * GitHubIssuesPanel displays GitHub issues for a repository
 * with filtering, selection, and copy-to-prompt functionality.
 */
const meta = {
  title: 'Panels/GitHubIssuesPanel',
  component: GitHubIssuesPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A panel for viewing and managing GitHub repository issues. Features include:
- **Filter by state**: View open, closed, or all issues
- **Selection**: Select individual or all issues
- **Copy to prompt**: Generate an AI-friendly prompt from selected issues
- **Issue detail modal**: View full issue details including description
- **External links**: Open issues directly on GitHub

Required data slice: \`github-issues\` (GitHubIssuesSliceData)

Events emitted:
- \`github-issues:request\` - Request issues for current repository
- \`github-issues:refresh\` - Refresh issues data
- \`issue:selected\` - When user selects an issue
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
} satisfies Meta<typeof GitHubIssuesPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Helper to create context with GitHub issues slice
 */
const createIssuesContext = (
  issues: GitHubIssue[],
  options: {
    owner?: string;
    repo?: string;
    isAuthenticated?: boolean;
    loading?: boolean;
    error?: string;
  } = {}
) => {
  const {
    owner = 'acme',
    repo = 'web-app',
    isAuthenticated = true,
    loading = false,
    error,
  } = options;

  const sliceData: GitHubIssuesSliceData = {
    issues,
    owner,
    repo,
    isAuthenticated,
    error,
  };

  const issuesSlice: DataSlice<GitHubIssuesSliceData> = {
    scope: 'repository',
    name: 'github-issues',
    data: sliceData,
    loading,
    error: error ? new Error(error) : null,
    refresh: async () => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Refreshing GitHub issues...');
    },
  };

  const slices = new Map<string, DataSlice>();
  slices.set('github-issues', issuesSlice as DataSlice);

  return createMockContext({
    slices,
    getSlice: <T,>(name: string) => {
      if (name === 'github-issues') {
        return issuesSlice as unknown as DataSlice<T>;
      }
      return undefined;
    },
    hasSlice: (name: string) => name === 'github-issues',
    isSliceLoading: (name: string) => name === 'github-issues' && loading,
  });
};

/**
 * Default state with open and closed issues
 */
export const Default: Story = {
  args: {
    context: createIssuesContext(mockIssues),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Loading state while fetching issues
 */
export const Loading: Story = {
  args: {
    context: createIssuesContext([], { loading: true }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Not authenticated - prompts user to sign in
 */
export const NotAuthenticated: Story = {
  args: {
    context: createIssuesContext([], { isAuthenticated: false }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Error state - failed to load issues
 */
export const ErrorState: Story = {
  args: {
    context: createIssuesContext([], {
      error: 'Failed to fetch issues. Please check your network connection and try again.',
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * No repository selected
 */
export const NoRepository: Story = {
  args: {
    context: createIssuesContext([], { owner: '', repo: '' }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * No issues in repository
 */
export const EmptyIssues: Story = {
  args: {
    context: createIssuesContext([]),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Only open issues
 */
export const OnlyOpenIssues: Story = {
  args: {
    context: createIssuesContext(mockIssues.filter((i) => i.state === 'open')),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Only closed issues
 */
export const OnlyClosedIssues: Story = {
  args: {
    context: createIssuesContext(mockIssues.filter((i) => i.state === 'closed')),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Many issues - tests scrolling
 */
export const ManyIssues: Story = {
  args: {
    context: createIssuesContext([
      ...mockIssues,
      ...mockIssues.map((issue, i) => ({
        ...issue,
        id: issue.id + 100 + i,
        number: issue.number + 10 + i,
        title: `${issue.title} (copy ${i + 1})`,
      })),
      ...mockIssues.map((issue, i) => ({
        ...issue,
        id: issue.id + 200 + i,
        number: issue.number + 20 + i,
        title: `${issue.title} (variant ${i + 1})`,
      })),
    ]),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Issues with many labels
 */
export const ManyLabels: Story = {
  args: {
    context: createIssuesContext([
      {
        ...mockIssues[0],
        labels: [
          { id: 1, name: 'enhancement', color: 'a2eeef' },
          { id: 2, name: 'ux', color: '7057ff' },
          { id: 3, name: 'priority: medium', color: 'fbca04' },
          { id: 4, name: 'needs-review', color: '0e8a16' },
          { id: 5, name: 'frontend', color: '1d76db' },
          { id: 6, name: 'v2.0', color: 'd4c5f9' },
        ],
      },
    ]),
    actions: createMockActions(),
    events: createMockEvents(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Issue with many labels - shows truncation (max 3 visible).',
      },
    },
  },
};

/**
 * Interactive with event logging
 */
export const Interactive: Story = {
  args: {
    context: createIssuesContext(mockIssues),
    actions: createMockActions(),
    events: (() => {
      const mockEvents = createMockEvents();
      const originalEmit = mockEvents.emit;
      mockEvents.emit = (event) => {
        // eslint-disable-next-line no-console
        console.log('Event emitted:', event);
        if (event.type === 'issue:selected') {
          const payload = event.payload as { issue: GitHubIssue };
          // eslint-disable-next-line no-console
          console.log(`Selected issue: #${payload.issue.number} - ${payload.issue.title}`);
        }
        originalEmit(event);
      };
      return mockEvents;
    })(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo with event logging. Click issues and check the console/Actions panel to see emitted events.',
      },
    },
  },
};

/**
 * Compact layout (narrow panel) - simulates a sidebar view
 */
export const CompactLayout: Story = {
  args: {
    context: createIssuesContext(mockIssues),
    actions: createMockActions(),
    events: createMockEvents(),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '350px', background: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Narrow panel layout for sidebar use.',
      },
    },
  },
};

/**
 * Wide layout - simulates a main panel view
 */
export const WideLayout: Story = {
  args: {
    context: createIssuesContext(mockIssues),
    actions: createMockActions(),
    events: createMockEvents(),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '800px', background: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Wide panel layout for main content area.',
      },
    },
  },
};
