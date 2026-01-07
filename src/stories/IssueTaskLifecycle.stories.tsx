import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider, theme as defaultTheme } from '@principal-ade/industry-theme';
import { ResponsiveConfigurablePanelLayout } from '@principal-ade/panel-layouts';
import { GitHubIssuesPanel } from '../panels/GitHubIssuesPanel';
import { GitHubIssueDetailPanel } from '../panels/GitHubIssueDetailPanel';
import { GitHubMessagesPanel } from '../panels/GitHubMessagesPanel';
import {
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../mocks/panelContext';
import type { DataSlice, PanelComponentProps } from '../types';
import type {
  GitHubIssuesSliceData,
  GitHubIssue,
  GitHubMessagesSliceData,
  GitHubTimelineEvent,
} from '../types/github';

// Mock issue data for the lifecycle demo
const mockIssues: GitHubIssue[] = [
  {
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
      { id: 3, name: 'priority: high', color: 'b60205' },
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
    body: `Memory usage increases over time when the dashboard is open.

## Investigation

Suspected cause is event listeners not being cleaned up properly in the useEffect hooks.

## Steps to Reproduce

1. Open dashboard
2. Monitor memory usage in Chrome DevTools
3. Leave dashboard open for 10+ minutes
4. Observe steady increase in memory

## Expected Behavior

Memory usage should stabilize after initial load.`,
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
    body: `Users have requested dark mode support for the application.

## Requirements

- Respect system preferences
- Allow manual override
- Save preference to local storage
- Smooth transition between modes`,
    html_url: 'https://github.com/acme/web-app/issues/126',
    created_at: '2024-12-08T11:00:00Z',
    updated_at: '2024-12-08T11:00:00Z',
    labels: [
      { id: 1, name: 'enhancement', color: 'a2eeef' },
      { id: 5, name: 'good first issue', color: '7ee57e' },
      { id: 6, name: 'backlog-task:fix', color: '0e8a16' }, // Already has a fix task
    ],
    comments: 12,
    user: {
      login: 'bob',
      avatar_url: 'https://avatars.githubusercontent.com/u/3456789',
    },
    assignees: [],
  },
];

// Mock timeline data for issues
const mockTimelineForIssue: Record<number, GitHubTimelineEvent[]> = {
  128: [
    {
      event: 'commented',
      id: 1001,
      node_id: 'IC_1001',
      url: 'https://api.github.com/repos/acme/web-app/issues/comments/1001',
      html_url: 'https://github.com/acme/web-app/issues/128#issuecomment-1001',
      body: 'I agree, the current error messages are too technical. Users often contact support asking what "OAuth state mismatch" means.',
      user: {
        login: 'alice',
        avatar_url: 'https://avatars.githubusercontent.com/u/2345678',
      },
      actor: {
        login: 'alice',
        avatar_url: 'https://avatars.githubusercontent.com/u/2345678',
      },
      created_at: '2024-12-10T14:30:00Z',
      updated_at: '2024-12-10T14:30:00Z',
      author_association: 'MEMBER',
    },
    {
      event: 'labeled',
      id: 1002,
      node_id: 'LE_1002',
      url: 'https://api.github.com/repos/acme/web-app/issues/events/1002',
      created_at: '2024-12-10T15:00:00Z',
      actor: {
        login: 'johndoe',
        avatar_url: 'https://avatars.githubusercontent.com/u/1234567',
      },
      label: {
        name: 'priority: high',
        color: 'b60205',
      },
    },
    {
      event: 'commented',
      id: 1003,
      node_id: 'IC_1003',
      url: 'https://api.github.com/repos/acme/web-app/issues/comments/1003',
      html_url: 'https://github.com/acme/web-app/issues/128#issuecomment-1003',
      body: 'I can work on this. I\'ll start with updating the error messages to be more user-friendly.',
      user: {
        login: 'janedoe',
        avatar_url: 'https://avatars.githubusercontent.com/u/7654321',
      },
      actor: {
        login: 'janedoe',
        avatar_url: 'https://avatars.githubusercontent.com/u/7654321',
      },
      created_at: '2024-12-11T10:00:00Z',
      updated_at: '2024-12-11T10:00:00Z',
      author_association: 'CONTRIBUTOR',
    },
    {
      event: 'assigned',
      id: 1004,
      node_id: 'AE_1004',
      url: 'https://api.github.com/repos/acme/web-app/issues/events/1004',
      created_at: '2024-12-11T10:05:00Z',
      actor: {
        login: 'johndoe',
        avatar_url: 'https://avatars.githubusercontent.com/u/1234567',
      },
      assignee: {
        login: 'janedoe',
        avatar_url: 'https://avatars.githubusercontent.com/u/7654321',
      },
    },
  ],
  127: [
    {
      event: 'commented',
      id: 2001,
      node_id: 'IC_2001',
      url: 'https://api.github.com/repos/acme/web-app/issues/comments/2001',
      html_url: 'https://github.com/acme/web-app/issues/127#issuecomment-2001',
      body: 'I\'ve been investigating this. The issue is in the `useWebSocket` hook - it\'s not cleaning up listeners on unmount.',
      user: {
        login: 'bob',
        avatar_url: 'https://avatars.githubusercontent.com/u/3456789',
      },
      actor: {
        login: 'bob',
        avatar_url: 'https://avatars.githubusercontent.com/u/3456789',
      },
      created_at: '2024-12-09T18:00:00Z',
      updated_at: '2024-12-09T18:00:00Z',
      author_association: 'CONTRIBUTOR',
    },
    {
      event: 'commented',
      id: 2002,
      node_id: 'IC_2002',
      url: 'https://api.github.com/repos/acme/web-app/issues/comments/2002',
      html_url: 'https://github.com/acme/web-app/issues/127#issuecomment-2002',
      body: 'Here\'s a memory profile showing the leak:\n\n```\nSnapshot 1: 45MB\nSnapshot 2: 67MB (+22MB)\nSnapshot 3: 89MB (+22MB)\n```\n\nThe growth is linear and consistent with the number of dashboard refreshes.',
      user: {
        login: 'alice',
        avatar_url: 'https://avatars.githubusercontent.com/u/2345678',
      },
      actor: {
        login: 'alice',
        avatar_url: 'https://avatars.githubusercontent.com/u/2345678',
      },
      created_at: '2024-12-09T19:30:00Z',
      updated_at: '2024-12-09T19:30:00Z',
      author_association: 'MEMBER',
    },
    {
      event: 'labeled',
      id: 2003,
      node_id: 'LE_2003',
      url: 'https://api.github.com/repos/acme/web-app/issues/events/2003',
      created_at: '2024-12-09T20:00:00Z',
      actor: {
        login: 'alice',
        avatar_url: 'https://avatars.githubusercontent.com/u/2345678',
      },
      label: {
        name: 'priority: high',
        color: 'b60205',
      },
    },
    {
      event: 'commented',
      id: 2004,
      node_id: 'IC_2004',
      url: 'https://api.github.com/repos/acme/web-app/issues/comments/2004',
      html_url: 'https://github.com/acme/web-app/issues/127#issuecomment-2004',
      body: 'PR incoming with a fix!',
      user: {
        login: 'bob',
        avatar_url: 'https://avatars.githubusercontent.com/u/3456789',
      },
      actor: {
        login: 'bob',
        avatar_url: 'https://avatars.githubusercontent.com/u/3456789',
      },
      created_at: '2024-12-10T09:00:00Z',
      updated_at: '2024-12-10T09:00:00Z',
      author_association: 'CONTRIBUTOR',
    },
  ],
  126: [
    {
      event: 'commented',
      id: 3001,
      node_id: 'IC_3001',
      url: 'https://api.github.com/repos/acme/web-app/issues/comments/3001',
      html_url: 'https://github.com/acme/web-app/issues/126#issuecomment-3001',
      body: '+1 for dark mode! My eyes would really appreciate this feature.',
      user: {
        login: 'user1',
        avatar_url: 'https://avatars.githubusercontent.com/u/1111111',
      },
      actor: {
        login: 'user1',
        avatar_url: 'https://avatars.githubusercontent.com/u/1111111',
      },
      created_at: '2024-12-08T12:00:00Z',
      updated_at: '2024-12-08T12:00:00Z',
      author_association: 'NONE',
    },
    {
      event: 'labeled',
      id: 3002,
      node_id: 'LE_3002',
      url: 'https://api.github.com/repos/acme/web-app/issues/events/3002',
      created_at: '2024-12-08T12:30:00Z',
      actor: {
        login: 'alice',
        avatar_url: 'https://avatars.githubusercontent.com/u/2345678',
      },
      label: {
        name: 'good first issue',
        color: '7ee57e',
      },
    },
    {
      event: 'commented',
      id: 3003,
      node_id: 'IC_3003',
      url: 'https://api.github.com/repos/acme/web-app/issues/comments/3003',
      html_url: 'https://github.com/acme/web-app/issues/126#issuecomment-3003',
      body: 'This would be a great first contribution for anyone looking to get started!',
      user: {
        login: 'alice',
        avatar_url: 'https://avatars.githubusercontent.com/u/2345678',
      },
      actor: {
        login: 'alice',
        avatar_url: 'https://avatars.githubusercontent.com/u/2345678',
      },
      created_at: '2024-12-08T12:35:00Z',
      updated_at: '2024-12-08T12:35:00Z',
      author_association: 'MEMBER',
    },
  ],
};

// We'll use ResponsiveConfigurablePanelLayout from @principal-ade/panel-layouts
// This provides a proper responsive panel system with support for different layouts

/**
 * Interactive wrapper that connects the panels with shared event bus
 */
const IssueTaskLifecycleDemo: React.FC<{
  issues: GitHubIssue[];
  showMessages?: boolean;
}> = ({ issues: initialIssues, showMessages = false }) => {
  // State for issues (so we can remove deleted issues)
  const [issues, setIssues] = React.useState<GitHubIssue[]>(initialIssues);

  // State for messages slice data
  const [messagesData, setMessagesData] = React.useState<GitHubMessagesSliceData | null>(null);

  // Create shared mock infrastructure (memoized to persist across renders)
  const events = React.useMemo(() => createMockEvents(), []);
  const actions = React.useMemo(() => createMockActions(), []);

  // Sync issues state when prop changes (for story switching)
  React.useEffect(() => {
    setIssues(initialIssues);
  }, [initialIssues]);

  // Create GitHub issues slice
  const sliceData: GitHubIssuesSliceData = {
    issues,
    owner: 'acme',
    repo: 'web-app',
    isAuthenticated: true,
  };

  const issuesSlice: DataSlice<GitHubIssuesSliceData> = {
    scope: 'repository',
    name: 'github-issues',
    data: sliceData,
    loading: false,
    error: null,
    refresh: async () => {
      console.log('[Mock] Refreshing GitHub issues...');
    },
  };

  // Create GitHub messages slice (dynamically updated)
  const messagesSlice: DataSlice<GitHubMessagesSliceData> | undefined = messagesData
    ? {
        scope: 'repository',
        name: 'github-messages',
        data: messagesData,
        loading: false,
        error: null,
        refresh: async () => {
          console.log('[Mock] Refreshing GitHub messages...');
        },
      }
    : undefined;

  const slices = new Map<string, DataSlice>();
  slices.set('github-issues', issuesSlice as DataSlice);
  if (messagesSlice) {
    slices.set('github-messages', messagesSlice as DataSlice);
  }

  const context = createMockContext({
    slices,
    getSlice: <T,>(name: string) => {
      if (name === 'github-issues') {
        return issuesSlice as unknown as DataSlice<T>;
      }
      if (name === 'github-messages' && messagesSlice) {
        return messagesSlice as unknown as DataSlice<T>;
      }
      return undefined;
    },
    hasSlice: (name: string) => {
      if (name === 'github-issues') return true;
      if (name === 'github-messages') return messagesSlice !== undefined;
      return false;
    },
    isSliceLoading: () => false,
  });

  // Host orchestration: Listen for domain events and emit focus events
  React.useEffect(() => {
    // When an issue is selected, focus the detail panel and load messages
    const unsubscribeIssueSelected = events.on('issue:selected', (event) => {
      const payload = event.payload as { issue: GitHubIssue; owner: string; repo: string };
      console.log(`[Lifecycle] Issue selected: #${payload.issue.number} - ${payload.issue.title}`);

      // Update messages slice with timeline data for this issue
      if (showMessages) {
        const timeline = mockTimelineForIssue[payload.issue.number] || [];
        setMessagesData({
          target: {
            type: 'issue',
            number: payload.issue.number,
            title: payload.issue.title,
            state: payload.issue.state,
            user: payload.issue.user,
            created_at: payload.issue.created_at,
            html_url: payload.issue.html_url,
            labels: payload.issue.labels,
            assignees: payload.issue.assignees,
          },
          timeline,
          reviewComments: [],
          owner: payload.owner,
          repo: payload.repo,
          loading: false,
          isAuthenticated: true,
        });
        console.log(`[Lifecycle] Loaded ${timeline.length} timeline events for issue #${payload.issue.number}`);
      }

      // Emit focus event to the issue detail panel
      events.emit({
        type: 'panel:focus',
        source: 'issue-task-lifecycle-story',
        timestamp: Date.now(),
        payload: {
          panelId: 'github-issue-detail',
          panelSlot: showMessages ? 'middle' : 'right',
        },
      });
    });

    // When an issue is deselected (X button clicked), clear messages and focus back to issues list
    const unsubscribeIssueDeselected = events.on('issue:deselected', () => {
      console.log('[Lifecycle] Issue deselected - clearing messages panel and focusing back to issues list');

      // Clear messages data to return panel to empty state
      setMessagesData(null);
      console.log('[Lifecycle] Messages panel cleared');

      // Emit focus event back to the issues panel
      events.emit({
        type: 'panel:focus',
        source: 'issue-task-lifecycle-story',
        timestamp: Date.now(),
        payload: {
          panelId: 'github-issues',
          panelSlot: 'left',
        },
      });
    });

    // When view discussion is clicked, focus the messages panel
    const unsubscribeViewDiscussion = events.on('issue:view-discussion', (event) => {
      const payload = event.payload as { issue: GitHubIssue; owner: string; repo: string };
      console.log(`[Lifecycle] View discussion for issue #${payload.issue.number}`);

      // Only emit focus if messages panel is shown
      if (showMessages) {
        events.emit({
          type: 'panel:focus',
          source: 'issue-task-lifecycle-story',
          timestamp: Date.now(),
          payload: {
            panelId: 'github-messages',
            panelSlot: 'right',
          },
        });
      } else {
        console.log('[Lifecycle] Messages panel not available in this layout');
      }
    });

    // When view task is clicked
    const unsubscribeViewTask = events.on('task:view', (event) => {
      const payload = event.payload as { issue: GitHubIssue; owner: string; repo: string };
      console.log(`[Lifecycle] View task for issue #${payload.issue.number}`);
      // In real implementation, this would navigate to kanban board or open task file
      alert(`Would navigate to task for issue #${payload.issue.number}: ${payload.issue.title}`);
    });

    // When an issue is deleted, remove it from list and trigger deselection flow
    const unsubscribeIssueDeleted = events.on('github-issue:delete', (event) => {
      const payload = event.payload as { owner: string; repo: string; number: number };
      console.log(`[Lifecycle] Issue #${payload.number} deleted - removing from list and triggering deselection`);

      // Remove the issue from the issues list
      setIssues(prevIssues => {
        const filtered = prevIssues.filter(issue => issue.number !== payload.number);
        console.log(`[Lifecycle] Removed issue #${payload.number} from list (${prevIssues.length} -> ${filtered.length} issues)`);
        return filtered;
      });

      // Emit issue:deselected to clear both detail and messages panels
      // The deselected handler above will clear messages and refocus issues list
      events.emit({
        type: 'issue:deselected',
        source: 'issue-task-lifecycle-story',
        timestamp: Date.now(),
        payload: {},
      });

      // Note: In a real implementation, this would also:
      // - Call GitHub API to actually delete/close the issue
      // - Handle any errors from the API
    });

    // When create task is requested, simulate the task creation process
    const unsubscribeCreateTask = events.on('issue:create-task', (event) => {
      const payload = event.payload as {
        issue: GitHubIssue;
        owner: string;
        repo: string;
        taskType: 'investigate' | 'fix';
        additionalInstructions?: string;
      };
      console.log(`[Lifecycle] Create task (type: ${payload.taskType}) from issue #${payload.issue.number}: ${payload.issue.title}`);
      if (payload.additionalInstructions) {
        console.log(`[Lifecycle] Additional instructions: ${payload.additionalInstructions}`);
      }

      // Simulate async task creation (building markdown, writing to backlog.md, git commit, add label)
      setTimeout(() => {
        // Simulate 80% success rate for demo purposes
        const success = Math.random() > 0.2;

        if (success) {
          console.log(`[Lifecycle] Task created successfully for issue #${payload.issue.number}`);

          // Add appropriate label based on task type to the issue
          // In real implementation, this would call GitHub API to add the label
          const labelName = `backlog-task:${payload.taskType}`;
          if (!payload.issue.labels.some(l => l.name === labelName)) {
            payload.issue.labels.push({
              id: Date.now(),
              name: labelName,
              color: '0e8a16', // green color
            });
            console.log(`[Lifecycle] Added '${labelName}' label to issue #${payload.issue.number}`);
          }

          // Emit success event
          events.emit({
            type: 'issue:task-created',
            source: 'issue-task-lifecycle-story',
            timestamp: Date.now(),
            payload: {
              issueNumber: payload.issue.number,
              taskId: `task-${payload.issue.number}-${Date.now()}`,
            },
          });

          // Re-emit issue:selected to refresh the panel with updated labels
          events.emit({
            type: 'issue:selected',
            source: 'issue-task-lifecycle-story',
            timestamp: Date.now(),
            payload: {
              issue: payload.issue,
              owner: payload.owner,
              repo: payload.repo,
            },
          });
        } else {
          console.log(`[Lifecycle] Task creation failed for issue #${payload.issue.number}`);
          // Emit error event
          events.emit({
            type: 'issue:create-task:error',
            source: 'issue-task-lifecycle-story',
            timestamp: Date.now(),
            payload: {
              issueNumber: payload.issue.number,
              error: 'Failed to write to backlog.md - file is locked',
            },
          });
        }
      }, 2000); // 2 second delay to simulate file operations and git commit
    });

    return () => {
      unsubscribeIssueSelected();
      unsubscribeIssueDeselected();
      unsubscribeViewDiscussion();
      unsubscribeViewTask();
      unsubscribeIssueDeleted();
      unsubscribeCreateTask();
    };
  }, [events, showMessages]);

  const props: PanelComponentProps = { context, actions, events };

  // Define panels array
  const panels = [
    {
      id: 'github-issues',
      label: 'GitHub Issues',
      content: <GitHubIssuesPanel {...props} />,
    },
    {
      id: 'github-issue-detail',
      label: 'Issue Detail',
      content: <GitHubIssueDetailPanel {...props} />,
    },
  ];

  if (showMessages) {
    panels.push({
      id: 'github-messages',
      label: 'Messages',
      content: <GitHubMessagesPanel {...props} />,
    });
  }

  // Create layout configuration
  const layout = showMessages
    ? {
        left: 'github-issues',
        middle: 'github-issue-detail',
        right: 'github-messages',
      }
    : {
        left: 'github-issues',
        right: 'github-issue-detail',
      };

  return (
    <div style={{ height: '100vh', background: '#1a1a1a' }}>
      <ResponsiveConfigurablePanelLayout
        theme={defaultTheme}
        panels={panels}
        layout={layout}
        defaultSizes={
          showMessages
            ? { left: 25, middle: 50, right: 25 }
            : { left: 30, right: 70 }
        }
        minSizes={
          showMessages
            ? { left: 15, middle: 30, right: 15 }
            : { left: 20, right: 30 }
        }
        collapsiblePanels={
          showMessages
            ? { left: true, right: true }
            : { left: true }
        }
        collapsed={
          showMessages
            ? { left: false, right: false }
            : { left: false }
        }
        showCollapseButtons={true}
      />
    </div>
  );
};

/**
 * Demonstrates the Issue to Task lifecycle flow with interactive panels
 */
const meta = {
  title: 'Workflows/Issue to Task Lifecycle',
  component: IssueTaskLifecycleDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Issue to Task Lifecycle

This story demonstrates the complete workflow from selecting a GitHub issue to creating a task in the backlog.

## Workflow Steps

1. **Issue Selection** - User clicks an issue in the GitHubIssuesPanel
2. **Event Emission** - \`issue:selected\` event is emitted
3. **Panel Focus** - GitHubIssueDetailPanel receives and displays the issue
4. **Push to Backlog** - User clicks "Push to Backlog" button (simulated)
5. **Task Creation** - \`issue:push-to-backlog\` event triggers task creation
6. **File Operations** - Task is written to backlog.md and committed
7. **Notification** - \`issue:task-created\` event notifies other panels

## Components Involved

- **GitHubIssuesPanel** - Lists issues with filtering
- **GitHubIssueDetailPanel** - Shows full issue details
- **GitHubMessagesPanel** - (Optional) Shows timeline/comments

## Event Flow

\`\`\`
GitHubIssuesPanel (click)
  → issue:selected
  → GitHubIssueDetailPanel (displays)
  → issue:push-to-backlog (button click)
  → Build Task Markdown
  → Append to backlog.md
  → Git Commit
  → issue:task-created
  → Kanban Panel (refreshes)

Issue Close Flow (X button):
  → issue:deselected emitted
  → Messages Panel cleared (returns to empty state)
  → Issue Detail Panel cleared (returns to empty state)
  → Focus returns to Issues List Panel

Issue Delete Flow (Trash button):
  → github-issue:delete (with owner, repo, number)
  → Issue removed from Issues List
  → issue:deselected emitted
  → Messages Panel cleared (returns to empty state)
  → Issue Detail Panel cleared (returns to empty state)
  → Focus returns to Issues List Panel
  → (In real implementation: also call GitHub API to delete on server)
\`\`\`

## Try It

1. Click an issue in the left panel
2. View details in the right panel
3. Check browser console for event logs
4. (Future) Click "Push to Backlog" to create a task

## Testing Close/Delete Issue Behavior

**To test closing an issue (X button):**
1. Select an issue to view it and load its messages
2. Click the X button in the issue detail panel header
3. Observe: both messages and detail panels clear and return to empty state

**To test deleting an issue (Trash button):**
1. Select an issue to view it and load its messages
2. Click the trash/delete button in the issue detail panel header
3. Confirm the deletion in the modal
4. Observe:
   - The issue is removed from the issues list on the left
   - Both messages and detail panels clear and return to empty state
   - Focus returns to the issues list panel

**Behavior:**
- **Close (X button)**: Emits \`issue:deselected\` to clear panels, issue remains in list
- **Delete (Trash button)**: Emits \`github-issue:delete\`, removes issue from list, then emits \`issue:deselected\` to clear panels
- Both actions clear the messages panel and detail panel
- Focus returns to the issues list panel in both cases
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof IssueTaskLifecycleDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default two-panel layout with issues and detail panels
 */
export const Default: Story = {
  args: {
    issues: mockIssues,
    showMessages: false,
  },
};

/**
 * Full workflow with messages panel showing timeline
 */
export const WithMessagesPanel: Story = {
  args: {
    issues: mockIssues,
    showMessages: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Complete workflow including the messages panel for viewing issue timeline and comments.',
      },
    },
  },
};

/**
 * Empty state - no issues in repository
 */
export const EmptyState: Story = {
  args: {
    issues: [],
    showMessages: false,
  },
};

/**
 * Single issue workflow
 */
export const SingleIssue: Story = {
  args: {
    issues: [mockIssues[0]],
    showMessages: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Simplified workflow with a single issue to demonstrate the interaction.',
      },
    },
  },
};

/**
 * High priority issues only
 */
export const HighPriorityOnly: Story = {
  args: {
    issues: mockIssues.filter((issue) =>
      issue.labels.some((label) => label.name.includes('priority: high'))
    ),
    showMessages: false,
  },
};

/**
 * Compact view for smaller screens
 */
export const CompactView: Story = {
  args: {
    issues: mockIssues,
    showMessages: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '900px', height: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Wide desktop view with all panels
 */
export const WideDesktopView: Story = {
  args: {
    issues: mockIssues,
    showMessages: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '1600px', height: '900px' }}>
        <Story />
      </div>
    ),
  ],
};
