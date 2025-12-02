import type { Meta, StoryObj } from '@storybook/react-vite';
import { GitHubProjectsPanel } from './GitHubProjectsPanel';
import {
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../mocks/panelContext';
import type { DataSlice } from '../types';
import type { GitHubRepositoriesSliceData } from '../types/github';
import {
  createMockGitHubSliceData,
  createUnauthenticatedSliceData,
  createEmptySliceData,
  mockOwnedRepositories,
  mockStarredRepositories,
  mockOrganizations,
} from '../mocks/githubData';

/**
 * GitHubProjectsPanel displays a browsable list of GitHub repositories
 * organized by owned, organization, and starred sections.
 */
const meta = {
  title: 'Panels/GitHubProjectsPanel',
  component: GitHubProjectsPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A panel for browsing GitHub repositories. Features include:
- **Owned repositories**: Your personal repos
- **Organization repositories**: Repos from organizations you belong to
- **Starred repositories**: Repos you've starred
- **Responsive layout**: Columns for wide panels (>=600px), collapsible sections for narrow
- **Search**: Filter repositories by name, description, or language
- **Events**: Emits \`repository:selected\` events when a repo is clicked

Required data slice: \`github-repositories\` (GitHubRepositoriesSliceData)
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
} satisfies Meta<typeof GitHubProjectsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Helper to create context with GitHub slice
 */
const createGitHubContext = (sliceData: GitHubRepositoriesSliceData, loading = false) => {
  const githubSlice: DataSlice<GitHubRepositoriesSliceData> = {
    scope: 'global',
    name: 'github-repositories',
    data: sliceData,
    loading,
    error: null,
    refresh: async () => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Refreshing GitHub repositories...');
    },
  };

  const slices = new Map<string, DataSlice>();
  slices.set('github-repositories', githubSlice as DataSlice);

  return createMockContext({
    slices,
    getSlice: <T,>(name: string) => {
      if (name === 'github-repositories') {
        return githubSlice as unknown as DataSlice<T>;
      }
      return undefined;
    },
    hasSlice: (name: string) => name === 'github-repositories',
    isSliceLoading: (name: string) => name === 'github-repositories' && loading,
  });
};

/**
 * Default state with owned and starred repositories
 */
export const Default: Story = {
  args: {
    context: createGitHubContext(createMockGitHubSliceData()),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Loading state while fetching repositories
 */
export const Loading: Story = {
  args: {
    context: createGitHubContext(createMockGitHubSliceData(), true),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Not authenticated - prompts user to sign in
 */
export const NotAuthenticated: Story = {
  args: {
    context: createGitHubContext(createUnauthenticatedSliceData()),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Authenticated but no repositories
 */
export const EmptyRepositories: Story = {
  args: {
    context: createGitHubContext(createEmptySliceData()),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Only owned repositories (no starred)
 */
export const OnlyOwned: Story = {
  args: {
    context: createGitHubContext({
      owned: mockOwnedRepositories,
      starred: [],
      username: 'johndoe',
      isAuthenticated: true,
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Only starred repositories (no owned)
 */
export const OnlyStarred: Story = {
  args: {
    context: createGitHubContext({
      owned: [],
      starred: mockStarredRepositories,
      username: 'johndoe',
      isAuthenticated: true,
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Many repositories - tests scrolling
 */
export const ManyRepositories: Story = {
  args: {
    context: createGitHubContext({
      owned: [
        ...mockOwnedRepositories,
        ...mockOwnedRepositories.map((r, i) => ({ ...r, id: r.id + 100 + i, name: `${r.name}-copy-${i}` })),
        ...mockOwnedRepositories.map((r, i) => ({ ...r, id: r.id + 200 + i, name: `${r.name}-another-${i}` })),
      ],
      starred: [
        ...mockStarredRepositories,
        ...mockStarredRepositories.map((r, i) => ({ ...r, id: r.id + 100 + i, name: `${r.name}-copy-${i}` })),
      ],
      username: 'johndoe',
      isAuthenticated: true,
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * No GitHub slice available
 */
export const NoDataSlice: Story = {
  args: {
    context: createMockContext({
      slices: new Map(),
      hasSlice: () => false,
      getSlice: () => undefined,
      isSliceLoading: () => false,
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Interactive with event logging
 */
export const Interactive: Story = {
  args: {
    context: createGitHubContext(createMockGitHubSliceData()),
    actions: createMockActions(),
    events: (() => {
      const mockEvents = createMockEvents();
      const originalEmit = mockEvents.emit;
      mockEvents.emit = (event) => {
        // eslint-disable-next-line no-console
        console.log('Event emitted:', event);
        if (event.type === 'repository:selected') {
          const payload = event.payload as { repository: { name: string } };
          // eslint-disable-next-line no-console
          console.log(`Selected repository: ${payload.repository.name}`);
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
          'Interactive demo with event logging. Click repositories and check the console/Actions panel to see emitted events.',
      },
    },
  },
};

/**
 * With organizations - shows personal, org, and starred repos
 */
export const WithOrganizations: Story = {
  args: {
    context: createGitHubContext(createMockGitHubSliceData()),
    actions: createMockActions(),
    events: createMockEvents(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows repositories from personal account, organizations, and starred repos.',
      },
    },
  },
};

/**
 * Compact layout (narrow panel) - simulates a sidebar view
 */
export const CompactLayout: Story = {
  args: {
    context: createGitHubContext(createMockGitHubSliceData()),
    actions: createMockActions(),
    events: createMockEvents(),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '320px', background: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Narrow panel (<600px) uses compact layout with collapsible sections and single-column list.',
      },
    },
  },
};

/**
 * Expanded layout (wide panel) - simulates a main panel view
 */
export const ExpandedLayout: Story = {
  args: {
    context: createGitHubContext(createMockGitHubSliceData()),
    actions: createMockActions(),
    events: createMockEvents(),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '900px', background: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Wide panel (>=600px) uses expanded layout with responsive grid columns.',
      },
    },
  },
};

/**
 * Single organization - user belongs to one org
 */
export const SingleOrganization: Story = {
  args: {
    context: createGitHubContext({
      owned: mockOwnedRepositories,
      starred: mockStarredRepositories,
      organizations: [mockOrganizations[0]],
      username: 'johndoe',
      isAuthenticated: true,
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Many organizations - user belongs to multiple orgs
 */
export const ManyOrganizations: Story = {
  args: {
    context: createGitHubContext({
      owned: mockOwnedRepositories,
      starred: mockStarredRepositories,
      organizations: [
        ...mockOrganizations,
        {
          id: 1003,
          login: 'startup-labs',
          avatar_url: 'https://avatars.githubusercontent.com/u/1003003',
          description: 'Innovation at startup speed',
          repositories: [
            {
              id: 4001,
              name: 'mobile-app',
              full_name: 'startup-labs/mobile-app',
              owner: {
                login: 'startup-labs',
                avatar_url: 'https://avatars.githubusercontent.com/u/1003003',
                type: 'Organization',
              },
              private: true,
              html_url: 'https://github.com/startup-labs/mobile-app',
              description: 'Cross-platform mobile application',
              fork: false,
              clone_url: 'https://github.com/startup-labs/mobile-app.git',
              language: 'Dart',
              default_branch: 'develop',
              stargazers_count: 0,
              forks_count: 0,
              updated_at: '2024-11-27T15:00:00Z',
            },
          ],
        },
      ],
      username: 'johndoe',
      isAuthenticated: true,
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '900px', background: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'User with multiple organization memberships.',
      },
    },
  },
};
