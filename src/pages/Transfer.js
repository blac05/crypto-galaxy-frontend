import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useWalletStore } from '../store';
import { PendingTransactionBanner, AccountLockedOverlay } from '../components/TransactionGuard';

// ─── COINS ───────────────────────────────────────────────────────────────────
const COINS = [
{ id: 'BTC',  name: 'Bitcoin',  icon: '₿', color: '#F7931A' },
{ id: 'ETH',  name: 'Ethereum', icon: 'Ξ', color: '#627EEA' },
{ id: 'SOL',  name: 'Solana',   icon: '◎', color: '#9945FF' },
{ id: 'USDT', name: 'Tether',   icon: '₮', color: '#26A17B' },
{ id: 'BNB',  name: 'BNB',      icon: 'B', color: '#F3BA2F' },
{ id: 'ADA',  name: 'Cardano',  icon: '₳', color: '#0033AD' },
];

// ─── NETWORKS per coin ────────────────────────────────────────────────────────
const NETWORKS = {
BTC:  [{ id: 'bitcoin',   name: 'Bitcoin',          fee: '~0.00005 BTC' },
{ id: 'lightning', name: 'Lightning Network', fee: '~0.000001 BTC' }],
ETH:  [{ id: 'ethereum',  name: 'Ethereum (ERC-20)', fee: '~0.002 ETH' },
{ id: 'arbitrum',  name: 'Arbitrum One',      fee: '~0.0001 ETH' },
{ id: 'optimism',  name: 'Optimism',          fee: '~0.0001 ETH' }],
SOL:  [{ id: 'solana',    name: 'Solana',            fee: '~0.000005 SOL' }],
USDT: [{ id: 'ethereum',  name: 'Ethereum (ERC-20)', fee: '~2 USDT' },
{ id: 'tron',      name: 'TRON (TRC-20)',     fee: '~1 USDT' },
{ id: 'bsc',       name: 'BNB Smart Chain',   fee: '~0.5 USDT' }],
BNB:  [{ id: 'bsc',       name: 'BNB Smart Chain',   fee: '~0.0005 BNB' },
{ id: 'opbnb',     name: 'opBNB',             fee: '~0.00001 BNB' }],
ADA:  [{ id: 'cardano',   name: 'Cardano',           fee: '~0.17 ADA' }],
};

// ─── ADDRESS GENERATORS ───────────────────────────────────────────────────────
const rand = (chars, len) =>
Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

const HEX    = '0123456789abcdef';
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BECH32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

