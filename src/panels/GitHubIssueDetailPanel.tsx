import React, { useState, useEffect } from 'react';
import {
  Github,
  MessageSquare,
  ExternalLink,
  X,
} from 'lucide-react';
import { useTheme } from '@principal-ade/industry-theme';
import { DocumentView } from 'themed-markdown';
import type { PanelComponentProps, PanelEventEmitter } from '../types';
import type { GitHubIssue, IssueSelectedEventPayload } from '../types/github';

/**
 * Format a date string to a relative time description
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  if (diffDays < 30) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  const months = Math.floor(diffDays / 30);
  if (diffDays < 365) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

/**
 * GitHubIssueDetailPanelContent - Internal component that uses theme
 */
const GitHubIssueDetailPanelContent: React.FC<PanelComponentProps> = ({ events }) => {
  const { theme } = useTheme();
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssue | null>(null);
  const [owner, setOwner] = useState<string>('');
  const [repo, setRepo] = useState<string>('');

  // Listen for issue:selected events
  useEffect(() => {
    if (!events) return;

    const handleIssueSelected = (event: { payload: IssueSelectedEventPayload }) => {
      setSelectedIssue(event.payload.issue);
      setOwner(event.payload.owner);
      setRepo(event.payload.repo);
    };

    // Subscribe to issue:selected events
    const unsubscribe = (events as PanelEventEmitter).on('issue:selected', handleIssueSelected);

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [events]);

  // Handle back/close
  const handleBack = () => {
    setSelectedIssue(null);
    setOwner('');
    setRepo('');
    // Emit an event to notify other panels
    if (events) {
      (events as PanelEventEmitter).emit({
        type: 'issue:deselected',
        source: 'github-issue-detail-panel',
        timestamp: Date.now(),
        payload: {},
      });
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  };

  // Empty state when no issue is selected
  if (!selectedIssue) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <Github size={48} style={{ color: theme.colors.textMuted }} />
          <div>
            <h3
              style={{
                margin: 0,
                marginBottom: '8px',
                fontFamily: theme.fonts.heading,
                fontSize: theme.fontSizes[3],
                fontWeight: 600,
                color: theme.colors.text,
              }}
            >
              No Issue Selected
            </h3>
            <p
              style={{
                margin: 0,
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSizes[1],
                color: theme.colors.textSecondary,
                lineHeight: 1.5,
              }}
            >
              Click on an issue in the Issues panel to view its details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isOpen = selectedIssue.state === 'open';
  const statusColor = isOpen
    ? theme.colors.success || '#22c55e'
    : theme.colors.error || '#ef4444';
  const statusBg = `${statusColor}20`;
  const statusLabel = isOpen ? 'Open' : 'Closed';

  return (
    <div style={containerStyle}>
      {/* Header - 40px to match other panels */}
      <div
        style={{
          height: '40px',
          minHeight: '40px',
          padding: '0 12px',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.backgroundSecondary,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxSizing: 'border-box',
        }}
      >
        {/* Issue number */}
        <span
          style={{
            fontFamily: theme.fonts.monospace,
            fontSize: theme.fontSizes[0],
            color: theme.colors.textSecondary,
          }}
        >
          #{selectedIssue.number}
        </span>

        {/* Status badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '999px',
            backgroundColor: statusBg,
            color: statusColor,
            fontFamily: theme.fonts.heading,
            fontSize: theme.fontSizes[0],
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {statusLabel}
        </span>

        {/* Author and date */}
        <span
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes[0],
            fontFamily: theme.fonts.body,
          }}
        >
          by <span style={{ color: theme.colors.primary }}>{selectedIssue.user.login}</span> {formatDate(selectedIssue.created_at)}
        </span>

        {/* Comments */}
        {selectedIssue.comments > 0 && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes[0],
            }}
          >
            <MessageSquare size={12} />
            {selectedIssue.comments}
          </span>
        )}

        {/* Assignees */}
        {selectedIssue.assignees && selectedIssue.assignees.length > 0 && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes[0],
              fontFamily: theme.fonts.body,
            }}
          >
            assigned to{' '}
            {selectedIssue.assignees.map((assignee, index) => (
              <span key={assignee.login}>
                <span style={{ color: theme.colors.primary }}>{assignee.login}</span>
                {index < selectedIssue.assignees.length - 1 && ', '}
              </span>
            ))}
          </span>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* External link */}
        <a
          href={selectedIssue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          title="View on GitHub"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            padding: 0,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '6px',
            backgroundColor: theme.colors.background,
            color: theme.colors.textSecondary,
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={14} />
        </a>

        {/* Close button */}
        <button
          type="button"
          onClick={handleBack}
          title="Close"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            padding: 0,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '6px',
            backgroundColor: theme.colors.background,
            color: theme.colors.textSecondary,
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Title - fixed */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: theme.fonts.heading,
            fontSize: theme.fontSizes[4] || 20,
            fontWeight: 600,
            color: theme.colors.text,
            lineHeight: 1.3,
          }}
        >
          {selectedIssue.title}
        </h1>
      </div>

      {/* Body - scrollable */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
        }}
      >
          {selectedIssue.body ? (
            <DocumentView
              content={selectedIssue.body}
              theme={theme}
              maxWidth="100%"
              transparentBackground
            />
          ) : (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: theme.colors.textMuted,
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSizes[1],
                fontStyle: 'italic',
              }}
            >
              No description provided.
            </div>
          )}
      </div>
    </div>
  );
};

/**
 * GitHubIssueDetailPanel - A panel for viewing GitHub issue details
 *
 * This panel shows:
 * - Compact header with issue number, status, and actions
 * - Issue title
 * - Issue description/body rendered as markdown
 *
 * Listens for 'issue:selected' events from other panels (e.g., GitHubIssuesPanel)
 */
export const GitHubIssueDetailPanel: React.FC<PanelComponentProps> = (props) => {
  return <GitHubIssueDetailPanelContent {...props} />;
};

/**
 * Panel metadata for registration
 */
export const GitHubIssueDetailPanelMetadata = {
  id: 'github-issue-detail',
  name: 'GitHub Issue Details',
  description: 'View detailed information about a GitHub issue',
  icon: 'circle-dot',
  version: '0.1.0',
  slices: [],
  surfaces: ['panel'],
};
