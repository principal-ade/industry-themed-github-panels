/**
 * GitHub Panel Type Definitions
 *
 * Defines the data structures for GitHub repository data slices
 * and events emitted by the GitHub Projects panel.
 */

import type { AlexandriaEntry } from '@principal-ai/alexandria-core-library';

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
 *
 * NOTE: This type is duplicated from @industry-theme/alexandria-panels/src/panels/shared/github-types.ts
 * TODO: Centralize this type in a shared package to avoid drift between implementations
 * Copied from: /Users/griever/Developer/web-ade/industry-themed-alexandria-entry-panels
 * Extended with additional properties used by github-panels
 */
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
    type?: 'User' | 'Organization'; // Extended for github-panels
  };
  private: boolean;
  html_url: string;
  description: string | null;
  clone_url: string;
  updated_at: string;
  pushed_at?: string;
  language: string | null;
  stargazers_count?: number;
  forks_count?: number; // Extended for github-panels
  watchers_count?: number; // Extended for github-panels
  open_issues_count?: number; // Extended for github-panels
  default_branch: string;
  fork?: boolean;
  archived?: boolean; // Extended for github-panels
  disabled?: boolean; // Extended for github-panels
  visibility?: 'public' | 'private' | 'internal'; // Extended for github-panels
  created_at?: string; // Extended for github-panels
  ssh_url?: string; // Extended for github-panels
  topics?: string[]; // Extended for github-panels
  /** Parent repository info (for forks) */
  parent?: {
    full_name: string;
    owner: {
      login: string;
      avatar_url: string;
    };
  };
  /** License information - simplified to string or null for compatibility */
  license?: string | { spdx_id: string; name: string } | null;
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
 * Data slice for workspace repositories (local)
 * Contains repository data for repos in the workspace
 * NOTE: This duplicates the type from @industry-theme/alexandria-panels
 * temporarily until we centralize workspace types
 */
export interface WorkspaceRepositoriesSlice {
  /** Repositories in the workspace */
  repositories: AlexandriaEntry[];
  /** Loading state */
  loading: boolean;
  /** Error message if loading failed */
  error?: string;
}

/**
 * Data slice for workspace collection repositories (web/GitHub)
 * Contains GitHub repository data for repos in the workspace collection
 * Used by web-based panels that work with GitHub repositories
 */
export interface GitHubWorkspaceRepositoriesSlice {
  /** GitHub repositories in the workspace */
  repositories: GitHubRepository[];
  /** Loading state */
  loading: boolean;
  /** Error message if loading failed */
  error?: string;
}

/**
 * Actions for panels with addToCollection functionality
 */
export interface CollectionPanelActions extends PanelActions {
  /** Add a repository to the current collection/workspace */
  addToCollection?: (repo: GitHubRepository) => Promise<void>;
}

/**
 * Search result from GitHub API
 */
export interface GitHubSearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}

/**
 * Actions for GitHubSearchPanel
 */
export interface GitHubSearchPanelActions extends CollectionPanelActions {
  /** Search GitHub repositories */
  searchRepositories?: (query: string, options?: {
    perPage?: number;
    page?: number;
    sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
    order?: 'asc' | 'desc';
  }) => Promise<GitHubSearchResult>;
}

// ============================================================================
// Pull Requests
// ============================================================================

/**
 * GitHub Pull Request head/base reference
 */
export interface GitHubPullRequestRef {
  ref: string;
  sha: string;
  label?: string;
  user?: GitHubIssueUser;
}

/**
 * GitHub Pull Request data structure
 * Matches the GitHub API response format
 */
export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  body: string | null;
  html_url: string;
  diff_url: string;
  patch_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  draft: boolean;
  merged: boolean;
  mergeable: boolean | null;
  mergeable_state: string;
  merge_commit_sha: string | null;
  user: GitHubIssueUser;
  assignees: GitHubIssueUser[];
  labels: GitHubIssueLabel[];
  head: GitHubPullRequestRef;
  base: GitHubPullRequestRef;
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
  requested_reviewers: GitHubIssueUser[];
  merged_by: GitHubIssueUser | null;
}

