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
 * Custom event types for the GitHub panel
 */
export type GitHubPanelEventType = 'repository:selected' | 'repository:preview';
