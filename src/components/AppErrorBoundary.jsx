import { Component } from 'react';
import './AppErrorBoundary.css';

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
      <main className="app-error" role="alert">
        <div className="app-error__card">
          <p className="app-error__eyebrow">PHNX A&amp;P Exam Prep</p>
          <h1 className="app-error__title">Something went wrong</h1>
          <p className="app-error__message">
            Your progress is stored locally on this device. Try reloading the app or return to the home screen.
          </p>
          <div className="app-error__actions">
            <button type="button" onClick={this.handleReset}>Try Again</button>
            <button type="button" onClick={() => window.location.reload()}>Reload App</button>
          </div>
        </div>
      </main>
    );
  }
}
