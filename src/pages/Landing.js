import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GalaxyScene from '../components/GalaxyScene';
import Logo from '../components/Logo';

const FEATURES = [
  { icon: '🔐', title: 'Bank-Grade Security', desc: 'Multi-factor auth, email & SMS verification, 256-bit encryption' },
  { icon: '⚡', title: 'Instant Transfers', desc: 'Send & receive BTC, ETH, SOL, USDT across the globe instantly' },
  { icon: '💳', title: '8+ Payment Methods', desc: 'Wire, PayPal, CashApp, Zelle, Venmo, Neteller, ZenGo & more' },
  { icon: '🔔', title: 'Real-Time Alerts', desc: 'Instant notifications via email & SMS for every transaction' },
  { icon: '📈', title: 'Live Price Tracking', desc: 'Real-time market data and price alerts for your portfolio' },
  { icon: '🛡️', title: 'Regulatory Compliance', desc: 'KYC/AML compliant with top-tier security audits' },
  { icon: '🌐', title: 'Global Access', desc: 'Trade and manage your crypto from anywhere in the universe' },
  { icon: '🚀', title: 'Future-Ready', desc: 'Built for the next 100 years of crypto innovation' },
  { icon: '🎁', title: 'Gift Cards', desc: 'Buy and send crypto gift cards for any occasion' },
  { icon: '📱', title: 'Mobile App', desc: 'Manage your crypto galaxy on the go with our iOS & Android apps' },
  { icon: '🤖', title: 'AI Trading Bot', desc: 'Automated trading strategies powered by AI to maximize your gains' },
  { icon: '🛒', title: 'NFT Marketplace', desc: 'Buy, sell, and trade NFTs from your favorite collections' },
  { icon: '👾', title: 'Gamified Experience', desc: 'Earn rewards and level up as you trade in the crypto galaxy' },
  { icon: '🪐', title: 'Staking & Yield', desc: 'Stake your crypto and earn passive income with competitive yields' },
  { icon: '📊', title: 'Advanced Analytics', desc: 'In-depth portfolio analytics and performance tracking' },
  { icon: '🤝', title: '24/7 Support', desc: 'Our intergalactic support team is here to help you anytime' },
  { icon: '🔗', title: 'DeFi Integration', desc: 'Seamlessly connect to top DeFi protocols and earn more' },
  { icon: '🛡️', title: 'Insurance Protection', desc: 'Up to $100M in insurance coverage for your assets' },
  { icon: '🌌', title: 'Cosmic Rewards', desc: 'Exclusive rewards and perks for our most active traders' },
  { icon: '🚀', title: 'Launchpad Access', desc: 'Get early access to the hottest new crypto projects' },
  { icon: '🎓', title: 'Crypto Academy', desc: 'Learn everything about crypto with our comprehensive guides and tutorials' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Full-screen 3D Galaxy */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Suspense fallback={<div style={{ background: '#000008', width: '100%', height: '100%' }} />}>
          <GalaxyScene interactive={true} />
        </Suspense>
      </div>

      {/* Dark overlay for readability */}
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,8,0.3) 0%, rgba(0,0,8,0.5) 60%, rgba(0,0,8,0.95) 100%)', zIndex: 1 }} />

      {/* Navigation */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10, padding: '20px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', background: 'rgba(0,0,8,0.3)' }}>
        <Logo size="sm" />
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-secondary" onClick={() => navigate('/login')}>SIGN IN</button>
          <button className="btn-primary" onClick={() => navigate('/register')} style={{ width: 'auto', padding: '10px 24px', fontSize: 13 }}>
            GET STARTED 🚀
          </button>
        </div>
      </nav>

      {/* Hero content */}
      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 40px 60px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
            style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
            <img src="/logo.jpeg" alt="Crypto Galaxy"
              style={{ width: 160, height: 160, objectFit: 'contain', borderRadius: 32,
                filter: 'drop-shadow(0 0 30px rgba(123,47,190,0.8)) drop-shadow(0 0 60px rgba(0,245,255,0.4))',
                animation: 'float 4s ease-in-out infinite' }} />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
            className="font-orbitron" style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
            <span style={{ display: 'block', background: 'linear-gradient(135deg, #00F5FF, #7B2FBE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              CRYPTO
            </span>
            <span style={{ display: 'block', background: 'linear-gradient(135deg, #FFD700, #00F5FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              GALAXY
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ fontSize: 'clamp(16px, 2vw, 22px)', color: 'rgba(232,232,255,0.8)', marginBottom: 12, fontFamily: 'Rajdhani, sans-serif', maxWidth: 600 }}>
            The Universe of Digital Finance
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 40, fontFamily: 'Share Tech Mono, monospace', maxWidth: 500 }}>
            Trade BTC · ETH · SOL · USDT with military-grade security and real-time galaxy notifications
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button
              className="btn-primary"
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              style={{ width: 'auto', padding: '16px 40px', fontSize: 16, letterSpacing: 2 }}
            >
              🚀 LAUNCH INTO SPACE
            </motion.button>
            <motion.button
              className="btn-secondary"
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              style={{ padding: '16px 40px', fontSize: 14 }}
            >
              SIGN IN →
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Coin badges */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          style={{ display: 'flex', gap: 12, marginTop: 60, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: '₿', name: 'Bitcoin', color: '#F7931A' },
            { icon: 'Ξ', name: 'Ethereum', color: '#627EEA' },
            { icon: '◎', name: 'Solana', color: '#9945FF' },
            { icon: '₮', name: 'USDT', color: '#26A17B' },
          ].map((coin) => (
            <div key={coin.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: `${coin.color}15`, border: `1px solid ${coin.color}44`, borderRadius: 30, backdropFilter: 'blur(10px)' }}>
              <span style={{ color: coin.color, fontSize: 18, fontWeight: 900 }}>{coin.icon}</span>
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, color: 'white' }}>{coin.name}</span>
            </div>
          ))}
        </motion.div>

        {/* Features section */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          style={{ marginTop: 100, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, maxWidth: 1000, width: '100%' }}>
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 + i * 0.1 }}
              className="glass-card" style={{ padding: '24px 20px', textAlign: 'center' }}
              whileHover={{ scale: 1.04, y: -4 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
              <h3 className="font-orbitron" style={{ fontSize: 13, marginBottom: 10, color: 'var(--star-cyan)', letterSpacing: 0.5 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Payment methods */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          style={{ marginTop: 60, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'Orbitron, monospace', fontSize: 11, letterSpacing: 3, marginBottom: 16 }}>ACCEPTED PAYMENT METHODS</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🏦 Wire', '🅿️ PayPal', '💵 Cash App', '⚡ Zelle', '🔵 Venmo', '🌐 Neteller', '🔑 ZenGo', '💳 Card'].map((m) => (
              <span key={m} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>{m}</span>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div style={{ marginTop: 80, color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'Share Tech Mono, monospace', opacity: 0.5 }}>
          © 2025 Crypto Galaxy · All rights reserved · Built for the stars 🌌
        </div>
      </div>
    </div>
  );
}
