import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  GitCommit,
  GitMerge,
  GitPullRequest,
  CircleDot,
  Check,
  X,
  AlertCircle,
  Tag,
  UserPlus,
  UserMinus,
  Eye,
  Rocket,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '@principal-ade/industry-theme';
import { DocumentView } from 'themed-markdown';
import type { PanelComponentProps, PanelEventEmitter } from '../types';
import type {
  GitHubMessagesSliceData,
  GitHubTimelineEvent,
  GitHubTimelineCommentEvent,
  GitHubTimelineReviewEvent,
  GitHubTimelineCommitEvent,
  GitHubTimelineLabelEvent,
  GitHubTimelineAssignEvent,
  GitHubTimelineMergeEvent,
  GitHubTimelineStateEvent,
  GitHubTimelineRefEvent,
  GitHubTimelineReviewRequestEvent,
  GitHubReviewComment,
  GitHubIssueUser,
  GitHubReactions,
  IssueSelectedEventPayload,
  PullRequestSelectedEventPayload,
} from '../types/github';

/**
 * Format a date string to a relative time description
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'just now';
      return `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  const weeks = Math.floor(diffDays / 7);
  if (diffDays < 30) return `${weeks}w ago`;
  const months = Math.floor(diffDays / 30);
  if (diffDays < 365) return `${months}mo ago`;
  const years = Math.floor(diffDays / 365);
  return `${years}y ago`;
};

/**
 * Format commit SHA to short form
 */
const formatSha = (sha: string): string => sha.substring(0, 7);

/**
 * Get event timestamp
 */
const getEventTimestamp = (event: GitHubTimelineEvent): string => {
  if ('created_at' in event) return event.created_at;
  if ('submitted_at' in event) return event.submitted_at;
  if ('committer' in event) return event.committer.date;
  return '';
};

/**
 * Avatar component
 */
