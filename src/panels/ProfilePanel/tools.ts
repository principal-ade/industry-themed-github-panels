/**
 * ProfilePanel Tools
 *
 * UTCP-compatible tools for profile panel operations.
 * These tools emit events that the ProfilePanel listens for.
 *
 * Note: The panel ID can be customized via the panelId prop.
 * These tools use the default panel ID 'industry-theme.profile'.
 */

import type {
  PanelTool,
  PanelToolsMetadata,
} from '@principal-ade/utcp-panel-event';

const PANEL_ID = 'industry-theme.profile';

/**
 * Tool: Set View
 *
 * Switch between collections, repositories, and starred views.
 */
export const setProfileViewTool: PanelTool = {
  name: 'set_profile_view',
  description:
    'Switch between collections, repositories, and starred views in the profile panel. The starred view is only available for user profiles.',
  inputs: {
    type: 'object',
    properties: {
      view: {
        type: 'string',
        enum: ['collections', 'repositories', 'starred'],
        description:
          'The view to switch to (collections, repositories, or starred)',
      },
    },
    required: ['view'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
    },
  },
  tags: ['profile', 'view', 'switch'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: `${PANEL_ID}:set-view`,
  },
};

/**
 * Tool: Select Collection
 *
 * Select a collection from the profile's collections.
 */
export const selectProfileCollectionTool: PanelTool = {
  name: 'select_profile_collection',
  description:
    "Select a collection from the user or organization's collections to view its repositories.",
  inputs: {
    type: 'object',
    properties: {
      collectionId: {
        type: 'string',
        description: 'The ID of the collection to select',
      },
    },
    required: ['collectionId'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      collectionId: { type: 'string' },
    },
  },
  tags: ['profile', 'collection', 'select'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: `${PANEL_ID}:select-collection`,
  },
};

/**
 * Tool: Select Repository
 *
 * Select a repository from the profile's repositories or starred repos.
 */
export const selectProfileRepositoryTool: PanelTool = {
  name: 'select_profile_repository',
  description:
    "Select a repository from the user or organization's repositories to view its details.",
  inputs: {
    type: 'object',
    properties: {
      owner: {
        type: 'string',
        description: 'The repository owner (user or organization login)',
      },
      repo: {
        type: 'string',
        description: 'The repository name',
      },
    },
    required: ['owner', 'repo'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      repository: { type: 'string' },
    },
  },
  tags: ['profile', 'repository', 'select', 'navigate'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: `${PANEL_ID}:select-repository`,
  },
};

/**
 * Tool: Clone Repository
 *
 * Clone a repository from the profile.
 */
export const cloneProfileRepositoryTool: PanelTool = {
  name: 'clone_profile_repository',
  description:
    'Clone a repository from the user or organization to your local machine.',
  inputs: {
    type: 'object',
    properties: {
      owner: {
        type: 'string',
        description: 'The repository owner (user or organization login)',
      },
      repo: {
        type: 'string',
        description: 'The repository name',
      },
    },
    required: ['owner', 'repo'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
    },
  },
  tags: ['profile', 'repository', 'clone', 'download'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: `${PANEL_ID}:clone-repository`,
  },
};

/**
 * Tool: Filter Repositories
 *
 * Filter repositories in the profile by search query.
 */
export const filterProfileRepositoriesTool: PanelTool = {
  name: 'filter_profile_repositories',
  description:
    "Filter the user or organization's repositories by name, description, or language.",
  inputs: {
    type: 'object',
    properties: {
      filter: {
        type: 'string',
        description: 'The search query to filter repositories',
      },
    },
    required: ['filter'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
    },
  },
  tags: ['profile', 'repository', 'filter', 'search'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: `${PANEL_ID}:filter-repositories`,
  },
};

/**
 * All ProfilePanel tools exported as an array.
 */
export const profileTools: PanelTool[] = [
  setProfileViewTool,
  selectProfileCollectionTool,
  selectProfileRepositoryTool,
  cloneProfileRepositoryTool,
  filterProfileRepositoriesTool,
];

/**
 * ProfilePanel tools metadata for registration.
 */
export const profileToolsMetadata: PanelToolsMetadata = {
  id: 'profile-panel',
  name: 'Profile Panel',
  description:
    'Tools for browsing user and organization profiles, collections, and repositories',
  tools: profileTools,
};
