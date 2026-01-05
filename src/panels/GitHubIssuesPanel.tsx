import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import {
  Github,
  AlertCircle,
  MessageSquare,
  Loader2,
  RefreshCw,
  LogIn,
  ChevronDown,
  Tag,
  Plus,
} from 'lucide-react';

import type { PanelComponentProps } from '../types';
import type {
  GitHubIssue,
  GitHubIssuesSliceData,
  IssueSelectedEventPayload,
} from '../types/github';
import { CreateIssueModal } from '../components/CreateIssueModal';

/**
 * Format a date string to a relative time description
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  if (diffDays < 30) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  const months = Math.floor(diffDays / 30);
  if (diffDays < 365) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

/**
 * GitHubIssuesPanelContent - Internal component that uses theme
 */
const GitHubIssuesPanelContent: React.FC<PanelComponentProps> = ({
  context,
  events,
}) => {
  const { theme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  // Listen for panel focus events
  usePanelFocusListener(
    'github-issues',
    events,
    () => panelRef.current?.focus()
  );

  // Get issues from data slice
  const issuesSlice = context.getSlice<GitHubIssuesSliceData>('github-issues');
  const isLoading = context.isSliceLoading('github-issues');
  const hasData = context.hasSlice('github-issues');

  const issues = issuesSlice?.data?.issues ?? [];
  const owner = issuesSlice?.data?.owner ?? '';
  const repo = issuesSlice?.data?.repo ?? '';
  const isAuthenticated = issuesSlice?.data?.isAuthenticated ?? false;
  const sliceError = issuesSlice?.data?.error;

  // State for label filter
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // State for selected issue
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);

  // State for create issue modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Extract unique labels from all issues
  const uniqueLabels = useMemo(() => {
    const labelMap = new Map<string, { name: string; color: string }>();
    issues.forEach((issue) => {
      issue.labels.forEach((label) => {
        if (!labelMap.has(label.name)) {
          labelMap.set(label.name, { name: label.name, color: label.color });
        }
      });
    });
    return Array.from(labelMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [issues]);

  // Request issues data on mount
  useEffect(() => {
    events.emit({
      type: 'github-issues:request',
      source: 'github-issues-panel',
      timestamp: Date.now(),
      payload: {},
    });
  }, [events]);

  // Filter to only show open issues, optionally filtered by label
  const openIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (issue.state !== 'open') return false;
      if (selectedLabel && !issue.labels.some((l) => l.name === selectedLabel)) return false;
      return true;
    });
  }, [issues, selectedLabel]);

  const handleIssueClick = (issue: GitHubIssue) => {
    setSelectedIssueId(issue.id);
    // Emit issue selected event for detail panel
    events.emit<IssueSelectedEventPayload>({
      type: 'issue:selected',
      source: 'github-issues-panel',
      timestamp: Date.now(),
      payload: {
        issue,
        owner,
        repo,
      },
    });
  };

  const handleRefresh = async () => {
    // Call the context's refresh method to reload issues
    await context.refresh('repository', 'github-issues');
  };

  const handleIssueCreated = async () => {
    // Refresh the issues list after creating a new issue
    await handleRefresh();
  };

  const handleLogin = () => {
    events.emit({
      type: 'github:login-requested',
      source: 'github-issues-panel',
      timestamp: Date.now(),
      payload: {},
    });
  };

  // Render helper for state messages
  const renderState = (
    icon: React.ReactNode,
    title: string,
    description?: string,
    action?: React.ReactNode
  ) => (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: theme.colors.background,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          maxWidth: '360px',
          textAlign: 'center',
        }}
      >
        <div>{icon}</div>
        <div>
          <h3
            style={{
              margin: 0,
              marginBottom: '8px',
              color: theme.colors.text,
              fontSize: `${theme.fontSizes[3]}px`,
              fontWeight: theme.fontWeights.semibold,
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              style={{
                margin: 0,
                color: theme.colors.textSecondary,
                lineHeight: 1.5,
                fontSize: `${theme.fontSizes[2]}px`,
              }}
            >
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
    </div>
  );

  // Loading state
  if (isLoading && !hasData) {
    return renderState(
      <Loader2
        size={32}
        style={{ color: theme.colors.textSecondary }}
        className="animate-spin"
      />,
      'Loading issues...',
      'Fetching issues from GitHub'
    );
  }

  // Not authenticated state
  if (!isAuthenticated && !hasData) {
    return renderState(
      <AlertCircle
        size={32}
        style={{ color: theme.colors.warning || '#f59e0b' }}
      />,
      'Sign in to GitHub',
      'Connect your GitHub account to view repository issues.',
      <button
        type="button"
        onClick={handleLogin}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: theme.colors.primary,
          color: theme.colors.background,
          fontWeight: theme.fontWeights.semibold,
          fontSize: `${theme.fontSizes[2]}px`,
          cursor: 'pointer',
        }}
      >
        <LogIn size={16} />
        Sign in with GitHub
      </button>
    );
  }

  // Error state
  if (sliceError) {
    return renderState(
      <AlertCircle size={32} style={{ color: theme.colors.error }} />,
      'Failed to Load Issues',
      sliceError,
      <button
        type="button"
        onClick={handleRefresh}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: '6px',
          border: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          fontWeight: theme.fontWeights.medium,
          fontSize: `${theme.fontSizes[2]}px`,
          cursor: 'pointer',
        }}
      >
        <RefreshCw size={16} />
        Try Again
      </button>
    );
  }

  // No repository context
  if (!owner || !repo) {
    return renderState(
      <Github size={32} style={{ color: theme.colors.textSecondary }} />,
      'No Repository Selected',
      'Select a repository to view its issues.'
    );
  }

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
        outline: 'none',
      }}
    >
      {/* Header - 40px total including border */}
      <div
        style={{
          position: 'relative',
          height: '40px',
          padding: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.backgroundLight,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes[1],
              color: theme.colors.textSecondary,
              fontWeight: 500,
            }}
          >
            Open Issues
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Label filter dropdown */}
            {uniqueLabels.length > 0 && (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.surface,
                    color: selectedLabel ? theme.colors.text : theme.colors.textSecondary,
                    fontSize: `${theme.fontSizes[0]}px`,
                    cursor: 'pointer',
                  }}
                >
                  <Tag size={10} />
                  <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedLabel || 'All'}
                  </span>
                  <ChevronDown
                    size={10}
                    style={{
                      transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </button>

                {isDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '4px',
                      minWidth: '150px',
                      backgroundColor: theme.colors.surface,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 10,
                      maxHeight: '200px',
                      overflow: 'auto',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLabel('');
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 10px',
                        border: 'none',
                        backgroundColor: selectedLabel === '' ? theme.colors.backgroundLight : 'transparent',
                        color: theme.colors.text,
                        fontSize: `${theme.fontSizes[1]}px`,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      All labels
                    </button>
                    {uniqueLabels.map((label) => (
                      <button
                        key={label.name}
                        type="button"
                        onClick={() => {
                          setSelectedLabel(label.name);
                          setIsDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '8px 10px',
                          border: 'none',
                          backgroundColor: selectedLabel === label.name ? theme.colors.backgroundLight : 'transparent',
                          color: theme.colors.text,
                          fontSize: `${theme.fontSizes[1]}px`,
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: `#${label.color}`,
                          }}
                        />
                        {label.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Create Issue Button */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: theme.colors.primary,
                color: theme.colors.textOnPrimary || theme.colors.background,
                fontSize: `${theme.fontSizes[0]}px`,
                fontWeight: theme.fontWeights.medium,
                cursor: 'pointer',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <Plus size={12} />
              New
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              style={{
                background: 'none',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                padding: '4px',
                color: theme.colors.textSecondary,
                opacity: isLoading ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {openIssues.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '16px',
              color: theme.colors.textSecondary,
            }}
          >
            <Github size={48} color={theme.colors.border} />
            <div style={{ textAlign: 'center' }}>
              <h3
                style={{
                  color: theme.colors.text,
                  marginBottom: '8px',
                  fontSize: `${theme.fontSizes[3]}px`,
                }}
              >
                No Open Issues
              </h3>
              <p style={{ margin: 0, fontSize: `${theme.fontSizes[2]}px` }}>
                There are no open issues in this repository.
              </p>

              {/* Create Issue Button */}
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                style={{
                  marginTop: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.textOnPrimary || theme.colors.background,
                  fontSize: `${theme.fontSizes[2]}px`,
                  fontWeight: theme.fontWeights.semibold,
                  cursor: 'pointer',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Plus size={16} />
                Create Issue
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {openIssues.map((issue) => {
              const isSelected = selectedIssueId === issue.id;
              return (
              <button
                key={issue.id}
                type="button"
                onClick={() => handleIssueClick(issue)}
                style={{
                  width: '100%',
                  padding: '16px 16px',
                  borderRadius: 0,
                  border: 'none',
                  borderBottom: `1px solid ${theme.colors.border}`,
                  backgroundColor: isSelected ? theme.colors.backgroundSecondary : theme.colors.surface,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div style={{ minWidth: 0 }}>
                    {/* Issue title */}
                    <h4
                      style={{
                        margin: 0,
                        marginBottom: '6px',
                        color: theme.colors.text,
                        fontSize: `${theme.fontSizes[2]}px`,
                        fontWeight: theme.fontWeights.semibold,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {issue.title}
                    </h4>

                    {/* Metadata */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: `${theme.fontSizes[0]}px`,
                        color: theme.colors.textSecondary,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span>#{issue.number}</span>

                      <span>
                        Created by{' '}
                        <span style={{ color: theme.colors.primary }}>
                          {issue.user.login}
                        </span>
                      </span>

                      <span>
                        {formatDate(issue.created_at)}
                      </span>

                      {issue.comments > 0 && (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <MessageSquare size={12} />
                          {issue.comments}
                        </span>
                      )}
                    </div>
                </div>
              </button>
            );
            })}
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        owner={owner}
        repo={repo}
        onIssueCreated={handleIssueCreated}
        apiBaseUrl={typeof window !== 'undefined' ? window.location.origin : ''}
      />
    </div>
  );
};

/**
 * GitHubIssuesPanel - A panel for viewing GitHub repository issues
 *
 * Features:
 * - View issues with filtering (open/closed/all)
 * - Select issues and copy as AI prompt
 * - Emits 'issue:selected' event for detail panel
 * - External links to GitHub
 */
export const GitHubIssuesPanel: React.FC<PanelComponentProps> = (props) => {
  return <GitHubIssuesPanelContent {...props} />;
};

/**
 * Panel metadata for registration
 */
export const GitHubIssuesPanelMetadata = {
  id: 'github-issues',
  name: 'GitHub Issues',
  description: 'View and manage GitHub repository issues',
  icon: 'circle-dot',
  version: '0.1.0',
  slices: ['github-issues'],
  surfaces: ['panel'],
};
