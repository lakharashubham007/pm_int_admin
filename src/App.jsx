import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { X } from 'lucide-react';
import authStore from './store/authStore';
import themeStore from './store/themeStore';
import Login from './pages/Login';
import Markup from './routes';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("APP CRASH:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#fff', height: '100vh' }}>
          <h2 style={{ color: '#ef4444' }}>Something went wrong.</h2>
          <p style={{ color: '#666' }}>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', background: '#5BA4FC', color: '#fff', border: 'none', borderRadius: '8px' }}>
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [authState, setAuthState] = useState(authStore.getState());

  useEffect(() => {
    const unsubscribe = authStore.subscribe(setAuthState);
    authStore.init();
    return unsubscribe;
  }, []);

  if (!authState.initialized) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  if (!authState.token) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return <Markup />;
}

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        containerStyle={{ zIndex: 9999999 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card, 0 0% 100%))',
            color: 'hsl(var(--foreground, 222.2 84% 4.9%))',
            backdropFilter: 'blur(16px)',
            border: '1px solid hsl(var(--primary, 221.2 83.2% 53.3%) / 0.2)',
            borderRadius: '16px',
            padding: '12px 20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            fontSize: '0.95rem',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: 'hsl(var(--primary))',
              secondary: 'hsl(var(--primary-foreground))',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff4b4b',
              secondary: '#fff',
            },
            style: {
              border: '1px solid rgba(255, 75, 75, 0.2)',
            }
          }
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                {message}
                {t.type !== 'loading' && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="ml-2 p-1 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Router>
  );
}

export default App;