// ============================================================================
// Comments, Reviews, and Messages
// ============================================================================

/**
 * GitHub App information (for bot comments)
 */
export interface GitHubApp {
  id: number;
  slug: string;
  node_id: string;
  name: string;
  description: string;
  external_url: string;
  html_url: string;
  owner: GitHubIssueUser;
}

/**
 * Reaction counts on comments/reviews
 */
export interface GitHubReactions {
  url: string;
  total_count: number;
  '+1': number;
  '-1': number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
}

/**
 * Issue/PR comment (general discussion)
 * From: GET /repos/{owner}/{repo}/issues/{issue_number}/comments
 */
export interface GitHubComment {
  id: number;
  node_id: string;
  html_url: string;
  issue_url?: string;
  body: string;
  user: GitHubIssueUser;
  created_at: string;
  updated_at: string;
  author_association: 'OWNER' | 'MEMBER' | 'CONTRIBUTOR' | 'COLLABORATOR' | 'FIRST_TIMER' | 'FIRST_TIME_CONTRIBUTOR' | 'MANNEQUIN' | 'NONE';
  reactions?: GitHubReactions;
  performed_via_github_app?: GitHubApp | null;
}

/**
 * PR Review (approve, request changes, comment)
 * From: GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews
 */
export interface GitHubReview {
  id: number;
  node_id: string;
  user: GitHubIssueUser;
  body: string | null;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'PENDING' | 'DISMISSED';
  html_url: string;
  pull_request_url: string;
  submitted_at: string;
  commit_id: string;
  author_association: string;
}

/**
 * PR Review Comment (inline code comment)
 * From: GET /repos/{owner}/{repo}/pulls/{pull_number}/comments
 */
export interface GitHubReviewComment {
  id: number;
  node_id: string;
  pull_request_review_id: number | null;
  diff_hunk: string;
  path: string;
  position: number | null;
  original_position: number;
  line: number | null;
  original_line: number;
  side: 'LEFT' | 'RIGHT';
  start_line: number | null;
  original_start_line: number | null;
  start_side: 'LEFT' | 'RIGHT' | null;
  commit_id: string;
  original_commit_id: string;
  user: GitHubIssueUser;
  body: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  pull_request_url: string;
  author_association: string;
  reactions?: GitHubReactions;
  in_reply_to_id?: number;
  subject_type: 'line' | 'file';
}

// ============================================================================
// Timeline Events
// ============================================================================

/**
 * Git commit author/committer info
 */
export interface GitHubCommitAuthor {
  name: string;
  email: string;
  date: string;
}

/**
 * Git commit verification status
 */
export interface GitHubCommitVerification {
  verified: boolean;
  reason: string;
  signature: string | null;
  payload: string | null;
}

/**
 * Timeline: Commit event
 */
export interface GitHubTimelineCommitEvent {
  event: 'committed';
  sha: string;
  node_id: string;
  url: string;
  html_url: string;
  message: string;
  author: GitHubCommitAuthor;
  committer: GitHubCommitAuthor;
  tree: { sha: string; url: string };
  parents: Array<{ sha: string; url: string; html_url: string }>;
  verification: GitHubCommitVerification;
}

/**
 * Timeline: Comment event
 */
export interface GitHubTimelineCommentEvent {
  event: 'commented';
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  body: string;
  user: GitHubIssueUser;
  actor: GitHubIssueUser;
  created_at: string;
  updated_at: string;
  author_association: string;
  reactions?: GitHubReactions;
  performed_via_github_app?: GitHubApp | null;
}

/**
 * Timeline: Review event
 */
