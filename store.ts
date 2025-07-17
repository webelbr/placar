"use client"

// Simple store implementation for toast management
type Action = {
  type: string
  [key: string]: any
}

// Simple dispatch function for toast actions
export function dispatch(action: Action) {
  // This is a simplified dispatch that works with the toast system
  // In a real application, you might want to use a more robust state management solution
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("toast-action", { detail: action }))
  }
}
