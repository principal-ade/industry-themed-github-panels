/**
 * ProfilePanel Type Definitions
 *
 * Unified types for displaying user and organization profiles,
 * including their collections and repositories.
 */

import type {
  PanelActions,
  DataSlice,
  PanelComponentProps,
} from '@principal-ade/panel-framework-core';
import type { GitHubRepository } from '../../types/github';
import type { Collection } from '@principal-ai/alexandria-collections';
import type { ReactNode } from 'react';

// Re-export shared types for convenience
export type { GitHubRepository, Collection };

/**
 * Profile type discriminator
 */
export type ProfileType = 'user' | 'organization';

/**
 * GitHub User profile
 */
export interface GitHubUserProfile {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  company: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  blog?: string | null;
  twitter_username?: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  html_url?: string;
  created_at: string;
  updated_at: string;
  type?: 'User';
}

/**
 * GitHub Organization profile
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

/**
 * Union type for profile data
 */
export type GitHubProfile = GitHubUserProfile | GitHubOrgProfile;

/**
 * Active view tab in the panel
 * - 'collections': Show collections
 * - 'repositories': Show owned/org repositories
 * - 'starred': Show starred repositories (user only)
 */
export type ProfileView = 'collections' | 'repositories' | 'starred';

/**
 * Data slice for profile panel
 */
export interface ProfileSlice {
  /** The profile (user or org) */
  profile: GitHubProfile | null;
  /** Profile's collections */
  collections: Collection[];
  /** Profile's repositories (owned for users, org repos for orgs) */
  repositories: GitHubRepository[];
  /** Starred repositories (user only) */
  starredRepositories?: GitHubRepository[];
  /** Currently selected collection ID (for highlighting) */
  selectedCollectionId?: string | null;
  /** Currently selected repository ID (for highlighting) */
  selectedRepositoryId?: number | null;
  /** Currently active view tab */
  currentView?: ProfileView;
  /** Whether data is loading */
  loading: boolean;
  /** Error message if loading failed */
  error?: string;
}

/**
 * Extended actions for ProfilePanel
 */
export interface ProfilePanelActions extends PanelActions {
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
   * Fetch user profile by username
   * @param username - GitHub username
   */
  fetchUserProfile?: (username: string) => Promise<GitHubUserProfile | null>;

  /**
   * Fetch organization profile by login
   * @param login - Organization login
   */
  fetchOrgProfile?: (login: string) => Promise<GitHubOrgProfile | null>;

  /**
   * Fetch repositories for user/org
   * @param login - User/org login
   */
  fetchRepositories?: (login: string) => Promise<GitHubRepository[]>;

  /**
   * Fetch starred repositories (user only)
   * @param username - GitHub username
   */
  fetchStarredRepositories?: (username: string) => Promise<GitHubRepository[]>;
}

/**
 * Context interface for ProfilePanel
 * Declares which slices this panel requires
 */
export interface ProfilePanelContext {
  /** Profile data slice (required) */
  profile: DataSlice<ProfileSlice>;
}

/**
 * Extension points for customizing ProfilePanel behavior
 */
export interface ProfilePanelExtensions {
  /**
   * Render additional content in the header (e.g., presence indicator)
   * @param profile - The current profile
   */
  renderHeaderExtra?: (profile: GitHubProfile) => ReactNode;

  /**
   * Render additional actions for repository cards
   * @param repository - The repository
   */
  renderRepositoryActions?: (repository: GitHubRepository) => ReactNode;

  /**
   * Custom repository card wrapper (e.g., for drag-and-drop)
   * @param children - The repository card element
   * @param repository - The repository data
   */
  wrapRepositoryCard?: (
    children: ReactNode,
    repository: GitHubRepository
  ) => ReactNode;
}

/**
 * Base props for ProfilePanel component (before typed props)
 */
export interface ProfilePanelBaseProps {
  /**
   * Type of profile being displayed
   * Defaults to 'user' if not specified
   */
  profileType?: ProfileType;

  /**
   * Panel ID for events (defaults to 'industry-theme.profile')
   */
  panelId?: string;

  /**
   * Extension points for customization
   */
  extensions?: ProfilePanelExtensions;
}

/**
 * Props type for ProfilePanel component
 */
export type ProfilePanelPropsTyped = PanelComponentProps<
  ProfilePanelActions,
  ProfilePanelContext
> &
  ProfilePanelBaseProps;

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
 * Event payloads for ProfilePanel
 */
export interface ProfilePanelEventPayloads {
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
  'view:changed': { view: ProfileView };
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
 * Helper to check if profile is an organization
 */
export function isOrgProfile(
  profile: GitHubProfile
): profile is GitHubOrgProfile {
  return profile.type === 'Organization';
}

/**
 * Helper to check if profile is a user
 */
export function isUserProfile(
  profile: GitHubProfile
): profile is GitHubUserProfile {
  return profile.type !== 'Organization';
}

/**
 * Get description from profile (handles both user bio and org description)
 */
export function getProfileDescription(profile: GitHubProfile): string | null {
  if (isOrgProfile(profile)) {
    return profile.description;
  }
  return profile.bio;
}
