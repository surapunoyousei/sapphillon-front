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

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Network connection failed. Please check your internet connection.",
  API_ERROR: "API request failed. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  GENERIC_ERROR: "An unexpected error occurred. Please try again.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  WORKFLOW_CREATED: "Workflow created successfully!",
  WORKFLOW_UPDATED: "Workflow updated successfully!",
  WORKFLOW_DELETED: "Workflow deleted successfully!",
  SETTINGS_SAVED: "Settings saved successfully!",
  PLUGIN_INSTALLED: "Plugin installed successfully!",
} as const;
