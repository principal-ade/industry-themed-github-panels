import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GitHubMessagesPanel } from './GitHubMessagesPanel';
import {
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../mocks/panelContext';
import type {
  GitHubMessagesSliceData,
  GitHubTimelineCommentEvent,
  GitHubTimelineReviewEvent,
  GitHubTimelineCommitEvent,
  GitHubTimelineLabelEvent,
  GitHubTimelineAssignEvent,
  GitHubTimelineMergeEvent,
  GitHubTimelineStateEvent,
  GitHubTimelineReviewRequestEvent,
  GitHubReviewComment,
  GitHubIssueUser,
} from '../types/github';

// Mock users
const mockUsers: Record<string, GitHubIssueUser> = {
  alice: {
    login: 'alice',
    avatar_url: 'https://avatars.githubusercontent.com/u/1234567',
  },
  bob: {
    login: 'bob',
    avatar_url: 'https://avatars.githubusercontent.com/u/2345678',
  },
  charlie: {
    login: 'charlie',
    avatar_url: 'https://avatars.githubusercontent.com/u/3456789',
  },
  vercelBot: {
    login: 'vercel[bot]',
    avatar_url: 'https://avatars.githubusercontent.com/in/8329?v=4',
  },
};

// Mock timeline events
const mockComment1: GitHubTimelineCommentEvent = {
  event: 'commented',
  id: 1001,
  node_id: 'IC_1001',
  url: 'https://api.github.com/repos/acme/web-app/issues/comments/1001',
  html_url: 'https://github.com/acme/web-app/pull/42#issuecomment-1001',
  body: `Great start on this PR! I have a few suggestions:

1. Consider adding error handling for the edge case when \`user\` is null
2. The loading state could use a spinner instead of just text

\`\`\`typescript
if (!user) {
  throw new UserNotFoundError('User not found');
}
\`\`\`

Otherwise, looks good to me!`,
  user: mockUsers.bob,
  actor: mockUsers.bob,
  created_at: '2024-12-10T14:30:00Z',
  updated_at: '2024-12-10T14:30:00Z',
  author_association: 'MEMBER',
  reactions: {
    url: '',
    total_count: 3,
    '+1': 2,
    '-1': 0,
    laugh: 0,
    hooray: 0,
    confused: 0,
    heart: 1,
    rocket: 0,
    eyes: 0,
  },
};

const mockReviewApproved: GitHubTimelineReviewEvent = {
  event: 'reviewed',
  id: 2001,
  node_id: 'PRR_2001',
  user: mockUsers.charlie,
  body: 'LGTM! Great work on the refactoring.',
  state: 'approved',
  html_url: 'https://github.com/acme/web-app/pull/42#pullrequestreview-2001',
  pull_request_url: 'https://api.github.com/repos/acme/web-app/pulls/42',
  submitted_at: '2024-12-11T09:15:00Z',
  commit_id: 'abc123def456',
  author_association: 'CONTRIBUTOR',
};

const mockReviewChangesRequested: GitHubTimelineReviewEvent = {
  event: 'reviewed',
  id: 2002,
  node_id: 'PRR_2002',
  user: mockUsers.bob,
  body: 'Please address the type safety issues before merging.',
  state: 'changes_requested',
  html_url: 'https://github.com/acme/web-app/pull/42#pullrequestreview-2002',
  pull_request_url: 'https://api.github.com/repos/acme/web-app/pulls/42',
  submitted_at: '2024-12-10T16:45:00Z',
  commit_id: 'abc123def456',
  author_association: 'MEMBER',
};

const mockCommit1: GitHubTimelineCommitEvent = {
  event: 'committed',
  sha: 'abc123def456789012345678901234567890abcd',
  node_id: 'C_abc123',
  url: 'https://api.github.com/repos/acme/web-app/git/commits/abc123',
  html_url: 'https://github.com/acme/web-app/commit/abc123',
  message: 'feat: add user authentication flow\n\nImplements OAuth2 authentication with support for:\n- GitHub login\n- Google login\n- Email/password fallback',
  author: {
    name: 'Alice Developer',
    email: 'alice@example.com',
    date: '2024-12-10T10:00:00Z',
  },
  committer: {
    name: 'Alice Developer',
    email: 'alice@example.com',
    date: '2024-12-10T10:00:00Z',
  },
  tree: { sha: 'tree123', url: '' },
  parents: [{ sha: 'parent123', url: '', html_url: '' }],
  verification: {
    verified: true,
    reason: 'valid',
    signature: null,
    payload: null,
  },
};

const mockCommit2: GitHubTimelineCommitEvent = {
  event: 'committed',
  sha: 'def456abc789012345678901234567890defabc',
  node_id: 'C_def456',
  url: 'https://api.github.com/repos/acme/web-app/git/commits/def456',
  html_url: 'https://github.com/acme/web-app/commit/def456',
  message: 'fix: address review feedback',
  author: {
    name: 'Alice Developer',
    email: 'alice@example.com',
    date: '2024-12-11T11:30:00Z',
  },
  committer: {
    name: 'Alice Developer',
    email: 'alice@example.com',
    date: '2024-12-11T11:30:00Z',
  },
  tree: { sha: 'tree456', url: '' },
  parents: [{ sha: 'abc123', url: '', html_url: '' }],
  verification: {
    verified: false,
    reason: 'unsigned',
    signature: null,
    payload: null,
  },
};

const mockLabelEvent: GitHubTimelineLabelEvent = {
  event: 'labeled',
  id: 3001,
  node_id: 'LE_3001',
  url: '',
  actor: mockUsers.bob,
  created_at: '2024-12-10T10:05:00Z',
  label: {
    name: 'enhancement',
    color: 'a2eeef',
  },
};

const mockAssignEvent: GitHubTimelineAssignEvent = {
  event: 'assigned',
  id: 4001,
  node_id: 'AE_4001',
  url: '',
  actor: mockUsers.alice,
  assignee: mockUsers.charlie,
  created_at: '2024-12-10T10:10:00Z',
};

const mockReviewRequestEvent: GitHubTimelineReviewRequestEvent = {
  event: 'review_requested',
  id: 5001,
  node_id: 'RRE_5001',
  url: '',
  actor: mockUsers.alice,
  review_requester: mockUsers.alice,
  requested_reviewer: mockUsers.bob,
  created_at: '2024-12-10T10:15:00Z',
};

const mockMergeEvent: GitHubTimelineMergeEvent = {
  event: 'merged',
  id: 6001,
  node_id: 'ME_6001',
  url: '',
  actor: mockUsers.alice,
  commit_id: 'merge123456789',
  commit_url: 'https://github.com/acme/web-app/commit/merge123',
  created_at: '2024-12-11T15:00:00Z',
};

const mockClosedEvent: GitHubTimelineStateEvent = {
  event: 'closed',
  id: 7001,
  node_id: 'CE_7001',
  url: '',
  actor: mockUsers.alice,
  commit_id: null,
  commit_url: null,
  created_at: '2024-12-11T15:00:00Z',
};

// Mock inline review comments
const mockReviewComment1: GitHubReviewComment = {
  id: 8001,
  node_id: 'PRRC_8001',
  pull_request_review_id: 2002,
  diff_hunk: `@@ -15,7 +15,9 @@ export function authenticate(user: User) {
   if (!user.email) {
     throw new Error('Email required');
   }
+
+  const token = generateToken(user);`,
  path: 'src/auth/authenticate.ts',
  position: 5,
  original_position: 5,
  line: 19,
  original_line: 19,
  side: 'RIGHT',
  start_line: null,
  original_start_line: null,
  start_side: null,
  commit_id: 'abc123',
  original_commit_id: 'abc123',
  user: mockUsers.bob,
  body: 'Consider using a more descriptive variable name here, like `authToken` instead of just `token`.',
  created_at: '2024-12-10T16:50:00Z',
  updated_at: '2024-12-10T16:50:00Z',
  html_url: 'https://github.com/acme/web-app/pull/42#discussion_r8001',
  pull_request_url: 'https://api.github.com/repos/acme/web-app/pulls/42',
  author_association: 'MEMBER',
  reactions: {
    url: '',
    total_count: 1,
    '+1': 1,
    '-1': 0,
    laugh: 0,
    hooray: 0,
    confused: 0,
    heart: 0,
    rocket: 0,
    eyes: 0,
  },
  subject_type: 'line',
};

const mockReviewComment2: GitHubReviewComment = {
  id: 8002,
  node_id: 'PRRC_8002',
  pull_request_review_id: 2002,
  diff_hunk: `@@ -1,5 +1,8 @@
 import { User } from './types';
+import { generateToken } from './token';
+import { validateEmail } from './validation';`,
  path: 'src/auth/authenticate.ts',
  position: 2,
  original_position: 2,
  line: 3,
  original_line: 3,
  side: 'RIGHT',
  start_line: null,
  original_start_line: null,
  start_side: null,
  commit_id: 'abc123',
  original_commit_id: 'abc123',
  user: mockUsers.bob,
  body: 'These imports should be sorted alphabetically according to our style guide.',
  created_at: '2024-12-10T16:48:00Z',
  updated_at: '2024-12-10T16:48:00Z',
  html_url: 'https://github.com/acme/web-app/pull/42#discussion_r8002',
  pull_request_url: 'https://api.github.com/repos/acme/web-app/pulls/42',
  author_association: 'MEMBER',
  subject_type: 'line',
};

// Full mock data for a PR conversation
const mockPRMessagesData: GitHubMessagesSliceData = {
  target: {
    type: 'pull_request',
    number: 42,
    title: 'feat: Add user authentication flow',
    state: 'open',
    user: mockUsers.alice,
    created_at: '2024-12-10T09:00:00Z',
    html_url: 'https://github.com/acme/web-app/pull/42',
    draft: false,
  },
  timeline: [
    mockCommit1,
    mockLabelEvent,
    mockAssignEvent,
    mockReviewRequestEvent,
    mockComment1,
    mockReviewChangesRequested,
    mockCommit2,
    mockReviewApproved,
  ],
  reviewComments: [mockReviewComment2, mockReviewComment1],
  owner: 'acme',
  repo: 'web-app',
  loading: false,
  isAuthenticated: true,
};

const mockMergedPRData: GitHubMessagesSliceData = {
  ...mockPRMessagesData,
  target: {
    ...mockPRMessagesData.target!,
    state: 'closed',
    merged: true,
    merged_at: '2024-12-11T15:00:00Z',
  },
  timeline: [
    ...mockPRMessagesData.timeline,
    mockMergeEvent,
  ],
};

const mockIssueMessagesData: GitHubMessagesSliceData = {
  target: {
    type: 'issue',
    number: 128,
    title: 'Bug: Login button not working on mobile',
    state: 'open',
    user: mockUsers.bob,
    created_at: '2024-12-09T08:00:00Z',
    html_url: 'https://github.com/acme/web-app/issues/128',
  },
  timeline: [
    {
      event: 'labeled',
      id: 9001,
      node_id: 'LE_9001',
      url: '',
      actor: mockUsers.bob,
      created_at: '2024-12-09T08:01:00Z',
      label: { name: 'bug', color: 'd73a4a' },
    } as GitHubTimelineLabelEvent,
    {
      event: 'labeled',
      id: 9002,
      node_id: 'LE_9002',
      url: '',
      actor: mockUsers.bob,
      created_at: '2024-12-09T08:01:00Z',
      label: { name: 'mobile', color: '0e8a16' },
    } as GitHubTimelineLabelEvent,
    {
      event: 'commented',
      id: 9003,
      node_id: 'IC_9003',
      url: '',
      html_url: '',
      body: 'I can reproduce this on iOS Safari. The click event seems to be swallowed by the parent container.',
      user: mockUsers.charlie,
      actor: mockUsers.charlie,
      created_at: '2024-12-09T10:30:00Z',
      updated_at: '2024-12-09T10:30:00Z',
      author_association: 'CONTRIBUTOR',
    } as GitHubTimelineCommentEvent,
    {
      event: 'assigned',
      id: 9004,
      node_id: 'AE_9004',
      url: '',
      actor: mockUsers.alice,
      assignee: mockUsers.alice,
      created_at: '2024-12-09T11:00:00Z',
    } as GitHubTimelineAssignEvent,
    {
      event: 'commented',
      id: 9005,
      node_id: 'IC_9005',
      url: '',
      html_url: '',
      body: "I'll take a look at this. Might be related to the touch event handling we added last week.",
      user: mockUsers.alice,
      actor: mockUsers.alice,
      created_at: '2024-12-09T11:05:00Z',
      updated_at: '2024-12-09T11:05:00Z',
      author_association: 'MEMBER',
    } as GitHubTimelineCommentEvent,
  ],
  reviewComments: [],
  owner: 'acme',
  repo: 'web-app',
  loading: false,
  isAuthenticated: true,
};

const mockClosedIssueData: GitHubMessagesSliceData = {
  ...mockIssueMessagesData,
  target: {
    ...mockIssueMessagesData.target!,
    state: 'closed',
  },
  timeline: [
    ...mockIssueMessagesData.timeline,
    mockClosedEvent,
  ],
};

// Wrapper component that sends messages data on mount
const MessagesWithData: React.FC<{
  data: GitHubMessagesSliceData;
  context: ReturnType<typeof createMockContext>;
  actions: ReturnType<typeof createMockActions>;
  events: ReturnType<typeof createMockEvents>;
}> = ({ data, context, actions, events }) => {
  useEffect(() => {
    // Emit messages data event after a short delay
    const timer = setTimeout(() => {
      events.emit({
        type: 'github-messages:data',
        source: 'storybook',
        timestamp: Date.now(),
        payload: data,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [data, events]);

  return <GitHubMessagesPanel context={context} actions={actions} events={events} />;
};

/**
 * GitHubMessagesPanel displays conversation threads for GitHub issues and PRs.
 * It shows comments, reviews, commits, and other timeline events in chronological order.
 */
const meta = {
  title: 'Panels/GitHubMessagesPanel',
  component: GitHubMessagesPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A panel for viewing GitHub issue and PR conversation threads.

**Features:**
- Chronological timeline of all activity
- Comments with markdown rendering and reactions
- PR reviews with approval/changes requested status
- Commits with expandable messages
- Labels, assignments, review requests
- Inline code review comments with diff context
- Merge/close/reopen events

**Events listened:**
- \`issue:selected\` - When user selects an issue
- \`pr:selected\` - When user selects a pull request
- \`github-messages:data\` - Receives conversation data

**Events emitted:**
- \`github-messages:request\` - Requests conversation data for an issue/PR
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
} satisfies Meta<typeof GitHubMessagesPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultMocks = {
  context: createMockContext(),
  actions: createMockActions(),
  events: createMockEvents(),
};

/**
 * Empty state - no issue/PR selected
 */
export const EmptyState: Story = {
  args: {
    context: createMockContext(),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Pull request conversation with comments, reviews, and commits
 */
export const PullRequestConversation: Story = {
  args: defaultMocks,
  render: (args) => (
    <MessagesWithData
      data={mockPRMessagesData}
      context={args.context}
      actions={args.actions}
      events={args.events}
    />
  ),
};

/**
 * Merged pull request
 */
export const MergedPullRequest: Story = {
  args: defaultMocks,
  render: (args) => (
    <MessagesWithData
      data={mockMergedPRData}
      context={args.context}
      actions={args.actions}
      events={args.events}
    />
  ),
};

/**
 * Draft pull request
 */
export const DraftPullRequest: Story = {
  args: defaultMocks,
  render: (args) => (
    <MessagesWithData
      data={{
        ...mockPRMessagesData,
        target: {
          ...mockPRMessagesData.target!,
          draft: true,
        },
      }}
      context={args.context}
      actions={args.actions}
      events={args.events}
    />
  ),
};

/**
 * Issue conversation
 */
export const IssueConversation: Story = {
  args: defaultMocks,
  render: (args) => (
    <MessagesWithData
      data={mockIssueMessagesData}
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
    <MessagesWithData
      data={mockClosedIssueData}
      context={args.context}
      actions={args.actions}
      events={args.events}
    />
  ),
};

/**
 * Empty conversation (no activity yet)
 */
export const EmptyConversation: Story = {
  args: defaultMocks,
  render: (args) => (
    <MessagesWithData
      data={{
        target: {
          type: 'issue',
          number: 1,
          title: 'New issue with no comments',
          state: 'open',
          user: mockUsers.alice,
          created_at: new Date().toISOString(),
          html_url: 'https://github.com/acme/web-app/issues/1',
        },
        timeline: [],
        reviewComments: [],
        owner: 'acme',
        repo: 'web-app',
        loading: false,
        isAuthenticated: true,
      }}
      context={args.context}
      actions={args.actions}
      events={args.events}
    />
  ),
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: defaultMocks,
  render: (args) => (
    <MessagesWithData
      data={{
        target: {
          type: 'pull_request',
          number: 42,
          title: 'Loading conversation...',
          state: 'open',
          user: mockUsers.alice,
          created_at: new Date().toISOString(),
          html_url: 'https://github.com/acme/web-app/pull/42',
        },
        timeline: [],
        reviewComments: [],
        owner: 'acme',
        repo: 'web-app',
        loading: true,
        isAuthenticated: true,
      }}
      context={args.context}
      actions={args.actions}
      events={args.events}
    />
  ),
};

/**
 * Error state
 */
export const ErrorState: Story = {
  args: defaultMocks,
  render: (args) => (
    <MessagesWithData
      data={{
        target: {
          type: 'pull_request',
          number: 42,
          title: 'Failed to load',
          state: 'open',
          user: mockUsers.alice,
          created_at: new Date().toISOString(),
          html_url: 'https://github.com/acme/web-app/pull/42',
        },
        timeline: [],
        reviewComments: [],
        owner: 'acme',
        repo: 'web-app',
        loading: false,
        isAuthenticated: true,
        error: 'Failed to load conversation. Please try again.',
      }}
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
    <MessagesWithData
      data={mockPRMessagesData}
      context={args.context}
      actions={args.actions}
      events={args.events}
    />
  ),
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '400px', background: '#1a1a1a' }}>
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
    <MessagesWithData
      data={mockPRMessagesData}
      context={args.context}
      actions={args.actions}
      events={args.events}
    />
  ),
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '900px', background: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
};