const Avatar: React.FC<{ user: GitHubIssueUser; size?: number }> = ({ user, size = 32 }) => {
  const { theme } = useTheme();
  return (
    <img
      src={user.avatar_url}
      alt={user.login}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1px solid ${theme.colors.border}`,
      }}
    />
  );
};

/**
 * Reactions display component
 */
const ReactionsDisplay: React.FC<{ reactions: GitHubReactions }> = ({ reactions }) => {
  const { theme } = useTheme();

  if (reactions.total_count === 0) return null;

  const reactionEmojis: Record<string, string> = {
    '+1': '\u{1F44D}',
    '-1': '\u{1F44E}',
    laugh: '\u{1F604}',
    hooray: '\u{1F389}',
    confused: '\u{1F615}',
    heart: '\u{2764}\u{FE0F}',
    rocket: '\u{1F680}',
    eyes: '\u{1F440}',
  };

  const reactionCounts: Record<string, number> = {
    '+1': reactions['+1'],
    '-1': reactions['-1'],
    laugh: reactions.laugh,
    hooray: reactions.hooray,
    confused: reactions.confused,
    heart: reactions.heart,
    rocket: reactions.rocket,
    eyes: reactions.eyes,
  };

  const activeReactions = Object.entries(reactionEmojis)
    .filter(([key]) => reactionCounts[key] > 0)
    .map(([key, emoji]) => ({
      emoji,
      count: reactionCounts[key],
    }));

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
      {activeReactions.map(({ emoji, count }) => (
        <span
          key={emoji}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: theme.colors.backgroundSecondary,
            border: `1px solid ${theme.colors.border}`,
            fontSize: theme.fontSizes[0],
          }}
        >
          <span>{emoji}</span>
          <span style={{ color: theme.colors.textSecondary }}>{count}</span>
        </span>
      ))}
    </div>
  );
};

/**
 * Comment event component
 */
const CommentEvent: React.FC<{ event: GitHubTimelineCommentEvent }> = ({ event }) => {
  const { theme } = useTheme();
  const user = event.user || event.actor;

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        padding: '16px',
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      <Avatar user={user} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: theme.colors.text,
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes[1],
            }}
          >
            {user.login}
          </span>
          <span
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.fontSizes[0],
            }}
          >
            commented {formatDate(event.created_at)}
          </span>
          {event.author_association && event.author_association !== 'NONE' && (
            <span
              style={{
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                fontSize: theme.fontSizes[0],
                color: theme.colors.textSecondary,
                textTransform: 'uppercase',
              }}
            >
              {event.author_association.toLowerCase()}
            </span>
          )}
        </div>
        <div
          style={{
            backgroundColor: theme.colors.backgroundSecondary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <DocumentView
            content={event.body}
            theme={theme}
            maxWidth="100%"
            transparentBackground
          />
        </div>
        {event.reactions && <ReactionsDisplay reactions={event.reactions} />}
      </div>
    </div>
  );
};

/**
 * Review event component
 */
const ReviewEvent: React.FC<{ event: GitHubTimelineReviewEvent }> = ({ event }) => {
  const { theme } = useTheme();

  const stateConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    approved: {
      icon: <Check size={16} />,
      color: theme.colors.success || '#22c55e',
      label: 'approved',
    },
    changes_requested: {
      icon: <AlertCircle size={16} />,
      color: theme.colors.error || '#ef4444',
      label: 'requested changes',
    },
    commented: {
      icon: <MessageSquare size={16} />,
      color: theme.colors.textSecondary,
      label: 'reviewed',
    },
    dismissed: {
      icon: <X size={16} />,
      color: theme.colors.textMuted,
      label: 'dismissed review',
    },
  };

  const config = stateConfig[event.state] || stateConfig.commented;

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        padding: '16px',
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      <Avatar user={event.user} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: event.body ? '8px' : 0,
          }}
        >
          <span style={{ color: config.color }}>{config.icon}</span>
          <span
            style={{
              fontWeight: 600,
              color: theme.colors.text,
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes[1],
            }}
          >
            {event.user.login}
          </span>
          <span
            style={{
              color: config.color,
              fontWeight: 500,
              fontSize: theme.fontSizes[1],
            }}
          >
            {config.label}
          </span>
          <span
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.fontSizes[0],
            }}
          >
            {formatDate(event.submitted_at)}
          </span>
        </div>
        {event.body && (
          <div
            style={{
              backgroundColor: theme.colors.backgroundSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <DocumentView
              content={event.body}
              theme={theme}
              maxWidth="100%"
              transparentBackground
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Commit event component
 */
const CommitEvent: React.FC<{ event: GitHubTimelineCommitEvent }> = ({ event }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const messageLines = event.message.split('\n');
  const title = messageLines[0];
  const body = messageLines.slice(1).join('\n').trim();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 16px',
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.background,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: theme.colors.backgroundSecondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.colors.textSecondary,
        }}
      >
        <GitCommit size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {body && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: theme.colors.textSecondary,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <span
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes[1],
              color: theme.colors.text,
              flex: 1,
            }}
          >
            {title}
          </span>
          <a
            href={event.html_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: theme.fonts.monospace,
              fontSize: theme.fontSizes[0],
              color: theme.colors.primary,
              textDecoration: 'none',
            }}
          >
            {formatSha(event.sha)}
          </a>
        </div>
        {expanded && body && (
          <pre
            style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: theme.colors.backgroundSecondary,
              borderRadius: '6px',
              fontFamily: theme.fonts.monospace,
              fontSize: theme.fontSizes[0],
              color: theme.colors.textSecondary,
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
            }}
          >
            {body}
          </pre>
        )}
        <div
          style={{
            marginTop: '4px',
            fontSize: theme.fontSizes[0],
            color: theme.colors.textMuted,
          }}
        >
          {event.author.name} committed {formatDate(event.committer.date)}
          {event.verification?.verified && (
            <span
              style={{
                marginLeft: '8px',
                color: theme.colors.success || '#22c55e',
              }}
            >
              <Check size={12} style={{ verticalAlign: 'middle' }} /> Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Simple event component for labels, assignments, etc.
 */
const SimpleEvent: React.FC<{
  icon: React.ReactNode;
  actor: GitHubIssueUser;
  action: React.ReactNode;
  timestamp: string;
}> = ({ icon, actor, action, timestamp }) => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        borderBottom: `1px solid ${theme.colors.border}`,
        fontSize: theme.fontSizes[0],
        color: theme.colors.textSecondary,
      }}
    >
      <div
        style={{
          width: 32,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <Avatar user={actor} size={20} />
      <span style={{ fontWeight: 500, color: theme.colors.text }}>{actor.login}</span>
      {action}
      <span style={{ color: theme.colors.textMuted, marginLeft: 'auto' }}>
        {formatDate(timestamp)}
      </span>
    </div>
  );
};

/**
 * Label event component
 */
const LabelEvent: React.FC<{ event: GitHubTimelineLabelEvent }> = ({ event }) => {
  const { theme } = useTheme();
  const isLabeled = event.event === 'labeled';

  return (
    <SimpleEvent
      icon={<Tag size={14} style={{ color: theme.colors.textMuted }} />}
      actor={event.actor}
      action={
        <>
          <span>{isLabeled ? 'added' : 'removed'}</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: `#${event.label.color}`,
              color: parseInt(event.label.color, 16) > 0x7fffff ? '#000' : '#fff',
              fontSize: '11px',
              fontWeight: 500,
            }}
          >
            {event.label.name}
          </span>
        </>
      }
      timestamp={event.created_at}
    />
  );
};

