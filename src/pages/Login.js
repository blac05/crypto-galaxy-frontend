import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import { useAuthStore } from '../store';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email) errs.email = 'Email required';
    if (!form.password) errs.password = 'Password required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const res = await login(form.email, form.password);
    if (res.success) {
      toast.success('Welcome back, astronaut! 🚀');
      navigate('/dashboard');
    } else {
      toast.error(res.message || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative' }}>
      <div className="nebula-overlay" />

      {/* Stars */}
      <div className="stars-bg">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 2 + 1 + 'px',
            height: Math.random() * 2 + 1 + 'px',
            background: 'white',
            borderRadius: '50%',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            opacity: Math.random() * 0.7 + 0.1,
            animation: `twinkle ${Math.random() * 3 + 2}s ease infinite ${Math.random() * 2}s`,
          }} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <Logo size="lg" />
        </div>

        <div className="glass-card animated-border" style={{ padding: '40px' }}>
          <h2 className="font-orbitron" style={{ fontSize: 22, marginBottom: 6 }}>Mission Control</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 30 }}>Sign in to your galaxy account</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, fontFamily: 'Orbitron, monospace', letterSpacing: 1 }}>EMAIL</label>
              <input
                className="galaxy-input"
                name="email"
                type="email"
                placeholder="commander@cryptogalaxy.io"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <span style={{ color: 'var(--danger-red)', fontSize: 12 }}>{errors.email}</span>}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, fontFamily: 'Orbitron, monospace', letterSpacing: 1 }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="galaxy-input"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{ paddingRight: 50 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span style={{ color: 'var(--danger-red)', fontSize: 12 }}>{errors.password}</span>}
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'AUTHENTICATING...' : 'LAUNCH INTO GALAXY 🌌'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
          </div>

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
            New to the galaxy?{' '}
            <Link to="/register" style={{ color: 'var(--star-cyan)', textDecoration: 'none', fontWeight: 600 }}>
              Create Account
            </Link>
          </p>
        </div>

        {/* Security note */}
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'Share Tech Mono, monospace' }}>
          🔐 256-bit encrypted · Multi-factor secured
        </p>
      </motion.div>
    </div>
  );
}
