import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import Home from './pages/Home.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

// Protected Route Guard
function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem('portfolio_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('portfolio_theme') || 'dark'; // Dark mode is default & gorgeous
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router>
      <Routes>
        {/* Public Homepage Route */}
        <Route 
          path="/" 
          element={<Home theme={theme} toggleTheme={toggleTheme} />} 
        />
        
        {/* Admin Login Route */}
        <Route 
          path="/admin/login" 
          element={<AdminLogin />} 
        />
        
        {/* Protected Admin Panel */}
        <Route 
          path="/admin" 
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } 
        />

        {/* Fallback Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