/**
 * Assignment event component
 */
const AssignEvent: React.FC<{ event: GitHubTimelineAssignEvent }> = ({ event }) => {
  const { theme } = useTheme();
  const isAssigned = event.event === 'assigned';

  return (
    <SimpleEvent
      icon={
        isAssigned ? (
          <UserPlus size={14} style={{ color: theme.colors.textMuted }} />
        ) : (
          <UserMinus size={14} style={{ color: theme.colors.textMuted }} />
        )
      }
      actor={event.actor}
      action={
        <>
          <span>{isAssigned ? 'assigned' : 'unassigned'}</span>
          <span style={{ fontWeight: 500, color: theme.colors.text }}>
            {event.assignee.login}
          </span>
        </>
      }
      timestamp={event.created_at}
    />
  );
};

/**
 * Review request event component
 */
const ReviewRequestEvent: React.FC<{ event: GitHubTimelineReviewRequestEvent }> = ({ event }) => {
  const { theme } = useTheme();
  const isRequested = event.event === 'review_requested';
  const reviewer = event.requested_reviewer?.login || event.requested_team?.name || 'unknown';

  return (
    <SimpleEvent
      icon={<Eye size={14} style={{ color: theme.colors.textMuted }} />}
      actor={event.review_requester}
      action={
        <>
          <span>{isRequested ? 'requested review from' : 'removed review request from'}</span>
          <span style={{ fontWeight: 500, color: theme.colors.text }}>{reviewer}</span>
        </>
      }
      timestamp={event.created_at}
    />
  );
};

/**
 * Merge event component
 */
const MergeEvent: React.FC<{ event: GitHubTimelineMergeEvent }> = ({ event }) => {
  const { theme } = useTheme();

  return (
    <SimpleEvent
      icon={<GitMerge size={14} style={{ color: theme.colors.success || '#22c55e' }} />}
      actor={event.actor}
      action={
        <>
          <span style={{ color: theme.colors.success || '#22c55e', fontWeight: 500 }}>
            merged
          </span>
          <span>commit</span>
          <code
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: theme.colors.backgroundSecondary,
              fontFamily: theme.fonts.monospace,
              fontSize: '11px',
            }}
          >
            {formatSha(event.commit_id)}
          </code>
        </>
      }
      timestamp={event.created_at}
    />
  );
};

/**
 * State change event component (closed/reopened)
 */
const StateEvent: React.FC<{ event: GitHubTimelineStateEvent }> = ({ event }) => {
  const { theme } = useTheme();
  const isClosed = event.event === 'closed';

  return (
    <SimpleEvent
      icon={
        isClosed ? (
          <CircleDot size={14} style={{ color: theme.colors.error || '#ef4444' }} />
        ) : (
          <CircleDot size={14} style={{ color: theme.colors.success || '#22c55e' }} />
        )
      }
      actor={event.actor}
      action={
        <span
          style={{
            color: isClosed
              ? theme.colors.error || '#ef4444'
              : theme.colors.success || '#22c55e',
            fontWeight: 500,
          }}
        >
          {isClosed ? 'closed' : 'reopened'}
        </span>
      }
      timestamp={event.created_at}
    />
  );
};

/**
 * Ref event component (force push, etc.)
 */
const RefEvent: React.FC<{ event: GitHubTimelineRefEvent }> = ({ event }) => {
  const { theme } = useTheme();

  const labels: Record<string, string> = {
    head_ref_force_pushed: 'force-pushed',
    head_ref_deleted: 'deleted branch',
    head_ref_restored: 'restored branch',
  };

  return (
    <SimpleEvent
      icon={<Rocket size={14} style={{ color: theme.colors.textMuted }} />}
      actor={event.actor}
      action={<span>{labels[event.event] || event.event}</span>}
      timestamp={event.created_at}
    />
  );
};

