import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProfilePanel } from './index';
import {
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../../mocks/panelContext';
import type { DataSlice } from '../../types';
import type {
  ProfileSlice,
  ProfilePanelActions,
  GitHubUserProfile,
  GitHubOrgProfile,
  GitHubRepository,
  Collection,
} from './types';

// Mock user profile
const mockUserProfile: GitHubUserProfile = {
  login: 'octocat',
  id: 583231,
  avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
  name: 'The Octocat',
  company: '@github',
  location: 'San Francisco',
  email: 'octocat@github.com',
  bio: 'A mysterious cat that loves to code and contribute to open source projects around the world.',
  blog: 'https://github.blog',
  twitter_username: 'github',
  public_repos: 8,
  public_gists: 8,
  followers: 15000,
  following: 9,
  html_url: 'https://github.com/octocat',
  created_at: '2011-01-25T18:44:36Z',
  updated_at: '2024-12-01T00:00:00Z',
  type: 'User',
};

// Mock organization profile
const mockOrgProfile: GitHubOrgProfile = {
  login: 'facebook',
  id: 69631,
  avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
  name: 'Meta',
  description:
    'We build technologies that help people connect, find communities, and grow businesses.',
  company: null,
  blog: 'https://opensource.fb.com',
  location: 'Menlo Park, California',
  email: 'opensource@fb.com',
  twitter_username: 'meta',
  is_verified: true,
  has_organization_projects: true,
  has_repository_projects: true,
  public_repos: 150,
  public_gists: 0,
  followers: 250000,
  following: 0,
  html_url: 'https://github.com/facebook',
  created_at: '2009-04-02T03:35:22Z',
  updated_at: '2024-12-01T00:00:00Z',
  type: 'Organization',
};

// Mock collections
const mockCollections: Collection[] = [
  {
    id: 'col-1',
    name: 'Frontend Frameworks',
    description: 'Popular frontend libraries and frameworks',
    members: [
      { repositoryId: 'facebook/react', collectionId: 'col-1', addedAt: Date.parse('2024-01-01') },
      { repositoryId: 'facebook/react-native', collectionId: 'col-1', addedAt: Date.parse('2024-01-02') },
    ],
    createdAt: Date.parse('2024-01-01'),
    updatedAt: Date.parse('2024-12-01'),
    visibility: 'public',
    owner: 'octocat',
    ownerType: 'user',
  },
  {
    id: 'col-2',
    name: 'Testing Tools',
    description: 'Testing frameworks and utilities',
    members: [
      { repositoryId: 'facebook/jest', collectionId: 'col-2', addedAt: Date.parse('2024-02-15') },
    ],
    createdAt: Date.parse('2024-02-15'),
    updatedAt: Date.parse('2024-11-20'),
    visibility: 'public',
    owner: 'octocat',
    ownerType: 'user',
  },
  {
    id: 'col-3',
    name: 'Documentation',
    description: 'Documentation generators and tools',
    members: [
      { repositoryId: 'facebook/docusaurus', collectionId: 'col-3', addedAt: Date.parse('2024-03-10') },
    ],
    createdAt: Date.parse('2024-03-10'),
    updatedAt: Date.parse('2024-10-15'),
    visibility: 'private',
    owner: 'octocat',
    ownerType: 'user',
  },
];

// Mock repositories
const mockRepositories: GitHubRepository[] = [
  {
    id: 1,
    name: 'react',
    full_name: 'facebook/react',
    owner: {
      login: 'facebook',
      avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
    },
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
    owner: {
      login: 'facebook',
      avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
    },
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
    owner: {
      login: 'facebook',
      avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
    },
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
    owner: {
      login: 'facebook',
      avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
    },
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
    owner: {
      login: 'facebook',
      avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
    },
    private: false,
    html_url: 'https://github.com/facebook/relay',
    description:
      'Relay is a JavaScript framework for building data-driven React applications.',
    fork: false,
    clone_url: 'https://github.com/facebook/relay.git',
    language: 'Rust',
    default_branch: 'main',
    stargazers_count: 18000,
    forks_count: 1800,
    updated_at: '2024-12-06T11:30:00Z',
    created_at: '2015-08-10T19:10:57Z',
  },
];

// Mock starred repositories (different from owned repos)
const mockStarredRepositories: GitHubRepository[] = [
  {
    id: 100,
    name: 'typescript',
    full_name: 'microsoft/typescript',
    owner: {
      login: 'microsoft',
      avatar_url: 'https://avatars.githubusercontent.com/u/6154722?v=4',
    },
    private: false,
    html_url: 'https://github.com/microsoft/typescript',
    description:
      'TypeScript is a superset of JavaScript that compiles to clean JavaScript output.',
    fork: false,
    clone_url: 'https://github.com/microsoft/typescript.git',
    language: 'TypeScript',
    default_branch: 'main',
    stargazers_count: 99000,
    forks_count: 12000,
    updated_at: '2024-12-10T08:00:00Z',
    created_at: '2014-06-17T15:28:39Z',
  },
  {
    id: 101,
    name: 'vscode',
    full_name: 'microsoft/vscode',
    owner: {
      login: 'microsoft',
      avatar_url: 'https://avatars.githubusercontent.com/u/6154722?v=4',
    },
    private: false,
    html_url: 'https://github.com/microsoft/vscode',
    description: 'Visual Studio Code',
    fork: false,
    clone_url: 'https://github.com/microsoft/vscode.git',
    language: 'TypeScript',
    default_branch: 'main',
    stargazers_count: 162000,
    forks_count: 29000,
    updated_at: '2024-12-09T22:15:00Z',
    created_at: '2015-09-03T20:23:38Z',
  },
];

/**
 * ProfilePanel displays a user or organization profile with their
 * collections, repositories, and starred repositories.
 */
const meta = {
  title: 'Panels/ProfilePanel',
  component: ProfilePanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A unified panel for viewing GitHub user or organization profiles. Features include:
- **Profile header**: Avatar, name, bio/description, location, links
- **Stats**: Followers, following, repository count
- **Collections tab**: View and select collections
- **Repositories tab**: Browse owned/org repositories with search
- **Starred tab**: View starred repositories (user profiles only)
- **Extension points**: Custom header content, repository card wrappers

Required data slice: \`profile\` (ProfileSlice)

Events emitted:
- \`{panelId}:collection:selected\` - When a collection is clicked
- \`{panelId}:repository:selected\` - When a repository is clicked
- \`{panelId}:repository:clone-requested\` - When clone is triggered
- \`{panelId}:view:changed\` - When switching tabs
- \`repository:preview\` - Standard cross-panel repository preview event
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
} satisfies Meta<typeof ProfilePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Helper to create context with profile slice
 */
const createProfileContext = (
  profile: GitHubUserProfile | GitHubOrgProfile | null,
  options: {
    collections?: Collection[];
    repositories?: GitHubRepository[];
    starredRepositories?: GitHubRepository[];
    selectedCollectionId?: string | null;
    selectedRepositoryId?: number | null;
    loading?: boolean;
    error?: string;
  } = {}
) => {
  const {
    collections = [],
    repositories = [],
    starredRepositories = [],
    selectedCollectionId = null,
    selectedRepositoryId = null,
    loading = false,
    error,
  } = options;

  const sliceData: ProfileSlice = {
    profile,
    collections,
    repositories,
    starredRepositories,
    selectedCollectionId,
    selectedRepositoryId,
    loading,
    error,
  };

  const profileSlice: DataSlice<ProfileSlice> = {
    scope: 'repository',
    name: 'profile',
    data: sliceData,
    loading,
    error: error ? new Error(error) : null,
    refresh: async () => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Refreshing profile data...');
    },
  };

  return createMockContext({
    profile: profileSlice,
  });
};

/**
 * Default state with user profile
 */
export const Default: Story = {
  args: {
    profileType: 'user',
    context: createProfileContext(mockUserProfile, {
      collections: mockCollections,
      repositories: mockRepositories.slice(0, 3),
      starredRepositories: mockStarredRepositories,
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Organization profile view
 */
export const OrganizationProfile: Story = {
  args: {
    profileType: 'organization',
    context: createProfileContext(mockOrgProfile, {
      collections: mockCollections,
      repositories: mockRepositories,
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows an organization profile. Note: Organizations do not have a "Starred" tab.',
      },
    },
  },
};

/**
 * Loading state while fetching profile data
 */
export const Loading: Story = {
  args: {
    profileType: 'user',
    context: createProfileContext(null, { loading: true }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * No profile selected state
 */
export const NoProfileSelected: Story = {
  args: {
    profileType: 'user',
    context: createProfileContext(null),
    actions: createMockActions(),
    events: createMockEvents(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the empty state when no profile has been selected.',
      },
    },
  },
};

/**
 * No profile selected - organization variant
 */
export const NoOrgSelected: Story = {
  args: {
    profileType: 'organization',
    context: createProfileContext(null),
    actions: createMockActions(),
    events: createMockEvents(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the empty state for organizations when none is selected.',
      },
    },
  },
};

/**
 * Profile with no collections
 */
export const NoCollections: Story = {
  args: {
    profileType: 'user',
    context: createProfileContext(mockUserProfile, {
      collections: [],
      repositories: mockRepositories.slice(0, 3),
      starredRepositories: mockStarredRepositories,
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the Collections tab when no collections exist.',
      },
    },
  },
};

/**
 * Profile with no repositories
 */
export const NoRepositories: Story = {
  args: {
    profileType: 'user',
    context: createProfileContext(mockUserProfile, {
      collections: mockCollections,
      repositories: [],
      starredRepositories: [],
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the empty state in the Repositories tab when user has no repos.',
      },
    },
  },
};

/**
 * Many repositories - tests scrolling and filtering
 */
export const ManyRepositories: Story = {
  args: {
    profileType: 'organization',
    context: createProfileContext(mockOrgProfile, {
      collections: mockCollections,
      repositories: [
        ...mockRepositories,
        ...mockRepositories.map((repo, i) => ({
          ...repo,
          id: repo.id + 100 + i,
          name: `${repo.name}-v2`,
          full_name: `${mockOrgProfile.login}/${repo.name}-v2`,
        })),
        ...mockRepositories.map((repo, i) => ({
          ...repo,
          id: repo.id + 200 + i,
          name: `${repo.name}-experimental`,
          full_name: `${mockOrgProfile.login}/${repo.name}-experimental`,
        })),
      ],
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows many repositories to test scrolling and the search/filter functionality.',
      },
    },
  },
};

/**
 * With selected collection
 */
export const WithSelectedCollection: Story = {
  args: {
    profileType: 'user',
    context: createProfileContext(mockUserProfile, {
      collections: mockCollections,
      repositories: mockRepositories.slice(0, 3),
      starredRepositories: mockStarredRepositories,
      selectedCollectionId: 'col-2',
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a collection in selected state.',
      },
    },
  },
};

/**
 * Interactive with event logging
 */
export const Interactive: Story = {
  args: {
    profileType: 'user',
    context: createProfileContext(mockUserProfile, {
      collections: mockCollections,
      repositories: mockRepositories.slice(0, 4),
      starredRepositories: mockStarredRepositories,
    }),
    actions: {
      ...createMockActions(),
      viewRepository: async (owner: string, repo: string) => {
        // eslint-disable-next-line no-console
        console.log(`[Action] View repository: ${owner}/${repo}`);
      },
      cloneRepository: async (repository: GitHubRepository) => {
        // eslint-disable-next-line no-console
        console.log(`[Action] Clone repository: ${repository.full_name}`);
      },
      openInBrowser: async (url: string) => {
        // eslint-disable-next-line no-console
        console.log(`[Action] Open in browser: ${url}`);
      },
    } as ProfilePanelActions,
    events: (() => {
      const mockEvents = createMockEvents();
      const originalEmit = mockEvents.emit;
      mockEvents.emit = (event) => {
        // eslint-disable-next-line no-console
        console.log('Event emitted:', event);
        originalEmit(event);
      };
      return mockEvents;
    })(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo with event and action logging. Click on items and check the console to see emitted events.',
      },
    },
  },
};
