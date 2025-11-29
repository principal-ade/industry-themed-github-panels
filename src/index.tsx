import { GitHubProjectsPanel, GitHubProjectsPanelMetadata } from './panels/GitHubProjectsPanel';
import { GitHubSearchPanel, GitHubSearchPanelMetadata } from './panels/GitHubSearchPanel';
import type { PanelDefinition, PanelContextValue, PanelTool } from './types';
import { githubTools, githubToolsMetadata } from './tools';

/**
 * Export array of panel definitions.
 * This is the required export for panel extensions.
 */
export const panels: PanelDefinition[] = [
  {
    metadata: {
      ...GitHubProjectsPanelMetadata,
      tools: githubTools, // Add tools to panel metadata
    },
    component: GitHubProjectsPanel,

    onMount: async (context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('GitHub Projects Panel mounted');

      // Refresh GitHub data if available
      const slice = context.getSlice('github-repositories');
      if (slice && !slice.loading) {
        await slice.refresh();
      }
    },

    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('GitHub Projects Panel unmounting');
    },
  },
  {
    metadata: GitHubSearchPanelMetadata,
    component: GitHubSearchPanel,

    onMount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('GitHub Search Panel mounted');
    },

    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('GitHub Search Panel unmounting');
    },
  },
];

/**
 * Optional: Called once when the entire package is loaded.
 * Use this for package-level initialization.
 */
export const onPackageLoad = async () => {
  // eslint-disable-next-line no-console
  console.log('Panel package loaded - GitHub Panels Extension');
};

/**
 * Optional: Called once when the package is unloaded.
 * Use this for package-level cleanup.
 */
export const onPackageUnload = async () => {
  // eslint-disable-next-line no-console
  console.log('Panel package unloading - GitHub Panels Extension');
};

// Export components for direct use
export { GitHubProjectCard } from './components/GitHubProjectCard';
export { GitHubProjectsPanel } from './panels/GitHubProjectsPanel';
export { GitHubSearchPanel } from './panels/GitHubSearchPanel';

// Export types
export type {
  GitHubOwner,
  GitHubRepository,
  GitHubOrganization,
  GitHubRepositoriesSliceData,
  RepositorySelectedEventPayload,
  RepositoryPreviewEventPayload,
  GitHubPanelEventType,
} from './types/github';

// Export tools
export {
  githubTools,
  githubToolsMetadata,
  listRepositoriesTool,
  selectRepositoryTool,
  previewRepositoryTool,
  searchRepositoriesTool,
  openRepositorySwitcherTool,
  requestGitHubLoginTool,
} from './tools';