export interface GitHubTimelineReviewEvent {
  event: 'reviewed';
  id: number;
  node_id: string;
  user: GitHubIssueUser;
  body: string | null;
  state: 'approved' | 'changes_requested' | 'commented' | 'dismissed';
  html_url: string;
  pull_request_url: string;
  submitted_at: string;
  commit_id: string;
  author_association: string;
}

/**
 * Timeline: Label event
 */
export interface GitHubTimelineLabelEvent {
  event: 'labeled' | 'unlabeled';
  id: number;
  node_id: string;
  url: string;
  actor: GitHubIssueUser;
  created_at: string;
  label: {
    name: string;
    color: string;
  };
}

/**
 * Timeline: Assignment event
 */
export interface GitHubTimelineAssignEvent {
  event: 'assigned' | 'unassigned';
  id: number;
  node_id: string;
  url: string;
  actor: GitHubIssueUser;
  assignee: GitHubIssueUser;
  assigner?: GitHubIssueUser;
  created_at: string;
}

/**
 * Timeline: Review request event
 */
export interface GitHubTimelineReviewRequestEvent {
  event: 'review_requested' | 'review_request_removed';
  id: number;
  node_id: string;
  url: string;
  actor: GitHubIssueUser;
  review_requester: GitHubIssueUser;
  requested_reviewer?: GitHubIssueUser;
  requested_team?: {
    id: number;
    node_id: string;
    name: string;
    slug: string;
  };
  created_at: string;
}

/**
 * Timeline: Merge event
 */
export interface GitHubTimelineMergeEvent {
  event: 'merged';
  id: number;
  node_id: string;
  url: string;
  actor: GitHubIssueUser;
  commit_id: string;
  commit_url: string;
  created_at: string;
}

/**
 * Timeline: Close/reopen event
 */
export interface GitHubTimelineStateEvent {
  event: 'closed' | 'reopened';
  id: number;
  node_id: string;
  url: string;
  actor: GitHubIssueUser;
  commit_id: string | null;
  commit_url: string | null;
  created_at: string;
}

/**
 * Timeline: Head ref events (force push, delete, restore)
 */
export interface GitHubTimelineRefEvent {
  event: 'head_ref_force_pushed' | 'head_ref_deleted' | 'head_ref_restored';
  id: number;
  node_id: string;
  url: string;
  actor: GitHubIssueUser;
  commit_id: string | null;
  commit_url: string | null;
  created_at: string;
}

/**
 * Timeline: Deploy event
 */
export interface GitHubTimelineDeployEvent {
  event: 'deployed';
  id: number;
  node_id: string;
  url: string;
  actor: GitHubIssueUser;
  created_at: string;
}

/**
 * Timeline: Rename event
 */
export interface GitHubTimelineRenameEvent {
  event: 'renamed';
  id: number;
  node_id: string;
  url: string;
  actor: GitHubIssueUser;
  created_at: string;
  rename: {
    from: string;
    to: string;
  };
}

/**
 * Timeline: Milestone event
 */
export interface GitHubTimelineMilestoneEvent {
  event: 'milestoned' | 'demilestoned';
  id: number;
  node_id: string;
  url: string;
  actor: GitHubIssueUser;
  created_at: string;
  milestone: {
    title: string;
  };
}

/**
 * Timeline: Cross-reference event
 */
export interface GitHubTimelineCrossReferenceEvent {
  event: 'cross-referenced';
  actor: GitHubIssueUser;
  created_at: string;
  source: {
    type: 'issue';
    issue: {
      number: number;
      title: string;
      state: 'open' | 'closed';
      html_url: string;
      pull_request?: { url: string };
    };
  };
}

/**
 * Union type for all timeline events
 */
export type GitHubTimelineEvent =
  | GitHubTimelineCommitEvent
  | GitHubTimelineCommentEvent
  | GitHubTimelineReviewEvent
  | GitHubTimelineLabelEvent
  | GitHubTimelineAssignEvent
  | GitHubTimelineReviewRequestEvent
  | GitHubTimelineMergeEvent
  | GitHubTimelineStateEvent
  | GitHubTimelineRefEvent
  | GitHubTimelineDeployEvent
  | GitHubTimelineRenameEvent
  | GitHubTimelineMilestoneEvent
  | GitHubTimelineCrossReferenceEvent;

