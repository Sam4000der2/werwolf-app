import React from "react";

type AppErrorBoundaryState = {
  hasError: boolean;
};

class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    if (process.env.NODE_ENV !== "production") {
      // Keep full error details during local debugging.
      console.error("AppErrorBoundary caught runtime error", error);
      return;
    }

    // Avoid leaking internal runtime details in production consoles.
    console.error("AppErrorBoundary caught runtime error");
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Ein unerwarteter Fehler ist aufgetreten.</h2>
        <p>Die App wurde in einen sicheren Zustand versetzt.</p>
        <button className="button button--outline" onClick={() => window.location.reload()}>
          App neu laden
        </button>
      </div>
    );
  }
}

export default AppErrorBoundary;
