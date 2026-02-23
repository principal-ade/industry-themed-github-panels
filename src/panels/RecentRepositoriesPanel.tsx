import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { X, Github } from 'lucide-react';

import type {
  GitHubRepository,
  RepositoryPreviewEventPayload,
  RecentRepositoriesPanelProps,
} from '../types/github';

const STORAGE_KEY = 'recent-repositories';
const OWNERS_STORAGE_KEY = 'recent-owners';
const MAX_RECENT_ITEMS = 50;

/**
 * A simplified repository record stored in localStorage
 */
interface RecentRepository {
  type: 'repository';
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url?: string;
  };
  description: string | null;
  language: string | null;
  html_url: string;
  stargazers_count?: number;
  forks_count?: number;
  visitedAt: number;
}

/**
 * A simplified owner record stored in localStorage
 */
interface RecentOwner {
  type: 'owner';
  id: number;
  login: string;
  avatar_url?: string;
  name?: string;
  bio?: string;
  ownerType: 'User' | 'Organization';
  public_repos?: number;
  followers?: number;
  visitedAt: number;
}

type RecentItem = RecentRepository | RecentOwner;

/**
 * Load recent repositories from localStorage
 */
function loadRecentRepositories(): RecentRepository[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const items = JSON.parse(stored);
      // Add type field if missing (migration from old format)
      return items.map((item: RecentRepository) => ({ ...item, type: 'repository' as const }));
    }
  } catch (err) {
    console.error('Failed to load recent repositories:', err);
  }
  return [];
}

/**
 * Load recent owners from localStorage
 */
function loadRecentOwners(): RecentOwner[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(OWNERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Failed to load recent owners:', err);
  }
  return [];
}

/**
 * Save recent repositories to localStorage
 */
function saveRecentRepositories(repos: RecentRepository[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(repos));
  } catch (err) {
    console.error('Failed to save recent repositories:', err);
  }
}

/**
 * Save recent owners to localStorage
 */
function saveRecentOwners(owners: RecentOwner[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OWNERS_STORAGE_KEY, JSON.stringify(owners));
  } catch (err) {
    console.error('Failed to save recent owners:', err);
  }
}

/**
 * Add a repository to the recent list
 */
export function addRecentRepository(repo: GitHubRepository): void {
  // Validate required fields to prevent undefined key issues
  if (repo.id == null) {
    console.warn('addRecentRepository: skipping repository without valid id', repo.full_name);
    return;
  }

  const recent = loadRecentRepositories();

  // Remove if already exists
  const filtered = recent.filter(r => r.id !== repo.id);

  // Add to front with current timestamp
  const newEntry: RecentRepository = {
    type: 'repository',
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    owner: {
      login: repo.owner.login,
      avatar_url: repo.owner.avatar_url,
    },
    description: repo.description,
    language: repo.language,
    html_url: repo.html_url,
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    visitedAt: Date.now(),
  };

  // Keep only MAX_RECENT_ITEMS
  const updated = [newEntry, ...filtered].slice(0, MAX_RECENT_ITEMS);
  saveRecentRepositories(updated);

  // Dispatch event so panels can update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('recent-items-updated'));
  }
}

/**
 * Owner info structure for addRecentOwner
 */
export interface OwnerInfo {
  id: number;
  login: string;
  avatar_url?: string;
  name?: string;
  bio?: string;
  type: 'User' | 'Organization';
  public_repos?: number;
  followers?: number;
}

/**
 * Add an owner to the recent list
 */
export function addRecentOwner(owner: OwnerInfo): void {
  // Validate required fields to prevent undefined key issues
  if (owner.id == null) {
    console.warn('addRecentOwner: skipping owner without valid id', owner.login);
    return;
  }

  const recent = loadRecentOwners();

  // Remove if already exists
  const filtered = recent.filter(o => o.id !== owner.id);

  // Add to front with current timestamp
  const newEntry: RecentOwner = {
    type: 'owner',
    id: owner.id,
    login: owner.login,
    avatar_url: owner.avatar_url,
    name: owner.name,
    bio: owner.bio,
    ownerType: owner.type,
    public_repos: owner.public_repos,
    followers: owner.followers,
    visitedAt: Date.now(),
  };

  // Keep only MAX_RECENT_ITEMS
  const updated = [newEntry, ...filtered].slice(0, MAX_RECENT_ITEMS);
  saveRecentOwners(updated);

  // Dispatch event so panels can update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('recent-items-updated'));
  }
}

/**
 * RecentRepositoriesPanelContent - Internal component that uses theme
 */
