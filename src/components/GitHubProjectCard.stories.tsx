import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { GitHubProjectCard } from './GitHubProjectCard';
import {
  mockOwnedRepositories,
  mockStarredRepositories,
} from '../mocks/githubData';

/**
 * GitHubProjectCard displays a single GitHub repository with metadata
 * and action buttons.
 */
const meta = {
  title: 'Components/GitHubProjectCard',
  component: GitHubProjectCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A card component for displaying GitHub repository information. Shows repository name, description, language, stars, and forks.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ maxWidth: '600px', padding: '16px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    onSelect: { action: 'selected' },
    onOpenInGitHub: { action: 'openInGitHub' },
  },
} satisfies Meta<typeof GitHubProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Get sample repositories
const publicRepo = mockOwnedRepositories[0];
const privateRepo = mockOwnedRepositories[1];
const starredRepo = mockStarredRepositories[0]; // React - 225k stars
const highStarsRepo = mockStarredRepositories[3]; // TypeScript - 98k stars

/**
 * Default card showing a public repository
 */
export const Default: Story = {
  args: {
    repository: publicRepo,
    isSelected: false,
  },
};

/**
 * Private repository with lock icon
 */
export const PrivateRepository: Story = {
  args: {
    repository: privateRepo,
    isSelected: false,
  },
};

/**
 * Selected/highlighted state
 */
export const Selected: Story = {
  args: {
    repository: publicRepo,
    isSelected: true,
  },
};

/**
 * Popular repository with high star count (formatted as 225k)
 */
export const PopularRepository: Story = {
  args: {
    repository: starredRepo,
    isSelected: false,
  },
};

/**
 * Repository with very high star count
 */
export const HighStarCount: Story = {
  args: {
    repository: highStarsRepo,
    isSelected: false,
  },
};

/**
 * Multiple cards in a list - owned repositories
 */
export const OwnedList: Story = {
  args: {
    repository: publicRepo,
  },
  render: () => (
    <ThemeProvider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {mockOwnedRepositories.map((repo) => (
          <GitHubProjectCard
            key={repo.id}
            repository={repo}
            isSelected={repo.id === 1}
            // eslint-disable-next-line no-console
            onSelect={(r) => console.log('Selected:', r.name)}
          />
        ))}
      </div>
    </ThemeProvider>
  ),
};

/**
 * Starred repositories list
 */
export const StarredList: Story = {
  args: {
    repository: starredRepo,
  },
  render: () => (
    <ThemeProvider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {mockStarredRepositories.map((repo) => (
          <GitHubProjectCard
            key={repo.id}
            repository={repo}
            // eslint-disable-next-line no-console
            onSelect={(r) => console.log('Selected:', r.name)}
          />
        ))}
      </div>
    </ThemeProvider>
  ),
};

/**
 * Interactive card - click to see events in Actions panel
 */
export const Interactive: Story = {
  args: {
    repository: publicRepo,
    isSelected: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Click the card to select it, or use the GitHub button. Check the Actions panel to see the events.',
      },
    },
  },
};
