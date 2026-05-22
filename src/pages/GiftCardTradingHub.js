import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../store';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Shopping', 'Entertainment', 'Gaming', 'Tech', 'Food', 'Other'];

const CATEGORY_ICONS = {
  Shopping: '🛍️', Entertainment: '🎬', Gaming: '🎮', Tech: '💻', Food: '🍔', 
};

export default function GiftCardHub() {
  const [tab, setTab] = useState('marketplace');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [activeChatCardId, setActiveChatCardId] = useState(null);
  const [validatorCode, setValidatorCode] = useState('');
  const [validatorType, setValidatorType] = useState('Gift Card');
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [sellForm, setSellForm] = useState({ brand: '', value: '', asking: '', type: 'Gift Card', code: '', category: 'Shopping', expires: '' });
  const [selling, setSelling] = useState(false);
  const [escrowCard, setEscrowCard] = useState(null);
  const chatEndRef = useRef(null);

  // Fetch listings from backend
  const fetchListings = useCallback(async () => {
    setLoadingListings(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.set('category', category);
      if (search) params.set('search', search);
      const res = await api.get(`/gift-cards?${params}`);
      setListings(res.data.cards || []);
    } catch {
      toast.error('Failed to load listings');
    } finally {
      setLoadingListings(false);
    }
  }, [category, search]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleValidate = async () => {
    if (!validatorCode.trim()) return;
    setValidating(true);
    setValidationResult(null);
    try {
      const res = await api.post('/gift-cards/validate', { code: validatorCode, type: validatorType });
      setValidationResult(res.data);
    } catch {
      toast.error('Validation request failed');
    } finally {
      setValidating(false);
    }
  };

  const handleSell = async () => {
    const { brand, value, asking, code, type, category: cat, expires } = sellForm;
    if (!brand || !value || !asking || !code) {
      toast.error('Fill all required fields');
      return;
    }
    setSelling(true);
    try {
      await api.post('/gift-cards', { brand, value, asking, code, type, category: cat, expires });
      toast.success('✅ Listing posted and validated!');
      setSellForm({ brand: '', value: '', asking: '', type: 'Gift Card', code: '', category: 'Shopping', expires: '' });
      setTab('marketplace');
      fetchListings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to post listing';
      toast.error(msg);
    } finally {
      setSelling(false);
    }
  };

  const handleBuyEscrow = async (card) => {
    try {
      await api.post(`/gift-cards/${card._id}/buy`);
      setEscrowCard(card);
      toast.success(`🔒 Escrow started for ${card.brand} ${card.type}`);
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Escrow failed');
    }
  };

  const handleConfirm = async () => {
    if (!escrowCard) return;
    try {
      const res = await api.post(`/gift-cards/${escrowCard._id}/confirm`);
      toast.success(`✅ Confirmed! Your code: ${res.data.code}`);
      setEscrowCard(null);
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Confirm failed');
    }
  };

  const openChat = async (card) => {
    setActiveChatCardId(card._id);
    setSelectedCard(card);
    setTab('chat');
    try {
      const res = await api.get(`/gift-cards/${card._id}/messages`);
      setMessages(res.data.messages || []);
    } catch {
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!msgInput.trim() || !activeChatCardId) return;
    const text = msgInput.trim();
    setMsgInput('');
    try {
      await api.post(`/gift-cards/${activeChatCardId}/message`, { text });
      const res = await api.get(`/gift-cards/${activeChatCardId}/messages`);
      setMessages(res.data.messages || []);
    } catch {
      toast.error('Message failed');
    }
  };

  const openValidatorForCard = (card) => {
    setValidatorCode('');
    setValidatorType(card.type);
    setValidationResult(null);
    setTab('validator');
  };

  const scoreColor = (s) => s >= 80 ? '#00ff88' : s >= 60 ? '#ffd700' : '#ff4466';

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif", minHeight: '100vh', color: '#e2e8f0' }}>
      <style>{`
        .gc-card-hover { transition: all 0.25s cubic-bezier(.4,0,.2,1); cursor: pointer; }
        .gc-card-hover:hover { transform: translateY(-4px); box-shadow: 0 0 30px rgba(99,102,241,0.35); border-color: #6366f1 !important; }
        .gc-btn { transition: all 0.2s; cursor: pointer; border: none; }
        .gc-btn:hover { box-shadow: 0 0 20px rgba(99,102,241,0.5); transform: scale(1.02); }
        .gc-tab { transition: all 0.2s; cursor: pointer; border: none; }
        .gc-pulse { animation: gcpulse 2s infinite; }
        @keyframes gcpulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .gc-slide { animation: gcslide 0.3s ease; }
        @keyframes gcslide { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
        .gc-verified { display:inline-flex;align-items:center;gap:3px;background:rgba(0,255,136,0.15);color:#00ff88;border:1px solid rgba(0,255,136,0.3);border-radius:4px;padding:1px 6px;font-size:10px;font-weight:600; }
        .gc-risk { background:rgba(255,68,102,0.1);border:1px solid rgba(255,68,102,0.3);border-radius:6px;padding:6px 10px;color:#ff6688;font-size:12px;margin-top:4px; }
        input:focus,select:focus,textarea:focus { border-color:#6366f1 !important; outline:none; box-shadow:0 0 0 2px rgba(99,102,241,0.2); }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)', borderBottom: '1px solid #1e293b', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎴</div>
          <div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 900, background: 'linear-gradient(90deg,#6366f1,#a78bfa,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CARD NEXUS</div>
            <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 2 }}>CRYPTO GALAXY MODULE</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[['marketplace','🏪 Market'], ['sell','💸 Sell'], ['validator','🛡️ Validate'], ['chat','💬 Chat']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} className="gc-tab" style={{ padding: '8px 14px', borderRadius: 8, background: tab === t ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.05)', color: tab === t ? '#fff' : '#94a3b8', fontSize: 12, fontWeight: 600, letterSpacing: 1, border: tab === t ? 'none' : '1px solid #1e293b' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Escrow Banner */}
      {escrowCard && (
        <div style={{ background: 'rgba(0,255,136,0.06)', borderBottom: '1px solid rgba(0,255,136,0.2)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#00ff88' }}>🔒 Escrow Active: <strong>{escrowCard.brand} {escrowCard.type}</strong> — Confirm receipt to release code</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleConfirm} className="gc-btn" style={{ padding: '6px 16px', background: 'linear-gradient(135deg,#059669,#0d9488)', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✅ Confirm & Get Code</button>
            <button onClick={() => setEscrowCard(null)} className="gc-btn" style={{ padding: '6px 12px', background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.3)', borderRadius: 8, color: '#ff6688', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 20px' }}>

        {/* ── MARKETPLACE ── */}
        {tab === 'marketplace' && (
          <div className="gc-slide">
            <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search cards, vouchers, coupons..." style={{ flex: 1, minWidth: 200, padding: '10px 16px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, color: '#e2e8f0', fontSize: 14 }} />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)} className="gc-tab" style={{ padding: '8px 12px', borderRadius: 8, background: category === c ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)', color: category === c ? '#a78bfa' : '#64748b', border: `1px solid ${category === c ? '#6366f1' : '#1e293b'}`, fontSize: 12, fontWeight: 600 }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {[['🏪', 'Listings', listings.length], ['✅', 'Verified', listings.filter(l => l.verified).length], ['🛡️', 'Escrow Protected', '100%'], ['⚡', 'Avg Response', '< 2 min']].map(([ic, label, val]) => (
                <div key={label} style={{ flex: 1, minWidth: 110, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '10px 14px' }}>
                  <div>{ic}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Orbitron',monospace", color: '#e2e8f0' }}>{val}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{label}</div>
                </div>
              ))}
            </div>

            {loadingListings && <div style={{ textAlign: 'center', color: '#6366f1', padding: 40, fontSize: 14 }} className="gc-pulse">Loading listings...</div>}

            {!loadingListings && listings.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎴</div>
                <div>No listings yet. Be the first to sell!</div>
                <button onClick={() => setTab('sell')} className="gc-btn" style={{ marginTop: 16, padding: '10px 24px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Post a Listing</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {listings.map(card => (
                <div key={card._id} className="gc-card-hover" style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: 20, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: 'rgba(99,102,241,0.08)', borderRadius: '50%', filter: 'blur(20px)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontSize: 32 }}>{CATEGORY_ICONS[card.category] || '🎁'}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{card.brand}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{card.type} · {card.category}</div>
                      </div>
                    </div>
                    {card.verified && <span className="gc-verified">✓ VERIFIED</span>}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(99,102,241,0.06)', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                    <div><div style={{ fontSize: 10, color: '#64748b' }}>FACE VALUE</div><div style={{ fontSize: 20, fontWeight: 700 }}>${card.value}</div></div>
                    <div style={{ textAlign: 'right' }}><div style={{ fontSize: 10, color: '#64748b' }}>ASKING</div><div style={{ fontSize: 20, fontWeight: 700, color: '#00ff88' }}>${card.asking}</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 10, color: '#64748b' }}>SAVE</div><div style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>{Math.round((1 - card.asking / card.value) * 100)}%</div></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 14 }}>
                    <span>👤 {card.sellerName}</span>
                    <span>⭐ {card.sellerRating?.toFixed(1)}</span>
                    {card.expires && <span>📅 {card.expires}</span>}
                  </div>

                  {card.trustScore > 0 && (
                    <div style={{ marginBottom: 10, fontSize: 11, color: scoreColor(card.trustScore) }}>🛡️ Trust Score: {card.trustScore}</div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleBuyEscrow(card)} className="gc-btn" style={{ flex: 1, padding: '10px 0', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      🛒 Buy (Escrow)
                    </button>
                    <button onClick={() => openChat(card)} className="gc-btn" style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid #1e293b', borderRadius: 8, color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>💬</button>
                    <button onClick={() => openValidatorForCard(card)} className="gc-btn" style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid #1e293b', borderRadius: 8, color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>🛡️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SELL ── */}
        {tab === 'sell' && (
          <div className="gc-slide" style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 32 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, marginBottom: 6, background: 'linear-gradient(90deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>POST A LISTING</div>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>Your card is validated before going live. Fraudulent codes are rejected automatically.</p>

              <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#a78bfa' }}>
                🛡️ <strong>Anti-Fraud:</strong> Codes are checked against our blacklist. Listing a fake card results in a permanent ban.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[['brand', 'Brand *', 'text', 'Amazon, Netflix…'], ['value', 'Face Value ($) *', 'number', '100'], ['asking', 'Asking Price ($) *', 'number', '88'], ['expires', 'Expiry Date', 'date', '']].map(([key, label, type, ph]) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 5, fontWeight: 600 }}>{label}</label>
                    <input type={type} placeholder={ph} value={sellForm[key]} onChange={e => setSellForm(p => ({ ...p, [key]: e.target.value }))} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0', fontSize: 14 }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 5, fontWeight: 600 }}>Type *</label>
                  <select value={sellForm.type} onChange={e => setSellForm(p => ({ ...p, type: e.target.value }))} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0', fontSize: 14 }}>
                    {['Gift Card', 'Coupon', 'Voucher'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 5, fontWeight: 600 }}>Category</label>
                  <select value={sellForm.category} onChange={e => setSellForm(p => ({ ...p, category: e.target.value }))} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0', fontSize: 14 }}>
                    {['Shopping', 'Entertainment', 'Gaming', 'Tech', 'Food'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 5, fontWeight: 600 }}>Card Code * (encrypted, only revealed after payment)</label>
                <input placeholder="e.g. AMZN-X4K2-9LMQ-7WRT" value={sellForm.code} onChange={e => setSellForm(p => ({ ...p, code: e.target.value }))} style={{ width: '100%', padding: '10px 14px', background: '#030712', border: '1px solid #1e293b', borderRadius: 8, color: '#00ff88', fontSize: 14, fontFamily: 'monospace', letterSpacing: 2 }} />
                <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>🔒 Hidden from buyers until escrow is confirmed.</div>
              </div>

              <button onClick={handleSell} disabled={selling} className="gc-btn" style={{ width: '100%', marginTop: 22, padding: 14, background: selling ? '#1e293b' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, cursor: selling ? 'not-allowed' : 'pointer' }}>
                {selling ? '⏳ Validating & Posting...' : '🚀 Post Listing'}
              </button>
            </div>
          </div>
        )}

        {/* ── VALIDATOR ── */}
        {tab === 'validator' && (
          <div className="gc-slide" style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 32 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, marginBottom: 6, background: 'linear-gradient(90deg,#00ff88,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🛡️ CARD VALIDATOR</div>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>Check any card's authenticity and fraud risk before transacting.</p>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6, fontWeight: 600 }}>Card Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Gift Card', 'Coupon', 'Voucher'].map(t => (
                    <button key={t} onClick={() => setValidatorType(t)} className="gc-tab" style={{ flex: 1, padding: '10px', background: validatorType === t ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)', color: validatorType === t ? '#a78bfa' : '#64748b', border: `1px solid ${validatorType === t ? '#6366f1' : '#1e293b'}`, borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6, fontWeight: 600 }}>Enter Code</label>
                <input value={validatorCode} onChange={e => setValidatorCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleValidate()} placeholder="AMZN-X4K2-9LMQ-7WRT" style={{ width: '100%', padding: '14px 18px', background: '#030712', border: '1px solid #334155', borderRadius: 10, color: '#00ff88', fontSize: 16, fontFamily: 'monospace', letterSpacing: 3 }} />
              </div>

              <button onClick={handleValidate} disabled={validating} className="gc-btn" style={{ width: '100%', padding: 14, background: validating ? '#1e293b' : 'linear-gradient(135deg,#059669,#0d9488)', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, cursor: validating ? 'not-allowed' : 'pointer' }}>
                {validating ? '🔍 Scanning...' : '⚡ Validate Card'}
              </button>

              {validating && (
                <div style={{ marginTop: 20, padding: 18, background: '#030712', border: '1px solid #1e293b', borderRadius: 10 }}>
                  {['Checking format…', 'Cross-referencing blacklist…', 'Scanning for duplicates…', 'Scoring trust level…'].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 12, color: '#475569' }}>
                      <div className="gc-pulse" style={{ width: 6, height: 6, background: '#6366f1', borderRadius: '50%' }} />{s}
                    </div>
                  ))}
                </div>
              )}

              {validationResult && !validating && (
                <div className="gc-slide" style={{ marginTop: 20, background: validationResult.valid ? 'rgba(0,255,136,0.04)' : 'rgba(255,68,102,0.04)', border: `1px solid ${validationResult.valid ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,102,0.3)'}`, borderRadius: 12, padding: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: validationResult.valid ? '#00ff88' : '#ff4466' }}>
                      {validationResult.valid ? '✅ VALID' : '❌ INVALID / FLAGGED'}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 30, fontWeight: 900, color: scoreColor(validationResult.score) }}>{validationResult.score}</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>TRUST SCORE</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    {[['Status', validationResult.status, validationResult.valid ? '#00ff88' : '#ff4466'], ['Format', validationResult.formatOk ? '✓ Valid' : '✗ Invalid', validationResult.formatOk ? '#00ff88' : '#ff4466']].map(([label, val, color]) => (
                      <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {validationResult.riskFlags?.length > 0 && validationResult.riskFlags.map((f, i) => <div key={i} className="gc-risk">{f}</div>)}

                  {validationResult.valid && (
                    <div style={{ marginTop: 12, background: 'rgba(0,255,136,0.07)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#00ff88' }}>
                      🟢 Safe to transact. Use Escrow for full protection.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginTop: 18, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: 22 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#a78bfa' }}>🛡️ Anti-Rip Protections</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[['🔒', 'Escrow System', 'Funds held until buyer confirms receipt'], ['🔍', 'Live Validation', 'Codes checked against fraud DB on backend'], ['📊', 'Trust Score', 'Every listing is scored 0–100 at post time'], ['🚫', 'Blacklist DB', 'Known scam patterns auto-rejected']].map(([ic, title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 18 }}>{ic}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{title}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CHAT ── */}
        {tab === 'chat' && (
          <div className="gc-slide" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14, height: 'calc(100vh - 220px)', minHeight: 400 }}>
            {/* Sidebar */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: 14, overflow: 'auto' }}>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>TRADE CHATS</div>
              {listings.slice(0, 10).map(card => (
                <div key={card._id} onClick={() => openChat(card)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: activeChatCardId === card._id ? 'rgba(99,102,241,0.15)' : 'transparent', border: activeChatCardId === card._id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent', marginBottom: 4, transition: 'all 0.2s' }}>
                  <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{(card.brand || '?').slice(0, 2).toUpperCase()}</div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.brand}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{card.type} · ${card.asking}</div>
                  </div>
                </div>
              ))}
              {listings.length === 0 && <div style={{ fontSize: 11, color: '#475569', textAlign: 'center', marginTop: 20 }}>No listings to chat about</div>}

              <div style={{ borderTop: '1px solid #1e293b', marginTop: 14, paddingTop: 14 }}>
                <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>SAFETY TIPS</div>
                {['Always use Escrow', 'Validate before paying', 'Never share personal info', 'Check Trust Score'].map(tip => (
                  <div key={tip} style={{ fontSize: 11, color: '#64748b', padding: '3px 0' }}>⚡ {tip}</div>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, display: 'flex', flexDirection: 'column' }}>
              {!selectedCard ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                  <div>Select a listing from the left to start a chat</div>
                </div>
              ) : (
                <>
                  <div style={{ padding: '12px 18px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                        {(selectedCard.brand || '?').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{selectedCard.brand} — {selectedCard.sellerName}</div>
                        <div style={{ fontSize: 11, color: '#00ff88' }}>● Active Listing · ${selectedCard.asking}</div>
                      </div>
                    </div>
                    <button onClick={() => toast('Report submitted to moderation team.', { icon: '🚩' })} className="gc-btn" style={{ padding: '6px 12px', background: 'rgba(255,68,102,0.08)', border: '1px solid rgba(255,68,102,0.2)', borderRadius: 8, color: '#ff6688', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      🚩 Report
                    </button>
                  </div>

                  <div style={{ flex: 1, overflow: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {messages.length === 0 && (
                      <div style={{ textAlign: 'center', color: '#475569', fontSize: 13, marginTop: 20 }}>Start the conversation about this listing.</div>
                    )}
                    {messages.map((msg, i) => {
                      const isMe = msg.senderName && !msg.senderName.includes(selectedCard.sellerName);
                      return (
                        <div key={i} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                          <div style={{ width: 28, height: 28, background: isMe ? 'linear-gradient(135deg,#059669,#0d9488)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {(msg.senderName || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ maxWidth: '65%' }}>
                            {!isMe && <div style={{ fontSize: 10, color: '#64748b', marginBottom: 3 }}>{msg.senderName}</div>}
                            <div style={{ background: isMe ? 'rgba(5,150,105,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isMe ? 'rgba(5,150,105,0.3)' : '#1e293b'}`, borderRadius: isMe ? '12px 4px 12px 12px' : '4px 12px 12px 12px', padding: '8px 12px', fontSize: 13, color: '#e2e8f0', lineHeight: 1.5 }}>
                              {msg.text}
                            </div>
                            <div style={{ fontSize: 10, color: '#475569', marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>
                              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message… (Enter to send)" style={{ flex: 1, padding: '10px 14px', background: '#030712', border: '1px solid #1e293b', borderRadius: 10, color: '#e2e8f0', fontSize: 14 }} />
                    <button onClick={handleSendMessage} className="gc-btn" style={{ padding: '10px 16px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>➤</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
