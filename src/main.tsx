import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import App from '../App';
import ResetPasswordView from '../components/ResetPasswordView';
import './index.css';

const ResetPasswordWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <ResetPasswordView onComplete={() => navigate('/')} />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordWrapper />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
