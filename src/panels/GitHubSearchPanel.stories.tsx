import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GitHubSearchPanel } from './GitHubSearchPanel';
import {
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../mocks/panelContext';
import type { GitHubRepository } from '../types/github';

// Mock search results
const mockSearchResults: GitHubRepository[] = [
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
  },
  {
    id: 2,
    name: 'vue',
    full_name: 'vuejs/vue',
    owner: {
      login: 'vuejs',
      avatar_url: 'https://avatars.githubusercontent.com/u/6128107?v=4',
    },
    private: false,
    html_url: 'https://github.com/vuejs/vue',
    description: 'This is the repo for Vue 2. For Vue 3, go to https://github.com/vuejs/core',
    fork: false,
    clone_url: 'https://github.com/vuejs/vue.git',
    language: 'TypeScript',
    default_branch: 'main',
    stargazers_count: 207000,
    forks_count: 33500,
  },
  {
    id: 3,
    name: 'angular',
    full_name: 'angular/angular',
    owner: {
      login: 'angular',
      avatar_url: 'https://avatars.githubusercontent.com/u/139426?v=4',
    },
    private: false,
    html_url: 'https://github.com/angular/angular',
    description: 'Deliver web apps with confidence',
    fork: false,
    clone_url: 'https://github.com/angular/angular.git',
    language: 'TypeScript',
    default_branch: 'main',
    stargazers_count: 95000,
    forks_count: 25000,
  },
  {
    id: 4,
    name: 'svelte',
    full_name: 'sveltejs/svelte',
    owner: {
      login: 'sveltejs',
      avatar_url: 'https://avatars.githubusercontent.com/u/23617963?v=4',
    },
    private: false,
    html_url: 'https://github.com/sveltejs/svelte',
    description: 'Cybernetically enhanced web apps',
    fork: false,
    clone_url: 'https://github.com/sveltejs/svelte.git',
    language: 'JavaScript',
    default_branch: 'main',
    stargazers_count: 78000,
    forks_count: 4100,
  },
  {
    id: 5,
    name: 'next.js',
    full_name: 'vercel/next.js',
    owner: {
      login: 'vercel',
      avatar_url: 'https://avatars.githubusercontent.com/u/14985020?v=4',
    },
    private: false,
    html_url: 'https://github.com/vercel/next.js',
    description: 'The React Framework',
    fork: false,
    clone_url: 'https://github.com/vercel/next.js.git',
    language: 'JavaScript',
    default_branch: 'canary',
    stargazers_count: 124000,
    forks_count: 26500,
  },
];

/**
 * Decorator that mocks the fetch API for GitHub search
 */
const MockFetchDecorator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const originalFetch = window.fetch;

    const mockFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();

      // Mock the GitHub search API
      if (url.includes('/api/github/search')) {
        const urlParams = new URL(url, window.location.origin).searchParams;
        const query = urlParams.get('q')?.toLowerCase() || '';

        // Filter mock results based on query
        const filteredResults = query
          ? mockSearchResults.filter(
              (repo) =>
                repo.name.toLowerCase().includes(query) ||
                repo.full_name.toLowerCase().includes(query) ||
                repo.description?.toLowerCase().includes(query)
            )
          : mockSearchResults;

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 200));

        return new Response(
          JSON.stringify({
            total_count: filteredResults.length,
            incomplete_results: false,
            items: filteredResults,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Pass through other requests
      return originalFetch(input, init);
    };

    window.fetch = mockFetch as typeof fetch;

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
};

/**
 * GitHubSearchPanel allows users to search for repositories on GitHub
 * with real-time debounced search and preview functionality.
 */
const meta = {
  title: 'Panels/GitHubSearchPanel',
  component: GitHubSearchPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A panel for searching GitHub repositories. Features include:
- **Real-time search**: Debounced search as you type
- **Repository preview**: Click to preview README
- **External links**: Open repositories directly on GitHub
- **Repository stats**: Stars, forks, and language display

Events emitted:
- \`repository:preview\` - When user clicks a repository to preview
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MockFetchDecorator>
        <div style={{ height: '100vh', background: '#1a1a1a' }}>
          <Story />
        </div>
      </MockFetchDecorator>
    ),
  ],
} satisfies Meta<typeof GitHubSearchPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default empty state - ready to search
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
          'Interactive demo with event logging. Search and click repositories to see emitted events in the console.',
      },
    },
  },
};
