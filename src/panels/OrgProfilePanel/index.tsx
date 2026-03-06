import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import {
  Building2,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Users,
  FolderGit2,
  FolderOpen,
  Search,
  X,
} from 'lucide-react';
import type {
  Collection,
  GitHubRepository,
  OrgProfilePanelPropsTyped,
  OrgProfileView,
} from './types';
import { GitHubRepositoryCard } from '../../components/shared/GitHubRepositoryCard';

// Panel event prefix
const PANEL_ID = 'industry-theme.org-profile';

// Helper to create panel events with required fields
const createPanelEvent = <T,>(type: string, payload: T) => ({
  type,
  source: PANEL_ID,
  timestamp: Date.now(),
  payload,
});

/**
 * Format a date string to a readable format
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

/**
 * CollectionCard - Displays a single collection
 */
const CollectionCard: React.FC<{
  collection: Collection;
  isSelected?: boolean;
  onClick?: (collection: Collection) => void;
}> = ({ collection, isSelected, onClick }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => onClick?.(collection)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: isSelected
          ? `${theme.colors.primary}15`
          : isHovered
            ? theme.colors.backgroundTertiary
            : theme.colors.background,
        border: `1px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          backgroundColor: theme.colors.backgroundTertiary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FolderOpen size={20} style={{ color: theme.colors.primary }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: `${theme.fontSizes[1]}px`,
            fontWeight: theme.fontWeights.semibold,
            color: theme.colors.text,
            fontFamily: theme.fonts.body,
          }}
        >
          {collection.name}
        </div>
        {collection.description && (
          <div
            style={{
              fontSize: `${theme.fontSizes[0]}px`,
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.body,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {collection.description}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * OrgProfilePanelContent - Internal component that uses theme
 */
const OrgProfilePanelContent: React.FC<OrgProfilePanelPropsTyped> = ({
  context,
  actions,
  events,
}) => {
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState<OrgProfileView>('repositories');
  const [searchQuery, setSearchQuery] = useState('');

  // Get extended actions
  const panelActions = actions;

  // Get org profile data from typed context slice
  const { orgProfile: profileSlice } = context;
  const org = profileSlice?.data?.org ?? null;
  const collections = useMemo(
    () => profileSlice?.data?.collections || [],
    [profileSlice?.data?.collections]
  );
  const repositories = useMemo(
    () => profileSlice?.data?.repositories || [],
    [profileSlice?.data?.repositories]
  );
  const selectedCollectionId = profileSlice?.data?.selectedCollectionId;
  const loading = profileSlice?.loading ?? false;

  // Filter repositories by search
  const filteredRepositories = useMemo(() => {
    if (!searchQuery.trim()) return repositories;
    const query = searchQuery.toLowerCase().trim();
    return repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query) ||
        repo.full_name.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query) ||
        repo.language?.toLowerCase().includes(query)
    );
  }, [repositories, searchQuery]);

  // Handle collection selection
  const handleCollectionSelect = useCallback(
    (collection: Collection) => {
      events.emit(
        createPanelEvent(`${PANEL_ID}:collection:selected`, {
          collectionId: collection.id,
          collection,
        })
      );
    },
    [events]
  );

  // Handle repository selection
  const handleRepositorySelect = useCallback(
    (repository: GitHubRepository) => {
      events.emit(
        createPanelEvent(`${PANEL_ID}:repository:selected`, {
          owner: repository.owner.login,
          repo: repository.name,
          repository,
        })
      );
      panelActions.viewRepository?.(repository.owner.login, repository.name);
    },
    [events, panelActions]
  );

  // Handle repository clone
  const handleCloneRepository = useCallback(
    (repository: GitHubRepository) => {
      events.emit(
        createPanelEvent(`${PANEL_ID}:repository:clone-requested`, {
          repository,
        })
      );
      panelActions.cloneRepository?.(repository);
    },
    [events, panelActions]
  );

  // Handle view change
  const handleViewChange = useCallback(
    (view: OrgProfileView) => {
      setActiveView(view);
      setSearchQuery('');
      events.emit(createPanelEvent(`${PANEL_ID}:view:changed`, { view }));
    },
    [events]
  );

  // Subscribe to panel events
  useEffect(() => {
    const unsubscribers = [
      events.on<{ view: OrgProfileView }>(`${PANEL_ID}:set-view`, (event) => {
        if (event.payload?.view) {
          handleViewChange(event.payload.view);
        }
      }),
      events.on<{ collectionId: string }>(
        `${PANEL_ID}:select-collection`,
        (event) => {
          const { collectionId } = event.payload || {};
          if (collectionId) {
            const collection = collections.find((c) => c.id === collectionId);
            if (collection) {
              handleCollectionSelect(collection);
            }
          }
        }
      ),
      events.on<{ owner: string; repo: string }>(
        `${PANEL_ID}:select-repository`,
        (event) => {
          const { owner, repo } = event.payload || {};
          if (owner && repo) {
            const repository = repositories.find(
              (r) => r.owner.login === owner && r.name === repo
            );
            if (repository) {
              handleRepositorySelect(repository);
            }
          }
        }
      ),
      events.on<{ owner: string; repo: string }>(
        `${PANEL_ID}:clone-repository`,
        (event) => {
          const { owner, repo } = event.payload || {};
          if (owner && repo) {
            const repository = repositories.find(
              (r) => r.owner.login === owner && r.name === repo
            );
            if (repository) {
              handleCloneRepository(repository);
            }
          }
        }
      ),
      events.on<{ filter: string }>(`${PANEL_ID}:filter-repositories`, (event) => {
        if (event.payload?.filter !== undefined) {
          setSearchQuery(event.payload.filter);
          setActiveView('repositories');
        }
      }),
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [
    events,
    collections,
    repositories,
    handleViewChange,
    handleCollectionSelect,
    handleRepositorySelect,
    handleCloneRepository,
  ]);

  const baseContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: theme.colors.backgroundSecondary,
  };

  // Loading state
  if (loading) {
    return (
      <div style={baseContainerStyle}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              maxWidth: '360px',
            }}
          >
            <h3
              style={{
                margin: 0,
                color: theme.colors.text,
                fontSize: `${theme.fontSizes[3]}px`,
                fontWeight: theme.fontWeights.semibold,
                fontFamily: theme.fonts.body,
              }}
            >
              Loading organization...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  // No org selected state
  if (!org) {
    return (
      <div style={baseContainerStyle}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              maxWidth: '360px',
            }}
          >
            <Building2 size={48} style={{ color: theme.colors.textSecondary }} />
            <h3
              style={{
                margin: 0,
                color: theme.colors.text,
                fontSize: `${theme.fontSizes[2]}px`,
                fontWeight: theme.fontWeights.semibold,
                fontFamily: theme.fonts.body,
              }}
            >
              Select an organization
            </h3>
            <p
              style={{
                margin: 0,
                color: theme.colors.textSecondary,
                fontSize: `${theme.fontSizes[1]}px`,
                fontFamily: theme.fonts.body,
              }}
            >
              Click on an organization to view its profile and repositories
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={baseContainerStyle}>
      {/* Org Info */}
      <div
        style={{
          padding: '16px',
          backgroundColor: theme.colors.background,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <img
            src={org.avatar_url}
            alt={org.login}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '12px',
              objectFit: 'cover',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: `${theme.fontSizes[3]}px`,
                fontWeight: theme.fontWeights.bold,
                color: theme.colors.text,
                fontFamily: theme.fonts.body,
              }}
            >
              {org.name || org.login}
            </div>
            <div
              onClick={() =>
                panelActions.openInBrowser?.(`https://github.com/${org.login}`)
              }
              style={{
                fontSize: `${theme.fontSizes[1]}px`,
                color: theme.colors.primary,
                fontFamily: theme.fonts.body,
                cursor: panelActions.openInBrowser ? 'pointer' : 'default',
              }}
            >
              @{org.login}
            </div>
            {org.description && (
              <div
                style={{
                  fontSize: `${theme.fontSizes[1]}px`,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.body,
                  marginTop: '8px',
                }}
              >
                {org.description}
              </div>
            )}
          </div>
        </div>

        {/* Org meta info */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '12px',
            fontSize: `${theme.fontSizes[0]}px`,
            color: theme.colors.textSecondary,
            fontFamily: theme.fonts.body,
          }}
        >
          {org.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} />
              {org.location}
            </span>
          )}
          {org.blog && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
              onClick={() => panelActions.openInBrowser?.(org.blog!)}
            >
              <LinkIcon size={12} />
              {org.blog.replace(/^https?:\/\//, '')}
            </span>
          )}
          {org.email && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {org.email}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} />
            Created {formatDate(org.created_at)}
          </span>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '12px',
            fontSize: `${theme.fontSizes[1]}px`,
            fontFamily: theme.fonts.body,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={14} style={{ color: theme.colors.textSecondary }} />
            <strong style={{ color: theme.colors.text }}>
              {org.followers}
            </strong>{' '}
            <span style={{ color: theme.colors.textSecondary }}>followers</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FolderGit2 size={14} style={{ color: theme.colors.textSecondary }} />
            <strong style={{ color: theme.colors.text }}>
              {org.public_repos}
            </strong>{' '}
            <span style={{ color: theme.colors.textSecondary }}>repos</span>
          </span>
        </div>
      </div>

      {/* Tab navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.background,
        }}
      >
        <button
          onClick={() => handleViewChange('collections')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '12px',
            border: 'none',
            backgroundColor: 'transparent',
            color:
              activeView === 'collections'
                ? theme.colors.primary
                : theme.colors.textSecondary,
            fontSize: `${theme.fontSizes[1]}px`,
            fontWeight:
              activeView === 'collections'
                ? theme.fontWeights.semibold
                : theme.fontWeights.medium,
            fontFamily: theme.fonts.body,
            cursor: 'pointer',
            borderBottom:
              activeView === 'collections'
                ? `2px solid ${theme.colors.primary}`
                : '2px solid transparent',
            transition: 'all 0.15s ease',
          }}
        >
          <FolderOpen size={16} />
          Collections ({collections.length})
        </button>
        <button
          onClick={() => handleViewChange('repositories')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '12px',
            border: 'none',
            backgroundColor: 'transparent',
            color:
              activeView === 'repositories'
                ? theme.colors.primary
                : theme.colors.textSecondary,
            fontSize: `${theme.fontSizes[1]}px`,
            fontWeight:
              activeView === 'repositories'
                ? theme.fontWeights.semibold
                : theme.fontWeights.medium,
            fontFamily: theme.fonts.body,
            cursor: 'pointer',
            borderBottom:
              activeView === 'repositories'
                ? `2px solid ${theme.colors.primary}`
                : '2px solid transparent',
            transition: 'all 0.15s ease',
          }}
        >
          <FolderGit2 size={16} />
          Repositories ({repositories.length})
        </button>
      </div>

      {/* Search box for repositories view */}
      {activeView === 'repositories' && (
        <div
          style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.background,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.backgroundSecondary,
              }}
            >
              <Search size={16} style={{ color: theme.colors.textSecondary }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter repositories..."
                style={{
                  flex: 1,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: theme.colors.text,
                  fontSize: `${theme.fontSizes[1]}px`,
                  fontFamily: theme.fonts.body,
                  outline: 'none',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: theme.colors.textSecondary,
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {activeView === 'collections' && (
          <>
            {collections.length === 0 ? (
              <div
                style={{
                  padding: '32px',
                  textAlign: 'center',
                  color: theme.colors.textSecondary,
                }}
              >
                <FolderOpen
                  size={32}
                  style={{ marginBottom: '12px', opacity: 0.5 }}
                />
                <p style={{ margin: 0 }}>No collections</p>
              </div>
            ) : (
              collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  isSelected={collection.id === selectedCollectionId}
                  onClick={handleCollectionSelect}
                />
              ))
            )}
          </>
        )}

        {activeView === 'repositories' && (
          <>
            {filteredRepositories.length === 0 ? (
              <div
                style={{
                  padding: '32px',
                  textAlign: 'center',
                  color: theme.colors.textSecondary,
                }}
              >
                <FolderGit2
                  size={32}
                  style={{ marginBottom: '12px', opacity: 0.5 }}
                />
                <p style={{ margin: 0 }}>
                  {searchQuery
                    ? `No repositories matching "${searchQuery}"`
                    : 'No repositories'}
                </p>
              </div>
            ) : (
              filteredRepositories
                .sort((a, b) =>
                  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
                )
                .map((repo) => (
                  <GitHubRepositoryCard
                    key={repo.id}
                    repository={repo}
                    onSelect={handleRepositorySelect}
                    onClone={
                      panelActions.cloneRepository
                        ? handleCloneRepository
                        : undefined
                    }
                  />
                ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

/**
 * OrgProfilePanel - View organization profiles with their collections and repos
 *
 * Features:
 * - Display organization profile header with avatar, bio, stats
 * - Show organization's collections
 * - Show organization's repositories with search/filter
 * - Clone repositories
 *
 * Data Slices:
 * - orgProfile: OrgProfileSlice object
 *
 * Events Emitted:
 * - industry-theme.org-profile:collection:selected
 * - industry-theme.org-profile:repository:selected
 * - industry-theme.org-profile:repository:clone-requested
 * - industry-theme.org-profile:view:changed
 *
 * Events Listened:
 * - industry-theme.org-profile:set-view
 * - industry-theme.org-profile:select-collection
 * - industry-theme.org-profile:select-repository
 * - industry-theme.org-profile:clone-repository
 * - industry-theme.org-profile:filter-repositories
 */
export const OrgProfilePanel: React.FC<OrgProfilePanelPropsTyped> = (props) => {
  return <OrgProfilePanelContent {...props} />;
};

/**
 * OrgProfilePanelPreview - Compact preview for panel tabs/thumbnails
 */
export const OrgProfilePanelPreview: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        padding: '12px',
        fontSize: `${theme.fontSizes[0]}px`,
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: theme.fontWeights.semibold,
        }}
      >
        <Building2 size={16} style={{ color: theme.colors.primary }} />
        <span>Organization</span>
      </div>
      <div
        style={{
          fontSize: `${theme.fontSizes[0]}px`,
          fontFamily: theme.fonts.body,
          color: theme.colors.textSecondary,
          marginTop: '4px',
        }}
      >
        View organization collections and repos
      </div>
    </div>
  );
};

/**
 * Panel metadata for registration
 */
export const OrgProfilePanelMetadata = {
  id: 'industry-theme.org-profile',
  name: 'Organization Profile',
  description: 'View organization profiles with collections and repositories',
  icon: 'building-2',
  version: '0.1.0',
  slices: ['orgProfile'],
  surfaces: ['panel'],
};

// Re-export types
export type {
  GitHubOrgProfile,
  GitHubRepository,
  Collection,
  OrgProfileSlice,
  OrgProfilePanelActions,
  OrgProfileView,
  CollectionCardProps,
  RepositoryCardProps,
  CollectionSelectedPayload,
  RepositorySelectedPayload,
  RepositoryCloneRequestedPayload,
  OrgProfilePanelEventPayloads,
} from './types';