/**
 * Inline review comment component
 */
const InlineReviewComment: React.FC<{ comment: GitHubReviewComment }> = ({ comment }) => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        padding: '12px 16px',
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.backgroundSecondary,
      }}
    >
      <Avatar user={comment.user} size={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: theme.colors.text,
              fontSize: theme.fontSizes[0],
            }}
          >
            {comment.user.login}
          </span>
          <span
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.fontSizes[0],
            }}
          >
            on
          </span>
          <code
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: theme.colors.background,
              fontFamily: theme.fonts.monospace,
              fontSize: '11px',
              color: theme.colors.primary,
            }}
          >
            {comment.path}
          </code>
          {comment.line && (
            <span style={{ fontSize: theme.fontSizes[0], color: theme.colors.textSecondary }}>
              line {comment.line}
            </span>
          )}
        </div>
        {comment.diff_hunk && (
          <pre
            style={{
              margin: '0 0 8px 0',
              padding: '8px',
              backgroundColor: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '6px',
              fontFamily: theme.fonts.monospace,
              fontSize: '11px',
              color: theme.colors.textSecondary,
              overflow: 'auto',
              maxHeight: '100px',
            }}
          >
            {comment.diff_hunk}
          </pre>
        )}
        <div
          style={{
            backgroundColor: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <DocumentView
            content={comment.body}
            theme={theme}
            maxWidth="100%"
            transparentBackground
          />
        </div>
        {comment.reactions && <ReactionsDisplay reactions={comment.reactions} />}
      </div>
    </div>
  );
};

/**
 * Render a timeline event
 */
const TimelineEventRenderer: React.FC<{ event: GitHubTimelineEvent }> = ({ event }) => {
  switch (event.event) {
    case 'commented':
      return <CommentEvent event={event as GitHubTimelineCommentEvent} />;
    case 'reviewed':
      return <ReviewEvent event={event as GitHubTimelineReviewEvent} />;
    case 'committed':
      return <CommitEvent event={event as GitHubTimelineCommitEvent} />;
    case 'labeled':
    case 'unlabeled':
      return <LabelEvent event={event as GitHubTimelineLabelEvent} />;
    case 'assigned':
    case 'unassigned':
      return <AssignEvent event={event as GitHubTimelineAssignEvent} />;
    case 'review_requested':
    case 'review_request_removed':
      return <ReviewRequestEvent event={event as GitHubTimelineReviewRequestEvent} />;
    case 'merged':
      return <MergeEvent event={event as GitHubTimelineMergeEvent} />;
    case 'closed':
    case 'reopened':
      return <StateEvent event={event as GitHubTimelineStateEvent} />;
    case 'head_ref_force_pushed':
    case 'head_ref_deleted':
    case 'head_ref_restored':
      return <RefEvent event={event as GitHubTimelineRefEvent} />;
    default:
      return null;
  }
};

/**
 * GitHubMessagesPanelContent - Internal component that uses theme
 */
