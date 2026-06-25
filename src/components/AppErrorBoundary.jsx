import { Component } from 'react';

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-dvh items-center justify-center bg-background p-4" role="alert">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 text-center shadow-sm">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">PHNX A&amp;P EXAM PREP</p>
          <h1 className="mt-2 text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your progress is stored locally on this device. Try reloading the app or return to the home screen.
          </p>
          <div className="mt-5 flex justify-center gap-2.5">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent"
            >
              Reload App
            </button>
          </div>
        </div>
      </main>
    );
  }
}
