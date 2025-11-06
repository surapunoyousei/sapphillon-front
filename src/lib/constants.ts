/**
 * Application-wide constants and configuration values
 */

// Application Information
export const APP_INFO = {
  name: "Sapphillon",
  fullName: "Floorp OS",
  version: "0.1.0-alpha",
  description: "Operating platform through browser and local OS automation",
} as const;

// API Configuration
export const API_CONFIG = {
  endpoints: {
    version: "/api/v1/version",
    workflow: "/api/v1/workflow",
  },
  timeout: 10000,
  retryAttempts: 3,
} as const;

// UI Configuration
export const UI_CONFIG = {
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  },
  debounce: {
    search: 300,
    resize: 150,
  },
} as const;

// Status Types
export const STATUS_TYPES = {
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  INFO: "info",
  NEUTRAL: "neutral",
  PRIMARY: "primary",
  SECONDARY: "secondary",
} as const;

// Workflow States
export const WORKFLOW_STATES = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: "sapphillon-theme",
  USER_PREFERENCES: "sapphillon-user-prefs",
  WORKFLOW_DRAFTS: "sapphillon-workflow-drafts",
  RECENT_SEARCHES: "sapphillon-recent-searches",
} as const;

// Error Messages (i18n keys)
// 使用する際は useTranslation の t 関数を使用してください
// 例: const { t } = useTranslation(); t(ERROR_MESSAGES.NETWORK_ERROR)
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "errors.networkError",
  API_ERROR: "errors.apiError",
  VALIDATION_ERROR: "errors.validationError",
  UNAUTHORIZED: "errors.unauthorized",
  NOT_FOUND: "errors.notFound",
  GENERIC_ERROR: "errors.genericError",
} as const;

// Success Messages (i18n keys)
// 使用する際は useTranslation の t 関数を使用してください
// 例: const { t } = useTranslation(); t(SUCCESS_MESSAGES.WORKFLOW_CREATED)
export const SUCCESS_MESSAGES = {
  WORKFLOW_CREATED: "success.workflowCreated",
  WORKFLOW_UPDATED: "success.workflowUpdated",
  WORKFLOW_DELETED: "success.workflowDeleted",
  SETTINGS_SAVED: "success.settingsSaved",
  PLUGIN_INSTALLED: "success.pluginInstalled",
} as const;
