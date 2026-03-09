import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import {
  Building2,
  User,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Users,
  FolderGit2,
  FolderOpen,
  Search,
  X,
  Star,
} from 'lucide-react';
import type {
  Collection,
  GitHubRepository,
  GitHubProfile,
  ProfilePanelPropsTyped,
  ProfileView,
  ProfileType,
} from './types';
import { isOrgProfile, getProfileDescription } from './types';
import { GitHubRepositoryCard } from '../../components/shared/GitHubRepositoryCard';

// Default panel event prefix
const DEFAULT_PANEL_ID = 'industry-theme.profile';

// Helper to create panel events with required fields
const createPanelEvent = <T,>(panelId: string, type: string, payload: T) => ({
  type,
  source: panelId,
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
        padding: '16px',
        borderRadius: 0,
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
 * ProfilePanelContent - Internal component that uses theme
 */
const ProfilePanelContent: React.FC<ProfilePanelPropsTyped> = ({
  context,
  actions,
  events,
  profileType = 'user',
  panelId = DEFAULT_PANEL_ID,
  extensions,
}) => {
  const { theme } = useTheme();

  // Determine available views based on profile type
  const availableViews: ProfileView[] = useMemo(() => {
    if (profileType === 'user') {
      return ['collections', 'repositories', 'starred'];
    }
    return ['collections', 'repositories'];
  }, [profileType]);

  const [activeView, setActiveView] = useState<ProfileView>('repositories');
  const [searchQuery, setSearchQuery] = useState('');

  // Get profile data from typed context slice
  const { profile: profileSlice } = context;
  const profile = profileSlice?.data?.profile ?? null;
  const collections = useMemo(
    () => profileSlice?.data?.collections || [],
    [profileSlice?.data?.collections]
  );
  const repositories = useMemo(
    () => profileSlice?.data?.repositories || [],
    [profileSlice?.data?.repositories]
  );
  const starredRepositories = useMemo(
    () => profileSlice?.data?.starredRepositories || [],
    [profileSlice?.data?.starredRepositories]
  );
  const selectedCollectionId = profileSlice?.data?.selectedCollectionId;
  const selectedRepositoryId = profileSlice?.data?.selectedRepositoryId;
  const loading = profileSlice?.loading ?? false;

  // Filter repositories by search
  const filteredRepositories = useMemo(() => {
    const repos =
      activeView === 'starred' ? starredRepositories : repositories;
    if (!searchQuery.trim()) return repos;
    const query = searchQuery.toLowerCase().trim();
    return repos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query) ||
        repo.full_name.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query) ||
        repo.language?.toLowerCase().includes(query)
    );
  }, [repositories, starredRepositories, searchQuery, activeView]);

  // Handle collection selection
  const handleCollectionSelect = useCallback(
    (collection: Collection) => {
      events.emit(
        createPanelEvent(panelId, `${panelId}:collection:selected`, {
          collectionId: collection.id,
          collection,
        })
      );
    },
    [events, panelId]
  );

  // Handle repository selection
  const handleRepositorySelect = useCallback(
    (repository: GitHubRepository) => {
      // Emit standard repository:preview event for cross-panel communication
      events.emit({
        type: 'repository:preview',
        source: panelId,
        timestamp: Date.now(),
        payload: {
          repository,
          source: 'click',
        },
      });
      // Emit panel-specific event for detailed tracking
      events.emit(
        createPanelEvent(panelId, `${panelId}:repository:selected`, {
          owner: repository.owner.login,
          repo: repository.name,
          repository,
        })
      );
      actions.viewRepository?.(repository.owner.login, repository.name);
    },
    [events, panelId, actions]
  );

  // Handle repository clone
  const handleCloneRepository = useCallback(
    (repository: GitHubRepository) => {
      events.emit(
        createPanelEvent(panelId, `${panelId}:repository:clone-requested`, {
          repository,
        })
      );
      actions.cloneRepository?.(repository);
    },
    [events, panelId, actions]
  );

  // Handle view change
  const handleViewChange = useCallback(
    (view: ProfileView) => {
      setActiveView(view);
      setSearchQuery('');
      events.emit(createPanelEvent(panelId, `${panelId}:view:changed`, { view }));
    },
    [events, panelId]
  );

  // Subscribe to panel events
  useEffect(() => {
    const unsubscribers = [
      events.on<{ view: ProfileView }>(`${panelId}:set-view`, (event) => {
        if (event.payload?.view && availableViews.includes(event.payload.view)) {
          handleViewChange(event.payload.view);
        }
      }),
      events.on<{ collectionId: string }>(
        `${panelId}:select-collection`,
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
        `${panelId}:select-repository`,
        (event) => {
          const { owner, repo } = event.payload || {};
          if (owner && repo) {
            const allRepos = [...repositories, ...starredRepositories];
            const repository = allRepos.find(
              (r) => r.owner.login === owner && r.name === repo
            );
            if (repository) {
              handleRepositorySelect(repository);
            }
          }
        }
      ),
      events.on<{ owner: string; repo: string }>(
        `${panelId}:clone-repository`,
        (event) => {
          const { owner, repo } = event.payload || {};
          if (owner && repo) {
            const allRepos = [...repositories, ...starredRepositories];
            const repository = allRepos.find(
              (r) => r.owner.login === owner && r.name === repo
            );
            if (repository) {
              handleCloneRepository(repository);
            }
          }
        }
      ),
      events.on<{ filter: string }>(`${panelId}:filter-repositories`, (event) => {
        if (event.payload?.filter !== undefined) {
          setSearchQuery(event.payload.filter);
          if (activeView === 'collections') {
            setActiveView('repositories');
          }
        }
      }),
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [
    events,
    panelId,
    collections,
    repositories,
    starredRepositories,
    availableViews,
    activeView,
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
              Loading {profileType === 'organization' ? 'organization' : 'user'}...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  // No profile selected state
  if (!profile) {
    const EmptyIcon = profileType === 'organization' ? Building2 : User;
    const entityName = profileType === 'organization' ? 'organization' : 'user';

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
            <EmptyIcon size={48} style={{ color: theme.colors.textSecondary }} />
            <h3
              style={{
                margin: 0,
                color: theme.colors.text,
                fontSize: `${theme.fontSizes[2]}px`,
                fontWeight: theme.fontWeights.semibold,
                fontFamily: theme.fonts.body,
              }}
            >
              Select {entityName === 'organization' ? 'an' : 'a'} {entityName}
            </h3>
            <p
              style={{
                margin: 0,
                color: theme.colors.textSecondary,
                fontSize: `${theme.fontSizes[1]}px`,
                fontFamily: theme.fonts.body,
              }}
            >
              Click on {entityName === 'organization' ? 'an' : 'a'} {entityName} to
              view its profile and repositories
            </p>
          </div>
        </div>
      </div>
    );
  }

  const description = getProfileDescription(profile);
  const ProfileIcon = isOrgProfile(profile) ? Building2 : User;

  // Render repository card with optional wrapper from extensions
  const renderRepositoryCard = (repo: GitHubRepository) => {
    const card = (
      <GitHubRepositoryCard
        key={repo.id}
        repository={repo}
        isSelected={repo.id === selectedRepositoryId}
        onSelect={handleRepositorySelect}
        onClone={actions.cloneRepository ? handleCloneRepository : undefined}
      />
    );

    if (extensions?.wrapRepositoryCard) {
      return (
        <React.Fragment key={repo.id}>
          {extensions.wrapRepositoryCard(card, repo)}
        </React.Fragment>
      );
    }

    return card;
  };

  return (
    <div style={baseContainerStyle}>
      {/* Profile Info */}
      <div
        style={{
          padding: '16px',
          backgroundColor: theme.colors.background,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={profile.avatar_url}
              alt={profile.login}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                objectFit: 'cover',
              }}
            />
            {/* Extension point for presence indicator */}
            {extensions?.renderHeaderExtra?.(profile)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: `${theme.fontSizes[3]}px`,
                fontWeight: theme.fontWeights.bold,
                color: theme.colors.text,
                fontFamily: theme.fonts.body,
              }}
            >
              {profile.name || profile.login}
            </div>
            <div
              onClick={() =>
                actions.openInBrowser?.(`https://github.com/${profile.login}`)
              }
              style={{
                fontSize: `${theme.fontSizes[1]}px`,
                color: theme.colors.primary,
                fontFamily: theme.fonts.body,
                cursor: actions.openInBrowser ? 'pointer' : 'default',
              }}
            >
              @{profile.login}
            </div>
            {description && (
              <div
                style={{
                  fontSize: `${theme.fontSizes[1]}px`,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.body,
                  marginTop: '8px',
                }}
              >
                {description}
              </div>
            )}
          </div>
        </div>

        {/* Profile meta info */}
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
          {profile.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} />
              {profile.location}
            </span>
          )}
          {profile.blog && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
              onClick={() => actions.openInBrowser?.(profile.blog!)}
            >
              <LinkIcon size={12} />
              {profile.blog.replace(/^https?:\/\//, '')}
            </span>
          )}
          {profile.email && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {profile.email}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} />
            Created {formatDate(profile.created_at)}
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
              {profile.followers}
            </strong>{' '}
            <span style={{ color: theme.colors.textSecondary }}>followers</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ProfileIcon
              size={14}
              style={{ color: theme.colors.textSecondary }}
            />
            <strong style={{ color: theme.colors.text }}>
              {profile.following}
            </strong>{' '}
            <span style={{ color: theme.colors.textSecondary }}>following</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FolderGit2 size={14} style={{ color: theme.colors.textSecondary }} />
            <strong style={{ color: theme.colors.text }}>
              {profile.public_repos}
            </strong>{' '}
            <span style={{ color: theme.colors.textSecondary }}>projects</span>
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
          Projects (
          {repositories.length})
        </button>
        {profileType === 'user' && (
          <button
            onClick={() => handleViewChange('starred')}
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
                activeView === 'starred'
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
              fontSize: `${theme.fontSizes[1]}px`,
              fontWeight:
                activeView === 'starred'
                  ? theme.fontWeights.semibold
                  : theme.fontWeights.medium,
              fontFamily: theme.fonts.body,
              cursor: 'pointer',
              borderBottom:
                activeView === 'starred'
                  ? `2px solid ${theme.colors.primary}`
                  : '2px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <Star size={16} />
            Starred ({starredRepositories.length})
          </button>
        )}
      </div>

      {/* Search box for repositories/starred view - only show if 5+ items */}
      {(activeView === 'repositories' || activeView === 'starred') &&
        (activeView === 'starred' ? starredRepositories : repositories).length >= 5 && (
        <div
          style={{
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
                padding: '12px 16px',
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
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {activeView === 'collections' && (
          <>
            {collections.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px',
                  color: theme.colors.textSecondary,
                  fontSize: `${theme.fontSizes[1]}px`,
                  fontFamily: theme.fonts.body,
                  backgroundColor: theme.colors.background,
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

        {(activeView === 'repositories' || activeView === 'starred') && (
          <>
            {filteredRepositories.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px',
                  color: theme.colors.textSecondary,
                  fontSize: `${theme.fontSizes[1]}px`,
                  fontFamily: theme.fonts.body,
                  backgroundColor: theme.colors.background,
                }}
              >
                {activeView === 'starred' ? (
                  <Star size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                ) : (
                  <FolderGit2
                    size={32}
                    style={{ marginBottom: '12px', opacity: 0.5 }}
                  />
                )}
                <p style={{ margin: 0 }}>
                  {searchQuery
                    ? `No projects matching "${searchQuery}"`
                    : activeView === 'starred'
                      ? 'No starred projects'
                      : 'No projects'}
                </p>
              </div>
            ) : (
              filteredRepositories
                .sort((a, b) =>
                  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
                )
                .map(renderRepositoryCard)
            )}
          </>
        )}
      </div>
    </div>
  );
};

/**
 * ProfilePanel - View user or organization profiles with their collections and repos
 *
 * Features:
 * - Display profile header with avatar, bio/description, stats
 * - Show profile's collections
 * - Show profile's repositories with search/filter
 * - Show starred repositories (user only)
 * - Clone repositories
 * - Extension points for additional features (presence, drag-and-drop)
 *
 * Props:
 * - profileType: 'user' | 'organization'
 * - panelId: Custom panel ID for events (optional)
 * - extensions: Extension points for customization (optional)
 *
 * Data Slices:
 * - profile: ProfileSlice object
 *
 * Events Emitted:
 * - {panelId}:collection:selected
 * - {panelId}:repository:selected
 * - {panelId}:repository:clone-requested
 * - {panelId}:view:changed
 *
 * Events Listened:
 * - {panelId}:set-view
 * - {panelId}:select-collection
 * - {panelId}:select-repository
 * - {panelId}:clone-repository
 * - {panelId}:filter-repositories
 */
export const ProfilePanel: React.FC<ProfilePanelPropsTyped> = (props) => {
  return <ProfilePanelContent {...props} />;
};

/**
 * ProfilePanelPreview - Compact preview for panel tabs/thumbnails
 */
export const ProfilePanelPreview: React.FC<{ profileType?: ProfileType }> = ({
  profileType = 'user',
}) => {
  const { theme } = useTheme();
  const Icon = profileType === 'organization' ? Building2 : User;
  const label = profileType === 'organization' ? 'Organization' : 'User';

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
        <Icon size={16} style={{ color: theme.colors.primary }} />
        <span>{label}</span>
      </div>
      <div
        style={{
          fontSize: `${theme.fontSizes[0]}px`,
          fontFamily: theme.fonts.body,
          color: theme.colors.textSecondary,
          marginTop: '4px',
        }}
      >
        View {label.toLowerCase()} collections and projects
      </div>
    </div>
  );
};

/**
 * Panel metadata for registration
 */
export const ProfilePanelMetadata = {
  id: 'industry-theme.profile',
  name: 'Profile',
  description: 'View user or organization profiles with collections and repositories',
  icon: 'user',
  version: '0.1.0',
  slices: ['profile'],
  surfaces: ['panel'],
};

// Re-export types
export type {
  GitHubUserProfile,
  GitHubOrgProfile,
  GitHubProfile,
  GitHubRepository,
  Collection,
  ProfileSlice,
  ProfilePanelActions,
  ProfilePanelContext,
  ProfilePanelExtensions,
  ProfilePanelBaseProps,
  ProfilePanelPropsTyped,
  ProfileView,
  ProfileType,
  CollectionCardProps,
  RepositoryCardProps,
  CollectionSelectedPayload,
  RepositorySelectedPayload,
  RepositoryCloneRequestedPayload,
  ProfilePanelEventPayloads,
} from './types';

export { isOrgProfile, isUserProfile, getProfileDescription } from './types';
