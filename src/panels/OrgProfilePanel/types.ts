/**
 * OrgProfilePanel Type Definitions
 *
 * Types for displaying organization profiles,
 * including their collections and repositories.
 */

import type { PanelActions, DataSlice, PanelComponentProps } from '@principal-ade/panel-framework-core';
import type { GitHubRepository } from '../../types/github';
import type { Collection } from '@principal-ai/alexandria-collections';

/**
 * GitHub Organization profile - extended from basic org data
 */
export interface GitHubOrgProfile {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  description: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  twitter_username: string | null;
  is_verified: boolean;
  has_organization_projects: boolean;
  has_repository_projects: boolean;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  html_url: string;
  created_at: string;
  updated_at: string;
  type: 'Organization';
}

// Re-export shared types for convenience
export type { GitHubRepository, Collection };

/**
 * Data slice for org profile panel
 */
export interface OrgProfileSlice {
  /** The organization's GitHub profile */
  org: GitHubOrgProfile | null;
  /** Organization's collections */
  collections: Collection[];
  /** Organization's repositories */
  repositories: GitHubRepository[];
  /** Currently selected collection ID (for highlighting) */
  selectedCollectionId?: string | null;
  /** Currently selected repository ID (for highlighting) */
  selectedRepositoryId?: number | null;
  /** Currently active view tab */
  currentView?: OrgProfileView;
  /** Whether data is loading */
  loading: boolean;
  /** Error message if loading failed */
  error?: string;
}

/**
 * Extended actions for OrgProfilePanel
 */
export interface OrgProfilePanelActions extends PanelActions {
  /**
   * View a repository's details
   * @param owner - Repository owner
   * @param repo - Repository name
   */
  viewRepository?: (owner: string, repo: string) => Promise<void>;

  /**
   * Clone a repository
   * @param repository - Repository to clone
   */
  cloneRepository?: (repository: GitHubRepository) => Promise<void>;

  /**
   * Open URL in browser
   * @param url - URL to open
   */
  openInBrowser?: (url: string) => Promise<void>;

  /**
   * Fetch organization profile by login
   * @param login - Organization login/username
   */
  fetchOrgProfile?: (login: string) => Promise<GitHubOrgProfile | null>;

  /**
   * Fetch organization's repositories
   * @param login - Organization login
   */
  fetchOrgRepositories?: (login: string) => Promise<GitHubRepository[]>;
}

/**
 * Props for CollectionCard component
 */
export interface CollectionCardProps {
  /** Collection data */
  collection: Collection;
  /** Whether this collection is selected */
  isSelected?: boolean;
  /** Callback when card is clicked */
  onClick?: (collection: Collection) => void;
}

/**
 * Props for RepositoryCard component
 */
export interface RepositoryCardProps {
  /** Repository data */
  repository: GitHubRepository;
  /** Callback when card is clicked */
  onClick?: (repository: GitHubRepository) => void;
  /** Callback when clone button is clicked */
  onClone?: (repository: GitHubRepository) => void;
  /** Callback when open in browser is clicked */
  onOpenInBrowser?: (repository: GitHubRepository) => void;
}

/**
 * Context interface for OrgProfilePanel
 * Declares which slices this panel requires
 */
export interface OrgProfilePanelContext {
  /** Organization profile data slice (required) */
  orgProfile: DataSlice<OrgProfileSlice>;
}

/**
 * Props type for OrgProfilePanel component
 */
export type OrgProfilePanelPropsTyped = PanelComponentProps<
  OrgProfilePanelActions,
  OrgProfilePanelContext
>;

/**
 * Collection selected event payload
 */
export interface CollectionSelectedPayload {
  collectionId: string;
  collection: Collection;
}

/**
 * Repository selected event payload
 */
export interface RepositorySelectedPayload {
  owner: string;
  repo: string;
  repository: GitHubRepository;
}

/**
 * Repository clone requested event payload
 */
export interface RepositoryCloneRequestedPayload {
  repository: GitHubRepository;
}

/**
 * Event payloads for OrgProfilePanel
 */
export interface OrgProfilePanelEventPayloads {
  /** Select collection event (from tools) */
  'select-collection': { collectionId: string };
  /** Select repository event (from tools) */
  'select-repository': { owner: string; repo: string };
  /** Collection selected notification */
  'collection:selected': CollectionSelectedPayload;
  /** Repository selected notification */
  'repository:selected': RepositorySelectedPayload;
  /** Repository clone requested notification */
  'repository:clone-requested': RepositoryCloneRequestedPayload;
  /** Profile view changed (switched tabs) */
  'view:changed': { view: OrgProfileView };
}

/**
 * Active view tab in the panel
 */
export type OrgProfileView = 'collections' | 'repositories';
