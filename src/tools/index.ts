/**
 * GitHub Panel Tools
 *
 * UTCP-compatible tools for GitHub repository operations.
 * These tools emit events that the GitHub panels listen for.
 */

import type { PanelTool, PanelToolsMetadata } from '@principal-ade/utcp-panel-event';

/**
 * Tool: List Repositories
 *
 * Triggers a refresh of the user's GitHub repositories.
 * The panel will emit repository data when available.
 */
export const listRepositoriesTool: PanelTool = {
  name: 'list_repositories',
  description: 'Get a list of GitHub repositories the user has access to, including owned repos, starred repos, and organization repos.',
  inputs: {
    type: 'object',
    properties: {},
    required: [],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
    },
  },
  tags: ['github', 'repository', 'list', 'browse'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'github:list-repositories',
  },
};

/**
 * Tool: Select Repository
 *
 * Select a repository to view its details and README.
 */
export const selectRepositoryTool: PanelTool = {
  name: 'select_repository',
  description: 'Select a GitHub repository to view its details, README, and files. Use the full repository name in "owner/repo" format.',
  inputs: {
    type: 'object',
    properties: {
      repository: {
        type: 'string',
        description: 'The full repository name in "owner/repo" format (e.g., "facebook/react")',
      },
    },
    required: ['repository'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      repository: { type: 'string' },
    },
  },
  tags: ['github', 'repository', 'select', 'navigate'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'repository:selected',
  },
};

/**
 * Tool: Preview Repository
 *
 * Preview a repository's README without fully selecting it.
 */
export const previewRepositoryTool: PanelTool = {
  name: 'preview_repository',
  description: 'Preview a GitHub repository\'s README in the viewer without navigating to it.',
  inputs: {
    type: 'object',
    properties: {
      repository: {
        type: 'string',
        description: 'The full repository name in "owner/repo" format (e.g., "facebook/react")',
      },
    },
    required: ['repository'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
    },
  },
  tags: ['github', 'repository', 'preview', 'readme'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'repository:preview',
  },
};

/**
 * Tool: Search Repositories
 *
 * Search through the user's repositories.
 */
export const searchRepositoriesTool: PanelTool = {
  name: 'search_repositories',
  description: 'Search through the user\'s GitHub repositories by name, description, or language.',
  inputs: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query to filter repositories',
      },
    },
    required: ['query'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
    },
  },
  tags: ['github', 'repository', 'search', 'filter'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'github:search-repositories',
  },
};

/**
 * Tool: Open Repository Switcher
 *
 * Open the repository switcher modal.
 */
export const openRepositorySwitcherTool: PanelTool = {
  name: 'open_repository_switcher',
  description: 'Open the repository switcher modal to browse and select a different repository.',
  inputs: {
    type: 'object',
    properties: {},
    required: [],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
    },
  },
  tags: ['github', 'repository', 'switch', 'modal'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'repository:open-switcher',
  },
};

/**
 * Tool: Request GitHub Login
 *
 * Prompt the user to sign in to GitHub.
 */
export const requestGitHubLoginTool: PanelTool = {
  name: 'request_github_login',
  description: 'Prompt the user to sign in to their GitHub account to access repositories.',
  inputs: {
    type: 'object',
    properties: {},
    required: [],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
    },
  },
  tags: ['github', 'auth', 'login', 'sign-in'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'github:login-requested',
  },
};

/**
 * All GitHub tools exported as an array.
 */
export const githubTools: PanelTool[] = [
  listRepositoriesTool,
  selectRepositoryTool,
  previewRepositoryTool,
  searchRepositoriesTool,
  openRepositorySwitcherTool,
  requestGitHubLoginTool,
];

/**
 * GitHub tools metadata for registration.
 */
export const githubToolsMetadata: PanelToolsMetadata = {
  id: 'github-panels',
  name: 'GitHub Panels',
  description: 'Tools for browsing and managing GitHub repositories',
  tools: githubTools,
};