const generateAddress = (coinId, networkId) => {
switch (coinId) {
case 'BTC':
if (networkId === 'lightning') return `lnbc${rand('0123456789', 8)}p1${rand(BECH32, 80)}`;
return `bc1q${rand(BECH32, 38)}`; // bech32 native segwit

case 'ETH':
case 'USDT':
if (networkId === 'ethereum' || networkId === 'arbitrum' || networkId === 'optimism')
return `0x${rand(HEX, 40)}`;
if (networkId === 'bsc') return `0x${rand(HEX, 40)}`;
return `0x${rand(HEX, 40)}`;

case 'SOL':
return rand(BASE58, 44);

case 'BNB':
return `0x${rand(HEX, 40)}`;

case 'ADA':
return `addr1${rand(BECH32, 53)}`;

default:
return rand(BASE58, 42);

}
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Transfer() {
const [mode, setMode]       = useState('send');
const [step, setStep]       = useState(1);
const [loading, setLoading] = useState(false);

const [form, setForm] = useState({
coin:    'BTC',
network: NETWORKS.BTC[0].id,
amount:  '',
address: '',
note:    '',
});

const { balances, sendCrypto } = useWalletStore();

const selectedCoin    = COINS.find(c => c.id === form.coin);
const availableNets   = NETWORKS[form.coin] || [];
const selectedNetwork = availableNets.find(n => n.id === form.network) || availableNets[0];

// Stable receive addresses per session (regenerate when coin/network changes)
const receiveAddress = useMemo(
() => generateAddress(form.coin, form.network),
[form.coin, form.network]
);

const handleCoinChange = (coinId) => {
const firstNet = NETWORKS[coinId]?.[0]?.id || '';
setForm(p => ({ p, coin: coinId, network: firstNet, amount: '', address: '' }));
};

const handleNetworkChange = (netId) => {
setForm(p => ({ p, network: netId }));
};

const handleSend = () => {
if (!form.address)                                              return toast.error('Enter recipient address');
if (!form.amount || parseFloat(form.amount) <= 0)              return toast.error('Enter a valid amount');
if (parseFloat(form.amount) > (balances[form.coin] || 0))      return toast.error('Insufficient balance');
setStep(2);
};

const handleConfirmSend = async () => {
setLoading(true);
const res = await sendCrypto({
coin:      form.coin,
network:   form.network,
amount:    parseFloat(form.amount),
toAddress: form.address,
note:      form.note,
});
setLoading(false);
if (res.success) {
toast.success(`Sent ${form.amount} ${form.coin} on ${selectedNetwork?.name}!`);
setStep(3);
} else {
toast.error(res.message);
}
};

const reset = () => {
setForm({ coin: 'BTC', network: NETWORKS.BTC[0].id, amount: '', address: '', note: '' });
setStep(1);
};

// ── Shared: Coin selector ──────────────────────────────────────────────────
const CoinSelector = () => (

<div style={{ marginBottom: 18 }}>
<label style={labelStyle}>SELECT COIN</label>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
{COINS.map((coin) => (
<button
key={coin.id}
onClick={() => handleCoinChange(coin.id)}
style={{
padding: '10px 6px',
border: `1px solid ${form.coin === coin.id ? coin.color : 'var(--glass-border)'}`,
borderRadius: 10,
background: form.coin === coin.id ? `${coin.color}18` : 'rgba(255,255,255,0.03)',
cursor: 'pointer',
transition: 'all 0.2s',
color: 'white',
}}
>
<div style={{ fontSize: 18, marginBottom: 3, color: coin.color }}>{coin.icon}</div>
<div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10 }}>{coin.id}</div>
{mode === 'send' && (
<div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>
{(balances[coin.id] || 0).toFixed(4)}
</div>
)}
</button>
))}
</div>
</div>
);

// ── Shared: Network selector ───────────────────────────────────────────────
const NetworkSelector = () => (

<div style={{ marginBottom: 18 }}>
<label style={labelStyle}>NETWORK</label>
<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
{availableNets.map((net) => (
<button
key={net.id}
onClick={() => handleNetworkChange(net.id)}
style={{
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center',
padding: '10px 14px',
border: `1px solid ${form.network === net.id ? selectedCoin?.color : 'var(--glass-border)'}`,
borderRadius: 8,
background: form.network === net.id ? `${selectedCoin?.color}12` : 'rgba(255,255,255,0.02)',
cursor: 'pointer',
transition: 'all 0.2s',
color: 'white',
textAlign: 'left',
}}
>
<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
<div style={{
width: 8, height: 8, borderRadius: '50%',
background: form.network === net.id ? selectedCoin?.color : 'var(--glass-border)',
transition: 'background 0.2s',
}} />
<span style={{ fontFamily: 'Orbitron, monospace', fontSize: 11 }}>{net.name}</span>
</div>
<span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
{net.fee}
</span>
</button>
))}
</div>
</div>
);

