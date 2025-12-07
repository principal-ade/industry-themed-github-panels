import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { Search, Github, Star, GitFork, ExternalLink } from 'lucide-react';

import type { PanelComponentProps } from '../types';
import type { GitHubRepository, RepositoryPreviewEventPayload } from '../types/github';

/** Search result from GitHub API */
interface GitHubSearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}

/**
 * GitHubSearchPanelContent - Internal component that uses theme
 */
const GitHubSearchPanelContent: React.FC<PanelComponentProps> = ({ events }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<GitHubRepository[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setTotalCount(0);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/github/search?q=${encodeURIComponent(query)}&per_page=30`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Search failed');
      }

      const data: GitHubSearchResult = await response.json();
      setResults(data.items || []);
      setTotalCount(data.total_count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  // Handle form submit (immediate search)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    performSearch(searchQuery);
  };

  // Handle repository preview (click to show README)
  const handleSelectRepository = (repo: GitHubRepository) => {
    setSelectedRepoId(repo.id);

    events.emit<RepositoryPreviewEventPayload>({
      type: 'repository:preview',
      source: 'github-search-panel',
      timestamp: Date.now(),
      payload: {
        repository: repo,
        source: 'search',
      },
    });
  };

  // Format number with K/M suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Github size={20} color={theme.colors.primary} />
        <h2
          style={{
            margin: 0,
            fontSize: `${theme.fontSizes[3]}px`,
            fontWeight: theme.fontWeights.semibold,
          }}
        >
          Search GitHub
        </h2>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSubmit} style={{ padding: '12px 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '6px',
            backgroundColor: theme.colors.backgroundSecondary,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <Search size={18} color={theme.colors.textSecondary} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search repositories on GitHub..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: `${theme.fontSizes[2]}px`,
              color: theme.colors.text,
            }}
          />
          {isLoading && (
            <div
              style={{
                width: 16,
                height: 16,
                border: `2px solid ${theme.colors.border}`,
                borderTopColor: theme.colors.primary,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          )}
        </div>
      </form>

      {/* Results Count */}
      {totalCount > 0 && !isLoading && (
        <div
          style={{
            padding: '0 16px 8px',
            fontSize: `${theme.fontSizes[1]}px`,
            color: theme.colors.textSecondary,
          }}
        >
          {formatNumber(totalCount)} repositories found
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          style={{
            padding: '16px',
            margin: '0 16px',
            borderRadius: '6px',
            backgroundColor: `${theme.colors.error}15`,
            color: theme.colors.error,
            fontSize: `${theme.fontSizes[2]}px`,
          }}
        >
          {error}
        </div>
      )}

      {/* Results List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 8px 8px',
        }}
      >
        {results.length === 0 && !isLoading && searchQuery && !error && (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: theme.colors.textSecondary,
            }}
          >
            No repositories found for "{searchQuery}"
          </div>
        )}

        {results.length === 0 && !searchQuery && (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: theme.colors.textSecondary,
            }}
          >
            <Search size={48} color={theme.colors.border} style={{ marginBottom: 16 }} />
            <p style={{ margin: 0 }}>
              Search for repositories by name, description, or topic
            </p>
          </div>
        )}

        {results.map((repo) => (
          <button
            key={repo.id}
            type="button"
            onClick={() => handleSelectRepository(repo)}
            style={{
              width: '100%',
              padding: '12px',
              margin: '4px 0',
              borderRadius: '6px',
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
            }}
          >
            {/* Repo name and owner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {repo.owner?.avatar_url && (
                <img
                  src={repo.owner.avatar_url}
                  alt={repo.owner.login}
                  style={{ width: 20, height: 20, borderRadius: 4 }}
                />
              )}
              <span
                style={{
                  fontSize: `${theme.fontSizes[2]}px`,
                  fontWeight: theme.fontWeights.semibold,
                  color: theme.colors.primary,
                }}
              >
                {repo.full_name}
              </span>
              {repo.private && (
                <span
                  style={{
                    fontSize: `${theme.fontSizes[0]}px`,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: theme.colors.backgroundTertiary,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Private
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

            {/* Stats */}
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
 * GitHubSearchPanel - A panel for searching GitHub repositories
 *
 * Features:
 * - Real-time search with debouncing
 * - Shows stars, forks, language
 * - Emits repository:selected events when a repo is clicked
 */
export const GitHubSearchPanel: React.FC<PanelComponentProps> = (props) => {
  return <GitHubSearchPanelContent {...props} />;
};

/**
 * Panel metadata for registration
 */
export const GitHubSearchPanelMetadata = {
  id: 'github-search',
  name: 'GitHub Search',
  description: 'Search for repositories on GitHub',
  icon: 'search',
  version: '0.1.0',
  slices: [],
  surfaces: ['panel'],
};
