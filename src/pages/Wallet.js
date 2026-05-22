import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWalletStore } from '../store';

const COINS = [
  { id: 'BTC', name: 'Bitcoin', icon: '₿', color: '#F7931A' },
  { id: 'ETH', name: 'Ethereum', icon: 'Ξ', color: '#627EEA' },
  { id: 'SOL', name: 'Solana', icon: '◎', color: '#9945FF' },
  { id: 'USDT', name: 'Tether', icon: '₮', color: '#26A17B' },
];

export default function Wallet() {
  const { balances, prices, transactions } = useWalletStore();
  const [filter, setFilter] = useState('all');

  const totalUSD = Object.entries(balances).reduce((sum, [coin, amt]) => sum + amt * (prices[coin] || 0), 0);

  const filtered = filter === 'all' ? transactions : transactions.filter(tx => tx.type === filter);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 className="font-orbitron" style={{ fontSize: 24, marginBottom: 6 }}>💼 My Wallet</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Your crypto holdings at a glance</p>
      </motion.div>

      {/* Total balance */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-card glow-purple" style={{ padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,47,190,0.2) 0%, transparent 70%)' }} />
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace', fontSize: 12, letterSpacing: 2, marginBottom: 8 }}>TOTAL PORTFOLIO VALUE</p>
        <h2 className="font-orbitron text-glow-cyan" style={{ fontSize: 40, fontWeight: 900, marginBottom: 4 }}>
          ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
        <p style={{ color: 'var(--success-green)', fontFamily: 'Share Tech Mono, monospace', fontSize: 14 }}>▲ Portfolio tracking active</p>
      </motion.div>

      {/* Coin cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28 }}>
        {COINS.map((coin, i) => {
          const bal = balances[coin.id] || 0;
          const price = prices[coin.id] || 0;
          const usdVal = bal * price;
          const pct = totalUSD > 0 ? (usdVal / totalUSD) * 100 : 0;
          return (
            <motion.div key={coin.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-card" style={{ padding: 24, border: `1px solid ${coin.color}33` }} whileHover={{ scale: 1.02 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${coin.color}22`, border: `2px solid ${coin.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: coin.color }}>{coin.icon}</div>
                  <div>
                    <div className="font-orbitron" style={{ fontSize: 15, color: 'white', fontWeight: 700 }}>{coin.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'Share Tech Mono, monospace' }}>{coin.id}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="font-orbitron" style={{ fontSize: 16, color: 'white' }}>{bal.toFixed(coin.id === 'USDT' ? 2 : 6)}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'Share Tech Mono, monospace' }}>${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
              {/* Portfolio share bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>Portfolio share</span>
                  <span style={{ fontSize: 11, color: coin.color, fontFamily: 'Share Tech Mono, monospace' }}>{pct.toFixed(1)}%</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.5 }}
                    style={{ height: '100%', background: coin.color, borderRadius: 2, boxShadow: `0 0 8px ${coin.color}88` }} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Transaction history */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 className="font-orbitron" style={{ fontSize: 15, letterSpacing: 1 }}>TRANSACTION HISTORY</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'buy', 'sell', 'send', 'receive'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${filter === f ? 'var(--star-cyan)' : 'var(--glass-border)'}`, background: filter === f ? 'rgba(0,245,255,0.1)' : 'transparent', color: filter === f ? 'var(--star-cyan)' : 'var(--text-secondary)', fontFamily: 'Orbitron, monospace', fontSize: 10, cursor: 'pointer', letterSpacing: 0.5, transition: 'all 0.2s' }}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌌</div>
            <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 13 }}>No transactions yet. Start trading to fill your history!</p>
          </div>
        ) : (
          filtered.map((tx, i) => (
            <div key={tx._id || i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < filtered.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: tx.type === 'send' || tx.type === 'sell' ? 'rgba(255,49,49,0.15)' : 'rgba(0,255,135,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {tx.type === 'send' ? '↗️' : tx.type === 'receive' ? '↙️' : tx.type === 'buy' ? '🛒' : '💰'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'white', marginBottom: 2 }}>{tx.type?.charAt(0).toUpperCase() + tx.type?.slice(1)} {tx.coin}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>{new Date(tx.createdAt).toLocaleString()}</div>
                {tx.toAddress && <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>To: {tx.toAddress?.slice(0, 16)}...</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-orbitron" style={{ fontSize: 14, fontWeight: 700, color: (tx.type === 'send' || tx.type === 'sell') ? 'var(--danger-red)' : 'var(--success-green)' }}>
                  {(tx.type === 'send' || tx.type === 'sell') ? '-' : '+'}{tx.amount} {tx.coin}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>${((tx.amount || 0) * (prices[tx.coin] || 0)).toFixed(2)}</div>
                <div style={{ marginTop: 4 }}><span className={`badge-${tx.status || 'pending'}`}>{tx.status || 'pending'}</span></div>
              </div>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
}
