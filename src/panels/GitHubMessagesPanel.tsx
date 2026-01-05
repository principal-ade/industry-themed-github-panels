import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  GitCommit,
  GitMerge,
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
  Trash2,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
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
 * Reaction content types (GitHub API format)
 */
type ReactionContent = '+1' | '-1' | 'laugh' | 'hooray' | 'confused' | 'heart' | 'rocket' | 'eyes';

/**
 * Map GitHub reaction types to emoji
 */
const REACTION_EMOJI: Record<ReactionContent, string> = {
  '+1': '👍',
  '-1': '👎',
  'laugh': '😄',
  'hooray': '🎉',
  'confused': '😕',
  'heart': '❤️',
  'rocket': '🚀',
  'eyes': '👀',
};

/**
 * Order reactions should appear (most positive first)
 */
const REACTION_ORDER: ReactionContent[] = [
  '+1',
  'heart',
  'hooray',
  'rocket',
  'eyes',
  'laugh',
  'confused',
  '-1',
];

/**
 * Extended reactions interface with viewer state
 */
interface ExtendedReactions extends GitHubReactions {
  viewerReactions?: Partial<Record<ReactionContent, number>>;
}

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
 * ReactionBar component with interactive buttons
 */
interface ReactionBarProps {
  reactions: ExtendedReactions;
  onToggleReaction?: (type: ReactionContent, currentReactionId?: number) => void;
  disabled?: boolean;
}

