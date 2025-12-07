import React, { useState, useCallback } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { Logo } from '@principal-ai/logo-component';
import {
  BookOpen,
  Network,
  ArrowRight,
  Github,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

import type { PanelComponentProps } from '../types';

/**
 * Highlighted project for the quick start section
 */
export interface HighlightedProject {
  owner: string;
  repo: string;
  label?: string; // Optional display label, defaults to "owner/repo"
}

/**
 * Props for the WelcomePanel
 */
export interface WelcomePanelProps extends PanelComponentProps {
  onNavigate?: (owner: string, repo: string) => void;
  highlightedProjects?: HighlightedProject[];
}

/**
 * Parse a GitHub URL or owner/repo string
 */
function parseGitHubInput(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();

  // Try full URL: https://github.com/owner/repo
  const urlMatch = trimmed.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, '') };
  }

  // Try owner/repo format
  const shortMatch = trimmed.match(/^([^/]+)\/([^/]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] };
  }

  return null;
}

/**
 * Feature card component
 */
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  theme: ReturnType<typeof useTheme>['theme'];
  link?: string;
  linkLabel?: string;
}> = ({ icon, title, description, theme, link, linkLabel }) => {
  // Split title to stack words vertically - first word in text color, rest in primary
  const words = title.split(' ');
  const firstWord = words[0];
  const restWords = words.slice(1).join(' ');

  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '12px',
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        flex: 1,
        minWidth: '200px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '10px',
          backgroundColor: `${theme.colors.primary}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.colors.primary,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          margin: 0,
          fontSize: `${theme.fontSizes[3]}px`,
          fontWeight: theme.fontWeights.semibold,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: 1.3,
        }}
      >
        <span style={{ color: theme.colors.text }}>{firstWord}</span>
        {restWords && (
          <span style={{ color: theme.colors.primary }}>{restWords}</span>
        )}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: `${theme.fontSizes[2]}px`,
          color: theme.colors.textSecondary,
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '4px',
            fontSize: `${theme.fontSizes[1]}px`,
            color: theme.colors.primary,
            textDecoration: 'none',
          }}
        >
          {linkLabel || 'Learn more'}
          <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
};

// Default highlighted projects
const defaultHighlightedProjects: HighlightedProject[] = [
  { owner: 'facebook', repo: 'react' },
  { owner: 'vercel', repo: 'next.js' },
];

/**
 * WelcomePanel - A landing panel with branding and repo search
 *
 * Features:
 * - Brand introduction with tagline
 * - Search input for owner/repo or GitHub URLs
 * - Feature highlights (documentation, diagrams, chat)
 * - Configurable quick start links to repos
 */
export const WelcomePanel: React.FC<WelcomePanelProps> = ({
  onNavigate,
  highlightedProjects = defaultHighlightedProjects,
}) => {
  const { theme } = useTheme();
  const [repoInput, setRepoInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parseGitHubInput(repoInput);
    if (!parsed) {
      setError('Enter a valid format: owner/repo or GitHub URL');
      return;
    }

    if (onNavigate) {
      onNavigate(parsed.owner, parsed.repo);
    } else {
      // Default: navigate via window.location
      window.location.href = `/${parsed.owner}/${parsed.repo}`;
    }
  }, [repoInput, onNavigate]);

  const handleProjectClick = useCallback((project: HighlightedProject) => {
    if (onNavigate) {
      onNavigate(project.owner, project.repo);
    } else {
      window.location.href = `/${project.owner}/${project.repo}`;
    }
  }, [onNavigate]);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
        overflowY: 'auto',
      }}
    >
      {/* Hero Section */}
      <div
        style={{
          padding: '48px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <Logo
            width={56}
            height={56}
            color={theme.colors.primary}
          />
          <span
            style={{
              fontSize: `${theme.fontSizes[6] || 32}px`,
              fontWeight: theme.fontWeights.bold,
            }}
          >
            <span style={{ color: theme.colors.text }}>Principal</span>
            {' '}
            <span style={{ color: theme.colors.primary }}>AI</span>
          </span>
          <Logo
            width={56}
            height={56}
            color={theme.colors.primary}
          />
        </div>

        {/* Tagline */}
        <h1
          style={{
            margin: '0 0 32px',
            fontSize: `${theme.fontSizes[6] || 32}px`,
            fontWeight: theme.fontWeights.bold,
            color: theme.colors.text,
          }}
        >
          Explore software like never before
        </h1>

        {/* Search Input */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            maxWidth: '500px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '6px',
              borderRadius: '12px',
              backgroundColor: theme.colors.surface,
              border: `2px solid ${error ? theme.colors.error : theme.colors.border}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '12px',
                color: theme.colors.textSecondary,
              }}
            >
              <Github size={20} />
            </div>
            <input
              type="text"
              value={repoInput}
              onChange={(e) => {
                setRepoInput(e.target.value);
                setError(null);
              }}
              placeholder="owner/repo or paste GitHub URL"
              style={{
                flex: 1,
                padding: '12px 8px',
                border: 'none',
                background: 'transparent',
                color: theme.colors.text,
                fontSize: `${theme.fontSizes[2]}px`,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: theme.colors.primary,
                color: '#fff',
                fontSize: `${theme.fontSizes[2]}px`,
                fontWeight: theme.fontWeights.semibold,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Explore
              <ArrowRight size={18} />
            </button>
          </div>
          {error && (
            <p
              style={{
                margin: '8px 0 0',
                fontSize: `${theme.fontSizes[1]}px`,
                color: theme.colors.error,
              }}
            >
              {error}
            </p>
          )}
        </form>
      </div>

      {/* Features Section */}
      <div
        style={{
          padding: '48px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '900px',
          }}
        >
          <FeatureCard
            icon={<BookOpen size={24} />}
            title="Reliable Documentation"
            description="Always up-to-date documentation generated directly from your codebase, never out of sync."
            theme={theme}
            link="https://github.com/principal-ai/alexandria-cli"
            linkLabel="alexandria-cli"
          />
          <FeatureCard
            icon={<Network size={24} />}
            title="Interactive Diagrams"
            description="Visualize repository structure, dependencies, and architecture with auto-generated diagrams you can explore."
            theme={theme}
            link="https://www.npmjs.com/package/@principal-ai/visual-validation-cli"
            linkLabel="visual-validation-cli"
          />
          <FeatureCard
            icon={<Sparkles size={24} />}
            title="Principal Agent"
            description="Ask questions about any repository and get instant, context-aware answers powered by AI."
            theme={theme}
          />
        </div>
      </div>

      {/* Quick Start Hint */}
      {highlightedProjects.length > 0 && (
        <div
          style={{
            padding: '24px 32px 48px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: `${theme.fontSizes[1]}px`,
              color: theme.colors.textSecondary,
            }}
          >
            Try it with{' '}
            {highlightedProjects.map((project, index) => (
              <React.Fragment key={`${project.owner}/${project.repo}`}>
                {index > 0 && (index === highlightedProjects.length - 1 ? ' or ' : ', ')}
                <button
                  onClick={() => handleProjectClick(project)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme.colors.primary,
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 'inherit',
                    fontWeight: theme.fontWeights.medium,
                    textDecoration: 'underline',
                  }}
                >
                  {project.label || `${project.owner}/${project.repo}`}
                </button>
              </React.Fragment>
            ))}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Panel metadata for registration
 */
export const WelcomePanelMetadata = {
  id: 'welcome',
  name: 'Welcome',
  description: 'Landing page with branding and repository search',
  icon: 'home',
  version: '0.1.0',
  slices: [],
  surfaces: ['panel'],
};