// ── RENDER ─────────────────────────────────────────────────────────────────
return (

<div>
<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
<h1 className="font-orbitron" style={{ fontSize: 24, marginBottom: 6 }}>💸 Send & Receive</h1>
<p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Transfer crypto across the galaxy</p>
</motion.div>

{/* Mode toggle */}

  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4, width: 260, marginBottom: 28 }}>
    {['send', 'receive'].map((m) => (
      <button
        key={m}
        onClick={() => { setMode(m); reset(); }}
        style={{
          flex: 1, padding: '10px', border: 'none', borderRadius: 10,
          background: mode === m ? 'linear-gradient(135deg, var(--cosmic-blue), var(--nebula-purple))' : 'transparent',
          color: mode === m ? 'white' : 'var(--text-secondary)',
          fontFamily: 'Orbitron, monospace', fontSize: 13, cursor: 'pointer',
          transition: 'all 0.3s', letterSpacing: 1,
        }}
      >
        {m === 'send' ? '↗️ SEND' : '↙️ RECEIVE'}
      </button>
    ))}
  </div>

  <div style={{ maxWidth: 540, margin: '0 auto' }}>
    <AnimatePresence mode="wait">

```
  {/* ── SEND MODE ── */}
  {mode === 'send' && (
    <motion.div key="send" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

      {step === 1 && (
        <div className="glass-card" style={{ padding: 32 }}>
          <h3 className="font-orbitron" style={{ fontSize: 16, marginBottom: 24 }}>↗️ SEND CRYPTO</h3>

          <CoinSelector />
          <NetworkSelector />

          {/* Amount */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              AMOUNT · Available:&nbsp;
              <span style={{ color: selectedCoin?.color }}>
                {(balances[form.coin] || 0).toFixed(6)} {form.coin}
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="galaxy-input"
                type="number"
                placeholder="0.000000"
                value={form.amount}
                onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
                style={{ fontSize: 20, fontFamily: 'Orbitron, monospace', paddingRight: 80 }}
                min="0"
              />
              <button
                onClick={() => setForm(p => ({ ...p, amount: String(balances[form.coin] || 0) }))}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: '1px solid var(--star-cyan)', borderRadius: 6,
                  color: 'var(--star-cyan)', padding: '4px 8px', cursor: 'pointer',
                  fontSize: 11, fontFamily: 'Orbitron, monospace',
                }}
              >
                MAX
              </button>
            </div>
          </div>

          {/* Recipient address */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>RECIPIENT ADDRESS</label>
            <input
              className="galaxy-input"
              placeholder={`Enter ${form.coin} ${selectedNetwork?.name} address`}
              value={form.address}
              onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
              style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 13 }}
            />
          </div>

          {/* Note */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>NOTE (OPTIONAL)</label>
            <input
              className="galaxy-input"
              placeholder="Add a memo..."
              value={form.note}
              onChange={(e) => setForm(p => ({ ...p, note: e.target.value }))}
            />
          </div>

          <button className="btn-primary" onClick={handleSend} style={{ width: '100%' }}>
            REVIEW TRANSACTION →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="glass-card animated-border" style={{ padding: 32 }}>
          <h3 className="font-orbitron" style={{ fontSize: 16, marginBottom: 24, textAlign: 'center' }}>⚡ CONFIRM SEND</h3>
          {[
            { label: 'Coin',    value: `${selectedCoin?.name} (${form.coin})` },
            { label: 'Network', value: selectedNetwork?.name },
            { label: 'Amount',  value: `${form.amount} ${form.coin}` },
            { label: 'Fee',     value: selectedNetwork?.fee },
            { label: 'To',      value: form.address.slice(0, 22) + '...' },
            { label: 'Note',    value: form.note || '--' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid var(--glass-border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace', fontSize: 13 }}>{label}</span>
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, color: 'white', maxWidth: 220, wordBreak: 'break-all', textAlign: 'right' }}>{value}</span>
            </div>
          ))}
          <div style={{ margin: '20px 0', padding: 12, background: 'rgba(255,49,49,0.1)', border: '1px solid rgba(255,49,49,0.3)', borderRadius: 8 }}>
            <p style={{ color: 'var(--danger-red)', fontSize: 13, fontFamily: 'Share Tech Mono, monospace' }}>
              ⚠️ Crypto transactions are irreversible. Verify the address and network before confirming.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← BACK</button>
            <button className="btn-primary" onClick={handleConfirmSend} disabled={loading} style={{ flex: 2 }}>
              {loading ? 'SENDING...' : '🚀 CONFIRM SEND'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <motion.div animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }} style={{ fontSize: 72, marginBottom: 16 }}>🚀</motion.div>
          <h2 className="font-orbitron gradient-text" style={{ fontSize: 22, marginBottom: 12 }}>TRANSACTION SENT!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: 14 }}>
            {form.amount} {form.coin} is launching across the galaxy
          </p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 12, fontFamily: 'Share Tech Mono, monospace' }}>
            via {selectedNetwork?.name}
          </p>
          <button className="btn-primary" onClick={reset}>SEND ANOTHER</button>
        </div>
      )}
    </motion.div>
  )}

  {/* ── RECEIVE MODE ── */}
  {mode === 'receive' && (
    <motion.div key="receive" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="glass-card" style={{ padding: 32 }}>
        <h3 className="font-orbitron" style={{ fontSize: 16, marginBottom: 24 }}>↙️ RECEIVE CRYPTO</h3>

        <CoinSelector />
        <NetworkSelector />

        {/* QR + address display */}
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: 180, height: 180, margin: '0 auto 20px',
            background: 'white', borderRadius: 12, padding: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `3px solid ${selectedCoin?.color}`,
            boxShadow: `0 0 30px ${selectedCoin?.color}44`,
          }}>
            <QRCodeSVG address={receiveAddress} color={selectedCoin?.color} />
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Orbitron, monospace', marginBottom: 8, letterSpacing: 1 }}>
            YOUR {form.coin} ADDRESS · {selectedNetwork?.name}
          </div>

          <div style={{
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${selectedCoin?.color}44`,
            borderRadius: 10,
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: 12,
            color: 'white',
            wordBreak: 'break-all',
            marginBottom: 16,
            lineHeight: 1.6,
          }}>
            {receiveAddress}
          </div>

          <button
            className="btn-secondary"
            onClick={() => { navigator.clipboard.writeText(receiveAddress); toast.success('Address copied!'); }}
            style={{ width: '100%', marginBottom: 12 }}
          >
            📋 COPY ADDRESS
          </button>
        </div>

        <div style={{ padding: 12, background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace', textAlign: 'center' }}>
            ✅ Only send {form.coin} on the {selectedNetwork?.name} network to this address.
            Sending other assets or using the wrong network may result in permanent loss.
          </p>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

  </div>
</div>

);
}

