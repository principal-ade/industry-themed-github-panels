/**
 * Mock GitHub data for Storybook development
 */

import type {
  GitHubRepository,
  GitHubOrganization,
  GitHubRepositoriesSliceData,
} from '../types/github';

/**
 * Sample owned repositories
 */
export const mockOwnedRepositories: GitHubRepository[] = [
  {
    id: 1,
    name: 'my-awesome-project',
    full_name: 'johndoe/my-awesome-project',
    owner: {
      login: 'johndoe',
      avatar_url: 'https://avatars.githubusercontent.com/u/1234567',
      type: 'User',
    },
    private: false,
    html_url: 'https://github.com/johndoe/my-awesome-project',
    description: 'An awesome project built with React and TypeScript',
    fork: false,
    clone_url: 'https://github.com/johndoe/my-awesome-project.git',
    ssh_url: 'git@github.com:johndoe/my-awesome-project.git',
    language: 'TypeScript',
    default_branch: 'main',
    stargazers_count: 142,
    forks_count: 23,
    watchers_count: 142,
    open_issues_count: 5,
    updated_at: '2024-11-25T10:30:00Z',
    pushed_at: '2024-11-25T10:30:00Z',
    topics: ['react', 'typescript', 'vite'],
    license: 'MIT',
  },
  {
    id: 2,
    name: 'dotfiles',
    full_name: 'johndoe/dotfiles',
    owner: {
      login: 'johndoe',
      avatar_url: 'https://avatars.githubusercontent.com/u/1234567',
      type: 'User',
    },
    private: true,
    html_url: 'https://github.com/johndoe/dotfiles',
    description: 'My personal dotfiles and system configuration',
    fork: false,
    clone_url: 'https://github.com/johndoe/dotfiles.git',
    language: 'Shell',
    default_branch: 'main',
    stargazers_count: 0,
    forks_count: 0,
    updated_at: '2024-11-20T08:00:00Z',
    license: null,
  },
  {
    id: 3,
    name: 'blog',
    full_name: 'johndoe/blog',
    owner: {
      login: 'johndoe',
      avatar_url: 'https://avatars.githubusercontent.com/u/1234567',
      type: 'User',
    },
    private: false,
    html_url: 'https://github.com/johndoe/blog',
    description: 'Personal blog built with Next.js',
    fork: false,
    clone_url: 'https://github.com/johndoe/blog.git',
    language: 'JavaScript',
    default_branch: 'main',
    stargazers_count: 15,
    forks_count: 2,
    updated_at: '2024-11-15T14:00:00Z',
    license: 'Apache-2.0',
  },
  {
    id: 4,
    name: 'rust-experiments',
    full_name: 'johndoe/rust-experiments',
    owner: {
      login: 'johndoe',
      avatar_url: 'https://avatars.githubusercontent.com/u/1234567',
      type: 'User',
    },
    private: false,
    html_url: 'https://github.com/johndoe/rust-experiments',
    description: 'Learning Rust through small projects',
    fork: false,
    clone_url: 'https://github.com/johndoe/rust-experiments.git',
    language: 'Rust',
    default_branch: 'main',
    stargazers_count: 8,
    forks_count: 1,
    updated_at: '2024-10-30T16:00:00Z',
    license: 'Unlicense',
  },
];

/**
 * Sample starred repositories
 */
