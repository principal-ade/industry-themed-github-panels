import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { Search, Github, X, AlertCircle } from 'lucide-react';

import type { PanelComponentProps } from '../types';
import type {
  GitHubRepository,
  RepositoryPreviewEventPayload,
  WorkspaceCollectionSlice,
  WorkspaceRepositoriesSlice,
  GitHubSearchPanelActions,
} from '../types/github';
import { GitHubRepositoryCard } from '../components/shared';

const PANEL_ID = 'github-search-panel';

// Helper to create panel events with required fields
const createPanelEvent = <T,>(type: string, payload: T) => ({
  type,
  source: PANEL_ID,
  timestamp: Date.now(),
  payload,
});

/**
 * GitHubSearchPanelContent - Internal component that uses theme
 */
const GitHubSearchPanelContent: React.FC<PanelComponentProps> = ({ context, actions, events }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<GitHubRepository[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get workspace/collection context for "Add to Collection" functionality
  const workspaceSlice = context.getSlice<WorkspaceCollectionSlice>('workspace');
  const workspaceReposSlice = context.getSlice<WorkspaceRepositoriesSlice>('workspaceRepositories');

  // Collection context
  const currentWorkspace = workspaceSlice?.data?.workspace;
  const collectionName = currentWorkspace?.name;
  const collectionRepos = useMemo(
    () => workspaceReposSlice?.data?.repositories || [],
    [workspaceReposSlice?.data?.repositories]
  );

  // Set of repo full_names already in the collection for quick lookup
  const collectionRepoSet = useMemo(() => {
    return new Set(collectionRepos.map((r) => r.full_name));
  }, [collectionRepos]);

  // Cast actions to panel-specific type
  const panelActions = actions as GitHubSearchPanelActions;

  // Check if search is available
  const searchAvailable = Boolean(panelActions.searchRepositories);

  // Focus input on mount
  useEffect(() => {
    if (searchAvailable) {
      inputRef.current?.focus();
    }
  }, [searchAvailable]);

  // Debounced search using the action
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setTotalCount(0);
      setError(null);
      return;
    }

    if (!panelActions.searchRepositories) {
      setError('Search is not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await panelActions.searchRepositories(query, { perPage: 30 });
      setResults(data.items || []);
      setTotalCount(data.total_count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [panelActions]);

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

  // Handle repository selection (click to show README)
  const handleSelectRepository = useCallback((repo: GitHubRepository) => {
    setSelectedRepoId(repo.id);

    events.emit<RepositoryPreviewEventPayload>({
      type: 'repository:preview',
      source: PANEL_ID,
      timestamp: Date.now(),
      payload: {
        repository: repo,
        source: 'search',
      },
    });
  }, [events]);

  // Handle add to collection
  const handleAddToCollection = useCallback(
    async (repo: GitHubRepository) => {
      if (panelActions.addToCollection) {
        await panelActions.addToCollection(repo);
        events.emit(
          createPanelEvent(`${PANEL_ID}:repository-added-to-collection`, {
            repository: repo,
          })
        );
      }
    },
    [panelActions, events]
  );

  // Format number with K/M suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Show message when search action is not provided
  if (!searchAvailable) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.body,
          padding: '32px',
          textAlign: 'center',
        }}
      >
        <AlertCircle size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
        <p style={{ margin: 0, fontSize: `${theme.fontSizes[2]}px` }}>
          Search is not available
        </p>
        <p style={{ margin: '8px 0 0', fontSize: `${theme.fontSizes[1]}px` }}>
          The host application must provide a searchRepositories action
        </p>
      </div>
    );
  }

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
      {/* Header with Search */}
      <form
        onSubmit={handleSubmit}
        style={{
          height: '40px',
          minHeight: '40px',
          padding: '0 16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxSizing: 'border-box',
        }}
      >
        <Github size={18} color={theme.colors.primary} style={{ flexShrink: 0 }} />
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search
            size={16}
            color={theme.colors.textSecondary}
            style={{
              position: 'absolute',
              left: '10px',
              pointerEvents: 'none',
            }}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search GitHub repositories..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '6px 32px 6px 32px',
              fontSize: `${theme.fontSizes[1]}px`,
              color: theme.colors.text,
              backgroundColor: theme.colors.backgroundSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '4px',
              outline: 'none',
              fontFamily: theme.fonts.body,
            }}
          />
          {searchQuery && !isLoading && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setResults([]);
                setTotalCount(0);
                inputRef.current?.focus();
              }}
              style={{
                position: 'absolute',
                right: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors.textSecondary,
              }}
            >
              <X size={16} />
            </button>
          )}
          {isLoading && (
            <div
              style={{
                position: 'absolute',
                right: '10px',
                width: 14,
                height: 14,
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
            padding: '8px 16px',
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
          <GitHubRepositoryCard
            key={repo.id}
            repository={repo}
            onSelect={handleSelectRepository}
            isSelected={selectedRepoId === repo.id}
            onAddToCollection={currentWorkspace ? handleAddToCollection : undefined}
            isInCollection={collectionRepoSet.has(repo.full_name)}
            collectionName={collectionName}
          />
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
 * - Emits repository:preview events when a repo is clicked
 * - Supports "Add to Collection" when in a collection context
 *
 * Required actions:
 * - searchRepositories: (query, options?) => Promise<GitHubSearchResult>
 *
 * Optional actions:
 * - addToCollection: (repo) => Promise<void>
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
  slices: ['workspace', 'workspaceRepositories'],
  surfaces: ['panel'],
};
