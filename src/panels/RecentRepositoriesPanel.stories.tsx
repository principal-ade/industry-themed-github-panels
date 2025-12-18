import type { Meta, StoryObj } from '@storybook/react-vite';
import { RecentRepositoriesPanel } from './RecentRepositoriesPanel';
import {
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../mocks/panelContext';
import type { GitHubRepository } from '../types/github';

/**
 * RecentRepositoriesPanel displays recently visited repositories and owners
 * with filtering, navigation, and history management.
 */
const meta = {
  title: 'Panels/RecentRepositoriesPanel',
  component: RecentRepositoriesPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A panel for viewing recently visited repositories and owners. Features include:
- **Recent history**: Persists visited repos and owners in localStorage
- **Filter tabs**: View all, repositories only, or owners only
- **Preview on click**: Single click to preview README
- **Open on double-click**: Double click to navigate to repository/owner
- **Remove items**: Hover to reveal remove button for individual items
- **Clear history**: Clear all or filtered items

Events emitted:
- \`repository:preview\` - When user clicks a repository
- \`repository:selected\` - When user double-clicks a repository
- \`owner:preview\` - When user clicks an owner
- \`owner:selected\` - When user double-clicks an owner
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', background: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RecentRepositoriesPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state - shows items from localStorage (may be empty)
 */
export const Default: Story = {
  args: {
    context: createMockContext(),
    actions: createMockActions(),
    events: createMockEvents(),
  },
};

/**
 * Interactive with event logging
 */
export const Interactive: Story = {
  args: {
    context: createMockContext(),
    actions: createMockActions(),
    events: (() => {
      const mockEvents = createMockEvents();
      const originalEmit = mockEvents.emit;
      mockEvents.emit = (event) => {
        // eslint-disable-next-line no-console
        console.log('Event emitted:', event);
        if (event.type === 'repository:preview') {
          const payload = event.payload as { repository: GitHubRepository };
          // eslint-disable-next-line no-console
          console.log(`Preview repository: ${payload.repository.full_name}`);
        } else if (event.type === 'repository:selected') {
          const payload = event.payload as { repository: GitHubRepository };
          // eslint-disable-next-line no-console
          console.log(`Selected repository: ${payload.repository.full_name}`);
        } else if (event.type === 'owner:preview' || event.type === 'owner:selected') {
          // eslint-disable-next-line no-console
          console.log(`Owner event: ${event.type}`, event.payload);
        }
        originalEmit(event);
      };
      return mockEvents;
    })(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo with event logging. Click repositories/owners and check the console to see emitted events.',
      },
    },
  },
};

/**
 * With navigation callback
 */
export const WithNavigate: Story = {
  args: {
    context: createMockContext(),
    actions: createMockActions(),
    events: createMockEvents(),
    onNavigate: (path: string) => {
      // eslint-disable-next-line no-console
      console.log('Navigate to:', path);
      alert(`Would navigate to: ${path}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'With onNavigate callback - double-click items to see navigation.',
      },
    },
  },
};