// ─── Deterministic-looking QR SVG ─────────────────────────────────────────────
// Seeded from the address string so it doesn’t flicker on re-render
function QRCodeSVG({ address, color }) {
const seed = address.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
const pseudo = (i) => ((seed * 1103515245 + i * 12345) >>> 0) % 100;

return (
<svg width="156" height="156" viewBox="0 0 156 156">
<rect width="156" height="156" fill="white" />
{/* Finder patterns */}
{[[10,10],[106,10],[10,106]].map(([x,y],i) => (
<g key={i}>
<rect x={x}   y={y}   width="40" height="40" fill="black"  rx="4" />
<rect x={x+6} y={y+6} width="28" height="28" fill="white"  rx="2" />
<rect x={x+12} y={y+12} width="16" height="16" fill="black" rx="1" />
</g>
))}
{/* Data modules seeded from address */}
{Array.from({ length: 48 }).map((_, i) => (
pseudo(i) > 38 ? (
<rect key={i}
x={58 + (i % 6) * 9}
y={58 + Math.floor(i / 6) * 9}
width='7' height='7' fill='black'
/>
) : null
))}
{/* Coin color accent dot */}
<circle cx="78" cy="78" r="10" fill={color} opacity="0.15" />
</svg>
);
}

// ─── Shared label style ───────────────────────────────────────────────────────
const labelStyle = {
display: 'block',
fontSize: 12,
color: 'var(–text-secondary)',
marginBottom: 8,
fontFamily: 'Orbitron, monospace',
letterSpacing: 1,
};