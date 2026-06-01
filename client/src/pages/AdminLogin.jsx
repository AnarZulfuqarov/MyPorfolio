import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Key, Eye, EyeOff, ChevronLeft, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    const token = localStorage.getItem('portfolio_token');
    if (token) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('portfolio_token', data.token);
        navigate('/admin');
      } else {
        setError(data.error || t('admin.login.error'));
      }
    } catch (error) {
      setError(t('contact.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card glass-card">
        {/* Back link */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          <ChevronLeft size={16} />
          <span>{t('admin.dashboard.back_to_site')}</span>
        </Link>

        {/* Panel Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '12px', 
            borderRadius: '12px', 
            backgroundColor: 'var(--primary-light)', 
            color: 'var(--primary)',
            marginBottom: '16px' 
          }}>
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{t('admin.login.title')}</h2>
        </div>

        {/* Login form */}
        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label htmlFor="password-field" className="form-label">{t('admin.login.password')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password-field"
                className="form-input"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                placeholder={t('admin.login.placeholder_password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <Key size={16} style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-muted)' 
              }} />
              <button
                type="button"
                style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-muted)',
                  cursor: 'pointer' 
                }}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error notification */}
          {error && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444', 
              fontSize: '0.85rem',
              fontWeight: 500,
              marginBottom: '20px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px' }}
            disabled={isLoading}
          >
            {isLoading ? t('contact.sending') : t('admin.login.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
