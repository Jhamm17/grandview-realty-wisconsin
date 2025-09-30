'use client';

import React from 'react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error }>;
    onError?: (error: Error) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('UI Error:', error, errorInfo);
        this.props.onError?.(error);
    }

    render() {
        if (this.state.hasError && this.state.error) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return <FallbackComponent error={this.state.error} />;
            }

            return (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
                    <p className="mt-2 text-sm text-red-600">
                        {this.state.error.message || 'An unexpected error occurred'}
                    </p>
                    <button
                        className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
                        onClick={() => this.setState({ hasError: false })}
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
} 