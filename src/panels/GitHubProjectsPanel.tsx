import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import {
  Github,
  Search,
  ChevronDown,
  ChevronRight,
  Folder,
  Star,
  LogIn,
  Building2,
} from 'lucide-react';

import type { PanelComponentProps } from '../types';
import type {
  GitHubRepositoriesSliceData,
  GitHubRepository,
  RepositoryPreviewEventPayload,
} from '../types/github';
import { GitHubProjectCard } from '../components/GitHubProjectCard';

/** Layout mode based on available width */
type LayoutMode = 'compact' | 'expanded';

/** Breakpoint for switching layouts (in pixels) */
const EXPANDED_BREAKPOINT = 600;

/**
 * Section component for collapsible repository groups
 */
interface SectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  layoutMode: LayoutMode;
}

const Section: React.FC<SectionProps> = ({
  title,
  icon,
  count,
  isExpanded,
  onToggle,
  children,
  layoutMode,
}) => {
  const { theme } = useTheme();

  // In expanded mode, sections are columns - always show content (no collapse)
  // In compact mode, sections are collapsible
  const showContent = layoutMode === 'expanded' || isExpanded;

  return (
    <div
      style={{
        marginBottom: layoutMode === 'compact' ? '8px' : '0',
        flex: layoutMode === 'expanded' ? '1 1 0' : undefined,
        minWidth: layoutMode === 'expanded' ? '280px' : undefined,
        display: 'flex',
        flexDirection: 'column',
        borderRight: layoutMode === 'expanded' ? `1px solid ${theme.colors.border}` : undefined,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={layoutMode === 'compact' ? onToggle : undefined}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 12px',
          border: 'none',
          background: 'none',
          cursor: layoutMode === 'compact' ? 'pointer' : 'default',
          color: theme.colors.text,
          fontSize: `${theme.fontSizes[2]}px`,
          fontWeight: theme.fontWeights.semibold,
          borderBottom: layoutMode === 'expanded' ? `1px solid ${theme.colors.border}` : undefined,
        }}
      >
        {layoutMode === 'compact' && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        {icon}
        <span>{title}</span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: `${theme.fontSizes[0]}px`,
            color: theme.colors.textSecondary,
            backgroundColor: theme.colors.backgroundTertiary || theme.colors.backgroundSecondary,
            padding: '2px 8px',
            borderRadius: '10px',
          }}
        >
          {count}
        </span>
      </button>
      {showContent && (
        <div
          style={{
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            flex: layoutMode === 'expanded' ? 1 : undefined,
            overflowY: layoutMode === 'expanded' ? 'auto' : undefined,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * GitHubProjectsPanelContent - Internal component that uses theme
 */
const GitHubProjectsPanelContent: React.FC<PanelComponentProps> = ({
  context,
  events,
}) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('compact');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['owned', 'starred'])
  );

  // Get GitHub repositories slice
  const githubSlice = context.getSlice<GitHubRepositoriesSliceData>('github-repositories');
  const isLoading = context.isSliceLoading('github-repositories');
  const hasData = context.hasSlice('github-repositories');

  const data = githubSlice?.data;

  // Observe container width for responsive layout
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setLayoutMode(width >= EXPANDED_BREAKPOINT ? 'expanded' : 'compact');
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Filter repositories by search query
  const filterRepos = useCallback((repos: GitHubRepository[]) => {
    if (!searchQuery) return repos;
    const query = searchQuery.toLowerCase();
    return repos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query) ||
        repo.full_name.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query) ||
        repo.language?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredOwned = useMemo(() => filterRepos(data?.owned || []), [data?.owned, filterRepos]);
  const filteredStarred = useMemo(() => filterRepos(data?.starred || []), [data?.starred, filterRepos]);
  const filteredOrgs = useMemo(() => {
    if (!data?.organizations) return [];
    return data.organizations.map((org) => ({
      ...org,
      repositories: filterRepos(org.repositories),
    })).filter((org) => org.repositories.length > 0 || !searchQuery);
  }, [data?.organizations, filterRepos, searchQuery]);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Handle repository preview (click to show README)
  const handleSelectRepository = (repo: GitHubRepository) => {
    setSelectedRepoId(repo.id);

    events.emit<RepositoryPreviewEventPayload>({
      type: 'repository:preview',
      source: 'github-projects-panel',
      timestamp: Date.now(),
      payload: {
        repository: repo,
        source: 'click',
      },
    });
  };

  // Render empty state for a section
  const renderEmptyState = (message: string) => (
    <div
      style={{
        padding: '16px',
        textAlign: 'center',
        color: theme.colors.textSecondary,
        fontSize: `${theme.fontSizes[1]}px`,
        gridColumn: layoutMode === 'expanded' ? '1 / -1' : undefined,
      }}
    >
      {message}
    </div>
  );

  // Render repository cards
  const renderCards = (repos: GitHubRepository[]) =>
    repos.map((repo) => (
      <GitHubProjectCard
        key={repo.id}
        repository={repo}
        isSelected={selectedRepoId === repo.id}
        onSelect={handleSelectRepository}
      />
    ));

  // Not authenticated state
  if (hasData && data && !data.isAuthenticated) {
    return (
      <div
        ref={containerRef}
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '24px',
          color: theme.colors.textSecondary,
        }}
      >
        <LogIn size={48} color={theme.colors.textSecondary} />
        <h3
          style={{
            margin: 0,
            fontSize: `${theme.fontSizes[3]}px`,
            color: theme.colors.text,
          }}
        >
          Sign in to GitHub
        </h3>
        <p style={{ margin: 0, textAlign: 'center' }}>
          Connect your GitHub account to see your repositories
        </p>
        <button
          type="button"
          onClick={() => {
            events.emit({
              type: 'github:login-requested',
              source: 'github-projects-panel',
              timestamp: Date.now(),
              payload: {},
            });
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: theme.colors.primary,
            color: theme.colors.background,
            fontSize: `${theme.fontSizes[2]}px`,
            fontWeight: theme.fontWeights.medium,
            cursor: 'pointer',
          }}
        >
          <Github size={18} />
          Sign in with GitHub
        </button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        ref={containerRef}
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.colors.textSecondary,
        }}
      >
        Loading repositories...
      </div>
    );
  }

  // No data state - show sign in prompt
  if (!hasData || !data) {
    return (
      <div
        ref={containerRef}
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '24px',
          color: theme.colors.textSecondary,
        }}
      >
        <LogIn size={48} color={theme.colors.textSecondary} />
        <h3
          style={{
            margin: 0,
            fontSize: `${theme.fontSizes[3]}px`,
            color: theme.colors.text,
          }}
        >
          Sign in to GitHub
        </h3>
        <p style={{ margin: 0, textAlign: 'center' }}>
          Connect your GitHub account to browse your repositories
        </p>
        <button
          type="button"
          onClick={() => {
            events.emit({
              type: 'github:login-requested',
              source: 'github-projects-panel',
              timestamp: Date.now(),
              payload: {},
            });
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: theme.colors.primary,
            color: theme.colors.background,
            fontSize: `${theme.fontSizes[2]}px`,
            fontWeight: theme.fontWeights.medium,
            cursor: 'pointer',
          }}
        >
          <Github size={18} />
          Sign in with GitHub
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
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
          flexWrap: 'wrap',
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
          GitHub Projects
        </h2>
        {data.username && (
          <span
            style={{
              fontSize: `${theme.fontSizes[1]}px`,
              color: theme.colors.textSecondary,
            }}
          >
            @{data.username}
          </span>
        )}
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: theme.colors.backgroundSecondary,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <Search size={16} color={theme.colors.textSecondary} />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: `${theme.fontSizes[2]}px`,
              color: theme.colors.text,
            }}
          />
        </div>
      </div>

      {/* Repository sections */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: layoutMode === 'expanded' ? 'row' : 'column',
          overflowY: layoutMode === 'compact' ? 'auto' : undefined,
          overflowX: layoutMode === 'expanded' ? 'auto' : undefined,
        }}
      >
        {/* Personal repositories */}
        <Section
          id="owned"
          title="Your Repositories"
          icon={<Folder size={16} color={theme.colors.primary} />}
          count={filteredOwned.length}
          isExpanded={expandedSections.has('owned')}
          onToggle={() => toggleSection('owned')}
          layoutMode={layoutMode}
        >
          {filteredOwned.length === 0
            ? renderEmptyState(searchQuery ? 'No repositories match your search' : 'No repositories found')
            : renderCards(filteredOwned)}
        </Section>

        {/* Organization repositories */}
        {filteredOrgs.map((org) => (
          <Section
            key={org.id}
            id={`org-${org.id}`}
            title={org.login}
            icon={
              org.avatar_url ? (
                <img
                  src={org.avatar_url}
                  alt={org.login}
                  style={{ width: 16, height: 16, borderRadius: 4 }}
                />
              ) : (
                <Building2 size={16} color={theme.colors.info || '#3b82f6'} />
              )
            }
            count={org.repositories.length}
            isExpanded={expandedSections.has(`org-${org.id}`)}
            onToggle={() => toggleSection(`org-${org.id}`)}
            layoutMode={layoutMode}
          >
            {org.repositories.length === 0
              ? renderEmptyState(searchQuery ? 'No repositories match your search' : 'No repositories')
              : renderCards(org.repositories)}
          </Section>
        ))}

        {/* Starred repositories */}
        <Section
          id="starred"
          title="Starred"
          icon={<Star size={16} color={theme.colors.warning || '#f59e0b'} />}
          count={filteredStarred.length}
          isExpanded={expandedSections.has('starred')}
          onToggle={() => toggleSection('starred')}
          layoutMode={layoutMode}
        >
          {filteredStarred.length === 0
            ? renderEmptyState(searchQuery ? 'No repositories match your search' : 'No starred repositories')
            : renderCards(filteredStarred)}
        </Section>
      </div>
    </div>
  );
};

/**
 * GitHubProjectsPanel - A panel for browsing GitHub repositories
 *
 * Features:
 * - Lists personal, organization, and starred repositories
 * - Responsive layout: compact (dropdown) for narrow, columns for wide
 * - Search/filter functionality
 * - Emits repository:selected events when a repo is clicked
 *
 * Required data slice: 'github-repositories' (GitHubRepositoriesSliceData)
 */
export const GitHubProjectsPanel: React.FC<PanelComponentProps> = (props) => {
  return (
    <ThemeProvider>
      <GitHubProjectsPanelContent {...props} />
    </ThemeProvider>
  );
};

/**
 * Panel metadata for registration
 */
export const GitHubProjectsPanelMetadata = {
  id: 'github-projects',
  name: 'GitHub Projects',
  description: 'Browse and manage your GitHub repositories',
  icon: 'github',
  version: '0.1.0',
  slices: ['github-repositories'],
  surfaces: ['sidebar', 'panel'],
};
