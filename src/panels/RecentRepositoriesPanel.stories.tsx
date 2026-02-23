import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { RecentRepositoriesPanel } from './RecentRepositoriesPanel';
import {
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../mocks/panelContext';
import type { GitHubRepository } from '../types/github';

// Mock data for stories
const mockRecentRepositories = [
  {
    type: 'repository' as const,
    id: 1,
    name: 'react',
    full_name: 'facebook/react',
    owner: { login: 'facebook', avatar_url: 'https://github.com/facebook.png' },
    description: 'The library for web and native user interfaces.',
    language: 'JavaScript',
    html_url: 'https://github.com/facebook/react',
    stargazers_count: 220000,
    forks_count: 45000,
    visitedAt: Date.now() - 1000 * 60 * 5, // 5 minutes ago
  },
  {
    type: 'repository' as const,
    id: 2,
    name: 'typescript',
    full_name: 'microsoft/typescript',
    owner: { login: 'microsoft', avatar_url: 'https://github.com/microsoft.png' },
    description: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript output.',
    language: 'TypeScript',
    html_url: 'https://github.com/microsoft/typescript',
    stargazers_count: 95000,
    forks_count: 12000,
    visitedAt: Date.now() - 1000 * 60 * 30, // 30 minutes ago
  },
  {
    type: 'repository' as const,
    id: 3,
    name: 'vscode',
    full_name: 'microsoft/vscode',
    owner: { login: 'microsoft', avatar_url: 'https://github.com/microsoft.png' },
    description: 'Visual Studio Code',
    language: 'TypeScript',
    html_url: 'https://github.com/microsoft/vscode',
    stargazers_count: 155000,
    forks_count: 27000,
    visitedAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    type: 'repository' as const,
    id: 4,
    name: 'next.js',
    full_name: 'vercel/next.js',
    owner: { login: 'vercel', avatar_url: 'https://github.com/vercel.png' },
    description: 'The React Framework',
    language: 'JavaScript',
    html_url: 'https://github.com/vercel/next.js',
    stargazers_count: 118000,
    forks_count: 25000,
    visitedAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
];

const mockRecentOwners = [
  {
    type: 'owner' as const,
    id: 101,
    login: 'anthropics',
    avatar_url: 'https://github.com/anthropics.png',
    name: 'Anthropic',
    bio: 'AI safety company',
    ownerType: 'Organization' as const,
    public_repos: 25,
    followers: 5000,
    visitedAt: Date.now() - 1000 * 60 * 15, // 15 minutes ago
  },
  {
    type: 'owner' as const,
    id: 102,
    login: 'gaearon',
    avatar_url: 'https://github.com/gaearon.png',
    name: 'Dan Abramov',
    bio: 'Working on React',
    ownerType: 'User' as const,
    public_repos: 250,
    followers: 85000,
    visitedAt: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
  },
];

// Wrapper component to populate localStorage with mock data
const MockDataWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Store original values
    const originalRepos = localStorage.getItem('recent-repositories');
    const originalOwners = localStorage.getItem('recent-owners');

    // Set mock data
    localStorage.setItem('recent-repositories', JSON.stringify(mockRecentRepositories));
    localStorage.setItem('recent-owners', JSON.stringify(mockRecentOwners));

    // Dispatch event to trigger refresh
    window.dispatchEvent(new CustomEvent('recent-items-updated'));
    setReady(true);

    // Cleanup on unmount
    return () => {
      if (originalRepos) {
        localStorage.setItem('recent-repositories', originalRepos);
      } else {
        localStorage.removeItem('recent-repositories');
      }
      if (originalOwners) {
        localStorage.setItem('recent-owners', originalOwners);
      } else {
        localStorage.removeItem('recent-owners');
      }
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
};

/**
 * RecentRepositoriesPanel displays recently visited repositories and owners
 * with filtering, navigation, and history management.
 */
const meta = {
  title: 'Panels/RecentRepositoriesPanel',
  component: RecentRepositoriesPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A panel for viewing recently visited repositories and owners. Features include:
- **Recent history**: Persists visited repos and owners in localStorage
- **Filter tabs**: View all, repositories only, or owners only
- **Preview on click**: Single click to preview README
- **Open on double-click**: Double click to navigate to repository/owner
- **Remove items**: Hover to reveal remove button for individual items
- **Clear history**: Clear all or filtered items

Events emitted:
- \`repository:preview\` - When user clicks a repository
- \`repository:selected\` - When user double-clicks a repository
- \`owner:preview\` - When user clicks an owner
- \`owner:selected\` - When user double-clicks an owner
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MockDataWrapper>
        <div style={{ height: '100vh', background: '#1a1a1a' }}>
          <Story />
        </div>
      </MockDataWrapper>
    ),
  ],
} satisfies Meta<typeof RecentRepositoriesPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state - shows items from localStorage (may be empty)
 */
export const Default: Story = {
  args: {
    context: createMockContext(),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Interactive with event logging
 */
export const Interactive: Story = {
  args: {
    context: createMockContext(),
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
        } else if (event.type === 'owner:preview' || event.type === 'owner:selected') {
          // eslint-disable-next-line no-console
          console.log(`Owner event: ${event.type}`, event.payload);
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
          'Interactive demo with event logging. Click repositories/owners and check the console to see emitted events.',
      },
    },
  },
};

/**
 * With navigation callback
 */
export const WithNavigate: Story = {
  args: {
    context: createMockContext(),
    actions: createMockActions(),
    events: createMockEvents(),
    onNavigate: (path: string) => {
      // eslint-disable-next-line no-console
      console.log('Navigate to:', path);
      alert(`Would navigate to: ${path}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'With onNavigate callback - double-click items to see navigation.',
      },
    },
  },
};

