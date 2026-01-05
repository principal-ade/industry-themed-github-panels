import React, { useState, useEffect, useRef } from 'react';
import {
  Github,
  MessageSquare,
  X,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import { DocumentView } from 'themed-markdown';
import type { PanelComponentProps, PanelEventEmitter } from '../types';
import type { GitHubIssue, IssueSelectedEventPayload } from '../types/github';

/** Task creation status for an issue */
type TaskCreationStatus = 'idle' | 'loading' | 'success' | 'error';

interface TaskCreationState {
  status: TaskCreationStatus;
  taskId?: string;
  error?: string;
}

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
  const [taskCreation, setTaskCreation] = useState<TaskCreationState>({ status: 'idle' });
  const [showTaskTypeModal, setShowTaskTypeModal] = useState(false);
  const [modalStep, setModalStep] = useState<'type' | 'instructions'>('type');
  const [selectedTaskType, setSelectedTaskType] = useState<'investigate' | 'fix' | null>(null);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Listen for panel focus events
  usePanelFocusListener(
    'github-issue-detail',
    events,
    () => panelRef.current?.focus()
  );

  // Handle "Create Task from Issue" button click - opens modal
  const handleCreateTask = () => {
    setShowTaskTypeModal(true);
    setModalStep('type');
    setSelectedTaskType(null);
    setAdditionalInstructions('');
  };

  // Handle task type selection - move to instructions step
  const handleSelectTaskType = (taskType: 'investigate' | 'fix') => {
    setSelectedTaskType(taskType);
    setModalStep('instructions');
  };

  // Handle final task creation with instructions
  const handleSubmitTask = () => {
    if (!events || !selectedIssue || !selectedTaskType) return;

    setShowTaskTypeModal(false);
    setTaskCreation({ status: 'loading' });

    // Emit event for host to handle
    (events as PanelEventEmitter).emit({
      type: 'issue:create-task',
      source: 'github-issue-detail-panel',
      timestamp: Date.now(),
      payload: {
        issue: selectedIssue,
        owner,
        repo,
        taskType: selectedTaskType,
        additionalInstructions: additionalInstructions.trim() || undefined,
      },
    });

    // Reset modal state
    setModalStep('type');
    setSelectedTaskType(null);
    setAdditionalInstructions('');
  };

  // Handle going back to task type selection
  const handleBackToTaskType = () => {
    setModalStep('type');
    setSelectedTaskType(null);
    setAdditionalInstructions('');
  };

  // Listen for issue:selected and issue:deselected events
  useEffect(() => {
    if (!events) return;

    const handleIssueSelected = (event: { payload: IssueSelectedEventPayload }) => {
      setSelectedIssue(event.payload.issue);
      setOwner(event.payload.owner);
      setRepo(event.payload.repo);
      // Reset task creation state when a new issue is selected
      setTaskCreation({ status: 'idle' });
    };

    const handleIssueDeselected = () => {
      // Clear the issue detail panel state
      setSelectedIssue(null);
      setOwner('');
      setRepo('');
      setTaskCreation({ status: 'idle' });
    };

    // Subscribe to events
    const unsubscribeSelected = (events as PanelEventEmitter).on('issue:selected', handleIssueSelected);
    const unsubscribeDeselected = (events as PanelEventEmitter).on('issue:deselected', handleIssueDeselected);

    return () => {
      if (typeof unsubscribeSelected === 'function') unsubscribeSelected();
      if (typeof unsubscribeDeselected === 'function') unsubscribeDeselected();
    };
  }, [events]);

  // Listen for task creation success/failure events
  useEffect(() => {
    if (!events) return;

    const unsubscribers = [
      (events as PanelEventEmitter).on('issue:task-created', (event) => {
        const payload = event.payload as { issueNumber: number; taskId: string };
        if (selectedIssue && payload.issueNumber === selectedIssue.number) {
          setTaskCreation({
            status: 'success',
            taskId: payload.taskId,
          });
        }
      }),
      (events as PanelEventEmitter).on('issue:create-task:error', (event) => {
        const payload = event.payload as { issueNumber: number; error: string };
        if (selectedIssue && payload.issueNumber === selectedIssue.number) {
          setTaskCreation({
            status: 'error',
            error: payload.error,
          });
        }
      }),
    ];

    return () => {
      unsubscribers.forEach((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, [events, selectedIssue]);

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

  // Handle delete action
  const handleDelete = () => {
    if (selectedIssue && events) {
      // Emit delete event
      (events as PanelEventEmitter).emit({
        type: 'github-issue:delete',
        source: 'github-issue-detail-panel',
        timestamp: Date.now(),
        payload: {
          owner,
          repo,
          number: selectedIssue.number,
        },
      });
    }

    setShowDeleteConfirm(false);
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
      <div ref={panelRef} tabIndex={-1} style={{ ...containerStyle, outline: 'none' }}>
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

  // Check if this issue already has a task created (by checking for 'backlog-task:*' labels)
  const taskLabel = selectedIssue.labels?.find(label =>
    label.name === 'backlog-task:investigate' || label.name === 'backlog-task:fix'
  );
  const hasTask = !!taskLabel;
  const taskType = taskLabel?.name.split(':')[1] as 'investigate' | 'fix' | undefined;

  return (
    <div ref={panelRef} tabIndex={-1} style={{ ...containerStyle, outline: 'none' }}>
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

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Delete button */}
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          title="Delete issue"
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
          <Trash2 size={14} />
        </button>

        {/* GitHub link button */}
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
          <Github size={16} />
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

      {/* Assignees section - only shown if there are assignees */}
      {selectedIssue.assignees && selectedIssue.assignees.length > 0 && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: theme.colors.backgroundSecondary,
            borderBottom: `1px solid ${theme.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes[1],
              fontFamily: theme.fonts.body,
              fontWeight: theme.fontWeights.medium,
            }}
          >
            Assigned to:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {selectedIssue.assignees.map((assignee) => (
              <div
                key={assignee.login}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: theme.colors.background,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '16px',
                }}
              >
                {assignee.avatar_url && (
                  <img
                    src={assignee.avatar_url}
                    alt={assignee.login}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                    }}
                  />
                )}
                <span
                  style={{
                    color: theme.colors.text,
                    fontSize: theme.fontSizes[1],
                    fontFamily: theme.fonts.body,
                    fontWeight: theme.fontWeights.medium,
                  }}
                >
                  {assignee.login}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions section - buttons split width equally */}
      <div
        style={{
          display: 'flex',
          gap: '1px',
          backgroundColor: theme.colors.border,
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        {/* Create Task / View Task / Status button */}
        <div style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {taskCreation.status === 'idle' && !hasTask && (
            <button
              onClick={handleCreateTask}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: theme.colors.primary,
                fontSize: theme.fontSizes[1],
                fontWeight: theme.fontWeights.medium,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundSecondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <FileText size={16} />
              <span style={{ lineHeight: 1 }}>Create Task</span>
            </button>
          )}

          {taskCreation.status === 'idle' && hasTask && (
            <button
              onClick={() => {
                // Emit event to view the task in kanban board
                if (events) {
                  (events as PanelEventEmitter).emit({
                    type: 'task:view',
                    source: 'github-issue-detail-panel',
                    timestamp: Date.now(),
                    payload: {
                      issue: selectedIssue,
                      owner,
                      repo,
                    },
                  });
                }
              }}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: theme.colors.success,
                fontSize: theme.fontSizes[1],
                fontWeight: theme.fontWeights.medium,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundSecondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <CheckCircle size={16} />
              <span style={{ lineHeight: 1 }}>Task Started</span>
            </button>
          )}

          {taskCreation.status === 'loading' && (
            <button
              disabled
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'default',
                color: theme.colors.textSecondary,
                fontSize: theme.fontSizes[1],
              }}
            >
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ lineHeight: 1 }}>Creating Task...</span>
            </button>
          )}

          {taskCreation.status === 'success' && (
            <button
              disabled
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'default',
                color: theme.colors.success,
                fontSize: theme.fontSizes[1],
                fontWeight: theme.fontWeights.medium,
              }}
            >
              <CheckCircle size={16} />
              <span style={{ lineHeight: 1 }}>Task Created</span>
            </button>
          )}

          {taskCreation.status === 'error' && (
            <button
              onClick={() => setTaskCreation({ status: 'idle' })}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: theme.colors.error,
                fontSize: theme.fontSizes[1],
                fontWeight: theme.fontWeights.medium,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundSecondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title={taskCreation.error}
            >
              <AlertCircle size={16} />
              <span style={{ lineHeight: 1 }}>Retry Task Creation</span>
            </button>
          )}
        </div>

        {/* View Discussion button */}
        <div style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <button
            onClick={() => {
              // Emit event to view discussion/messages
              if (events) {
                (events as PanelEventEmitter).emit({
                  type: 'issue:view-discussion',
                  source: 'github-issue-detail-panel',
                  timestamp: Date.now(),
                  payload: {
                    issue: selectedIssue,
                    owner,
                    repo,
                  },
                });
              }
            }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: theme.colors.text,
              fontSize: theme.fontSizes[1],
              fontWeight: theme.fontWeights.medium,
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.backgroundSecondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <MessageSquare size={16} />
            <span style={{ lineHeight: 1 }}>View Discussion</span>
            {selectedIssue.comments > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '20px',
                  padding: '2px 6px',
                  backgroundColor: theme.colors.backgroundSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '10px',
                  fontSize: theme.fontSizes[0],
                  fontWeight: theme.fontWeights.semibold,
                  color: theme.colors.textSecondary,
                  lineHeight: 1,
                }}
              >
                {selectedIssue.comments}
              </span>
            )}
          </button>
        </div>
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

      {/* Task Creation Modal (Two Steps) */}
      {showTaskTypeModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={() => setShowTaskTypeModal(false)}
        >
          <div
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Step 1: Choose Task Type */}
            {modalStep === 'type' && (
              <>
                {/* Modal Header */}
                <div style={{ marginBottom: '20px' }}>
                  <h2
                    style={{
                      margin: 0,
                      marginBottom: '8px',
                      fontFamily: theme.fonts.heading,
                      fontSize: theme.fontSizes[3],
                      fontWeight: 600,
                      color: theme.colors.text,
                    }}
                  >
                    Choose Task Type
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: theme.fonts.body,
                      fontSize: theme.fontSizes[1],
                      color: theme.colors.textSecondary,
                      lineHeight: 1.5,
                    }}
                  >
                    What type of task do you want to create for this issue?
                  </p>
                </div>

                {/* Task Type Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Investigate Option */}
                  <button
                    onClick={() => handleSelectTaskType('investigate')}
                    style={{
                      padding: '16px',
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      backgroundColor: theme.colors.background,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.primary;
                      e.currentTarget.style.backgroundColor = theme.colors.backgroundSecondary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.border;
                      e.currentTarget.style.backgroundColor = theme.colors.background;
                    }}
                  >
                    <div
                      style={{
                        fontFamily: theme.fonts.heading,
                        fontSize: theme.fontSizes[2],
                        fontWeight: 600,
                        color: theme.colors.text,
                        marginBottom: '4px',
                      }}
                    >
                      🔍 Investigate Issue
                    </div>
                    <div
                      style={{
                        fontFamily: theme.fonts.body,
                        fontSize: theme.fontSizes[1],
                        color: theme.colors.textSecondary,
                        lineHeight: 1.4,
                      }}
                    >
                      Research and identify the root cause of the problem
                    </div>
                  </button>

                  {/* Fix Option */}
                  <button
                    onClick={() => handleSelectTaskType('fix')}
                    style={{
                      padding: '16px',
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      backgroundColor: theme.colors.background,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.primary;
                      e.currentTarget.style.backgroundColor = theme.colors.backgroundSecondary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.border;
                      e.currentTarget.style.backgroundColor = theme.colors.background;
                    }}
                  >
                    <div
                      style={{
                        fontFamily: theme.fonts.heading,
                        fontSize: theme.fontSizes[2],
                        fontWeight: 600,
                        color: theme.colors.text,
                        marginBottom: '4px',
                      }}
                    >
                      🔧 Fix Issue
                    </div>
                    <div
                      style={{
                        fontFamily: theme.fonts.body,
                        fontSize: theme.fontSizes[1],
                        color: theme.colors.textSecondary,
                        lineHeight: 1.4,
                      }}
                    >
                      Implement a solution to resolve the issue
                    </div>
                  </button>
                </div>

                {/* Cancel Button */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <button
                    onClick={() => setShowTaskTypeModal(false)}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: theme.colors.textSecondary,
                      fontSize: theme.fontSizes[1],
                      fontFamily: theme.fonts.body,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Additional Instructions */}
            {modalStep === 'instructions' && (
              <>
                {/* Modal Header */}
                <div style={{ marginBottom: '20px' }}>
                  <h2
                    style={{
                      margin: 0,
                      marginBottom: '8px',
                      fontFamily: theme.fonts.heading,
                      fontSize: theme.fontSizes[3],
                      fontWeight: 600,
                      color: theme.colors.text,
                    }}
                  >
                    Additional Instructions
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: theme.fonts.body,
                      fontSize: theme.fontSizes[1],
                      color: theme.colors.textSecondary,
                      lineHeight: 1.5,
                    }}
                  >
                    Add any specific instructions or context for this task (optional)
                  </p>
                </div>

                {/* Textarea */}
                <textarea
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g., Focus on the authentication flow, check error handling in useWebSocket hook, etc."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '6px',
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    fontFamily: theme.fonts.body,
                    fontSize: theme.fontSizes[1],
                    lineHeight: 1.5,
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Action Buttons */}
                <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleBackToTaskType}
                    style={{
                      padding: '8px 16px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '6px',
                      background: theme.colors.background,
                      cursor: 'pointer',
                      color: theme.colors.text,
                      fontSize: theme.fontSizes[1],
                      fontFamily: theme.fonts.body,
                      fontWeight: theme.fontWeights.medium,
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitTask}
                    style={{
                      padding: '8px 24px',
                      border: 'none',
                      borderRadius: '6px',
                      background: theme.colors.primary,
                      cursor: 'pointer',
                      color: theme.colors.textOnPrimary || '#ffffff',
                      fontSize: theme.fontSizes[1],
                      fontFamily: theme.fonts.body,
                      fontWeight: theme.fontWeights.medium,
                    }}
                  >
                    Create Task
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && selectedIssue && (
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
                Delete Issue?
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
              Are you sure you want to delete "{selectedIssue.title}"? This action cannot be undone.
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
