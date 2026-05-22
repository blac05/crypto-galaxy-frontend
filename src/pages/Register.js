import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import { useAuthStore } from '../store';

const STEPS = ['account', 'verify-email', 'verify-phone', 'done'];

export default function Register() {
  const navigate = useNavigate();
  const { register, verifyEmail, verifyPhone, loading } = useAuthStore();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '',
  });
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const validateAccount = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!/^\+?[\d\s\-()]{10,}$/.test(form.phone)) errs.phone = 'Invalid phone number';
    if (form.password.length < 8) errs.password = 'Min 8 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validateAccount()) return;
    const res = await register(form);
    if (res.success) {
      toast.success('Verification codes sent!');
      setStep(1);
    } else {
      toast.error(res.message);
    }
  };

  const handleVerifyEmail = async () => {
    if (emailOtp.length < 6) return toast.error('Enter 6-digit code');
    const res = await verifyEmail(form.email, emailOtp);
    if (res.success) {
      toast.success('Email verified!');
      setStep(2);
    } else {
      toast.error(res.message);
    }
  };

  const handleVerifyPhone = async () => {
    if (phoneOtp.length < 6) return toast.error('Enter 6-digit code');
    const res = await verifyPhone(form.phone, phoneOtp);
    if (res.success) {
      toast.success('Phone verified!');
      setStep(3);
      setTimeout(() => navigate('/login'), 2500);
    } else {
      toast.error(res.message);
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
        style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <Logo size="md" />
        </div>

        <div className="glass-card" style={{ padding: '36px 40px' }}>
          {/* Progress bar */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              {['Account', 'Email OTP', 'Phone OTP', 'Done'].map((label, i) => (
                <span key={i} style={{
                  fontFamily: 'Orbitron, monospace',
                  fontSize: 10,
                  color: i <= step ? 'var(--star-cyan)' : 'var(--text-secondary)',
                  letterSpacing: 1,
                }}>
                  {label}
                </span>
              ))}
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <motion.div
                animate={{ width: `${(step / 3) * 100}%` }}
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--cosmic-blue), var(--star-cyan))', borderRadius: 2 }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 0: Account Info */}
            {step === 0 && (
              <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-orbitron" style={{ fontSize: 22, marginBottom: 6, color: 'white' }}>Create Account</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Join the crypto universe</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <input className="galaxy-input" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} />
                    {errors.firstName && <span style={{ color: 'var(--danger-red)', fontSize: 12 }}>{errors.firstName}</span>}
                  </div>
                  <div>
                    <input className="galaxy-input" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} />
                    {errors.lastName && <span style={{ color: 'var(--danger-red)', fontSize: 12 }}>{errors.lastName}</span>}
                  </div>
                </div>

                {[
                  { name: 'email', placeholder: '📧 Email Address', type: 'email' },
                  { name: 'phone', placeholder: '📱 Phone (e.g. +1234567890)', type: 'tel' },
                  { name: 'password', placeholder: '🔐 Password (min 8 chars)', type: 'password' },
                  { name: 'confirm', placeholder: '🔐 Confirm Password', type: 'password' },
                ].map(({ name, placeholder, type }) => (
                  <div key={name} style={{ marginBottom: 14 }}>
                    <input className="galaxy-input" name={name} type={type} placeholder={placeholder} value={form[name]} onChange={handleChange} />
                    {errors[name] && <span style={{ color: 'var(--danger-red)', fontSize: 12 }}>{errors[name]}</span>}
                  </div>
                ))}

                <div style={{ marginTop: 8 }}>
                  <button className="btn-primary" onClick={handleRegister} disabled={loading}>
                    {loading ? 'LAUNCHING...' : 'CREATE ACCOUNT 🚀'}
                  </button>
                </div>

                <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: 14 }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: 'var(--star-cyan)', textDecoration: 'none' }}>Sign In</Link>
                </p>
              </motion.div>
            )}

            {/* STEP 1: Email OTP */}
            {step === 1 && (
              <motion.div key="email-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
                <h2 className="font-orbitron" style={{ fontSize: 20, marginBottom: 8 }}>Verify Email</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
                  We sent a 6-digit code to<br />
                  <span style={{ color: 'var(--star-cyan)' }}>{form.email}</span>
                </p>
                <input
                  className="galaxy-input"
                  placeholder="Enter 6-digit code"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontFamily: 'Orbitron, monospace', marginBottom: 20 }}
                  maxLength={6}
                />
                <button className="btn-primary" onClick={handleVerifyEmail} disabled={loading || emailOtp.length < 6}>
                  {loading ? 'VERIFYING...' : 'VERIFY EMAIL ✓'}
                </button>
              </motion.div>
            )}

            {/* STEP 2: Phone OTP */}
            {step === 2 && (
              <motion.div key="phone-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📱</div>
                <h2 className="font-orbitron" style={{ fontSize: 20, marginBottom: 8 }}>Verify Phone</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
                  We sent a code to<br />
                  <span style={{ color: 'var(--star-cyan)' }}>{form.phone}</span>
                </p>
                <input
                  className="galaxy-input"
                  placeholder="Enter 6-digit code"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontFamily: 'Orbitron, monospace', marginBottom: 20 }}
                  maxLength={6}
                />
                <button className="btn-primary" onClick={handleVerifyPhone} disabled={loading || phoneOtp.length < 6}>
                  {loading ? 'VERIFYING...' : 'VERIFY PHONE ✓'}
                </button>
              </motion.div>
            )}

            {/* STEP 3: Done */}
            {step === 3 && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8 }}
                  style={{ fontSize: 64, marginBottom: 16 }}
                >
                  🌌
                </motion.div>
                <h2 className="font-orbitron gradient-text" style={{ fontSize: 24, marginBottom: 10 }}>WELCOME TO THE GALAXY</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Your account is verified. Redirecting to login...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
