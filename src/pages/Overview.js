import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useWalletStore } from '../store';
import GalaxyScene from '../components/GalaxyScene';


const COINS = [
  { id: 'BTC', name: 'Bitcoin', icon: '₿', color: '#F7931A', bgColor: 'rgba(247,147,26,0.1)', border: 'rgba(247,147,26,0.3)' },
  { id: 'ETH', name: 'Ethereum', icon: 'Ξ', color: '#627EEA', bgColor: 'rgba(98,126,234,0.1)', border: 'rgba(98,126,234,0.3)' },
  { id: 'SOL', name: 'Solana', icon: '◎', color: '#9945FF', bgColor: 'rgba(153,69,255,0.1)', border: 'rgba(153,69,255,0.3)' },
  { id: 'USDT', name: 'Tether', icon: '₮', color: '#26A17B', bgColor: 'rgba(38,161,123,0.1)', border: 'rgba(38,161,123,0.3)' },
  { id: 'ADA', name: 'Cardano', icon: '₳', color: '#0033AD', bgColor: 'rgba(0,51,173,0.1)', border: 'rgba(0,51,173,0.3)' },
  { id: 'DOT', name: 'Polkadot', icon: '●', color: '#E6007A', bgColor: 'rgba(230,0,122,0.1)', border: 'rgba(230,0,122,0.3)' },
  { id: 'DOGE', name: 'Dogecoin', icon: 'Ð', color: '#C2A633', bgColor: 'rgba(194,166,51,0.1)', border: 'rgba(194,166,51,0.3)' },
  { id: 'MATIC', name: 'Polygon', icon: '◆', color: '#8247E5', bgColor: 'rgba(130,71,229,0.1)', border: 'rgba(130,71,229,0.3)' },
  { id: 'AVAX', name: 'Avalanche', icon: 'A', color: '#E84142', bgColor: 'rgba(232,65,66,0.1)', border: 'rgba(232,65,66,0.3)' },
  { id: 'LUNA', name: 'Terra', icon: '☉', color: '#000000', bgColor: 'rgba(0,0,0,0.1)', border: 'rgba(0,0,0,0.3)' },
  
];

const QUICK_ACTIONS = [
  { icon: '🛒', label: 'Buy Crypto', path: '/dashboard/trade', color: 'var(--cosmic-blue)' },
  { icon: '💸', label: 'Send', path: '/dashboard/transfer', color: 'var(--nebula-purple)' },
  { icon: '📥', label: 'Receive', path: '/dashboard/transfer', color: 'var(--success-green)' },
  { icon: '💳', label: 'Payment', path: '/dashboard/payments', color: 'var(--gold-accent)' },
  { icon: '🎁', label: 'Gift Cards', path: '/dashboard/gift-cards', color: 'var(--pink-accent)' },
  { icon: '📊', label: 'Analytics', path: '/dashboard/analytics', color: 'var(--cyan-accent)' },
  { icon: '⚙️', label: 'Settings', path: '/dashboard/settings', color: 'var(--text-secondary)' },
  { icon: '❓', label: 'Support', path: '/dashboard/support', color: 'var(--text-secondary)' },
  { icon: '🚀', label: 'Launchpad', path: '/dashboard/launchpad', color: 'var(--cosmic-blue)' },
  { icon: '🪐', label: 'Staking', path: '/dashboard/staking', color: 'var(--nebula-purple)' },
  { icon: '⚡', label: 'Lightning', path: '/dashboard/lightning', color: 'var(--gold-accent)' },
  { icon: '🌌', label: 'Explore', path: '/dashboard/explore', color: 'var(--pink-accent)' },
  { icon: '🛸', label: 'Airdrops', path: '/dashboard/airdrops', color: 'var(--cyan-accent)' },
  { icon: '📈', label: 'DeFi', path: '/dashboard/defi', color: 'var(--success-green)' },
  { icon: '🎨', label: 'NFTs', path: '/dashboard/nfts', color: 'var(--text-secondary)' },
  { icon: '👾', label: 'Games', path: '/dashboard/games', color: 'var(--text-secondary)' },
  { icon: '🧑‍🚀', label: 'Space Travel', path: '/dashboard/space-travel', color: 'var(--cosmic-blue)' },
  { icon: '🔭', label: 'Observatory', path: '/dashboard/observatory', color: 'var(--nebula-purple)' },
];

