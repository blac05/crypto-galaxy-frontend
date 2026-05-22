import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../store';

const PAYMENT_METHODS = [
  { id: 'wire', name: 'Wire Transfer', icon: '🏦', color: '#1A6DFF', desc: 'Bank-to-bank transfer', fee: '0.5%' },
  { id: 'paypal', name: 'PayPal', icon: '🅿️', color: '#003087', desc: 'Pay via PayPal balance', fee: '1.5%' },
  { id: 'cashapp', name: 'Cash App', icon: '💵', color: '#00D632', desc: 'Pay via $Cashtag', fee: '1.5%' },
  { id: 'zelle', name: 'Zelle', icon: '⚡', color: '#6D1ED4', desc: 'Instant bank transfer', fee: '0%' },
  { id: 'maestro', name: 'Maestro Europe', icon: '🔴', color: '#0099DF', desc: 'European debit network', fee: '1.1%' },
  { id: 'neteller', name: 'Neteller', icon: '🌐', color: '#9F1354', desc: 'Digital wallet', fee: '2%' },
  { id: 'zengo', name: 'ZenGo', icon: '🔑', color: '#FF6B35', desc: 'Keyless crypto wallet', fee: '0.5%' },
  { id: 'venmo', name: 'Venmo Neon', icon: '🔷', color: '#008CFF', desc: 'Social mobile payments', fee: '1.2%' },
  { id: 'applepay', name: 'Apple Pay', icon: '🍎', color: '#000000', desc: 'Pay with Apple devices', fee: '1.5%' },
  { id: 'googlepay', name: 'Google Pay', icon: '🤖', color: '#4285F4', desc: 'Pay with Google account', fee: '1.5%' },
  { id: 'samsungpay', name: 'Samsung Pay', icon: '📱', color: '#1428A0', desc: 'Pay with Samsung devices', fee: '1.5%' },
  { id: 'alipay', name: 'Alipay', icon: '🉐', color: '#00A0E9', desc: 'Popular in China', fee: '1.5%' },
  { id: 'wechat', name: 'WeChat Pay', icon: '💬', color: '#7BB32E', desc: 'Popular in China', fee: '1.5%' },
  { id: 'discover', name: 'Discover Platinum', icon: '🌐', color: '#FF6000', desc: 'Modern cashback banking', fee: '1.5%' },
  { id: 'payoneer', name: 'Payoneer', icon: '🧾', color: '#FF5A00', desc: 'Global payments platform', fee: '2%' },
  { id: 'skrill', name: 'Skrill', icon: '💸', color: '#4A148C', desc: 'Digital wallet and payments', fee: '1.9%' },
  { id: 'revolut', name: 'Revolut', icon: '🔄', color: '#8A2BE2', desc: 'Global banking alternative', fee: '1%' },
  { id: 'n26', name: 'N26', icon: '🏦', color: '#00BFFF', desc: 'Mobile banking for Europe', fee: '1.5%' },
  { id: 'stripe', name: 'Stripe Atlas', icon: '🟣', color: '#635BFF', desc: 'Modern online processing', fee: '1.7%' },
  { id: 'starling', name: 'Starling Bank', icon: '⭐', color: '#4A90E2', desc: 'UK-based mobile bank', fee: '1.5%' },
  { id: 'bunq',  name: 'bunq Elite', icon: '🌈', color: '#00C244', desc: 'Dutch eco digital bank', fee: '1.2%' },
  { id: 'wirex', name: 'Wirex', icon: '🔗', color: '#1E90FF', desc: 'Crypto-friendly payment card', fee: '1.5%' },
  { id: 'paypay', name: 'PayPay', icon: '💴', color: '#FF4081', desc: 'Popular in Japan', fee: '1.5%' },
  { id: 'mollie', name: 'Mollie', icon: '🌍', color: '#FF5722', desc: 'European payment gateway', fee: '1.5%' },
  { id: 'maestro', name: 'Maestro Europe', icon: '🔴', color: '#0099DF', desc: 'European debit network', fee: '1.1%' },
  { id: 'square', name: 'Square', icon: '⬛', color: '#000000', desc: 'Pay with Square account', fee: '1.5%' },
  { id: 'amex', name: 'American Express Gold',  icon: '🟦', color: '#2E77BC', desc: 'Luxury rewards network', fee: '1.8%' },
  { id: 'visa', name: 'Visa Infinite', icon: '💳', color: '#1A1F71', desc: 'Global premium payments', fee: '1.2%' },
  { id: 'mastercard', name: 'Mastercard Black', icon: '🟠', color: '#EB001B', desc: 'Elite worldwide banking', fee: '1.4%' },
];

