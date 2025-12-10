import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import {
  Github,
  Star,
  GitFork,
  ExternalLink,
  Calendar,
  ArrowUpDown,
  Filter,
  Building2,
  User,
  RefreshCw,
  Lock,
} from 'lucide-react';

import type { PanelComponentProps } from '../types';
import type { GitHubRepository, RepositoryPreviewEventPayload, OwnerRepositoriesSliceData } from '../types/github';

type SortField = 'updated' | 'stars' | 'name' | 'created';
type SortOrder = 'asc' | 'desc';

/**
 * OwnerRepositoriesPanelContent - Internal component that uses theme
 */
const OwnerRepositoriesPanelContent: React.FC<PanelComponentProps & { owner?: string }> = ({
  events,
  context,
  owner: propOwner,
}) => {
  const { theme } = useTheme();
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [languageFilter, setLanguageFilter] = useState<string | null>(null);

  // Get owner from prop or context
  const owner = propOwner || (context?.currentScope?.repository as { name?: string })?.name;

  // Get owner repositories slice
  const ownerSlice = context.getSlice<OwnerRepositoriesSliceData>('owner-repositories');
  const isLoading = context.isSliceLoading('owner-repositories');

  const ownerInfo = ownerSlice?.data?.owner ?? null;
  const repositories = ownerSlice?.data?.repositories ?? [];
  const error = ownerSlice?.data?.error ?? null;
  const isAuthenticated = ownerSlice?.data?.isAuthenticated ?? false;

  // Extract unique languages from repositories
  const languages = React.useMemo(() => {
    return [...new Set(
      repositories
        .map(r => r.language)
        .filter((lang): lang is string => lang !== null)
    )].sort();
  }, [repositories]);

  // Request data refresh
  const handleRefresh = useCallback(() => {
    events.emit({
      type: 'owner-repositories:refresh',
      source: 'owner-repositories-panel',
      timestamp: Date.now(),
      payload: { owner },
    });
  }, [events, owner]);

  // Request owner data when owner changes
  useEffect(() => {
    if (owner) {
      events.emit({
        type: 'owner-repositories:request',
        source: 'owner-repositories-panel',
        timestamp: Date.now(),
        payload: { owner },
      });
    }
  }, [events, owner]);

  // Sort and filter repositories
  const sortedAndFilteredRepos = React.useMemo(() => {
    let filtered = repositories;

    // Apply language filter
    if (languageFilter) {
      filtered = filtered.filter(r => r.language === languageFilter);
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'updated':
          comparison = new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
          break;
        case 'stars':
          comparison = (b.stargazers_count || 0) - (a.stargazers_count || 0);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          break;
      }

      return sortOrder === 'desc' ? comparison : -comparison;
    });
  }, [repositories, sortField, sortOrder, languageFilter]);

  // Handle repository preview (click to show README)
  const handleSelectRepository = (repo: GitHubRepository) => {
    setSelectedRepoId(repo.id);

    events.emit<RepositoryPreviewEventPayload>({
      type: 'repository:preview',
      source: 'owner-repositories-panel',
      timestamp: Date.now(),
      payload: {
        repository: repo,
        source: 'click',
      },
    });
  };

  // Handle repository open (double-click or button)
  const handleOpenRepository = (repo: GitHubRepository) => {
    events.emit({
      type: 'repository:selected',
      source: 'owner-repositories-panel',
      timestamp: Date.now(),
      payload: {
        repository: repo,
        source: 'click',
      },
    });
  };

  // Format number with K/M suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

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
      {/* Header with owner info */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {ownerInfo ? (
          <>
            <img
              src={ownerInfo.avatar_url}
              alt={ownerInfo.login}
              style={{
                width: 48,
                height: 48,
                borderRadius: ownerInfo.type === 'Organization' ? 8 : '50%',
                border: `2px solid ${theme.colors.border}`,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: `${theme.fontSizes[4]}px`,
                    fontWeight: theme.fontWeights.bold,
                  }}
                >
                  {ownerInfo.name || ownerInfo.login}
                </h2>
                {ownerInfo.type === 'Organization' ? (
                  <Building2 size={16} color={theme.colors.textSecondary} />
                ) : (
                  <User size={16} color={theme.colors.textSecondary} />
                )}
              </div>
              {ownerInfo.bio && (
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: `${theme.fontSizes[1]}px`,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {ownerInfo.bio}
                </p>
              )}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '4px',
                  fontSize: `${theme.fontSizes[1]}px`,
                  color: theme.colors.textSecondary,
                }}
              >
                <span>{repositories.length} repositories</span>
                {ownerInfo.followers !== undefined && (
                  <span>{formatNumber(ownerInfo.followers)} followers</span>
                )}
              </div>
            </div>
            <button
              onClick={handleRefresh}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: `1px solid ${theme.colors.border}`,
                background: 'transparent',
                cursor: 'pointer',
                color: theme.colors.textSecondary,
              }}
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Github size={24} color={theme.colors.primary} />
            <h2
              style={{
                margin: 0,
                fontSize: `${theme.fontSizes[3]}px`,
                fontWeight: theme.fontWeights.semibold,
              }}
            >
              {owner || 'Repositories'}
            </h2>
          </div>
        )}
      </div>

      {/* Sort and Filter Controls */}
      {!isLoading && !error && repositories.length > 0 && (
        <div
          style={{
            padding: '8px 16px',
            borderBottom: `1px solid ${theme.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {/* Sort buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpDown size={14} color={theme.colors.textSecondary} />
            {(['updated', 'stars', 'name'] as SortField[]).map((field) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: sortField === field ? theme.colors.primary : theme.colors.backgroundSecondary,
                  color: sortField === field ? theme.colors.background : theme.colors.text,
                  fontSize: `${theme.fontSizes[1]}px`,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {field}
                {sortField === field && (sortOrder === 'desc' ? ' ↓' : ' ↑')}
              </button>
            ))}
          </div>

          {/* Language filter */}
          {languages.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
              <Filter size={14} color={theme.colors.textSecondary} />
              <select
                value={languageFilter || ''}
                onChange={(e) => setLanguageFilter(e.target.value || null)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.backgroundSecondary,
                  color: theme.colors.text,
                  fontSize: `${theme.fontSizes[1]}px`,
                  cursor: 'pointer',
                }}
              >
                <option value="">All languages</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            color: theme.colors.textSecondary,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: `3px solid ${theme.colors.border}`,
              borderTopColor: theme.colors.primary,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span>Loading repositories...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              padding: '16px 24px',
              borderRadius: '8px',
              backgroundColor: `${theme.colors.error}15`,
              color: theme.colors.error,
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
          <button
            onClick={handleRefresh}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: theme.colors.primary,
              color: theme.colors.background,
              cursor: 'pointer',
              fontWeight: theme.fontWeights.medium,
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && repositories.length === 0 && (
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
          <p style={{ margin: 0 }}>No repositories found</p>
        </div>
      )}

      {/* Repository List */}
      {!isLoading && !error && sortedAndFilteredRepos.length > 0 && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {sortedAndFilteredRepos.map((repo) => (
            <button
              key={repo.id}
              type="button"
              onClick={() => handleSelectRepository(repo)}
              onDoubleClick={() => handleOpenRepository(repo)}
              style={{
                width: '100%',
                padding: '12px',
                margin: '4px 0',
                borderRadius: '8px',
                border: selectedRepoId === repo.id
                  ? `2px solid ${theme.colors.primary}`
                  : `1px solid ${theme.colors.border}`,
                backgroundColor: selectedRepoId === repo.id
                  ? `${theme.colors.primary}10`
                  : theme.colors.surface,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Repo name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: `${theme.fontSizes[2]}px`,
                    fontWeight: theme.fontWeights.semibold,
                    color: theme.colors.primary,
                  }}
                >
                  {repo.name}
                </span>
                {repo.private && (
                  <span
                    style={{
                      fontSize: `${theme.fontSizes[0]}px`,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: theme.colors.backgroundTertiary,
                      color: theme.colors.textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Lock size={10} />
                    Private
                  </span>
                )}
                {repo.archived && (
                  <span
                    style={{
                      fontSize: `${theme.fontSizes[0]}px`,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: theme.colors.warning + '20',
                      color: theme.colors.warning,
                    }}
                  >
                    Archived
                  </span>
                )}
                {repo.fork && (
                  <span
                    style={{
                      fontSize: `${theme.fontSizes[0]}px`,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: theme.colors.backgroundTertiary,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Fork
                  </span>
                )}
              </div>

              {/* Description */}
              {repo.description && (
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
                  {repo.description}
                </p>
              )}

              {/* Stats row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: `${theme.fontSizes[1]}px`,
                  color: theme.colors.textSecondary,
                }}
              >
                {repo.language && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: theme.colors.info,
                      }}
                    />
                    {repo.language}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={14} />
                  {formatNumber(repo.stargazers_count || 0)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <GitFork size={14} />
                  {formatNumber(repo.forks_count || 0)}
                </span>
                {repo.updated_at && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} />
                    {formatRelativeTime(repo.updated_at)}
                  </span>
                )}
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    marginLeft: 'auto',
                    color: theme.colors.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Filtered empty state */}
      {!isLoading && !error && repositories.length > 0 && sortedAndFilteredRepos.length === 0 && (
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
          <Filter size={48} color={theme.colors.border} style={{ marginBottom: 16 }} />
          <p style={{ margin: 0 }}>No repositories match the current filter</p>
          <button
            onClick={() => setLanguageFilter(null)}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: `1px solid ${theme.colors.border}`,
              background: 'transparent',
              color: theme.colors.text,
              cursor: 'pointer',
            }}
          >
            Clear filter
          </button>
        </div>
      )}

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

/**
 * OwnerRepositoriesPanel - A panel for browsing a GitHub user or organization's repositories
 *
 * Features:
 * - Shows repositories for a user/org (including private if authenticated)
 * - Displays owner info (avatar, bio, repo count)
 * - Sort by updated, stars, or name
 * - Filter by programming language
 * - Click to preview README, double-click to open
 *
 * Required data slice: 'owner-repositories' (OwnerRepositoriesSliceData)
 *
 * Events emitted:
 * - 'owner-repositories:request' - Request data for a specific owner
 * - 'owner-repositories:refresh' - Request a refresh of current data
 * - 'repository:preview' - When a repo is clicked
 * - 'repository:selected' - When a repo is double-clicked
 */
export const OwnerRepositoriesPanel: React.FC<PanelComponentProps & { owner?: string }> = (props) => {
  return <OwnerRepositoriesPanelContent {...props} />;
};

/**
 * Panel metadata for registration
 */
export const OwnerRepositoriesPanelMetadata = {
  id: 'owner-repositories',
  name: 'Owner Repositories',
  description: 'Browse repositories for a GitHub user or organization',
  icon: 'github',
  version: '0.2.0',
  slices: ['owner-repositories'],
  surfaces: ['panel'],
};