export const mockStarredRepositories: GitHubRepository[] = [
  {
    id: 101,
    name: 'react',
    full_name: 'facebook/react',
    owner: {
      login: 'facebook',
      avatar_url: 'https://avatars.githubusercontent.com/u/69631',
      type: 'Organization',
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
    watchers_count: 225000,
    updated_at: '2024-11-27T12:00:00Z',
    topics: ['javascript', 'react', 'frontend'],
    license: 'MIT',
  },
  {
    id: 102,
    name: 'vite',
    full_name: 'vitejs/vite',
    owner: {
      login: 'vitejs',
      avatar_url: 'https://avatars.githubusercontent.com/u/65625612',
      type: 'Organization',
    },
    private: false,
    html_url: 'https://github.com/vitejs/vite',
    description: 'Next generation frontend tooling. It\'s fast!',
    fork: false,
    clone_url: 'https://github.com/vitejs/vite.git',
    language: 'TypeScript',
    default_branch: 'main',
    stargazers_count: 65000,
    forks_count: 5800,
    updated_at: '2024-11-26T18:00:00Z',
    topics: ['vite', 'build-tool', 'frontend'],
    license: 'MIT',
  },
  {
    id: 103,
    name: 'tauri',
    full_name: 'tauri-apps/tauri',
    owner: {
      login: 'tauri-apps',
      avatar_url: 'https://avatars.githubusercontent.com/u/54536011',
      type: 'Organization',
    },
    private: false,
    html_url: 'https://github.com/tauri-apps/tauri',
    description: 'Build smaller, faster, and more secure desktop applications with a web frontend.',
    fork: false,
    clone_url: 'https://github.com/tauri-apps/tauri.git',
    language: 'Rust',
    default_branch: 'dev',
    stargazers_count: 78000,
    forks_count: 2300,
    updated_at: '2024-11-27T08:00:00Z',
    topics: ['rust', 'desktop', 'webview'],
    license: 'Apache-2.0',
  },
  {
    id: 104,
    name: 'typescript',
    full_name: 'microsoft/typescript',
    owner: {
      login: 'microsoft',
      avatar_url: 'https://avatars.githubusercontent.com/u/6154722',
      type: 'Organization',
    },
    private: false,
    html_url: 'https://github.com/microsoft/typescript',
    description: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript output.',
    fork: false,
    clone_url: 'https://github.com/microsoft/typescript.git',
    language: 'TypeScript',
    default_branch: 'main',
    stargazers_count: 98000,
    forks_count: 12000,
    updated_at: '2024-11-27T10:00:00Z',
    license: 'Apache-2.0',
  },
];

/**
 * Sample organization repositories
 */
export const mockOrganizations: GitHubOrganization[] = [
  {
    id: 1001,
    login: 'acme-corp',
    avatar_url: 'https://avatars.githubusercontent.com/u/1001001',
    description: 'Building the future of widgets',
    repositories: [
      {
        id: 2001,
        name: 'widget-engine',
        full_name: 'acme-corp/widget-engine',
        owner: {
          login: 'acme-corp',
          avatar_url: 'https://avatars.githubusercontent.com/u/1001001',
          type: 'Organization',
        },
        private: true,
        html_url: 'https://github.com/acme-corp/widget-engine',
        description: 'Core widget processing engine',
        fork: false,
        clone_url: 'https://github.com/acme-corp/widget-engine.git',
        language: 'Go',
        default_branch: 'main',
        stargazers_count: 0,
        forks_count: 0,
        updated_at: '2024-11-26T14:00:00Z',
        topics: ['go', 'backend', 'engine'],
      },
      {
        id: 2002,
        name: 'widget-ui',
        full_name: 'acme-corp/widget-ui',
        owner: {
          login: 'acme-corp',
          avatar_url: 'https://avatars.githubusercontent.com/u/1001001',
          type: 'Organization',
        },
        private: false,
        html_url: 'https://github.com/acme-corp/widget-ui',
        description: 'React component library for widgets',
        fork: false,
        clone_url: 'https://github.com/acme-corp/widget-ui.git',
        language: 'TypeScript',
        default_branch: 'main',
        stargazers_count: 234,
        forks_count: 45,
        updated_at: '2024-11-27T09:00:00Z',
        topics: ['react', 'components', 'design-system'],
      },
      {
        id: 2003,
        name: 'widget-docs',
        full_name: 'acme-corp/widget-docs',
        owner: {
          login: 'acme-corp',
          avatar_url: 'https://avatars.githubusercontent.com/u/1001001',
          type: 'Organization',
        },
        private: false,
        html_url: 'https://github.com/acme-corp/widget-docs',
        description: 'Documentation site for widget platform',
        fork: false,
        clone_url: 'https://github.com/acme-corp/widget-docs.git',
        language: 'MDX',
        default_branch: 'main',
        stargazers_count: 12,
        forks_count: 8,
        updated_at: '2024-11-24T16:00:00Z',
      },
    ],
  },
  {
    id: 1002,
    login: 'open-source-collective',
    avatar_url: 'https://avatars.githubusercontent.com/u/1002002',
    description: 'Open source tools for developers',
    repositories: [
      {
        id: 3001,
        name: 'dev-tools',
        full_name: 'open-source-collective/dev-tools',
        owner: {
          login: 'open-source-collective',
          avatar_url: 'https://avatars.githubusercontent.com/u/1002002',
          type: 'Organization',
        },
        private: false,
        html_url: 'https://github.com/open-source-collective/dev-tools',
        description: 'CLI tools for modern development workflows',
        fork: false,
        clone_url: 'https://github.com/open-source-collective/dev-tools.git',
        language: 'Rust',
        default_branch: 'main',
        stargazers_count: 1523,
        forks_count: 189,
        updated_at: '2024-11-27T11:00:00Z',
        topics: ['rust', 'cli', 'developer-tools'],
      },
      {
        id: 3002,
        name: 'config-schema',
        full_name: 'open-source-collective/config-schema',
        owner: {
          login: 'open-source-collective',
          avatar_url: 'https://avatars.githubusercontent.com/u/1002002',
          type: 'Organization',
        },
        private: false,
        html_url: 'https://github.com/open-source-collective/config-schema',
        description: 'JSON Schema definitions for common configurations',
        fork: false,
        clone_url: 'https://github.com/open-source-collective/config-schema.git',
        language: 'JSON',
        default_branch: 'main',
        stargazers_count: 456,
        forks_count: 78,
        updated_at: '2024-11-20T10:00:00Z',
      },
    ],
  },
];

/**
 * Create mock GitHub repositories slice data
 */
export const createMockGitHubSliceData = (
  overrides?: Partial<GitHubRepositoriesSliceData>
): GitHubRepositoriesSliceData => ({
  owned: mockOwnedRepositories,
  starred: mockStarredRepositories,
  organizations: mockOrganizations,
  username: 'johndoe',
  isAuthenticated: true,
  ...overrides,
});

/**
 * Create unauthenticated state
 */
export const createUnauthenticatedSliceData = (): GitHubRepositoriesSliceData => ({
  owned: [],
  starred: [],
  isAuthenticated: false,
});

/**
 * Create empty but authenticated state
 */
export const createEmptySliceData = (): GitHubRepositoriesSliceData => ({
  owned: [],
  starred: [],
  username: 'newuser',
  isAuthenticated: true,
});