export default function Overview() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { balances, prices, transactions } = useWalletStore();

  const totalUSD = Object.entries(balances).reduce((sum, [coin, amount]) => {
    return sum + (amount * (prices[coin] || 0));
  }, 0);

  const recentTx = transactions.slice(0, 5);

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 className="font-orbitron" style={{ fontSize: 26, marginBottom: 4 }}>
          Welcome back, <span className="gradient-text">{user?.firstName}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace', fontSize: 13 }}>
          {new Date().toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </motion.div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Portfolio value + 3D scene */}
        <motion.div
  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
  className="glass-card glow-purple"
  style={{ gridColumn: '1 / -1', position: 'relative', overflow: 'hidden', height: 280, padding: '28px 32px' }}
>
  {/* 3D Galaxy animation behind */}
  <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
    <GalaxyScene interactive={false} />
  </div>

  {/* Content overlay */}
  <div style={{ position: 'relative', zIndex: 2 }}>
    <p style={{ color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace', fontSize: 12, marginBottom: 8, letterSpacing: 2 }}>
      TOTAL PORTFOLIO VALUE
    </p>
    <h2 className="font-orbitron text-glow-cyan" style={{ fontSize: 42, fontWeight: 900, marginBottom: 8 }}>
      ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </h2>
    <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
      {QUICK_ACTIONS.slice(0, 4).map((action) => (
        <motion.button
          key={action.label}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(action.path)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px',
            background: 'rgba(0,0,0,0.5)',
            border: `1px solid ${action.color}40`,
            borderRadius: 8,
            color: action.color,
            fontFamily: 'Orbitron, monospace',
            fontSize: 11,
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            letterSpacing: 0.5,
          }}
        >
          <span>{action.icon}</span> {action.label}
        </motion.button>
      ))}
    </div>
  </div>
</motion.div>
      </div>

      {/* Coin balances */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {COINS.map((coin, i) => (
          <motion.div
            key={coin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="glass-card"
            style={{ padding: '20px', border: `1px solid ${coin.border}`, background: coin.bgColor, cursor: 'pointer' }}
            whileHover={{ scale: 1.03, y: -3 }}
            onClick={() => navigate('/dashboard/wallet')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: `${coin.color}22`,
                border: `2px solid ${coin.color}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, color: coin.color, fontWeight: 900,
              }}>
                {coin.icon}
              </div>
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, color: coin.color, fontWeight: 700 }}>
                {coin.id}
              </span>
            </div>
            <div className="font-orbitron" style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>
              {(balances[coin.id] || 0).toFixed(coin.id === 'USDT' ? 2 : 6)}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>
              ≈ ${((balances[coin.id] || 0) * (prices[coin.id] || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 12, color: coin.color, marginTop: 4, fontFamily: 'Share Tech Mono, monospace' }}>
              ${(prices[coin.id] || 0).toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 className="font-orbitron" style={{ fontSize: 15, letterSpacing: 1 }}>RECENT TRANSACTIONS</h3>
          <button className="btn-secondary" onClick={() => navigate('/dashboard/wallet')} style={{ fontSize: 11 }}>
            VIEW ALL
          </button>
        </div>

        {recentTx.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🌌</div>
            <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 13 }}>No transactions yet. Start your journey!</p>
          </div>
        ) : (
          recentTx.map((tx, i) => (
            <div key={tx._id || i} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0',
              borderBottom: i < recentTx.length - 1 ? '1px solid var(--glass-border)' : 'none',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: tx.type === 'send' ? 'rgba(255,49,49,0.15)' : 'rgba(0,255,135,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>
                {tx.type === 'send' ? '↗️' : tx.type === 'receive' ? '↙️' : tx.type === 'buy' ? '🛒' : '💰'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'white', marginBottom: 2 }}>
                  {tx.type?.charAt(0).toUpperCase() + tx.type?.slice(1)} {tx.coin}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>
                  {new Date(tx.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-orbitron" style={{
                  fontSize: 14, fontWeight: 700,
                  color: tx.type === 'send' ? 'var(--danger-red)' : 'var(--success-green)',
                }}>
                  {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.coin}
                </div>
                <div style={{ marginTop: 4 }}>
                  <span className={`badge-${tx.status || 'pending'}`}>{tx.status || 'pending'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
}
