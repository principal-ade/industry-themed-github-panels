import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import {
  Github,
  AlertCircle,
  Copy,
  CheckCircle2,
  ExternalLink,
  Tag,
  Calendar,
  MessageSquare,
  Loader2,
  X,
  RefreshCw,
  LogIn,
} from 'lucide-react';

import type { PanelComponentProps } from '../types';
import type {
  GitHubIssue,
  GitHubIssuesSliceData,
  IssueSelectedEventPayload,
} from '../types/github';

type IssueFilter = 'all' | 'open' | 'closed';

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
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * GitHubIssuesPanelContent - Internal component that uses theme
 */
const GitHubIssuesPanelContent: React.FC<PanelComponentProps> = ({
  context,
  events,
}) => {
  const { theme } = useTheme();

  // Get issues from data slice
  const issuesSlice = context.getSlice<GitHubIssuesSliceData>('github-issues');
  const isLoading = context.isSliceLoading('github-issues');
  const hasData = context.hasSlice('github-issues');

  const issues = issuesSlice?.data?.issues ?? [];
  const owner = issuesSlice?.data?.owner ?? '';
  const repo = issuesSlice?.data?.repo ?? '';
  const isAuthenticated = issuesSlice?.data?.isAuthenticated ?? false;
  const sliceError = issuesSlice?.data?.error;

  // Local state
  const [selectedIssues, setSelectedIssues] = useState<Set<number>>(new Set());
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [issueFilter, setIssueFilter] = useState<IssueFilter>('open');
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssue | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Request issues data on mount
  useEffect(() => {
    events.emit({
      type: 'github-issues:request',
      source: 'github-issues-panel',
      timestamp: Date.now(),
      payload: {},
    });
  }, [events]);

  // Filter issues based on selected filter
  const filteredIssues = useMemo(() => {
    if (issueFilter === 'all') return issues;
    return issues.filter((issue) => issue.state === issueFilter);
  }, [issues, issueFilter]);

  // Issue counts for filter buttons
  const issueCounts = useMemo(() => ({
    all: issues.length,
    open: issues.filter((i) => i.state === 'open').length,
    closed: issues.filter((i) => i.state === 'closed').length,
  }), [issues]);

  const handleSelectAll = () => {
    if (selectedIssues.size === filteredIssues.length) {
      setSelectedIssues(new Set());
    } else {
      setSelectedIssues(new Set(filteredIssues.map((i) => i.number)));
    }
  };

  const handleToggleIssue = (issueNumber: number, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    const newSelected = new Set(selectedIssues);
    if (newSelected.has(issueNumber)) {
      newSelected.delete(issueNumber);
    } else {
      newSelected.add(issueNumber);
    }
    setSelectedIssues(newSelected);
  };

  const handleIssueClick = (issue: GitHubIssue, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.closest('a')) {
      return;
    }
    setSelectedIssue(issue);
    setShowIssueModal(true);

    // Emit issue selected event
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

  const handleRefresh = () => {
    events.emit({
      type: 'github-issues:refresh',
      source: 'github-issues-panel',
      timestamp: Date.now(),
      payload: {},
    });
  };

  const handleLogin = () => {
    events.emit({
      type: 'github:login-requested',
      source: 'github-issues-panel',
      timestamp: Date.now(),
      payload: {},
    });
  };

  const generatePrompt = (): string => {
    const selectedIssueData = issues.filter((i) =>
      selectedIssues.has(i.number)
    );

    if (selectedIssueData.length === 0) return '';

    let prompt = `I'm working on the GitHub repository ${owner}/${repo}. Here are the issues I need help with:\n\n`;

    selectedIssueData.forEach((issue) => {
      prompt += `## Issue #${issue.number}: ${issue.title}\n`;
      prompt += `- Status: ${issue.state}\n`;
      prompt += `- URL: ${issue.html_url}\n`;

      if (issue.labels.length > 0) {
        prompt += `- Labels: ${issue.labels.map((l) => l.name).join(', ')}\n`;
      }

      if (issue.body) {
        prompt += `- Description:\n${issue.body}\n`;
      }

      prompt += '\n';
    });

    prompt += `Please help me understand and address these issues.`;

    return prompt;
  };

  const handleCopyPrompt = async () => {
    const prompt = generatePrompt();
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
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
            flex: 1,
          }}
        >
          Issues
        </h2>
        <span
          style={{
            fontSize: `${theme.fontSizes[1]}px`,
            color: theme.colors.textSecondary,
          }}
        >
          {owner}/{repo}
        </span>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.backgroundSecondary,
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {/* Filter buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['open', 'closed', 'all'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setIssueFilter(filter)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border:
                    issueFilter === filter
                      ? 'none'
                      : `1px solid ${theme.colors.border}`,
                  backgroundColor:
                    issueFilter === filter
                      ? theme.colors.primary
                      : theme.colors.background,
                  color:
                    issueFilter === filter
                      ? theme.colors.background
                      : theme.colors.text,
                  fontSize: `${theme.fontSizes[1]}px`,
                  fontWeight:
                    issueFilter === filter
                      ? theme.fontWeights.semibold
                      : theme.fontWeights.body,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {filter === 'all' ? 'All' : filter === 'open' ? 'Open' : 'Closed'}
                <span style={{ marginLeft: '6px', opacity: 0.8 }}>
                  ({issueCounts[filter]})
                </span>
              </button>
            ))}
          </div>

          {filteredIssues.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.background,
                color: theme.colors.textSecondary,
                fontSize: `${theme.fontSizes[1]}px`,
                cursor: 'pointer',
              }}
            >
              {selectedIssues.size === filteredIssues.length
                ? 'Deselect All'
                : 'Select All'}
            </button>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              fontSize: `${theme.fontSizes[1]}px`,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleCopyPrompt}
            disabled={selectedIssues.size === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor:
                selectedIssues.size > 0
                  ? theme.colors.primary
                  : theme.colors.backgroundTertiary,
              color:
                selectedIssues.size > 0
                  ? theme.colors.background
                  : theme.colors.textSecondary,
              fontSize: `${theme.fontSizes[1]}px`,
              fontWeight: theme.fontWeights.semibold,
              cursor: selectedIssues.size > 0 ? 'pointer' : 'not-allowed',
              opacity: selectedIssues.size > 0 ? 1 : 0.5,
            }}
          >
            {copiedPrompt ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            {copiedPrompt ? 'Copied!' : `Copy Prompt (${selectedIssues.size})`}
          </button>
        </div>
      </div>

      {/* Issues List */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        {filteredIssues.length === 0 ? (
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
                No Issues Found
              </h3>
              <p style={{ margin: 0, fontSize: `${theme.fontSizes[2]}px` }}>
                There are no {issueFilter !== 'all' ? issueFilter : ''} issues
                in this repository.
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            {filteredIssues.map((issue) => (
              <button
                key={issue.id}
                type="button"
                onClick={(e) => handleIssueClick(issue, e)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: `1px solid ${
                    selectedIssues.has(issue.number)
                      ? theme.colors.primary
                      : theme.colors.border
                  }`,
                  backgroundColor: selectedIssues.has(issue.number)
                    ? `${theme.colors.primary}10`
                    : theme.colors.surface,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIssues.has(issue.number)}
                    onChange={() => handleToggleIssue(issue.number)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ marginTop: '2px', cursor: 'pointer' }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Issue header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '6px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor:
                            issue.state === 'open' ? '#22c55e22' : '#6b728022',
                          color:
                            issue.state === 'open' ? '#22c55e' : '#6b7280',
                          fontSize: `${theme.fontSizes[0]}px`,
                          fontWeight: theme.fontWeights.semibold,
                          textTransform: 'uppercase',
                        }}
                      >
                        {issue.state}
                      </span>

                      <span
                        style={{
                          color: theme.colors.textSecondary,
                          fontSize: `${theme.fontSizes[1]}px`,
                        }}
                      >
                        #{issue.number}
                      </span>

                      <a
                        href={issue.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          color: theme.colors.primary,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>

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

                    {/* Labels */}
                    {issue.labels.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px',
                          marginBottom: '6px',
                        }}
                      >
                        {issue.labels.slice(0, 3).map((label) => (
                          <span
                            key={label.id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 6px',
                              borderRadius: '12px',
                              backgroundColor: `#${label.color}22`,
                              color: `#${label.color}`,
                              fontSize: `${theme.fontSizes[0]}px`,
                              fontWeight: theme.fontWeights.medium,
                            }}
                          >
                            <Tag size={10} />
                            {label.name}
                          </span>
                        ))}
                        {issue.labels.length > 3 && (
                          <span
                            style={{
                              fontSize: `${theme.fontSizes[0]}px`,
                              color: theme.colors.textSecondary,
                            }}
                          >
                            +{issue.labels.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
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
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <img
                          src={issue.user.avatar_url}
                          alt={issue.user.login}
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                          }}
                        />
                        {issue.user.login}
                      </span>

                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Calendar size={12} />
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
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      {showIssueModal && selectedIssue && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => {
            setShowIssueModal(false);
            setSelectedIssue(null);
          }}
        >
          <div
            style={{
              backgroundColor: theme.colors.background,
              borderRadius: '12px',
              width: '90%',
              maxWidth: '700px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${theme.colors.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '20px',
                borderBottom: `1px solid ${theme.colors.border}`,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor:
                        selectedIssue.state === 'open'
                          ? '#22c55e22'
                          : '#6b728022',
                      color:
                        selectedIssue.state === 'open' ? '#22c55e' : '#6b7280',
                      fontSize: `${theme.fontSizes[1]}px`,
                      fontWeight: theme.fontWeights.semibold,
                      textTransform: 'uppercase',
                    }}
                  >
                    {selectedIssue.state}
                  </span>
                  <span
                    style={{
                      color: theme.colors.textSecondary,
                      fontSize: `${theme.fontSizes[2]}px`,
                    }}
                  >
                    #{selectedIssue.number}
                  </span>
                </div>
                <h2
                  style={{
                    color: theme.colors.text,
                    fontSize: `${theme.fontSizes[4]}px`,
                    fontWeight: theme.fontWeights.semibold,
                    margin: 0,
                  }}
                >
                  {selectedIssue.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowIssueModal(false);
                  setSelectedIssue(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  padding: '8px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '20px',
              }}
            >
              {/* Issue Metadata */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  marginBottom: '20px',
                  fontSize: `${theme.fontSizes[2]}px`,
                  color: theme.colors.textSecondary,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <img
                    src={selectedIssue.user.avatar_url}
                    alt={selectedIssue.user.login}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                    }}
                  />
                  <strong style={{ color: theme.colors.text }}>
                    {selectedIssue.user.login}
                  </strong>{' '}
                  opened
                </span>
                <span
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Calendar size={14} />
                  {formatDate(selectedIssue.created_at)}
                </span>
                {selectedIssue.comments > 0 && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <MessageSquare size={14} />
                    {selectedIssue.comments}{' '}
                    {selectedIssue.comments === 1 ? 'comment' : 'comments'}
                  </span>
                )}
              </div>

              {/* Labels */}
              {selectedIssue.labels.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '20px',
                  }}
                >
                  {selectedIssue.labels.map((label) => (
                    <span
                      key={label.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        backgroundColor: `#${label.color}22`,
                        color: `#${label.color}`,
                        fontSize: `${theme.fontSizes[1]}px`,
                        fontWeight: theme.fontWeights.medium,
                      }}
                    >
                      <Tag size={12} />
                      {label.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Issue Body */}
              {selectedIssue.body && (
                <div
                  style={{
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderRadius: '8px',
                    padding: '16px',
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <h3
                    style={{
                      color: theme.colors.text,
                      fontSize: `${theme.fontSizes[2]}px`,
                      fontWeight: theme.fontWeights.semibold,
                      marginTop: 0,
                      marginBottom: '12px',
                    }}
                  >
                    Description
                  </h3>
                  <div
                    style={{
                      color: theme.colors.text,
                      fontSize: `${theme.fontSizes[2]}px`,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {selectedIssue.body}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '16px 20px',
                borderTop: `1px solid ${theme.colors.border}`,
                gap: '12px',
              }}
            >
              <a
                href={selectedIssue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.background,
                  fontSize: `${theme.fontSizes[2]}px`,
                  fontWeight: theme.fontWeights.medium,
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={14} />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

/**
 * GitHubIssuesPanel - A panel for viewing GitHub repository issues
 *
 * Features:
 * - View issues with filtering (open/closed/all)
 * - Select issues and copy as AI prompt
 * - Issue detail modal
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
