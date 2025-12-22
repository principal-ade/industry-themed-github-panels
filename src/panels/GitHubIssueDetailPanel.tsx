import React, { useState, useEffect } from 'react';
import {
  Github,
  Tag,
  Calendar,
  MessageSquare,
  ExternalLink,
  ArrowLeft,
  User,
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

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * Status badge component
 */
const StatusBadge: React.FC<{ state: 'open' | 'closed' }> = ({ state }) => {
  const { theme } = useTheme();
  const isOpen = state === 'open';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: `${theme.fontSizes[1]}px`,
        fontWeight: theme.fontWeights.semibold,
        backgroundColor: isOpen ? '#22c55e22' : '#6b728022',
        color: isOpen ? '#22c55e' : '#6b7280',
        textTransform: 'uppercase',
      }}
    >
      {state}
    </span>
  );
};

/**
 * Metadata row component
 */
const MetadataRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => {
  const { theme } = useTheme();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: `${theme.fontSizes[1]}px`,
      }}
    >
      <span style={{ color: theme.colors.textSecondary, display: 'flex', alignItems: 'center' }}>
        {icon}
      </span>
      <span style={{ color: theme.colors.textSecondary }}>{label}:</span>
      <span style={{ color: theme.colors.text }}>{value}</span>
    </div>
  );
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

  // Empty state when no issue is selected
  if (!selectedIssue) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: theme.colors.background,
          color: theme.colors.textSecondary,
          gap: '16px',
        }}
      >
        <Github size={48} color={theme.colors.border} />
        <div style={{ textAlign: 'center' }}>
          <h3
            style={{
              margin: '0 0 8px 0',
              fontSize: `${theme.fontSizes[3]}px`,
              color: theme.colors.text,
              fontWeight: theme.fontWeights.semibold,
            }}
          >
            No Issue Selected
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: `${theme.fontSizes[1]}px`,
              color: theme.colors.textSecondary,
            }}
          >
            Click on an issue in the Issues panel to view its details
          </p>
        </div>
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
        overflow: 'hidden',
        fontFamily: theme.fonts.body,
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          padding: '16px 20px',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.backgroundSecondary,
        }}
      >
        {/* Back button, number, and status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          }}
        >
          <button
            type="button"
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '6px',
              background: theme.colors.surface,
              cursor: 'pointer',
              color: theme.colors.textSecondary,
            }}
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <span
            style={{
              fontFamily: theme.fonts.monospace || 'monospace',
              fontSize: `${theme.fontSizes[1]}px`,
              color: theme.colors.textSecondary,
            }}
          >
            #{selectedIssue.number}
          </span>
          <StatusBadge state={selectedIssue.state} />
          {owner && repo && (
            <span
              style={{
                fontSize: `${theme.fontSizes[0]}px`,
                color: theme.colors.textSecondary,
                marginLeft: 'auto',
              }}
            >
              {owner}/{repo}
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          style={{
            margin: '0 0 16px 0',
            fontSize: `${theme.fontSizes[5]}px`,
            fontWeight: theme.fontWeights.semibold,
            color: theme.colors.text,
            lineHeight: 1.3,
          }}
        >
          {selectedIssue.title}
        </h1>

        {/* Metadata grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          <MetadataRow
            icon={<User size={14} />}
            label="Author"
            value={
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img
                  src={selectedIssue.user.avatar_url}
                  alt={selectedIssue.user.login}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                  }}
                />
                {selectedIssue.user.login}
              </span>
            }
          />

          <MetadataRow
            icon={<Calendar size={14} />}
            label="Created"
            value={formatDate(selectedIssue.created_at)}
          />

          {selectedIssue.comments > 0 && (
            <MetadataRow
              icon={<MessageSquare size={14} />}
              label="Comments"
              value={`${selectedIssue.comments} ${selectedIssue.comments === 1 ? 'comment' : 'comments'}`}
            />
          )}
        </div>

        {/* Labels */}
        {selectedIssue.labels.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '12px',
              flexWrap: 'wrap',
            }}
          >
            <Tag size={14} color={theme.colors.textSecondary} />
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
                {label.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body Content */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
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
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.textSecondary,
              fontStyle: 'italic',
              padding: '40px',
            }}
          >
            No description provided
          </div>
        )}

        {/* Assignees */}
        {selectedIssue.assignees && selectedIssue.assignees.length > 0 && (
          <div
            style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: theme.colors.backgroundSecondary,
              borderRadius: '8px',
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
              Assignees
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {selectedIssue.assignees.map((assignee) => (
                <div
                  key={assignee.login}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    backgroundColor: theme.colors.surface,
                    borderRadius: '20px',
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <img
                    src={assignee.avatar_url}
                    alt={assignee.login}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                    }}
                  />
                  <span
                    style={{
                      fontSize: `${theme.fontSizes[1]}px`,
                      color: theme.colors.text,
                    }}
                  >
                    {assignee.login}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          flexShrink: 0,
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
  );
};

/**
 * GitHubIssueDetailPanel - A panel for viewing GitHub issue details
 *
 * This panel shows:
 * - Issue header with title, status, and metadata
 * - Labels and assignees
 * - Issue description/body
 * - Link to view on GitHub
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
