import type { Meta, StoryObj } from '@storybook/react-vite';
import { OwnerRepositoriesPanel } from './OwnerRepositoriesPanel';
import {
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../mocks/panelContext';
import type { DataSlice } from '../types';
import type { GitHubRepository, OwnerRepositoriesSliceData, OwnerInfo } from '../types/github';

// Mock owner info
const mockOwnerUser: OwnerInfo = {
  login: 'octocat',
  avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
  name: 'The Octocat',
  bio: 'A mysterious cat that loves to code and contribute to open source.',
  type: 'User',
  public_repos: 8,
  followers: 15000,
  following: 9,
};

const mockOwnerOrg: OwnerInfo = {
  login: 'facebook',
  avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
  name: 'Meta',
  bio: 'We build technologies that help people connect.',
  type: 'Organization',
  public_repos: 150,
  followers: 250000,
};

// Mock repositories
const mockRepositories: GitHubRepository[] = [
  {
    id: 1,
    name: 'react',
    full_name: 'facebook/react',
    owner: { login: 'facebook', avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4' },
    private: false,
    html_url: 'https://github.com/facebook/react',
    description: 'The library for web and native user interfaces.',
    fork: false,
    clone_url: 'https://github.com/facebook/react.git',
    language: 'JavaScript',
    default_branch: 'main',
    stargazers_count: 225000,
    forks_count: 46000,
    updated_at: '2024-12-10T10:30:00Z',
    created_at: '2013-05-24T16:15:54Z',
  },
  {
    id: 2,
    name: 'react-native',
    full_name: 'facebook/react-native',
    owner: { login: 'facebook', avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4' },
    private: false,
    html_url: 'https://github.com/facebook/react-native',
    description: 'A framework for building native applications using React.',
    fork: false,
    clone_url: 'https://github.com/facebook/react-native.git',
    language: 'C++',
    default_branch: 'main',
    stargazers_count: 118000,
    forks_count: 24000,
    updated_at: '2024-12-09T14:20:00Z',
    created_at: '2015-01-09T18:10:16Z',
  },
  {
    id: 3,
    name: 'jest',
    full_name: 'facebook/jest',
    owner: { login: 'facebook', avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4' },
    private: false,
    html_url: 'https://github.com/facebook/jest',
    description: 'Delightful JavaScript Testing.',
    fork: false,
    clone_url: 'https://github.com/facebook/jest.git',
    language: 'TypeScript',
    default_branch: 'main',
    stargazers_count: 44000,
    forks_count: 6500,
    updated_at: '2024-12-08T09:15:00Z',
    created_at: '2013-12-10T00:00:00Z',
  },
  {
    id: 4,
    name: 'docusaurus',
    full_name: 'facebook/docusaurus',
    owner: { login: 'facebook', avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4' },
    private: false,
    html_url: 'https://github.com/facebook/docusaurus',
    description: 'Easy to maintain open source documentation websites.',
    fork: false,
    clone_url: 'https://github.com/facebook/docusaurus.git',
    language: 'TypeScript',
    default_branch: 'main',
    stargazers_count: 55000,
    forks_count: 8300,
    updated_at: '2024-12-07T16:45:00Z',
    created_at: '2017-06-20T16:13:53Z',
  },
  {
    id: 5,
    name: 'relay',
    full_name: 'facebook/relay',
    owner: { login: 'facebook', avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4' },
    private: false,
    html_url: 'https://github.com/facebook/relay',
    description: 'Relay is a JavaScript framework for building data-driven React applications.',
    fork: false,
    clone_url: 'https://github.com/facebook/relay.git',
    language: 'Rust',
    default_branch: 'main',
    stargazers_count: 18000,
    forks_count: 1800,
    updated_at: '2024-12-06T11:30:00Z',
    created_at: '2015-08-10T19:10:57Z',
  },
  {
    id: 6,
    name: 'hermes',
    full_name: 'facebook/hermes',
    owner: { login: 'facebook', avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4' },
    private: true,
    html_url: 'https://github.com/facebook/hermes',
    description: 'A JavaScript engine optimized for running React Native.',
    fork: false,
    clone_url: 'https://github.com/facebook/hermes.git',
    language: 'C++',
    default_branch: 'main',
    stargazers_count: 9000,
    forks_count: 600,
    updated_at: '2024-12-05T08:00:00Z',
    created_at: '2019-06-12T00:00:00Z',
    archived: true,
  },
];

/**
 * OwnerRepositoriesPanel displays repositories for a GitHub user or organization
 * with sorting, filtering, and preview functionality.
 */
const meta = {
  title: 'Panels/OwnerRepositoriesPanel',
  component: OwnerRepositoriesPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A panel for browsing a GitHub user or organization's repositories. Features include:
- **Repository list**: Shows all repositories for an owner
- **Sort options**: Sort by updated date, stars, or name
- **Language filter**: Filter by programming language
- **Repository badges**: Shows private, archived, and fork status
- **Preview on click**: Single click to preview README
- **Open on double-click**: Double click to open repository

Required data slice: \`owner-repositories\` (OwnerRepositoriesSliceData)

Events emitted:
- \`owner-repositories:request\` - Request data for a specific owner
- \`owner-repositories:refresh\` - Request a refresh of current data
- \`repository:preview\` - When a repo is clicked
- \`repository:selected\` - When a repo is double-clicked
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
} satisfies Meta<typeof OwnerRepositoriesPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Helper to create context with owner repositories slice
 */
const createOwnerContext = (
  owner: OwnerInfo | null,
  repositories: GitHubRepository[],
  options: {
    isAuthenticated?: boolean;
    loading?: boolean;
    error?: string;
  } = {}
) => {
  const { isAuthenticated = true, loading = false, error } = options;

  const sliceData: OwnerRepositoriesSliceData = {
    owner,
    repositories,
    isAuthenticated,
    error,
  };

  const ownerSlice: DataSlice<OwnerRepositoriesSliceData> = {
    scope: 'repository',
    name: 'owner-repositories',
    data: sliceData,
    loading,
    error: error ? new Error(error) : null,
    refresh: async () => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Refreshing owner repositories...');
    },
  };

  const slices = new Map<string, DataSlice>();
  slices.set('owner-repositories', ownerSlice as DataSlice);

  return createMockContext({
    slices,
    getSlice: <T,>(name: string) => {
      if (name === 'owner-repositories') {
        return ownerSlice as unknown as DataSlice<T>;
      }
      return undefined;
    },
    hasSlice: (name: string) => name === 'owner-repositories',
    isSliceLoading: (name: string) => name === 'owner-repositories' && loading,
  });
};

/**
 * Default state with organization repositories
 */
export const Default: Story = {
  args: {
    context: createOwnerContext(mockOwnerOrg, mockRepositories),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * User profile with repositories
 */
export const UserProfile: Story = {
  args: {
    context: createOwnerContext(mockOwnerUser, mockRepositories.slice(0, 3)),
    actions: createMockActions(),
    events: createMockEvents(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows repositories for a user profile.',
      },
    },
  },
};

/**
 * Loading state while fetching repositories
 */
export const Loading: Story = {
  args: {
    context: createOwnerContext(null, [], { loading: true }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Error state - failed to load repositories
 */
export const ErrorState: Story = {
  args: {
    context: createOwnerContext(null, [], {
      error: 'Failed to fetch repositories. The user may not exist or you may not have access.',
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Empty state - no repositories
 */
export const EmptyRepositories: Story = {
  args: {
    context: createOwnerContext(mockOwnerUser, []),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Many repositories - tests scrolling
 */
export const ManyRepositories: Story = {
  args: {
    context: createOwnerContext(mockOwnerOrg, [
      ...mockRepositories,
      ...mockRepositories.map((repo, i) => ({
        ...repo,
        id: repo.id + 100 + i,
        name: `${repo.name}-v2`,
        full_name: `${repo.owner.login}/${repo.name}-v2`,
      })),
      ...mockRepositories.map((repo, i) => ({
        ...repo,
        id: repo.id + 200 + i,
        name: `${repo.name}-legacy`,
        full_name: `${repo.owner.login}/${repo.name}-legacy`,
        archived: true,
      })),
    ]),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Interactive with event logging
 */
export const Interactive: Story = {
  args: {
    context: createOwnerContext(mockOwnerOrg, mockRepositories),
    actions: createMockActions(),
    events: (() => {
      const mockEvents = createMockEvents();
      const originalEmit = mockEvents.emit;
      mockEvents.emit = (event) => {
        // eslint-disable-next-line no-console
        console.log('Event emitted:', event);
        if (event.type === 'repository:preview') {
          const payload = event.payload as { repository: GitHubRepository };
          // eslint-disable-next-line no-console
          console.log(`Preview repository: ${payload.repository.full_name}`);
        } else if (event.type === 'repository:selected') {
          const payload = event.payload as { repository: GitHubRepository };
          // eslint-disable-next-line no-console
          console.log(`Selected repository: ${payload.repository.full_name}`);
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
          'Interactive demo with event logging. Click repositories and check the console to see emitted events.',
      },
    },
  },
};

