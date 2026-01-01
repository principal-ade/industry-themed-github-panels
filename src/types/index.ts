/**
 * Panel Extension Type Definitions
 *
 * Re-exports core types from @principal-ade/panel-framework-core
 */

// Re-export all core types from panel-framework-core
export type {
  // Core data types
  DataSlice,
  WorkspaceMetadata,
  RepositoryMetadata,
  FileTreeSource,
  ActiveFileSlice,

  // Event system
  PanelEventType,
  PanelEvent,
  PanelEventEmitter,

  // Panel interface
  PanelActions,
  PanelContextValue,
  PanelComponentProps,

  // Panel definition
  PanelMetadata,
  PanelLifecycleHooks,
  PanelDefinition,
  PanelModule,

  // Registry types
  PanelRegistryEntry,
  PanelLoader,
  PanelRegistryConfig,

  // Tool types (UTCP-compatible)
  PanelTool,
  PanelToolsMetadata,
  JsonSchema,
  PanelEventCallTemplate,
} from '@principal-ade/panel-framework-core';

// Export GitHub-specific types
export type {
  GitHubOwner,
  GitHubRepository,
  GitHubOrganization,
  GitHubRepositoriesSliceData,
  OwnerInfo,
  OwnerRepositoriesSliceData,
  RepositorySelectedEventPayload,
  RepositoryPreviewEventPayload,
  GitHubPanelEventType,
  // Workspace/Collection types
  Workspace,
  WorkspaceCollectionSlice,
  WorkspaceRepositoriesSlice,
  CollectionPanelActions,
  // Search types
  GitHubSearchResult,
  GitHubSearchPanelActions,
} from './github';
