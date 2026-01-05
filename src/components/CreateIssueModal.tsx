import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { X, Plus, Loader2, AlertCircle } from 'lucide-react';

export interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: string;
  repo: string;
  onIssueCreated: () => void;
  apiBaseUrl: string;
}

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  isOpen,
  onClose,
  owner,
  repo,
  onIssueCreated,
  apiBaseUrl,
}) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus title field when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/github/repo/${owner}/${repo}/issues`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important: Send cookies for auth
          body: JSON.stringify({
            title: title.trim(),
            body: body.trim() || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error codes
        if (response.status === 401) {
          throw new Error('Authentication required to create issues');
        } else if (response.status === 403) {
          throw new Error("You don't have permission to create issues in this repository");
        } else {
          throw new Error(errorData.error || `Failed to create issue: ${response.status}`);
        }
      }

      // Success: clear form and trigger refresh
      setTitle('');
      setBody('');
      setError(null);
      onIssueCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${theme.colors.background}cc`,
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          width: '100%',
          margin: '0 16px',
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Plus size={20} style={{ color: theme.colors.primary }} />
            <h2
              style={{
                margin: 0,
                fontSize: `${theme.fontSizes[3]}px`,
                fontWeight: theme.fontWeights.semibold,
                color: theme.colors.text,
              }}
            >
              Create Issue
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: theme.colors.secondary,
              color: theme.colors.text,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.5 : 1,
              transition: 'opacity 0.15s ease',
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px' }}>
            {/* Repository info */}
            <p
              style={{
                margin: '0 0 16px 0',
                fontSize: `${theme.fontSizes[1]}px`,
                color: theme.colors.textSecondary,
              }}
            >
              Creating issue for{' '}
              <span style={{ color: theme.colors.text, fontWeight: theme.fontWeights.medium }}>
                {owner}/{repo}
              </span>
            </p>

            {/* Error display */}
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '12px',
                  marginBottom: '16px',
                  backgroundColor: `${theme.colors.error}20`,
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.error}40`,
                }}
              >
                <AlertCircle
                  size={16}
                  style={{
                    color: theme.colors.error,
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                />
                <span
                  style={{
                    color: theme.colors.error,
                    fontSize: `${theme.fontSizes[1]}px`,
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </span>
              </div>
            )}

            {/* Title field */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="issue-title"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: `${theme.fontSizes[1]}px`,
                  fontWeight: theme.fontWeights.medium,
                  color: theme.colors.text,
                }}
              >
                Title <span style={{ color: theme.colors.error }}>*</span>
              </label>
              <input
                ref={titleInputRef}
                id="issue-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Issue title..."
                disabled={isSubmitting}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: `${theme.fontSizes[2]}px`,
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  opacity: isSubmitting ? 0.5 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'text',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.border;
                }}
              />
            </div>

            {/* Body field */}
            <div>
              <label
                htmlFor="issue-body"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: `${theme.fontSizes[1]}px`,
                  fontWeight: theme.fontWeights.medium,
                  color: theme.colors.text,
                }}
              >
                Description{' '}
                <span style={{ color: theme.colors.textSecondary, fontWeight: 'normal' }}>
                  (optional)
                </span>
              </label>
              <textarea
                id="issue-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Describe the issue..."
                disabled={isSubmitting}
                rows={5}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: `${theme.fontSizes[2]}px`,
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  resize: 'vertical',
                  opacity: isSubmitting ? 0.5 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'text',
                  fontFamily: theme.fonts.body,
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.border;
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px 24px',
              borderTop: `1px solid ${theme.colors.border}`,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '10px 18px',
                fontSize: `${theme.fontSizes[2]}px`,
                fontWeight: theme.fontWeights.medium,
                color: theme.colors.text,
                backgroundColor: 'transparent',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '6px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = theme.colors.backgroundLight;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                fontSize: `${theme.fontSizes[2]}px`,
                fontWeight: theme.fontWeights.semibold,
                color: theme.colors.textOnPrimary || theme.colors.background,
                backgroundColor: theme.colors.primary,
                border: 'none',
                borderRadius: '6px',
                cursor: isSubmitting || !title.trim() ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || !title.trim() ? 0.5 : 1,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && title.trim()) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && title.trim()) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create Issue
                </>
              )}
            </button>
          </div>
        </form>
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
    </div>
  );
};
