import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

/**
 * Minimal error boundary for decorative subtrees (e.g., the lazy WebGL canvas).
 * A failed chunk import or WebGL init error must not blank the whole page, so
 * it renders `null` once it has caught — never a fallback UI.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
