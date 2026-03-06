/**
 * OrgProfilePanel Tools
 *
 * UTCP-compatible tools for organization profile operations.
 * These tools emit events that the OrgProfilePanel listens for.
 */

import type { PanelTool, PanelToolsMetadata } from '@principal-ade/utcp-panel-event';

const PANEL_ID = 'industry-theme.org-profile';

/**
 * Tool: Set View
 *
 * Switch between collections and repositories views.
 */
export const setOrgViewTool: PanelTool = {
  name: 'set_org_profile_view',
  description: 'Switch between collections and repositories views in the organization profile panel.',
  inputs: {
    type: 'object',
    properties: {
      view: {
        type: 'string',
        enum: ['collections', 'repositories'],
        description: 'The view to switch to (collections or repositories)',
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
  tags: ['organization', 'profile', 'view', 'switch'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: `${PANEL_ID}:set-view`,
  },
};

/**
 * Tool: Select Collection
 *
 * Select a collection from the organization's collections.
 */
export const selectOrgCollectionTool: PanelTool = {
  name: 'select_org_collection',
  description: 'Select a collection from the organization\'s collections to view its repositories.',
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
  tags: ['organization', 'collection', 'select'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: `${PANEL_ID}:select-collection`,
  },
};

/**
 * Tool: Select Repository
 *
 * Select a repository from the organization's repositories.
 */
export const selectOrgRepositoryTool: PanelTool = {
  name: 'select_org_repository',
  description: 'Select a repository from the organization\'s repositories to view its details.',
  inputs: {
    type: 'object',
    properties: {
      owner: {
        type: 'string',
        description: 'The repository owner (organization login)',
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
  tags: ['organization', 'repository', 'select', 'navigate'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: `${PANEL_ID}:select-repository`,
  },
};

/**
 * Tool: Clone Repository
 *
 * Clone a repository from the organization.
 */
export const cloneOrgRepositoryTool: PanelTool = {
  name: 'clone_org_repository',
  description: 'Clone a repository from the organization to your local machine.',
  inputs: {
    type: 'object',
    properties: {
      owner: {
        type: 'string',
        description: 'The repository owner (organization login)',
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
  tags: ['organization', 'repository', 'clone', 'download'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: `${PANEL_ID}:clone-repository`,
  },
};

/**
 * Tool: Filter Repositories
 *
 * Filter repositories in the organization by search query.
 */
export const filterOrgRepositoriesTool: PanelTool = {
  name: 'filter_org_repositories',
  description: 'Filter the organization\'s repositories by name, description, or language.',
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
  tags: ['organization', 'repository', 'filter', 'search'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: `${PANEL_ID}:filter-repositories`,
  },
};

/**
 * All OrgProfilePanel tools exported as an array.
 */
export const orgProfileTools: PanelTool[] = [
  setOrgViewTool,
  selectOrgCollectionTool,
  selectOrgRepositoryTool,
  cloneOrgRepositoryTool,
  filterOrgRepositoriesTool,
];

/**
 * OrgProfilePanel tools metadata for registration.
 */
export const orgProfileToolsMetadata: PanelToolsMetadata = {
  id: 'org-profile-panel',
  name: 'Organization Profile Panel',
  description: 'Tools for browsing organization profiles, collections, and repositories',
  tools: orgProfileTools,
};
