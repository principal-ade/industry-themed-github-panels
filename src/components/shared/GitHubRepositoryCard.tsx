import React, { useCallback, useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { useDraggable } from '@principal-ade/panel-framework-core';
import {
  ExternalLink,
  GitFork,
  Lock,
  Star,
  FolderOpen,
  Download,
  Scale,
  FolderPlus,
  Check,
} from 'lucide-react';
import type { GitHubRepository } from '../../types/github';
import { RepositoryAvatar } from './RepositoryAvatar';

/**
 * Reference to a locally cloned repository
 * Used to match GitHub repos with local entries
 */
export interface LocalRepositoryReference {
  /** Local file system path */
  path: string;
  /** Repository name */
  name: string;
  /** GitHub full name (owner/repo) if known */
  githubFullName?: string;
  /** GitHub numeric ID if known */
  githubId?: string;
}

export interface GitHubRepositoryCardProps {
  /** GitHub repository data */
  repository: GitHubRepository;
  /** Local repository reference if cloned */
  localRepo?: LocalRepositoryReference;
  /** Callback when clone button is clicked */
  onClone?: (repo: GitHubRepository) => void;
  /** Callback when open button is clicked (for local repos) */
  onOpen?: (localPath: string) => void;
  /** Whether an operation is in progress */
  isLoading?: boolean;
  /** Whether the card is selected */
  isSelected?: boolean;
  /** Callback when card is clicked */
  onSelect?: (repo: GitHubRepository) => void;
  /** Callback when add to collection button is clicked */
  onAddToCollection?: (repo: GitHubRepository) => void;
  /** Whether the repository is already in the current collection */
  isInCollection?: boolean;
  /** Name of the current collection (for tooltip) */
  collectionName?: string;
}

/**
 * GitHubRepositoryCard - Displays a GitHub repository with clone/open actions
 *
 * Used by GitHubStarredPanel, GitHubProjectsPanel, and GitHubSearchPanel
 * to display repositories with consistent styling and behavior.
 */
export const GitHubRepositoryCard: React.FC<GitHubRepositoryCardProps> = ({
  repository,
  localRepo,
  onClone,
  onOpen,
  isLoading = false,
  isSelected = false,
  onSelect,
  onAddToCollection,
  isInCollection = false,
  collectionName,
}) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const isCloned = Boolean(localRepo);

  // Add drag-and-drop functionality
  // Don't make draggable if already in the collection
  const { isDragging, ...dragProps } = useDraggable({
    dataType: 'repository-github',
    primaryData: repository.full_name,
    metadata: {
      name: repository.name,
      owner: repository.owner.login,
      description: repository.description,
      language: repository.language,
      stars: repository.stargazers_count,
      isPrivate: repository.private,
      htmlUrl: repository.html_url,
      cloneUrl: repository.clone_url,
    },
    suggestedActions: ['add-to-collection'],
    sourcePanel: 'github-repositories',
    dragPreview: repository.full_name,
  });

  const handleClone = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onClone && !isLoading) {
        onClone(repository);
      }
    },
    [onClone, repository, isLoading]
  );

  const handleOpen = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onOpen && localRepo && !isLoading) {
        onOpen(localRepo.path);
      }
    },
    [onOpen, localRepo, isLoading]
  );

  const handleClick = useCallback(() => {
    if (onSelect) {
      onSelect(repository);
    }
  }, [onSelect, repository]);

  const handleOpenOnGitHub = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(repository.html_url, '_blank', 'noopener,noreferrer');
    },
    [repository.html_url]
  );

  const handleAddToCollection = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onAddToCollection && !isLoading && !isInCollection) {
        onAddToCollection(repository);
      }
    },
    [onAddToCollection, repository, isLoading, isInCollection]
  );

  // Format relative time
  const getRelativeTime = (dateString: string) => {
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

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...(isInCollection ? {} : dragProps)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: isSelected
          ? `${theme.colors.primary}15`
          : isHovered
            ? theme.colors.backgroundTertiary
            : 'transparent',
        border: `1px solid ${isSelected ? theme.colors.primary : 'transparent'}`,
        cursor: isInCollection
          ? 'not-allowed'
          : isDragging
            ? 'grabbing'
            : onSelect
              ? 'grab'
              : 'default',
        opacity: isDragging ? 0.5 : isInCollection ? 0.7 : 1,
        transition: 'background-color 0.15s, border-color 0.15s, opacity 0.15s',
      }}
    >
      {/* Avatar */}
      <RepositoryAvatar
        owner={repository.owner.login}
        customAvatarUrl={repository.owner.avatar_url}
        size={40}
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header row: name + badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}
        >
          <span
            style={{
              fontSize: `${theme.fontSizes[2]}px`,
              fontWeight: theme.fontWeights.semibold,
              fontFamily: theme.fonts.body,
              color: isCloned ? '#10b981' : theme.colors.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={repository.full_name}
          >
            {repository.name}
          </span>

          {/* Badges */}
          {repository.private && (
            <span title="Private repository">
              <Lock
                size={12}
                style={{ color: theme.colors.textSecondary, flexShrink: 0 }}
              />
            </span>
          )}
          {repository.fork && (
            <span title="Forked repository">
              <GitFork
                size={12}
                style={{ color: theme.colors.textSecondary, flexShrink: 0 }}
              />
            </span>
          )}
        </div>

        {/* Owner */}
        <div
          style={{
            fontSize: `${theme.fontSizes[0]}px`,
            fontFamily: theme.fonts.body,
            color: theme.colors.textSecondary,
            marginBottom: '4px',
          }}
        >
          {repository.owner.login}
        </div>

        {/* Description */}
        {repository.description && (
          <div
            style={{
              fontSize: `${theme.fontSizes[1]}px`,
              fontFamily: theme.fonts.body,
              color: theme.colors.textSecondary,
              lineHeight: theme.lineHeights.body,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              marginBottom: '8px',
            }}
          >
            {repository.description}
          </div>
        )}

        {/* Metadata row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: `${theme.fontSizes[0]}px`,
            fontFamily: theme.fonts.body,
            color: theme.colors.textSecondary,
          }}
        >
          {/* Language */}
          {repository.language && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getLanguageColor(repository.language),
                }}
              />
              {repository.language}
            </span>
          )}

          {/* Stars */}
          {repository.stargazers_count !== undefined &&
            repository.stargazers_count > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={12} />
                {formatNumber(repository.stargazers_count)}
              </span>
            )}

          {/* License */}
          {repository.license && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Scale size={12} />
              {typeof repository.license === 'string'
                ? repository.license
                : repository.license.spdx_id || repository.license.name}
            </span>
          )}

          {/* Updated time */}
          {(repository.pushed_at || repository.updated_at) && (
            <span>Updated {getRelativeTime(repository.pushed_at || repository.updated_at!)}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        {/* Open on GitHub button */}
        <button
          type="button"
          onClick={handleOpenOnGitHub}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: 'transparent',
            color: theme.colors.textSecondary,
            cursor: 'pointer',
            transition: 'background-color 0.15s, color 0.15s',
          }}
          title="Open on GitHub"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.backgroundTertiary;
            e.currentTarget.style.color = theme.colors.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = theme.colors.textSecondary;
          }}
        >
          <ExternalLink size={16} />
        </button>

        {/* Add to Collection button - only shown when in collection context */}
        {onAddToCollection && (
          <button
            type="button"
            onClick={handleAddToCollection}
            disabled={isLoading || isInCollection}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: isInCollection ? '#10b981' : theme.colors.secondary,
              color: isInCollection ? '#ffffff' : theme.colors.text,
              fontSize: `${theme.fontSizes[1]}px`,
              fontWeight: theme.fontWeights.medium,
              fontFamily: theme.fonts.body,
              cursor: isLoading || isInCollection ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              transition: 'opacity 0.15s, background-color 0.15s',
            }}
            title={
              isInCollection
                ? `Already in ${collectionName || 'collection'}`
                : `Add to ${collectionName || 'collection'}`
            }
          >
            {isInCollection ? <Check size={14} /> : <FolderPlus size={14} />}
            {isInCollection ? 'Added' : 'Add'}
          </button>
        )}

        {/* Clone or Open button - only shown when handler is provided */}
        {isCloned && onOpen && (
          <button
            type="button"
            onClick={handleOpen}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#10b981',
              color: '#ffffff',
              fontSize: `${theme.fontSizes[1]}px`,
              fontWeight: theme.fontWeights.medium,
              fontFamily: theme.fonts.body,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
            title="Open in workspace"
          >
            <FolderOpen size={14} />
            Open
          </button>
        )}
        {!isCloned && onClone && (
          <button
            type="button"
            onClick={handleClone}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: theme.colors.primary,
              color: theme.colors.background,
              fontSize: `${theme.fontSizes[1]}px`,
              fontWeight: theme.fontWeights.medium,
              fontFamily: theme.fonts.body,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
            title="Clone repository"
          >
            <Download size={14} />
            Clone
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Get color for programming language (simplified)
 */
function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3572A5',
    Rust: '#dea584',
    Go: '#00ADD8',
    Java: '#b07219',
    Ruby: '#701516',
    PHP: '#4F5D95',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Shell: '#89e051',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Vue: '#41b883',
    Svelte: '#ff3e00',
  };
  return colors[language] || '#8b949e';
}

/**
 * Format large numbers with K/M suffixes
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
