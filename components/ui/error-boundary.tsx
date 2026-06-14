'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught boundary error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center border border-white/5 rounded-2xl bg-[#131316]/50 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-950/20 border border-red-500/20 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Workspace Fault Trapped</h3>
            <p className="text-xs text-zinc-500 mt-2 max-w-sm leading-relaxed">
              An unexpected runtime compilation or database processing error occurred in this panel.
            </p>
          </div>
          {this.state.error && (
            <div className="max-w-md p-3 rounded-lg bg-zinc-950 border border-white/5 text-[10px] font-mono text-zinc-500 overflow-x-auto text-left w-full">
              {this.state.error.toString()}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reload Module
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
