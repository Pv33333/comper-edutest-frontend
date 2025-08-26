// src/components/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // you can log to a service here
    // console.error("[ErrorBoundary]", error, info);
  }
  render() {
    if (this.state.hasError) {
      const e = this.state.error;
      let msg = "Unknown error";
      try {
        if (e instanceof Error) msg = e.message;
        else if (typeof e === "string") msg = e;
        else msg = JSON.stringify(e);
      } catch {
        msg = String(e);
      }
      return (
        <div className="p-6 text-red-700">
          <h2 className="text-xl font-semibold mb-2">A apărut o eroare.</h2>
          <pre className="whitespace-pre-wrap break-words text-sm opacity-80">{msg}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
