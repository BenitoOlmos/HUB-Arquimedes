import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '24px',
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid var(--status-replace)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            color: 'var(--text-primary)',
            textAlign: 'center',
            margin: '20px 0'
          }}
        >
          <AlertTriangle
            size={48}
            color="var(--status-replace)"
            style={{ animation: 'bounce 2s infinite' }}
          />
          <div>
            <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
              Error en el Componente
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
              Se produjo un error al renderizar esta sección del panel técnico. El resto del
              simulador sigue operando normalmente.
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid var(--border-glass)',
              background: 'var(--accent-blue)',
              color: '#ffffff',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
