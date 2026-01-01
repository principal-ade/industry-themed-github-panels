/**
 * GitHub Panel Type Definitions
 *
 * Defines the data structures for GitHub repository data slices
 * and events emitted by the GitHub Projects panel.
 */

/**
 * GitHub Repository owner information
 */
export interface GitHubOwner {
  login: string;
  avatar_url?: string;
  type?: 'User' | 'Organization';
}

/**
 * GitHub Repository data structure
 * Matches the GitHub API response format
 */
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubOwner;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  clone_url: string;
  ssh_url?: string;
  language: string | null;
  default_branch: string;
  stargazers_count?: number;
  forks_count?: number;
  watchers_count?: number;
  open_issues_count?: number;
  updated_at?: string;
  pushed_at?: string;
  created_at?: string;
  topics?: string[];
  archived?: boolean;
  disabled?: boolean;
  visibility?: 'public' | 'private' | 'internal';
  /** License SPDX identifier (e.g., "MIT", "Apache-2.0") */
  license?: string | null;
}

/**
 * GitHub Organization with its repositories
 */
export interface GitHubOrganization {
  id: number;
  login: string;
  avatar_url?: string;
  description?: string | null;
  /** Repositories belonging to this organization */
  repositories: GitHubRepository[];
}

/**
 * GitHub repositories data slice structure
 * This is what the panel receives from context.getSlice('github-repositories')
 */
export interface GitHubRepositoriesSliceData {
  /** User's personal repositories */
  owned: GitHubRepository[];
  /** User's starred repositories */
  starred: GitHubRepository[];
  /** Organizations the user belongs to (with their repos) */
  organizations?: GitHubOrganization[];
  /** GitHub username */
  username?: string;
  /** Whether the user is authenticated with GitHub */
  isAuthenticated: boolean;
}

// ============================================================================
// Events
// ============================================================================

/**
 * Payload for repository:selected event
 * Emitted when a user confirms they want to open/navigate to a repository
 */
export interface RepositorySelectedEventPayload {
  /** The selected repository */
  repository: GitHubRepository;
  /** Source of the selection (e.g., 'click', 'keyboard', 'search') */
  source?: 'click' | 'keyboard' | 'programmatic' | 'search';
}

/**
 * Payload for repository:preview event
 * Emitted when a user clicks a repository to preview its README
 */
export interface RepositoryPreviewEventPayload {
  /** The repository to preview */
  repository: GitHubRepository;
  /** Source of the preview request */
  source?: 'click' | 'keyboard' | 'search';
}

/**
 * Owner info for OwnerRepositoriesPanel
 */
export interface OwnerInfo {
  login: string;
  avatar_url: string;
  name?: string;
  bio?: string;
  type: 'User' | 'Organization';
  public_repos: number;
  followers?: number;
  following?: number;
}

/**
 * Owner repositories data slice structure
 * This is what the OwnerRepositoriesPanel receives from context.getSlice('owner-repositories')
 */
export interface OwnerRepositoriesSliceData {
  /** Owner info (user or organization) */
  owner: OwnerInfo | null;
  /** Repositories belonging to this owner */
  repositories: GitHubRepository[];
  /** Whether this data is for an authenticated view (includes private repos) */
  isAuthenticated: boolean;
  /** Error message if fetch failed */
  error?: string;
}

/**
 * Custom event types for the GitHub panel
 */
export type GitHubPanelEventType = 'repository:selected' | 'repository:preview';

// ============================================================================
// Issues
// ============================================================================

/**
 * GitHub Issue label
 */
export interface GitHubIssueLabel {
  id: number;
  name: string;
  color: string;
}

/**
 * GitHub user (for issue author/assignees)
 */
export interface GitHubIssueUser {
  login: string;
  avatar_url: string;
}

/**
 * GitHub Issue data structure
 * Matches the GitHub API response format
 */
export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  body: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  labels: GitHubIssueLabel[];
  comments: number;
  user: GitHubIssueUser;
  assignees: GitHubIssueUser[];
}

/**
 * GitHub issues data slice structure
 * This is what the GitHubIssuesPanel receives from context.getSlice('github-issues')
 */
export interface GitHubIssuesSliceData {
  /** List of issues for the repository */
  issues: GitHubIssue[];
  /** Repository owner */
  owner: string;
  /** Repository name */
  repo: string;
  /** Whether the user is authenticated with GitHub */
  isAuthenticated: boolean;
  /** Error message if fetch failed */
  error?: string;
}

/**
 * Payload for issue:selected event
 * Emitted when a user selects an issue
 */
export interface IssueSelectedEventPayload {
  /** The selected issue */
  issue: GitHubIssue;
  /** Repository owner */
  owner: string;
  /** Repository name */
  repo: string;
}

// ============================================================================
// Workspace/Collection Types (for addToCollection functionality)
// ============================================================================

/**
 * Workspace type - matches alexandria-core-library Workspace
 */
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  theme?: string;
  createdAt: number;
  updatedAt: number;
  isDefault?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Data slice for workspace collection
 */
export interface WorkspaceCollectionSlice {
  /** The current workspace */
  workspace: Workspace | null;
  /** Loading state */
  loading: boolean;
  /** Error message if loading failed */
  error?: string;
}

/**
 * Data slice for workspace repositories
 * Contains GitHub repository data for repos in the workspace
 */
export interface WorkspaceRepositoriesSlice {
  /** Repositories in the workspace */
  repositories: GitHubRepository[];
  /** Loading state */
  loading: boolean;
  /** Error message if loading failed */
  error?: string;
}

/**
 * Actions for panels with addToCollection functionality
 */
export interface CollectionPanelActions {
  /** Add a repository to the current collection/workspace */
  addToCollection?: (repo: GitHubRepository) => Promise<void>;
}