const ReactionBar: React.FC<ReactionBarProps> = ({ reactions, onToggleReaction, disabled }) => {
  const { theme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const sortedReactions = REACTION_ORDER
    .filter((type) => reactions[type] > 0)
    .map((type) => ({
      type,
      count: reactions[type],
      viewerReacted: !!reactions.viewerReactions?.[type],
      reactionId: reactions.viewerReactions?.[type],
    }));

  const handleReactionClick = (type: ReactionContent, reactionId?: number) => {
    if (disabled || !onToggleReaction) return;
    onToggleReaction(type, reactionId);
  };

  const handlePickerSelect = (type: ReactionContent) => {
    setShowPicker(false);
    if (disabled || !onToggleReaction) return;
    const reactionId = reactions.viewerReactions?.[type];
    onToggleReaction(type, reactionId);
  };

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', position: 'relative' }}>
      {sortedReactions.map(({ type, count, viewerReacted, reactionId }) => (
        <button
          key={type}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleReactionClick(type, reactionId);
          }}
          disabled={disabled}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: viewerReacted ? `${theme.colors.primary}20` : theme.colors.backgroundSecondary,
            border: `1px solid ${viewerReacted ? theme.colors.primary : theme.colors.border}`,
            fontSize: theme.fontSizes[0],
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
          title={viewerReacted ? 'Remove reaction' : 'Add reaction'}
        >
          <span>{REACTION_EMOJI[type]}</span>
          <span style={{ fontFamily: theme.fonts.body, color: viewerReacted ? theme.colors.primary : theme.colors.textSecondary }}>{count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      {onToggleReaction && (
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPicker(!showPicker);
            }}
            disabled={disabled}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '12px',
              backgroundColor: theme.colors.backgroundSecondary,
              border: `1px solid ${theme.colors.border}`,
              fontSize: theme.fontSizes[1],
              color: theme.colors.textMuted,
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
            title="Add reaction"
          >
            +
          </button>

          {/* Emoji picker popover */}
          {showPicker && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                marginBottom: '4px',
                padding: '4px',
                borderRadius: '8px',
                backgroundColor: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                gap: '2px',
                zIndex: 1000,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {REACTION_ORDER.map((type) => {
                const viewerReacted = !!reactions.viewerReactions?.[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePickerSelect(type);
                    }}
                    style={{
                      padding: '4px',
                      borderRadius: '4px',
                      backgroundColor: viewerReacted ? `${theme.colors.primary}20` : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      transition: 'transform 0.2s',
                    }}
                    title={type}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {REACTION_EMOJI[type]}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
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
          <span style={{ fontFamily: theme.fonts.body, color: theme.colors.textSecondary }}>{count}</span>
        </span>
      ))}
    </div>
  );
};

/**
 * Comment event component
 */
const CommentEvent: React.FC<{
  event: GitHubTimelineCommentEvent;
  onToggleReaction?: (itemId: number, itemType: 'comment', reactionType: ReactionContent, currentReactionId?: number) => void;
  getMergedReactions?: (itemId: number, itemType: 'comment', apiReactions?: GitHubReactions) => ExtendedReactions;
}> = ({ event, onToggleReaction, getMergedReactions }) => {
  const { theme } = useTheme();
  const user = event.user || event.actor;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLargeView, setIsLargeView] = useState(true);

  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        setIsLargeView(containerRef.current.offsetWidth >= 400);
      }
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const mergedReactions = getMergedReactions
    ? getMergedReactions(event.id, 'comment', event.reactions)
    : event.reactions as ExtendedReactions;

  return (
    <div
      ref={containerRef}
      style={{
        padding: '16px',
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <Avatar user={user} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1,
            minWidth: 0,
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
              fontFamily: theme.fonts.body,
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
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSizes[0],
                color: theme.colors.textSecondary,
                textTransform: 'uppercase',
              }}
            >
              {event.author_association.toLowerCase()}
            </span>
          )}
        </div>
      </div>
      <div
        style={{
          marginLeft: isLargeView ? '44px' : '0',
        }}
      >
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
        {mergedReactions && (
          <ReactionBar
            reactions={mergedReactions}
            onToggleReaction={onToggleReaction ? (type, reactionId) => onToggleReaction(event.id, 'comment', type, reactionId) : undefined}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Review event component
 */
const ReviewEvent: React.FC<{ event: GitHubTimelineReviewEvent }> = ({ event }) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLargeView, setIsLargeView] = useState(true);

  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        setIsLargeView(containerRef.current.offsetWidth >= 400);
      }
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

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
      ref={containerRef}
      style={{
        padding: '16px',
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: event.body ? '8px' : 0,
        }}
      >
        <Avatar user={event.user} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1,
            minWidth: 0,
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
              fontFamily: theme.fonts.body,
              color: config.color,
              fontWeight: 500,
              fontSize: theme.fontSizes[1],
            }}
          >
            {config.label}
          </span>
          <span
            style={{
              fontFamily: theme.fonts.body,
              color: theme.colors.textMuted,
              fontSize: theme.fontSizes[0],
            }}
          >
            {formatDate(event.submitted_at)}
          </span>
        </div>
      </div>
      {event.body && (
        <div
          style={{
            marginLeft: isLargeView ? '44px' : '0',
          }}
        >
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
        </div>
      )}
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
        backgroundColor: theme.colors.backgroundSecondary,
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
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes[0],
            color: theme.colors.textMuted,
          }}
        >
          {event.author.name} committed {formatDate(event.committer.date)}
          {event.verification?.verified && (
            <span
              style={{
                marginLeft: '8px',
                fontFamily: theme.fonts.body,
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
        fontFamily: theme.fonts.body,
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
      <span style={{ fontFamily: theme.fonts.body, fontWeight: 500, color: theme.colors.text }}>{actor.login}</span>
      {action}
      <span style={{ fontFamily: theme.fonts.body, color: theme.colors.textMuted, marginLeft: 'auto' }}>
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
          <span style={{ fontFamily: theme.fonts.body }}>{isLabeled ? 'added' : 'removed'}</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: `#${event.label.color}`,
              color: parseInt(event.label.color, 16) > 0x7fffff ? '#000' : '#fff',
              fontFamily: theme.fonts.body,
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
          <span style={{ fontFamily: theme.fonts.body }}>{isAssigned ? 'assigned' : 'unassigned'}</span>
          <span style={{ fontFamily: theme.fonts.body, fontWeight: 500, color: theme.colors.text }}>
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
          <span style={{ fontFamily: theme.fonts.body }}>{isRequested ? 'requested review from' : 'removed review request from'}</span>
          <span style={{ fontFamily: theme.fonts.body, fontWeight: 500, color: theme.colors.text }}>{reviewer}</span>
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
          <span style={{ fontFamily: theme.fonts.body, color: theme.colors.success || '#22c55e', fontWeight: 500 }}>
            merged
          </span>
          <span style={{ fontFamily: theme.fonts.body }}>commit</span>
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
            fontFamily: theme.fonts.body,
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
      action={<span style={{ fontFamily: theme.fonts.body }}>{labels[event.event] || event.event}</span>}
      timestamp={event.created_at}
    />
  );
};

/**
 * Inline review comment component
 */
const InlineReviewComment: React.FC<{
  comment: GitHubReviewComment;
  onToggleReaction?: (itemId: number, itemType: 'review_comment', reactionType: ReactionContent, currentReactionId?: number) => void;
  getMergedReactions?: (itemId: number, itemType: 'review_comment', apiReactions?: GitHubReactions) => ExtendedReactions;
}> = ({ comment, onToggleReaction, getMergedReactions }) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLargeView, setIsLargeView] = useState(true);

  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        setIsLargeView(containerRef.current.offsetWidth >= 400);
      }
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const mergedReactions = getMergedReactions
    ? getMergedReactions(comment.id, 'review_comment', comment.reactions)
    : comment.reactions as ExtendedReactions;

  return (
    <div
      ref={containerRef}
      style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.backgroundSecondary,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <Avatar user={comment.user} size={28} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              color: theme.colors.text,
              fontSize: theme.fontSizes[0],
            }}
          >
            {comment.user.login}
          </span>
          <span
            style={{
              fontFamily: theme.fonts.body,
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
            <span style={{ fontFamily: theme.fonts.body, fontSize: theme.fontSizes[0], color: theme.colors.textSecondary }}>
              line {comment.line}
            </span>
          )}
        </div>
      </div>
      <div
        style={{
          marginLeft: isLargeView ? '40px' : '0',
        }}
      >
        <div
          style={{
            backgroundColor: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: comment.diff_hunk ? '8px' : 0,
          }}
        >
          <DocumentView
            content={comment.body}
            theme={theme}
            maxWidth="100%"
            transparentBackground
          />
        </div>
        {comment.diff_hunk && (
          <pre
            style={{
              margin: 0,
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
        {mergedReactions && (
          <ReactionBar
            reactions={mergedReactions}
            onToggleReaction={onToggleReaction ? (type, reactionId) => onToggleReaction(comment.id, 'review_comment', type, reactionId) : undefined}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Render a timeline event
 */
const TimelineEventRenderer: React.FC<{
  event: GitHubTimelineEvent;
  onToggleReaction?: (itemId: number, itemType: 'comment' | 'review' | 'review_comment', reactionType: ReactionContent, currentReactionId?: number) => void;
  getMergedReactions?: (itemId: number, itemType: 'comment' | 'review' | 'review_comment', apiReactions?: GitHubReactions) => ExtendedReactions;
}> = ({ event, onToggleReaction, getMergedReactions }) => {
  switch (event.event) {
    case 'commented':
      return (
        <CommentEvent
          event={event as GitHubTimelineCommentEvent}
          onToggleReaction={onToggleReaction}
          getMergedReactions={getMergedReactions}
        />
      );
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

  // Panel container ref for focus management
  const panelRef = useRef<HTMLDivElement>(null);

  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Local state for reactions (optimistic updates)
  const [localReactions, setLocalReactions] = useState<Record<string, ExtendedReactions>>({});

  // Hidden messages state (persisted in localStorage)
  const [hiddenMessages, setHiddenMessages] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('github-messages-hidden');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });

  // Toggle to show/hide reacted messages
  const [showHiddenMessages, setShowHiddenMessages] = useState(false);

  // Comment input state
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle delete action
  const handleDelete = () => {
    const messagesSlice = context.getSlice<GitHubMessagesSliceData>('github-messages');
    const messagesData = messagesSlice?.data;

    if (messagesData?.target && events) {
      const { target, owner, repo } = messagesData;

      // Emit delete event
      (events as PanelEventEmitter).emit({
        type: target.type === 'pull_request' ? 'github-pr:delete' : 'github-issue:delete',
        source: 'github-messages-panel',
        timestamp: Date.now(),
        payload: {
          owner,
          repo,
          number: target.number,
        },
      });
    }

    setShowDeleteConfirm(false);
  };

  // Toggle reaction (optimistic update + event emission)
  const handleToggleReaction = useCallback((
    itemId: string | number,
    itemType: 'comment' | 'review' | 'review_comment',
    reactionType: ReactionContent,
    currentReactionId?: number
  ) => {
    const messagesSlice = context.getSlice<GitHubMessagesSliceData>('github-messages');
    const messagesData = messagesSlice?.data;

    if (!messagesData?.target || !events) return;

    const { owner, repo, target } = messagesData;
    const key = `${itemType}-${itemId}`;

    // Optimistic update to local state
    setLocalReactions((prev) => {
      const current: ExtendedReactions = prev[key] || {
        url: '',
        total_count: 0,
        '+1': 0,
        '-1': 0,
        laugh: 0,
        hooray: 0,
        confused: 0,
        heart: 0,
        rocket: 0,
        eyes: 0,
        viewerReactions: {},
      };

      const updated: ExtendedReactions = { ...current };
      const viewerReactions: Partial<Record<ReactionContent, number>> = { ...updated.viewerReactions };

      if (currentReactionId) {
        // Remove reaction
        updated[reactionType] = Math.max(0, (updated[reactionType] || 0) - 1);
        updated.total_count = Math.max(0, updated.total_count - 1);
        delete viewerReactions[reactionType];
      } else {
        // Add reaction
        updated[reactionType] = (updated[reactionType] || 0) + 1;
        updated.total_count = (updated.total_count || 0) + 1;
        viewerReactions[reactionType] = -1; // Temporary ID
      }

      updated.viewerReactions = viewerReactions;

      return { ...prev, [key]: updated };
    });

    // Emit event to notify host
    if (currentReactionId) {
      (events as PanelEventEmitter).emit({
        type: 'github-messages:reaction:remove',
        source: 'github-messages-panel',
        timestamp: Date.now(),
        payload: {
          owner,
          repo,
          targetType: target.type,
          targetNumber: target.number,
          itemType,
          itemId,
          reactionId: currentReactionId,
        },
      });
    } else {
      (events as PanelEventEmitter).emit({
        type: 'github-messages:reaction:add',
        source: 'github-messages-panel',
        timestamp: Date.now(),
        payload: {
          owner,
          repo,
          targetType: target.type,
          targetNumber: target.number,
          itemType,
          itemId,
          reactionType,
        },
      });

      // Auto-hide message after reacting (optional - can be configured)
      setHiddenMessages((prev) => {
        const next = new Set(prev);
        next.add(key);
        if (typeof window !== 'undefined') {
          localStorage.setItem('github-messages-hidden', JSON.stringify([...next]));
        }
        return next;
      });
    }
  }, [context, events]);

  // Handle sending comment
  const handleSendComment = useCallback(() => {
    const messagesSlice = context.getSlice<GitHubMessagesSliceData>('github-messages');
    const messagesData = messagesSlice?.data;

    if (!events || !messagesData?.target || !commentText.trim() || isSending) return;

    const { owner, repo, target } = messagesData;

    setIsSending(true);
    setSendError(null);

    (events as PanelEventEmitter).emit({
      type: 'github-messages:comment:create',
      source: 'github-messages-panel',
      timestamp: Date.now(),
      payload: {
        owner,
        repo,
        targetType: target.type,
        targetNumber: target.number,
        body: commentText.trim(),
      },
    });

    setCommentText('');
  }, [context, events, commentText, isSending]);

  // Helper to merge API reactions with local optimistic updates
  const getMergedReactions = useCallback((
    itemId: string | number,
    itemType: 'comment' | 'review' | 'review_comment',
    apiReactions?: GitHubReactions
  ): ExtendedReactions => {
    const key = `${itemType}-${itemId}`;
    const local = localReactions[key];

    if (!apiReactions && !local) {
      return {
        url: '',
        total_count: 0,
        '+1': 0,
        '-1': 0,
        laugh: 0,
        hooray: 0,
        confused: 0,
        heart: 0,
        rocket: 0,
        eyes: 0,
        viewerReactions: {},
      };
    }

    // Merge local optimistic updates with API data
    if (local) {
      return local;
    }

    return {
      ...apiReactions!,
      viewerReactions: {},
    };
  }, [localReactions]);

  // Helper to merge timeline events and review comments, sorted by timestamp
  const getMergedTimeline = useCallback((
    timeline: GitHubTimelineEvent[],
    reviewComments: GitHubReviewComment[]
  ): Array<{ type: 'event' | 'review_comment'; data: GitHubTimelineEvent | GitHubReviewComment }> => {
    const merged = [
      ...timeline.map(event => ({ type: 'event' as const, data: event })),
      ...reviewComments.map(comment => ({ type: 'review_comment' as const, data: comment })),
    ];

    // Sort by timestamp
    merged.sort((a, b) => {
      const timeA = a.type === 'event' ? getEventTimestamp(a.data as GitHubTimelineEvent) : (a.data as GitHubReviewComment).created_at;
      const timeB = b.type === 'event' ? getEventTimestamp(b.data as GitHubTimelineEvent) : (b.data as GitHubReviewComment).created_at;
      return new Date(timeA).getTime() - new Date(timeB).getTime();
    });

    return merged;
  }, []);

  // Listen for panel focus events
  usePanelFocusListener(
    'github-messages',
    events,
    () => panelRef.current?.focus()
  );

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

  // Auto-grow textarea as content changes
  useEffect(() => {
    if (textareaRef.current) {
      const minHeight = 36; // Single line height
      const maxHeight = 200;

      // If empty, always reset to minimum
      if (!commentText) {
        textareaRef.current.style.height = `${minHeight}px`;
        return;
      }

      textareaRef.current.style.height = `${minHeight}px`;
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [commentText]);

  // Listen for comment creation success/error events
  useEffect(() => {
    if (!events) return;

    const messagesSlice = context.getSlice<GitHubMessagesSliceData>('github-messages');
    const messagesData = messagesSlice?.data;

    const unsubscribers = [
      (events as PanelEventEmitter).on('github-messages:comment:created', (event) => {
        const payload = event.payload as { targetNumber: number };
        if (messagesData?.target && payload.targetNumber === messagesData.target.number) {
          setIsSending(false);
          setSendError(null);
        }
      }),
      (events as PanelEventEmitter).on('github-messages:comment:error', (event) => {
        const payload = event.payload as { targetNumber: number; error: string };
        if (messagesData?.target && payload.targetNumber === messagesData.target.number) {
          setIsSending(false);
          setSendError(payload.error);
        }
      }),
    ];

    return () => {
      unsubscribers.forEach((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, [events, context]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
    outline: 'none',
  };

  // Loading state
  if (isLoading && !hasData) {
    return (
      <div ref={panelRef} tabIndex={-1} style={containerStyle}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: theme.fonts.body,
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
      <div ref={panelRef} tabIndex={-1} style={containerStyle}>
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
      <div ref={panelRef} tabIndex={-1} style={containerStyle}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: theme.fonts.body,
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

  return (
    <div ref={panelRef} tabIndex={-1} style={containerStyle}>
      {/* Header */}
      <div
        style={{
          minHeight: '40px',
          padding: '8px 12px',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.backgroundSecondary,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxSizing: 'border-box',
          flexWrap: 'wrap',
        }}
      >
        {/* Labels */}
        {target.labels && target.labels.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSizes[0],
                color: theme.colors.textMuted,
                fontWeight: 500,
              }}
            >
              Tagged as
            </span>
            {target.labels.map((label) => (
              <span
                key={label.id}
                style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: `#${label.color}`,
                  color: parseInt(label.color, 16) > 0x7fffff ? '#000' : '#fff',
                  fontFamily: theme.fonts.body,
                  fontSize: theme.fontSizes[0],
                  fontWeight: 500,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Assignees */}
        {target.assignees && target.assignees.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSizes[0],
                color: theme.colors.textMuted,
                fontWeight: 500,
              }}
            >
              Assigned to
            </span>
            {target.assignees.map((assignee) => (
              <div
                key={assignee.login}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: theme.colors.backgroundSecondary,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <img
                  src={assignee.avatar_url}
                  alt={assignee.login}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                  }}
                />
                <span
                  style={{
                    fontFamily: theme.fonts.body,
                    fontSize: theme.fontSizes[0],
                    color: theme.colors.text,
                    fontWeight: 500,
                  }}
                >
                  {assignee.login}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Toggle hidden messages button */}
        {hiddenMessages.size > 0 && (
          <button
            type="button"
            onClick={() => setShowHiddenMessages(!showHiddenMessages)}
            title={showHiddenMessages ? 'Hide reacted messages' : `Show ${hiddenMessages.size} hidden message${hiddenMessages.size > 1 ? 's' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              height: '28px',
              padding: '0 8px',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '6px',
              backgroundColor: showHiddenMessages ? `${theme.colors.primary}20` : theme.colors.background,
              color: showHiddenMessages ? theme.colors.primary : theme.colors.textSecondary,
              cursor: 'pointer',
              fontSize: theme.fontSizes[0],
              fontFamily: theme.fonts.body,
            }}
          >
            <EyeOff size={14} />
            <span>{hiddenMessages.size}</span>
          </button>
        )}

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
            {getMergedTimeline(timeline, reviewComments)
              .filter((item) => {
                if (item.type === 'event') {
                  const event = item.data as GitHubTimelineEvent;

                  // Filter hidden reacted messages
                  if (!showHiddenMessages && event.event === 'commented') {
                    const key = `comment-${(event as GitHubTimelineCommentEvent).id}`;
                    if (hiddenMessages.has(key)) return false;
                  }

                  // Always hide label events (current state shown in header)
                  if (event.event === 'labeled' || event.event === 'unlabeled') {
                    return false;
                  }

                  // Always hide assignment events (current state shown in header)
                  if (event.event === 'assigned' || event.event === 'unassigned') {
                    return false;
                  }

                  return true;
                } else {
                  // Filter hidden review comments
                  const comment = item.data as GitHubReviewComment;
                  if (!showHiddenMessages) {
                    const key = `review_comment-${comment.id}`;
                    if (hiddenMessages.has(key)) return false;
                  }
                  return true;
                }
              })
              .map((item, index) => {
                if (item.type === 'event') {
                  const event = item.data as GitHubTimelineEvent;
                  return (
                    <TimelineEventRenderer
                      key={`event-${event.event}-${index}`}
                      event={event}
                      onToggleReaction={handleToggleReaction}
                      getMergedReactions={getMergedReactions}
                    />
                  );
                } else {
                  const comment = item.data as GitHubReviewComment;
                  return (
                    <InlineReviewComment
                      key={`review-comment-${comment.id}`}
                      comment={comment}
                      onToggleReaction={handleToggleReaction}
                      getMergedReactions={getMergedReactions}
                    />
                  );
                }
              })}
          </>
        )}
      </div>

      {/* Comment Input Area */}
      <div
        style={{
          borderTop: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.background,
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Error message */}
        {sendError && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: theme.colors.error ? `${theme.colors.error}20` : '#ef444420',
              border: `1px solid ${theme.colors.error || '#ef4444'}`,
              borderRadius: '6px',
              color: theme.colors.error || '#ef4444',
              fontSize: theme.fontSizes[0],
              fontFamily: theme.fonts.body,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={14} />
            <span>{sendError}</span>
            <button
              type="button"
              onClick={() => setSendError(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input container */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end',
          }}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              // Cmd/Ctrl + Enter to send
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSendComment();
              }
            }}
            placeholder="Write a comment"
            disabled={isSending}
            aria-label="Write a comment"
            style={{
              flex: 1,
              height: '36px',
              maxHeight: '200px',
              padding: '8px 12px',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '6px',
              backgroundColor: isSending ? theme.colors.backgroundSecondary : theme.colors.background,
              color: theme.colors.text,
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes[1],
              lineHeight: 1.5,
              resize: 'none',
              outline: 'none',
              transition: 'border-color 0.2s',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.colors.border;
            }}
          />

          {/* Send button */}
          <button
            type="button"
            onClick={handleSendComment}
            disabled={!commentText.trim() || isSending}
            aria-label="Send comment"
            title={isSending ? 'Sending...' : 'Send comment (Cmd/Ctrl+Enter)'}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: (!commentText.trim() || isSending)
                ? theme.colors.backgroundSecondary
                : theme.colors.primary,
              color: (!commentText.trim() || isSending)
                ? theme.colors.textMuted
                : (theme.colors.textOnPrimary || '#ffffff'),
              cursor: (!commentText.trim() || isSending) ? 'not-allowed' : 'pointer',
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes[1],
              fontWeight: theme.fontWeights?.medium || 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s',
              opacity: (!commentText.trim() || isSending) ? 0.5 : 1,
            }}
          >
            {isSending ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Sending...
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              backgroundColor: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              padding: '24px',
              minWidth: '320px',
              maxWidth: '400px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.error ? `${theme.colors.error}20` : '#ef444420',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.colors.error || '#ef4444',
                }}
              >
                <Trash2 size={20} />
              </div>
              <h3
                style={{
                  margin: 0,
                  fontFamily: theme.fonts.heading,
                  fontSize: theme.fontSizes[2],
                  fontWeight: 600,
                  color: theme.colors.text,
                }}
              >
                Delete {target.type === 'pull_request' ? 'Pull Request' : 'Issue'}?
              </h3>
            </div>
            <p
              style={{
                margin: '0 0 24px 0',
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSizes[1],
                color: theme.colors.textSecondary,
                lineHeight: 1.5,
              }}
            >
              Are you sure you want to delete "{target.title}"? This action cannot be undone.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '8px 16px',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '6px',
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.body,
                  fontSize: theme.fontSizes[1],
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: theme.colors.error || '#ef4444',
                  color: '#ffffff',
                  fontFamily: theme.fonts.body,
                  fontSize: theme.fontSizes[1],
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
