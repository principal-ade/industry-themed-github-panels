import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrgProfilePanel } from './index';
import {
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../../mocks/panelContext';
import type { DataSlice } from '../../types';
import type { OrgProfileSlice, GitHubOrgProfile, GitHubRepository } from './types';
import type { Collection } from '@principal-ai/alexandria-collections';

/**
 * Mock organization data
 */
const mockOrg: GitHubOrgProfile = {
  login: 'principal-ade',
  id: 12345,
  avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4',
  name: 'Principal ADE',
  description: 'Building the future of development environments',
  company: null,
  blog: 'https://principal.dev',
  location: 'San Francisco, CA',
  email: 'contact@principal.dev',
  twitter_username: 'principaldev',
  is_verified: true,
  has_organization_projects: true,
  has_repository_projects: true,
  public_repos: 42,
  public_gists: 5,
  followers: 1234,
  following: 0,
  html_url: 'https://github.com/principal-ade',
  created_at: '2022-01-15T10:00:00Z',
  updated_at: '2024-12-01T12:00:00Z',
  type: 'Organization',
};

/**
 * Mock repositories
 */
const mockRepositories: GitHubRepository[] = [
  {
    id: 1,
    name: 'panel-framework-core',
    full_name: 'principal-ade/panel-framework-core',
    owner: {
      login: 'principal-ade',
      avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4',
      type: 'Organization',
    },
    private: false,
    html_url: 'https://github.com/principal-ade/panel-framework-core',
    description: 'Core framework for building panels',
    clone_url: 'https://github.com/principal-ade/panel-framework-core.git',
    updated_at: '2024-12-01T12:00:00Z',
    language: 'TypeScript',
    stargazers_count: 256,
    default_branch: 'main',
    fork: false,
  },
  {
    id: 2,
    name: 'industry-theme',
    full_name: 'principal-ade/industry-theme',
    owner: {
      login: 'principal-ade',
      avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4',
      type: 'Organization',
    },
    private: false,
    html_url: 'https://github.com/principal-ade/industry-theme',
    description: 'Industrial-themed UI components',
    clone_url: 'https://github.com/principal-ade/industry-theme.git',
    updated_at: '2024-11-28T09:30:00Z',
    language: 'TypeScript',
    stargazers_count: 128,
    default_branch: 'main',
    fork: false,
  },
  {
    id: 3,
    name: 'alexandria-core',
    full_name: 'principal-ade/alexandria-core',
    owner: {
      login: 'principal-ade',
      avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4',
      type: 'Organization',
    },
    private: false,
    html_url: 'https://github.com/principal-ade/alexandria-core',
    description: 'Core library for Alexandria project management',
    clone_url: 'https://github.com/principal-ade/alexandria-core.git',
    updated_at: '2024-11-25T14:45:00Z',
    language: 'Rust',
    stargazers_count: 89,
    default_branch: 'main',
    fork: false,
  },
  {
    id: 4,
    name: 'docs',
    full_name: 'principal-ade/docs',
    owner: {
      login: 'principal-ade',
      avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4',
      type: 'Organization',
    },
    private: false,
    html_url: 'https://github.com/principal-ade/docs',
    description: 'Documentation for all Principal ADE projects',
    clone_url: 'https://github.com/principal-ade/docs.git',
    updated_at: '2024-11-20T16:00:00Z',
    language: 'MDX',
    stargazers_count: 45,
    default_branch: 'main',
    fork: false,
  },
];

/**
 * Mock collections
 */
const mockCollections: Collection[] = [
  {
    id: 'col-1',
    name: 'Core Libraries',
    description: 'Essential libraries and frameworks',
    members: [{ repositoryId: '1' }, { repositoryId: '3' }],
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'col-2',
    name: 'UI Components',
    description: 'Shared UI components and themes',
    members: [{ repositoryId: '2' }],
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'col-3',
    name: 'Documentation',
    description: 'Documentation and guides',
    members: [{ repositoryId: '4' }],
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
  },
] as Collection[];

/**
 * OrgProfilePanel displays organization information with collections and repositories
 */
const meta = {
  title: 'Panels/OrgProfilePanel',
  component: OrgProfilePanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A panel for viewing GitHub organization profiles. Features include:
- **Organization header**: Avatar, name, description, location, website
- **Stats**: Followers, public repos count
- **Collections tab**: Organization's repository collections
- **Repositories tab**: List of organization repositories with search/filter
- **Events**: Emits selection events for collections and repositories

Required data slice: \`orgProfile\` (OrgProfileSlice)
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
} satisfies Meta<typeof OrgProfilePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Helper to create context with org profile slice
 */
const createOrgProfileContext = (sliceData: OrgProfileSlice, loading = false) => {
  const orgProfileSlice: DataSlice<OrgProfileSlice> = {
    scope: 'global',
    name: 'orgProfile',
    data: sliceData,
    loading,
    error: null,
    refresh: async () => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Refreshing org profile...');
    },
  };

  return createMockContext({
    orgProfile: orgProfileSlice,
  });
};

/**
 * Default state with organization data
 */
export const Default: Story = {
  args: {
    context: createOrgProfileContext({
      org: mockOrg,
      collections: mockCollections,
      repositories: mockRepositories,
      loading: false,
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Loading state while fetching organization data
 */
export const Loading: Story = {
  args: {
    context: createOrgProfileContext(
      {
        org: null,
        collections: [],
        repositories: [],
        loading: true,
      },
      true
    ),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * No organization selected
 */
export const NoOrgSelected: Story = {
  args: {
    context: createOrgProfileContext({
      org: null,
      collections: [],
      repositories: [],
      loading: false,
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Organization with no collections
 */
export const NoCollections: Story = {
  args: {
    context: createOrgProfileContext({
      org: mockOrg,
      collections: [],
      repositories: mockRepositories,
      loading: false,
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Organization with no repositories
 */
export const NoRepositories: Story = {
  args: {
    context: createOrgProfileContext({
      org: mockOrg,
      collections: mockCollections,
      repositories: [],
      loading: false,
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Organization with minimal info (no description, location, etc.)
 */
export const MinimalInfo: Story = {
  args: {
    context: createOrgProfileContext({
      org: {
        ...mockOrg,
        name: null,
        description: null,
        location: null,
        blog: null,
        email: null,
        twitter_username: null,
      },
      collections: [],
      repositories: mockRepositories.slice(0, 2),
      loading: false,
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
    context: createOrgProfileContext({
      org: mockOrg,
      collections: mockCollections,
      repositories: mockRepositories,
      loading: false,
    }),
    actions: createMockActions(),
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
          'Interactive demo with event logging. Click collections or repositories and check the console to see emitted events.',
      },
    },
  },
};

/**
 * Compact layout (narrow panel) - simulates a sidebar view
 */
export const CompactLayout: Story = {
  args: {
    context: createOrgProfileContext({
      org: mockOrg,
      collections: mockCollections,
      repositories: mockRepositories,
      loading: false,
    }),
    actions: createMockActions(),
    events: createMockEvents(),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '360px', background: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Narrow panel layout suitable for sidebar use.',
      },
    },
  },
};
