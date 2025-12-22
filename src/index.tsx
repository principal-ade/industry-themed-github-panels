import { GitHubProjectsPanel, GitHubProjectsPanelMetadata } from './panels/GitHubProjectsPanel';
import { GitHubSearchPanel, GitHubSearchPanelMetadata } from './panels/GitHubSearchPanel';
import { GitHubIssuesPanel, GitHubIssuesPanelMetadata } from './panels/GitHubIssuesPanel';
import { GitHubIssueDetailPanel, GitHubIssueDetailPanelMetadata } from './panels/GitHubIssueDetailPanel';
import { OwnerRepositoriesPanel, OwnerRepositoriesPanelMetadata } from './panels/OwnerRepositoriesPanel';
import { RecentRepositoriesPanel, RecentRepositoriesPanelMetadata } from './panels/RecentRepositoriesPanel';
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
  {
    metadata: GitHubIssuesPanelMetadata,
    component: GitHubIssuesPanel,

    onMount: async (context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('GitHub Issues Panel mounted');

      // Refresh issues data if available
      const slice = context.getSlice('github-issues');
      if (slice && !slice.loading) {
        await slice.refresh();
      }
    },

    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('GitHub Issues Panel unmounting');
    },
  },
  {
    metadata: GitHubIssueDetailPanelMetadata,
    component: GitHubIssueDetailPanel,

    onMount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('GitHub Issue Detail Panel mounted');
    },

    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('GitHub Issue Detail Panel unmounting');
    },
  },
  {
    metadata: OwnerRepositoriesPanelMetadata,
    component: OwnerRepositoriesPanel,

    onMount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Owner Repositories Panel mounted');
    },

    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Owner Repositories Panel unmounting');
    },
  },
  {
    metadata: RecentRepositoriesPanelMetadata,
    component: RecentRepositoriesPanel,

    onMount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Recent Repositories Panel mounted');
    },

    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Recent Repositories Panel unmounting');
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
export { GitHubIssuesPanel } from './panels/GitHubIssuesPanel';
export { GitHubIssueDetailPanel } from './panels/GitHubIssueDetailPanel';
export { OwnerRepositoriesPanel } from './panels/OwnerRepositoriesPanel';
export { RecentRepositoriesPanel, addRecentRepository, addRecentOwner } from './panels/RecentRepositoriesPanel';
export type { OwnerInfo } from './panels/RecentRepositoriesPanel';

// Export types
export type {
  GitHubOwner,
  GitHubRepository,
  GitHubOrganization,
  GitHubRepositoriesSliceData,
  RepositorySelectedEventPayload,
  RepositoryPreviewEventPayload,
  GitHubPanelEventType,
  GitHubIssue,
  GitHubIssueLabel,
  GitHubIssueUser,
  GitHubIssuesSliceData,
  IssueSelectedEventPayload,
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
  listIssuesTool,
  refreshIssuesTool,
} from './tools';