/**
 * Helper to get event type from timeline event
 */
export function getTimelineEventType(event: GitHubTimelineEvent): string {
  return event.event;
}

/**
 * Helper to check if event is a comment
 */
export function isCommentEvent(event: GitHubTimelineEvent): event is GitHubTimelineCommentEvent {
  return event.event === 'commented';
}

/**
 * Helper to check if event is a review
 */
export function isReviewEvent(event: GitHubTimelineEvent): event is GitHubTimelineReviewEvent {
  return event.event === 'reviewed';
}

/**
 * Helper to check if event is a commit
 */
export function isCommitEvent(event: GitHubTimelineEvent): event is GitHubTimelineCommitEvent {
  return event.event === 'committed';
}

// ============================================================================
// Messages Panel Data Slice
// ============================================================================

/**
 * Target for the messages panel - either an issue or a pull request
 */
export interface GitHubMessagesTarget {
  type: 'issue' | 'pull_request';
  number: number;
  title: string;
  state: 'open' | 'closed';
  user: GitHubIssueUser;
  created_at: string;
  html_url: string;
  /** Labels on this issue/PR */
  labels: GitHubIssueLabel[];
  /** Users assigned to this issue/PR */
  assignees: GitHubIssueUser[];
  /** For PRs: merge status */
  merged?: boolean;
  merged_at?: string | null;
  /** For PRs: draft status */
  draft?: boolean;
}

/**
 * GitHub messages data slice structure
 * This is what the GitHubMessagesPanel receives from context.getSlice('github-messages')
 */
export interface GitHubMessagesSliceData {
  /** The issue or PR being viewed */
  target: GitHubMessagesTarget | null;
  /** Timeline events (comments, reviews, commits, etc.) */
  timeline: GitHubTimelineEvent[];
  /** Inline review comments (for PRs only) */
  reviewComments: GitHubReviewComment[];
  /** Repository owner */
  owner: string;
  /** Repository name */
  repo: string;
  /** Loading state */
  loading: boolean;
  /** Whether the user is authenticated with GitHub */
  isAuthenticated: boolean;
  /** Error message if fetch failed */
  error?: string;
}

/**
 * Payload for messages:request event
 * Emitted to request messages for an issue or PR
 */
export interface MessagesRequestEventPayload {
  /** Repository owner */
  owner: string;
  /** Repository name */
  repo: string;
  /** Issue or PR number */
  number: number;
  /** Type of target */
  type: 'issue' | 'pull_request';
}

/**
 * Payload for pr:selected event
 * Emitted when a user selects a pull request
 */
export interface PullRequestSelectedEventPayload {
  /** The selected pull request */
  pullRequest: GitHubPullRequest;
  /** Repository owner */
  owner: string;
  /** Repository name */
  repo: string;
}

/**
 * Payload for comment:create event
 * Emitted when user creates a new comment
 */
export interface CommentCreateEventPayload {
  owner: string;
  repo: string;
  targetType: 'issue' | 'pull_request';
  targetNumber: number;
  body: string;
}

/**
 * Payload for comment:created success event
 * Received when comment is successfully created
 */
export interface CommentCreatedEventPayload {
  targetNumber: number;
  commentId: number;
  comment: GitHubComment;
}

/**
 * Payload for comment:error event
 * Received when comment creation fails
 */
export interface CommentErrorEventPayload {
  targetNumber: number;
  error: string;
}

// ============================================================================
// Panel-specific typed interfaces (v0.4.2 migration)
// ============================================================================

import type { PanelActions, PanelComponentProps, DataSlice } from '@principal-ade/panel-framework-core';

/**
 * Actions for GitHubProjectsPanel
 * This panel doesn't require any actions - it only reads from slices and emits events
 */