const RecentRepositoriesPanelContent: React.FC<RecentRepositoriesPanelProps & {
  onNavigate?: (path: string) => void;
}> = ({
  events,
  onNavigate,
}) => {
  const { theme } = useTheme();
  const [items, setItems] = useState<RecentItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Create unique ID for an item
  const getItemId = (item: RecentItem): string => {
    return item.type === 'repository' ? `repo-${item.id}` : `owner-${item.id}`;
  };

  // Load and merge items on mount
  useEffect(() => {
    const loadItems = () => {
      // Filter out items with undefined IDs to prevent duplicate key warnings
      const repos = loadRecentRepositories().filter(r => r.id != null);
      const owners = loadRecentOwners().filter(o => o.id != null);

      // Merge and sort by visitedAt
      const merged: RecentItem[] = [...repos, ...owners].sort(
        (a, b) => b.visitedAt - a.visitedAt
      );
      setItems(merged);
    };

    loadItems();

    // Listen for updates
    const handleUpdate = () => loadItems();
    window.addEventListener('recent-items-updated', handleUpdate);
    // Legacy event for backward compatibility
    window.addEventListener('recent-repositories-updated', handleUpdate);

    return () => {
      window.removeEventListener('recent-items-updated', handleUpdate);
      window.removeEventListener('recent-repositories-updated', handleUpdate);
    };
  }, []);

  // Handle repository click
  const handleSelectRepository = useCallback((repo: RecentRepository) => {
    setSelectedId(getItemId(repo));

    const githubRepo: GitHubRepository = {
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url || `https://github.com/${repo.owner.login}.png`,
      },
      private: false,
      html_url: repo.html_url,
      description: repo.description,
      fork: false,
      clone_url: `https://github.com/${repo.full_name}.git`,
      language: repo.language,
      default_branch: 'main',
      updated_at: new Date().toISOString(),
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
    };

    events.emit<RepositoryPreviewEventPayload>({
      type: 'repository:preview',
      source: 'recent-repositories-panel',
      timestamp: Date.now(),
      payload: {
        repository: githubRepo,
        source: 'click',
      },
    });
  }, [events]);

  // Handle repository double-click (open)
  const handleOpenRepository = useCallback((repo: RecentRepository) => {
    if (onNavigate) {
      onNavigate(`/${repo.full_name}`);
    } else {
      const githubRepo: GitHubRepository = {
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatar_url || `https://github.com/${repo.owner.login}.png`,
        },
        private: false,
        html_url: repo.html_url,
        description: repo.description,
        fork: false,
        clone_url: `https://github.com/${repo.full_name}.git`,
        language: repo.language,
        default_branch: 'main',
        updated_at: new Date().toISOString(),
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
      };

      events.emit({
        type: 'repository:selected',
        source: 'recent-repositories-panel',
        timestamp: Date.now(),
        payload: {
          repository: githubRepo,
          source: 'click',
        },
      });
    }
  }, [events, onNavigate]);

  // Handle owner click
  const handleSelectOwner = useCallback((owner: RecentOwner) => {
    setSelectedId(getItemId(owner));

    events.emit({
      type: 'owner:preview',
      source: 'recent-repositories-panel',
      timestamp: Date.now(),
      payload: { owner },
    });
  }, [events]);

  // Handle owner double-click (open)
  const handleOpenOwner = useCallback((owner: RecentOwner) => {
    if (onNavigate) {
      onNavigate(`/${owner.login}`);
    } else {
      events.emit({
        type: 'owner:selected',
        source: 'recent-repositories-panel',
        timestamp: Date.now(),
        payload: { owner },
      });
    }
  }, [events, onNavigate]);

  // Remove a single item
  const handleRemoveItem = useCallback((item: RecentItem, e: React.MouseEvent) => {
    e.stopPropagation();

    if (item.type === 'repository') {
      const repos = loadRecentRepositories().filter(r => r.id !== item.id);
      saveRecentRepositories(repos);
    } else {
      const owners = loadRecentOwners().filter(o => o.id !== item.id);
      saveRecentOwners(owners);
    }

    setItems(prev => prev.filter(i => getItemId(i) !== getItemId(item)));

    if (selectedId === getItemId(item)) {
      setSelectedId(null);
    }
  }, [selectedId]);

  // Clear all history
  const handleClearAll = useCallback(() => {
    saveRecentRepositories([]);
    saveRecentOwners([]);
    setItems([]);
    setSelectedId(null);
  }, []);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: `${theme.fontSizes[3]}px`,
            fontWeight: theme.fontWeights.semibold,
          }}
        >
          Recent
        </h2>
        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: `1px solid ${theme.colors.border}`,
              background: 'transparent',
              cursor: 'pointer',
              color: theme.colors.textSecondary,
              fontSize: `${theme.fontSizes[1]}px`,
            }}
            title="Clear history"
          >
            Clear
          </button>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            color: theme.colors.textSecondary,
          }}
        >
          <Github size={48} color={theme.colors.border} style={{ marginBottom: 16 }} />
          <p style={{ margin: 0, fontSize: `${theme.fontSizes[2]}px` }}>
            No recent activity
          </p>
          <p style={{ margin: '8px 0 0', fontSize: `${theme.fontSizes[1]}px` }}>
            Repositories and owners you visit will appear here
          </p>
        </div>
      )}

      {/* Items List */}
      {items.length > 0 && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {items.map((item) => {
            const itemId = getItemId(item);
            const isSelected = selectedId === itemId;
            const isHovered = hoveredId === itemId;

            if (item.type === 'repository') {
              return (
                <div
                  key={itemId}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectRepository(item)}
                  onDoubleClick={() => handleOpenRepository(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSelectRepository(item);
                    if (e.key === ' ') { e.preventDefault(); handleSelectRepository(item); }
                  }}
                  onMouseEnter={() => setHoveredId(itemId)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderBottom: `1px solid ${theme.colors.border}`,
                    backgroundColor: isSelected
                      ? `${theme.colors.primary}10`
                      : isHovered
                        ? theme.colors.backgroundSecondary
                        : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'background-color 0.15s ease',
                    position: 'relative',
                  }}
                >
                  {isHovered && (
                    <button
                      onClick={(e) => handleRemoveItem(item, e)}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '8px',
                        padding: '4px',
                        borderRadius: '4px',
                        border: 'none',
                        background: theme.colors.backgroundSecondary,
                        cursor: 'pointer',
                        color: theme.colors.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Remove from history"
                    >
                      <X size={14} />
                    </button>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.owner.avatar_url && (
                      <img
                        src={item.owner.avatar_url}
                        alt={item.owner.login}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          border: `1px solid ${theme.colors.border}`,
                        }}
                      />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: `${theme.fontSizes[2]}px`,
                          fontWeight: theme.fontWeights.semibold,
                          color: theme.colors.primary,
                        }}
                      >
                        {item.name}
                      </span>
                      <span
                        style={{
                          fontSize: `${theme.fontSizes[1]}px`,
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {item.owner.login}
                      </span>
                    </div>
                  </div>

                  {item.description && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: `${theme.fontSizes[1]}px`,
                        color: theme.colors.textSecondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              );
            }

            // Owner item
            return (
              <div
                key={itemId}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectOwner(item)}
                onDoubleClick={() => handleOpenOwner(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSelectOwner(item);
                  if (e.key === ' ') { e.preventDefault(); handleSelectOwner(item); }
                }}
                onMouseEnter={() => setHoveredId(itemId)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderBottom: `1px solid ${theme.colors.border}`,
                  backgroundColor: isSelected
                    ? `${theme.colors.primary}10`
                    : isHovered
                      ? theme.colors.backgroundSecondary
                      : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'background-color 0.15s ease',
                  position: 'relative',
                }}
              >
                {isHovered && (
                  <button
                    onClick={(e) => handleRemoveItem(item, e)}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '8px',
                      padding: '4px',
                      borderRadius: '4px',
                      border: 'none',
                      background: theme.colors.backgroundSecondary,
                      cursor: 'pointer',
                      color: theme.colors.textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Remove from history"
                  >
                    <X size={14} />
                  </button>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {item.avatar_url && (
                    <img
                      src={item.avatar_url}
                      alt={item.login}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: item.ownerType === 'Organization' ? 8 : '50%',
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: `${theme.fontSizes[2]}px`,
                        fontWeight: theme.fontWeights.semibold,
                        color: theme.colors.primary,
                      }}
                    >
                      {item.name || item.login}
                    </span>
                    {item.name && (
                      <span
                        style={{
                          fontSize: `${theme.fontSizes[1]}px`,
                          color: theme.colors.textSecondary,
                        }}
                      >
                        @{item.login}
                      </span>
                    )}
                  </div>
                </div>

                {item.bio && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: `${theme.fontSizes[1]}px`,
                      color: theme.colors.textSecondary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.bio}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * RecentRepositoriesPanel - A panel for displaying recently visited repositories and owners
 *
 * Features:
 * - Persists visited repos and owners in localStorage
 * - Shows owner avatar, repo name, description
 * - Displays stars, forks, language, and last visited time
 * - Filter by repositories or owners
 * - Click to preview, double-click to open
 * - Remove individual items or clear all history
 */
export const RecentRepositoriesPanel: React.FC<RecentRepositoriesPanelProps & {
  onNavigate?: (path: string) => void;
}> = (props) => {
  return <RecentRepositoriesPanelContent {...props} />;
};

/**
 * Panel metadata for registration
 */
export const RecentRepositoriesPanelMetadata = {
  id: 'recent-repositories',
  name: 'Recent',
  description: 'View and navigate to recently visited repositories and owners',
  icon: 'history',
  version: '0.1.0',
  slices: [],
  surfaces: ['panel'],
};