const COINS = ['BTC', 'ETH', 'SOL', 'USDT'];

export default function Payments() {
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState(1); // 1: select method, 2: enter details, 3: confirm, 4: done
  const [form, setForm] = useState({ coin: 'BTC', amount: '', details: '' });
  const [loading, setLoading] = useState(false);
  const [txRef, setTxRef] = useState('');

  const method = PAYMENT_METHODS.find(m => m.id === selected);

  const handleSelect = (id) => { setSelected(id); setStep(2); };

  const handleSubmit = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.error('Enter valid amount');
    setStep(3);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await api.post('/payments/initiate', {
        method: selected,
        coin: form.coin,
        amount: parseFloat(form.amount),
        details: form.details,
      });
      setTxRef(res.data.reference);
      setStep(4);
      toast.success('Payment initiated! Confirmation sent to your email & phone.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setSelected(null); setStep(1); setForm({ coin: 'BTC', amount: '', details: '' }); setTxRef(''); };

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 className="font-orbitron" style={{ fontSize: 24, marginBottom: 6 }}>💳 Payment Methods</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Buy crypto using your preferred payment method</p>
      </motion.div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {['Select Method', 'Enter Details', 'Confirm', 'Done'].map((label, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              height: 4, borderRadius: 2, marginBottom: 6,
              background: i < step ? 'linear-gradient(90deg, var(--cosmic-blue), var(--star-cyan))' : 'var(--glass-border)',
              transition: 'all 0.4s ease',
            }} />
            <span style={{ fontSize: 11, color: i < step ? 'var(--star-cyan)' : 'var(--text-secondary)', fontFamily: 'Orbitron, monospace' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* STEP 1: Select payment method */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {PAYMENT_METHODS.map((pm, i) => (
                <motion.div
                  key={pm.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card"
                  onClick={() => handleSelect(pm.id)}
                  style={{
                    padding: '24px 20px', textAlign: 'center', cursor: 'pointer',
                    border: `1px solid ${pm.color}33`,
                    transition: 'all 0.3s ease',
                  }}
                  whileHover={{ scale: 1.04, y: -4, borderColor: pm.color }}
                >
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{pm.icon}</div>
                  <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, color: 'white', fontWeight: 700, marginBottom: 6 }}>
                    {pm.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{pm.desc}</div>
                  <div style={{
                    display: 'inline-block', padding: '3px 10px',
                    background: `${pm.color}22`, border: `1px solid ${pm.color}44`,
                    borderRadius: 20, color: pm.color,
                    fontFamily: 'Share Tech Mono, monospace', fontSize: 11,
                  }}>
                    Fee: {pm.fee}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: Enter details */}
        {step === 2 && method && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ maxWidth: 520, margin: '0 auto' }}>
              <div className="glass-card" style={{ padding: 32 }}>
                {/* Method header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, padding: '16px', background: `${method.color}11`, borderRadius: 12, border: `1px solid ${method.color}33` }}>
                  <span style={{ fontSize: 36 }}>{method.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 16, color: 'white', marginBottom: 4 }}>{method.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{method.desc} · Fee: {method.fee}</div>
                  </div>
                </div>

                {/* Coin select */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontFamily: 'Orbitron, monospace', letterSpacing: 1 }}>SELECT COIN TO BUY</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {COINS.map((coin) => (
                      <button
                        key={coin}
                        onClick={() => setForm(p => ({ ...p, coin }))}
                        style={{
                          padding: '10px',
                          background: form.coin === coin ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${form.coin === coin ? 'var(--star-cyan)' : 'var(--glass-border)'}`,
                          borderRadius: 8, color: form.coin === coin ? 'var(--star-cyan)' : 'var(--text-secondary)',
                          fontFamily: 'Orbitron, monospace', fontSize: 13, cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {coin}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontFamily: 'Orbitron, monospace', letterSpacing: 1 }}>AMOUNT (USD)</label>
                  <input
                    className="galaxy-input"
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
                    style={{ fontSize: 22, fontFamily: 'Orbitron, monospace' }}
                    min="0"
                  />
                </div>

                {/* Payment details */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontFamily: 'Orbitron, monospace', letterSpacing: 1 }}>
                    {selected === 'wire' ? 'BANK ACCOUNT NUMBER' :
                     selected === 'paypal' ? 'PAYPAL EMAIL' :
                     selected === 'cashapp' ? '$CASHTAG' :
                     selected === 'zelle' ? 'ZELLE EMAIL/PHONE' :
                     selected === 'card' ? 'CARD NUMBER' : 'ACCOUNT DETAILS'}
                  </label>
                  <input
                    className="galaxy-input"
                    placeholder={
                      selected === 'wire' ? 'IBAN or account number' :
                      selected === 'paypal' ? 'you@paypal.com' :
                      selected === 'cashapp' ? '$YourCashtag' :
                      selected === 'zelle' ? 'email or phone number' :
                      selected === 'card' ? '•••• •••• •••• ••••' : 'Enter details'
                    }
                    value={form.details}
                    onChange={(e) => setForm(p => ({ ...p, details: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn-secondary" onClick={reset} style={{ flex: 1 }}>← BACK</button>
                  <button className="btn-primary" onClick={handleSubmit} style={{ flex: 2 }}>
                    CONTINUE →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Confirm */}
        {step === 3 && method && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ maxWidth: 520, margin: '0 auto' }}>
              <div className="glass-card animated-border" style={{ padding: 32 }}>
                <h3 className="font-orbitron" style={{ fontSize: 18, marginBottom: 24, textAlign: 'center' }}>⚡ CONFIRM TRANSACTION</h3>

                {[
                  { label: 'Method', value: `${method.icon} ${method.name}` },
                  { label: 'Buying', value: form.coin },
                  { label: 'Amount', value: `$${parseFloat(form.amount).toLocaleString()}` },
                  { label: 'Fee', value: `${method.fee} ($${(parseFloat(form.amount) * parseFloat(method.fee) / 100).toFixed(2)})` },
                  { label: 'Total', value: `$${(parseFloat(form.amount) * (1 + parseFloat(method.fee) / 100)).toFixed(2)}` },
                  { label: 'Details', value: form.details },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace', fontSize: 13 }}>{label}</span>
                    <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, color: 'white' }}>{value}</span>
                  </div>
                ))}

                <div style={{ margin: '20px 0', padding: '12px 16px', background: 'rgba(255,159,0,0.1)', border: '1px solid rgba(255,159,0,0.3)', borderRadius: 8 }}>
                  <p style={{ fontSize: 13, color: 'var(--warning-amber)', fontFamily: 'Share Tech Mono, monospace' }}>
                    ⚠️ You will receive a confirmation via email and SMS. Transaction is irreversible after confirmation.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn-secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>← BACK</button>
                  <button className="btn-primary" onClick={handleConfirm} disabled={loading} style={{ flex: 2 }}>
                    {loading ? 'PROCESSING...' : '🔐 CONFIRM & PAY'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Done */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
              <div className="glass-card" style={{ padding: 40 }}>
                <motion.div animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }} style={{ fontSize: 72, marginBottom: 16 }}>✅</motion.div>
                <h2 className="font-orbitron gradient-text" style={{ fontSize: 24, marginBottom: 12 }}>PAYMENT INITIATED</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 15 }}>
                  Your transaction has been submitted for processing.
                </p>
                <div style={{ padding: '16px', background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 10, marginBottom: 24 }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'Share Tech Mono, monospace', marginBottom: 4 }}>TRANSACTION REFERENCE</p>
                  <p className="font-orbitron text-glow-cyan" style={{ fontSize: 16, letterSpacing: 2 }}>{txRef}</p>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24, fontFamily: 'Share Tech Mono, monospace' }}>
                  📧 Confirmation sent to your email<br />
                  📱 SMS notification sent to your phone
                </p>
                <button className="btn-primary" onClick={reset}>MAKE ANOTHER PAYMENT</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