export type GitHubProjectsPanelActions = PanelActions;

/**
 * Context for GitHubProjectsPanel
 */
export interface GitHubProjectsPanelContext {
  githubRepositories: DataSlice<GitHubRepositoriesSliceData>;
}

/**
 * Typed props for GitHubProjectsPanel
 */
export type GitHubProjectsPanelProps = PanelComponentProps<
  GitHubProjectsPanelActions,
  GitHubProjectsPanelContext
>;

/**
 * Context for GitHubSearchPanel
 */
export interface GitHubSearchPanelContext {
  workspace?: DataSlice<WorkspaceCollectionSlice>;
  workspaceRepositories?: DataSlice<GitHubWorkspaceRepositoriesSlice>;
}

/**
 * Typed props for GitHubSearchPanel
 */
export type GitHubSearchPanelProps = PanelComponentProps<
  GitHubSearchPanelActions,
  GitHubSearchPanelContext
>;

/**
 * Actions for GitHubIssuesPanel
 * This panel doesn't require any actions - it only reads from slices and emits events
 */
export type GitHubIssuesPanelActions = PanelActions;

/**
 * Context for GitHubIssuesPanel
 */
export interface GitHubIssuesPanelContext {
  githubIssues: DataSlice<GitHubIssuesSliceData>;
}

/**
 * Typed props for GitHubIssuesPanel
 */
export type GitHubIssuesPanelProps = PanelComponentProps<
  GitHubIssuesPanelActions,
  GitHubIssuesPanelContext
>;

/**
 * Actions for GitHubMessagesPanel
 * This panel doesn't require any actions - it only reads from slices and emits events
 */
export type GitHubMessagesPanelActions = PanelActions;

/**
 * Context for GitHubMessagesPanel
 */
export interface GitHubMessagesPanelContext {
  githubMessages: DataSlice<GitHubMessagesSliceData>;
}

/**
 * Typed props for GitHubMessagesPanel
 */
export type GitHubMessagesPanelProps = PanelComponentProps<
  GitHubMessagesPanelActions,
  GitHubMessagesPanelContext
>;

/**
 * Actions for OwnerRepositoriesPanel
 * This panel doesn't require any actions - it only reads from slices and emits events
 */
export type OwnerRepositoriesPanelActions = PanelActions;

/**
 * Context for OwnerRepositoriesPanel
 */
export interface OwnerRepositoriesPanelContext {
  ownerRepositories: DataSlice<OwnerRepositoriesSliceData>;
}

/**
 * Typed props for OwnerRepositoriesPanel (extends base props with owner prop)
 */
export type OwnerRepositoriesPanelPropsTyped = PanelComponentProps<
  OwnerRepositoriesPanelActions,
  OwnerRepositoriesPanelContext
>;

/**
 * Actions for GitHubIssueDetailPanel
 * This panel is event-driven and doesn't use slices or actions
 */
export type GitHubIssueDetailPanelActions = PanelActions;

/**
 * Context for GitHubIssueDetailPanel
 * This panel is event-driven and doesn't use context slices
 */
export type GitHubIssueDetailPanelContext = {};

/**
 * Typed props for GitHubIssueDetailPanel
 */
export type GitHubIssueDetailPanelProps = PanelComponentProps<
  GitHubIssueDetailPanelActions,
  GitHubIssueDetailPanelContext
>;

/**
 * Actions for RecentRepositoriesPanel
 * This panel uses localStorage and doesn't require actions or slices
 */
export type RecentRepositoriesPanelActions = PanelActions;

/**
 * Context for RecentRepositoriesPanel
 * This panel uses localStorage and doesn't require context slices
 */
export type RecentRepositoriesPanelContext = {};

/**
 * Typed props for RecentRepositoriesPanel
 */
export type RecentRepositoriesPanelProps = PanelComponentProps<
  RecentRepositoriesPanelActions,
  RecentRepositoriesPanelContext
>;
