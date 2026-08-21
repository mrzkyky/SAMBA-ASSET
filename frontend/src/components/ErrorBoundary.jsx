import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          color: '#f1f5f9',
          padding: '40px',
          fontFamily: 'monospace',
        }}>
          <h1 style={{ color: '#f43f5e', fontSize: '24px', marginBottom: '16px' }}>
            ⚠️ Terjadi Error pada Aplikasi
          </h1>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #334155',
            marginBottom: '16px',
          }}>
            <p style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '8px' }}>Error Message:</p>
            <pre style={{ color: '#fb7185', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {this.state.error && this.state.error.toString()}
            </pre>
          </div>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #334155',
            marginBottom: '16px',
          }}>
            <p style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '8px' }}>Component Stack:</p>
            <pre style={{ color: '#94a3b8', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '12px' }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.reload();
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#06b6d4',
              color: '#0f172a',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            🔄 Reset & Login Ulang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
