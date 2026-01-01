import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import {
  ExternalLink,
  Star,
  GitFork,
  Lock,
  Scale,
} from 'lucide-react';

import type { GitHubRepository } from '../types/github';

export interface GitHubProjectCardProps {
  /** The repository data to display */
  repository: GitHubRepository;
  /** Whether this card is currently selected/highlighted */
  isSelected?: boolean;
  /** Callback when card is clicked (selects the repository) */
  onSelect?: (repository: GitHubRepository) => void;
  /** Callback when "Open in GitHub" is clicked */
  onOpenInGitHub?: (repository: GitHubRepository) => void;
}

/**
 * Get color for programming language
 */
function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3776ab',
    Java: '#b07219',
    Go: '#00add8',
    Rust: '#dea584',
    Ruby: '#cc342d',
    PHP: '#777bb4',
    'C++': '#00599c',
    C: '#555555',
    'C#': '#239120',
    Swift: '#fa7343',
    Kotlin: '#7f52ff',
    Dart: '#0175c2',
    Vue: '#4fc08d',
    HTML: '#e34c26',
    CSS: '#1572b6',
    Shell: '#89e051',
    PowerShell: '#012456',
  };

  return colors[language] || '#6e7681';
}

/**
 * Format large numbers (e.g., 1234 -> 1.2k)
 */
function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}m`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

/**
 * GitHubProjectCard - Displays a GitHub repository card
 *
 * Features:
 * - Repository name with owner avatar
 * - Language indicator with color coding
 * - Star and fork counts
 * - Private/fork indicators
 * - GitHub link button
 */
export const GitHubProjectCard: React.FC<GitHubProjectCardProps> = ({
  repository,
  isSelected = false,
  onSelect,
  onOpenInGitHub,
}) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const highlightColor = theme.colors.primary;

  const handleCardClick = () => {
    onSelect?.(repository);
  };

  const handleOpenInGitHub = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenInGitHub) {
      onOpenInGitHub(repository);
    } else {
      window.open(repository.html_url, '_blank');
    }
  };

  const starCount = repository.stargazers_count ?? 0;
  const forkCount = repository.forks_count ?? 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '6px',
        backgroundColor: isSelected
          ? `${highlightColor}15`
          : isHovered
            ? theme.colors.backgroundTertiary || theme.colors.backgroundSecondary
            : 'transparent',
        border: isSelected
          ? `1px solid ${highlightColor}40`
          : '1px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Owner avatar */}
      {repository.owner.avatar_url ? (
        <img
          src={repository.owner.avatar_url}
          alt={repository.owner.login}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            flexShrink: 0,
            backgroundColor: theme.colors.backgroundTertiary || theme.colors.backgroundSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${theme.fontSizes[1]}px`,
            fontWeight: theme.fontWeights.semibold,
            color: theme.colors.textSecondary,
          }}
        >
          {repository.owner.login[0]?.toUpperCase() || '?'}
        </div>
      )}

      {/* Main content */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {/* Repository name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: `${theme.fontSizes[2]}px`,
              fontWeight: theme.fontWeights.medium,
              color: theme.colors.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {repository.name}
          </span>
          {repository.private && (
            <Lock size={12} color={theme.colors.warning || '#f59e0b'} />
          )}
          {repository.fork && (
            <GitFork size={12} color={theme.colors.textSecondary} />
          )}
        </div>

        {/* Metadata row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: `${theme.fontSizes[0]}px`,
            color: theme.colors.textSecondary,
            flexWrap: 'wrap',
          }}
        >
          {/* Language */}
          {repository.language && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getLanguageColor(repository.language),
                }}
              />
              <span>{repository.language}</span>
            </div>
          )}

          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={12} />
            <span>{formatCount(starCount)}</span>
          </div>

          {/* Forks */}
          {forkCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <GitFork size={12} />
              <span>{formatCount(forkCount)}</span>
            </div>
          )}

          {/* License */}
          {repository.license && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Scale size={12} />
              <span>
                {typeof repository.license === 'string'
                  ? repository.license
                  : repository.license.spdx_id || repository.license.name}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {repository.description && (
          <div
            style={{
              fontSize: `${theme.fontSizes[0]}px`,
              color: theme.colors.textSecondary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {repository.description}
          </div>
        )}
      </div>

      {/* GitHub link button */}
      <button
        type="button"
        onClick={handleOpenInGitHub}
        title="View on GitHub"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          borderRadius: '4px',
          border: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.background,
          color: theme.colors.textSecondary,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor =
            theme.colors.backgroundTertiary || theme.colors.backgroundSecondary;
          e.currentTarget.style.color = theme.colors.text;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.background;
          e.currentTarget.style.color = theme.colors.textSecondary;
        }}
      >
        <ExternalLink size={14} />
      </button>
    </div>
  );
};