const GitHubMessagesPanelContent: React.FC<PanelComponentProps> = ({ context, events }) => {
  const { theme } = useTheme();

  // Get messages data from slice - reads directly, no events for data updates
  const messagesSlice = context.getSlice<GitHubMessagesSliceData>('github-messages');
  const isLoading = context.isSliceLoading('github-messages');
  const hasData = context.hasSlice('github-messages');

  const messagesData = messagesSlice?.data;

  // Listen for issue:selected or pr:selected events to request messages
  useEffect(() => {
    if (!events) return;

    const handleIssueSelected = (event: { payload: IssueSelectedEventPayload }) => {
      // Request messages for this issue
      (events as PanelEventEmitter).emit({
        type: 'github-messages:request',
        source: 'github-messages-panel',
        timestamp: Date.now(),
        payload: {
          owner: event.payload.owner,
          repo: event.payload.repo,
          number: event.payload.issue.number,
          type: 'issue',
        },
      });
    };

    const handlePRSelected = (event: { payload: PullRequestSelectedEventPayload }) => {
      // Request messages for this PR
      (events as PanelEventEmitter).emit({
        type: 'github-messages:request',
        source: 'github-messages-panel',
        timestamp: Date.now(),
        payload: {
          owner: event.payload.owner,
          repo: event.payload.repo,
          number: event.payload.pullRequest.number,
          type: 'pull_request',
        },
      });
    };

    const unsubIssue = (events as PanelEventEmitter).on('issue:selected', handleIssueSelected);
    const unsubPR = (events as PanelEventEmitter).on('pr:selected', handlePRSelected);

    return () => {
      if (typeof unsubIssue === 'function') unsubIssue();
      if (typeof unsubPR === 'function') unsubPR();
    };
  }, [events]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  };

  // Loading state
  if (isLoading && !hasData) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.colors.textSecondary,
          }}
        >
          Loading conversation...
        </div>
      </div>
    );
  }

  // Empty state
  if (!messagesData || !messagesData.target) {
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
          <MessageSquare size={48} style={{ color: theme.colors.textMuted }} />
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
              No Conversation Selected
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
              Select an issue or pull request to view its conversation thread.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (messagesData.error) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: theme.colors.error || '#ef4444',
          }}
        >
          <AlertCircle size={32} />
          <span>{messagesData.error}</span>
        </div>
      </div>
    );
  }

  const { target, timeline, reviewComments } = messagesData;
  const isPR = target.type === 'pull_request';

  // Determine status color and icon
  const getStatusConfig = () => {
    if (isPR && target.merged) {
      return {
        icon: <GitMerge size={14} />,
        color: '#a855f7', // purple for merged
        label: 'Merged',
      };
    }
    if (target.state === 'open') {
      return {
        icon: isPR ? <GitPullRequest size={14} /> : <CircleDot size={14} />,
        color: theme.colors.success || '#22c55e',
        label: target.draft ? 'Draft' : 'Open',
      };
    }
    return {
      icon: <CircleDot size={14} />,
      color: theme.colors.error || '#ef4444',
      label: 'Closed',
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <div style={containerStyle}>
      {/* Header */}
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
        {/* Type and number */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: theme.fonts.monospace,
            fontSize: theme.fontSizes[0],
            color: theme.colors.textSecondary,
          }}
        >
          {isPR ? <GitPullRequest size={14} /> : <CircleDot size={14} />}
          #{target.number}
        </span>

        {/* Status badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '999px',
            backgroundColor: `${statusConfig.color}20`,
            color: statusConfig.color,
            fontFamily: theme.fonts.heading,
            fontSize: theme.fontSizes[0],
            fontWeight: 600,
          }}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </span>

        {/* Title (truncated) */}
        <span
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: theme.colors.text,
            fontSize: theme.fontSizes[1],
          }}
        >
          {target.title}
        </span>

        {/* Message count */}
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
          {timeline.filter((e: GitHubTimelineEvent) => e.event === 'commented' || e.event === 'reviewed').length}
        </span>

        {/* External link */}
        <a
          href={target.html_url}
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
      </div>

      {/* Timeline */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        {timeline.length === 0 && reviewComments.length === 0 ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: theme.colors.textMuted,
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes[1],
            }}
          >
            No activity yet.
          </div>
        ) : (
          <>
            {timeline.map((event: GitHubTimelineEvent, index: number) => (
              <TimelineEventRenderer key={`${event.event}-${index}`} event={event} />
            ))}
            {reviewComments.length > 0 && (
              <>
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderBottom: `1px solid ${theme.colors.border}`,
                    fontWeight: 600,
                    fontSize: theme.fontSizes[0],
                    color: theme.colors.textSecondary,
                    textTransform: 'uppercase',
                  }}
                >
                  Inline Review Comments ({reviewComments.length})
                </div>
                {reviewComments.map((comment: GitHubReviewComment) => (
                  <InlineReviewComment key={comment.id} comment={comment} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/**
 * GitHubMessagesPanel - A panel for viewing GitHub issue/PR conversation threads
 *
 * This panel shows:
 * - Compact header with issue/PR info and status
 * - Chronological timeline of comments, reviews, commits, and events
 * - Inline review comments for PRs
 *
 * Listens for 'issue:selected' and 'pr:selected' events
 * Requests data via 'github-messages:request' event
 * Receives data from 'github-messages' data slice
 */
export const GitHubMessagesPanel: React.FC<PanelComponentProps> = (props) => {
  return <GitHubMessagesPanelContent {...props} />;
};

/**
 * Panel metadata for registration
 */
export const GitHubMessagesPanelMetadata = {
  id: 'github-messages',
  name: 'GitHub Messages',
  description: 'View conversation threads for GitHub issues and pull requests',
  icon: 'message-square',
  version: '0.1.0',
  slices: ['github-messages'],
  surfaces: ['panel'],
};
