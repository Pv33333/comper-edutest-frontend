// src/components/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(p){ super(p); this.state = { hasError: false }; }
  static getDerivedStateFromError(){ return { hasError: true }; }
  componentDidCatch(error, info){ console.error("[ErrorBoundary]", error, info); }

  render(){
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center bg-white text-center p-8">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">A apărut o eroare.</h2>
          <p className="mt-1 text-gray-500">Te rugăm să reîncarci pagina.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
