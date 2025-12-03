import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import ResetPasswordView from '../components/ResetPasswordView';

// Simple path-based router
const Router: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  };

  // Handle password reset route
  if (currentPath === '/reset-password' || currentPath.startsWith('/reset-password')) {
    return <ResetPasswordView onComplete={navigateToHome} />;
  }

  // Default: render main app
  return <App />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
