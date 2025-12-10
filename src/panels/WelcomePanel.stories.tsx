import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { WelcomePanel } from './WelcomePanel';
import { createMockContext, createMockEvents, createMockActions } from '../mocks/panelContext';

const meta = {
  title: 'Panels/WelcomePanel',
  component: WelcomePanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Landing panel with branding, search, and featured organizations.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '100vh', width: '100%' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  args: {
    context: createMockContext(),
    events: createMockEvents(),
    actions: createMockActions(),
  },
} satisfies Meta<typeof WelcomePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state with no featured organizations
 */
export const Default: Story = {
  args: {
    highlightedProjects: [],
    featuredOrganizations: [],
  },
};

/**
 * With highlighted projects (legacy feature)
 */
export const WithHighlightedProjects: Story = {
  args: {
    highlightedProjects: [
      { owner: 'facebook', repo: 'react' },
      { owner: 'vercel', repo: 'next.js' },
    ],
    featuredOrganizations: [],
  },
};

/**
 * With featured organizations - the main use case
 */
export const WithFeaturedOrganizations: Story = {
  args: {
    highlightedProjects: [],
    featuredOrganizations: [
      { login: 'principal-ai', description: 'AI-powered development tools' },
      { login: 'principal-ade', description: 'Application Development Environment' },
      { login: 'principal-forks', description: 'Curated forks of popular projects' },
    ],
  },
};

/**
 * With both organizations and highlighted projects
 */
export const WithOrganizationsAndProjects: Story = {
  args: {
    highlightedProjects: [
      { owner: 'TheKicker25', repo: 'aider', label: 'aider' },
      { owner: 'TheKicker25', repo: 'dexter', label: 'dexter' },
    ],
    featuredOrganizations: [
      { login: 'principal-ai', description: 'AI-powered development tools' },
      { login: 'principal-ade', description: 'Application Development Environment' },
      { login: 'principal-forks', description: 'Curated forks of popular projects' },
    ],
  },
};

/**
 * Single organization
 */
export const SingleOrganization: Story = {
  args: {
    highlightedProjects: [],
    featuredOrganizations: [
      { login: 'principal-ai', description: 'AI-powered development tools' },
    ],
  },
};

/**
 * Organizations without descriptions
 */
export const OrganizationsNoDescriptions: Story = {
  args: {
    highlightedProjects: [],
    featuredOrganizations: [
      { login: 'principal-ai' },
      { login: 'principal-ade' },
      { login: 'principal-forks' },
    ],
  },
};

/**
 * Interactive with navigation handler
 */
export const Interactive: Story = {
  args: {
    highlightedProjects: [
      { owner: 'facebook', repo: 'react' },
    ],
    featuredOrganizations: [
      { login: 'principal-ai', description: 'AI-powered development tools' },
      { login: 'principal-ade', description: 'Application Development Environment' },
    ],
    onNavigate: (owner, repo) => {
      console.log(`Navigate to: ${owner}/${repo}`);
      alert(`Would navigate to: ${owner}/${repo}`);
    },
    onOrganizationClick: (org) => {
      console.log(`Organization clicked: ${org}`);
      alert(`Would open organization: ${org}`);
    },
  },
};
