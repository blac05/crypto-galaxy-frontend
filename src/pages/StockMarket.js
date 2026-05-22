import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, 
} from 'recharts'
import toast from 'react-hot-toast';

// ─── Asset Catalogue ──────────────────────────────────────────────────────────
const STOCKS = [
  { id: 'AAPL',  name: 'Apple Inc.',         sector: 'Technology',    basePrice: 189.84,  icon: '🍎', cap: '2.94T', yield: '0.55%', pe: 31.2 },
  { id: 'MSFT',  name: 'Microsoft',          sector: 'Technology',    basePrice: 415.20,  icon: '🪟', cap: '3.08T', yield: '0.72%', pe: 36.8 },
  { id: 'NVDA',  name: 'NVIDIA Corp.',       sector: 'Technology',    basePrice: 875.40,  icon: '🎮', cap: '2.16T', yield: '0.03%', pe: 68.1 },
  { id: 'GOOGL', name: 'Alphabet Inc.',      sector: 'Technology',    basePrice: 175.00,  icon: '🔍', cap: '2.17T', yield: '0.00%', pe: 27.4 },
  { id: 'TSLA',  name: 'Tesla Inc.',         sector: 'Consumer',      basePrice: 248.50,  icon: '⚡', cap: '791B',  yield: '0.00%', pe: 55.3 },
  { id: 'AMZN',  name: 'Amazon.com',         sector: 'Consumer',      basePrice: 185.60,  icon: '📦', cap: '1.93T', yield: '0.00%', pe: 42.7 },
  { id: 'META',  name: 'Meta Platforms',     sector: 'Technology',    basePrice: 520.00,  icon: '👓', cap: '1.32T', yield: '0.40%', pe: 24.8 },
  { id: 'JPM',   name: 'JPMorgan Chase',     sector: 'Finance',       basePrice: 198.30,  icon: '🏦', cap: '570B',  yield: '2.20%', pe: 11.4 },
  { id: 'V',     name: 'Visa Inc.',          sector: 'Finance',       basePrice: 275.80,  icon: '💳', cap: '545B',  yield: '0.77%', pe: 30.1 },
  { id: 'WMT',   name: 'Walmart Inc.',       sector: 'Consumer',      basePrice: 67.40,   icon: '🏪', cap: '543B',  yield: '1.33%', pe: 29.6 },
  { id: 'JNJ',   name: 'Johnson & Johnson',  sector: 'Healthcare',    basePrice: 158.90,  icon: '💊', cap: '382B',  yield: '3.12%', pe: 15.8 },
  { id: 'XOM', name: 'ExxonMobil', sector: 'Energy', basePrice: 112.40, icon: '🛢️', cap: '448B', yield: '3.55%', pe: 13.9 },
  { id: 'BAC', name: 'Bank of America', sector: 'Finance', basePrice: 34.20, icon: '🏦', cap: '380B', yield: '2.10%', pe: 12.5 },
  { id: 'DIS', name: 'Walt Disney', sector: 'Consumer', basePrice: 98.50, icon: '🎬', cap: '320B', yield: '0.00%', pe: 38.2 },
  { id: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', basePrice: 46.80, icon: '💉', cap: '265B', yield: '3.80%', pe: 9.7 },
  { id: 'KO', name: 'Coca-Cola', sector: 'Consumer', basePrice: 62.30, icon: '🥤', cap: '270B', yield: '2.95%', pe: 25.4 },
  { id: 'CSCO', name: 'Cisco Systems', sector: 'Technology', basePrice: 55.60, icon: '🖧', cap: '230B', yield: '2.50%', pe: 16.3 },
  { id: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', basePrice: 620.00, icon: '🎨', cap: '310B', yield: '0.00%', pe: 45.7 },
  { id: 'NFLX', name: 'Netflix Inc.', sector: 'Consumer', basePrice: 350.20, icon: '📺', cap: '155B', yield: '0.00%', pe: 29.8 },
  { id: 'ORCL', name: 'Oracle Corp.', sector: 'Technology', basePrice: 90.40, icon: '💾', cap: '250B', yield: '1.50%', pe: 18.5 },
  { id: 'INTC', name: 'Intel Corp.', sector: 'Technology', basePrice: 33.20, icon: '🔌', cap: '135B', yield: '4.10%', pe: 8.2 },
  { id: 'CRM', name: 'Salesforce', sector: 'Technology', basePrice: 210.50, icon: '☁️', cap: '220B', yield: '0.00%', pe: 55.4 },
  { id: 'ABNB', name: 'Airbnb Inc.', sector: 'Consumer', basePrice: 135.60, icon: '🏠', cap: '100B', yield: '0.00%', pe: 75.2 },
  { id: 'PYPL', name: 'PayPal Holdings', sector: 'Finance', basePrice: 80.40, icon: '💸', cap: '150B', yield: '0.00%', pe: 28.3 },
  { id: 'MCD', name: "McDonald's", sector: 'Consumer', basePrice: 250.30, icon: '🍔', cap: '190B', yield: '2.20%', pe: 35.6 },
  { id: 'NKE', name: 'Nike Inc.', sector: 'Consumer', basePrice: 120.50, icon: '👟', cap: '210B', yield: '0.80%', pe: 40.1 },
  { id: 'LLY', name: 'Eli Lilly', sector: 'Healthcare', basePrice: 320.00, icon: '💊', cap: '350B', yield: '1.10%', pe: 22.4 },
  { id: 'COST', name: 'Costco Wholesale', sector: 'Consumer', basePrice: 480.20, icon: '🛒', cap: '250B', yield: '0.70%', pe: 42.8 },
];

const BONDS = [
  { id: 'US10Y', name: 'US 10-Year Treasury', type: 'Government', basePrice: 98.50,  yield: '4.42%', rating: 'AAA', maturity: '2034', icon: '🏛️', duration: 8.7 },
  { id: 'US30Y', name: 'US 30-Year Treasury', type: 'Government', basePrice: 92.80,  yield: '4.61%', rating: 'AAA', maturity: '2054', icon: '🏛️', duration: 19.2 },
  { id: 'TIPS',  name: 'TIPS 5-Year',         type: 'Government', basePrice: 96.20,  yield: '2.15%', rating: 'AAA', maturity: '2029', icon: '🛡️', duration: 4.8 },
  { id: 'CORP1', name: 'Apple Corp Bond',     type: 'Corporate',  basePrice: 101.40, yield: '3.85%', rating: 'AA+', maturity: '2031', icon: '🍎', duration: 6.3 },
  { id: 'CORP2', name: 'MS Corp Bond',        type: 'Corporate',  basePrice: 99.80,  yield: '4.10%', rating: 'AA-', maturity: '2029', icon: '🪟', duration: 4.5 },
  { id: 'MUNI1', name: 'NYC Municipal Bond',  type: 'Municipal',  basePrice: 103.20, yield: '3.20%', rating: 'AA' , maturity: '2035', icon: '🗽', duration: 9.1 },
  { id: 'HY1',   name: 'High Yield Corp ETF', type: 'High Yield', basePrice: 87.60,  yield: '7.80%', rating: 'BB+', maturity: 'ETF',  icon: '🔥', duration: 4.2 },
  { id: 'INTL', name: 'Intl Sovereign Bond', type: 'Government', basePrice: 95.30, yield: '5.10%', rating: 'A', maturity: '2032', icon: '🌍', duration: 7.4 },
  { id: 'GREEN', name: 'Green Energy Bond', type: 'Corporate', basePrice: 98.70, yield: '4.50%', rating: 'A-', maturity: '2030', icon: '🌿', duration: 5.6 },
  { id: 'TECH', name: 'Tech Innovators Bond', type: 'Corporate', basePrice: 102.50, yield: '3.75%', rating: 'A+', maturity: '2033', icon: '💻', duration: 6.8 },
  { id: 'EMERG', name: 'Emerging Markets Bond', type: 'High Yield', basePrice: 85.40, yield: '8.20%', rating: 'BB', maturity: 'ETF', icon: '🌎', duration: 5.1 },
  { id: 'REAL', name: 'Real Estate Bond', type: 'Corporate', basePrice: 100.80, yield: '4.00%', rating: 'A', maturity: '2031', icon: '🏠', duration: 6.0 },
  { id: 'HEALTH', name: 'Healthcare Bond', type: 'Corporate', basePrice: 99.50, yield: '4.25%', rating: 'A-', maturity: '2030', icon: '💉', duration: 5.8 },
  { id: 'AUTO', name: 'Auto Manufacturers Bond', type: 'Corporate', basePrice: 97.30, yield: '5.00%', rating: 'BBB+', maturity: '2032', icon: '🚗', duration: 7.0 },
  { id: 'FIN', name: 'Financial Sector Bond', type: 'Corporate', basePrice: 101.20, yield: '3.90%', rating: 'A', maturity: '2031', icon: '🏦', duration: 6.5 },
  { id: 'CONS', name: 'Consumer Goods Bond', type: 'Corporate', basePrice: 98.90, yield: '4.15%', rating: 'A-', maturity: '2030', icon: '🛒', duration: 5.9 },
];

const SECTORS = ['All', 'Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer', 'Industrial', 'Utilities', 'Real Estate', 'Materials', 'Communication'];
const BOND_TYPES = ['All', 'Government', 'Corporate', 'Municipal', 'High Yield', 'ETF', 'Other'];
const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y', '5Y', 'MAX'];

// ─── Chart Data Generator ─────────────────────────────────────────────────────
function genChart(base, tf, vol = 0.02) {
  const pts = { '1D': 48, '1W': 84, '1M': 60, '3M': 90, '1Y': 52, '5Y': 60 };
  const count = pts[tf] || 48;
  let p = base * (0.88 + Math.random() * 0.12);
  const now = Date.now();
  const interval = { '1D': 1800000, '1W': 7200000, '1M': 43200000, '3M': 129600000, '1Y': 604800000, '5Y': 2592000000 }[tf];
  return Array.from({ length: count }, (_, i) => {
    p *= 1 + (Math.random() - 0.488) * vol;
    const v = Math.floor(Math.random() * 8000000 + 1000000);
    return {
      t: new Date(now - (count - i) * interval).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      p: +p.toFixed(2),
      v,
    };
  });
}

// ─── Portfolio Mock ───────────────────────────────────────────────────────────
const PORTFOLIO = [
  { id: 'AAPL', qty: 15,  avgCost: 172.30 },
  { id: 'MSFT', qty: 8,   avgCost: 388.00 },
  { id: 'NVDA', qty: 5,   avgCost: 620.00 },
  { id: 'US10Y',qty: 20,  avgCost: 97.20  },
  { id: 'CORP1',qty: 10,  avgCost: 100.50 },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(8,8,30,0.97)', border: '1px solid rgba(0,245,255,0.25)', borderRadius: 8, padding: '8px 14px', fontFamily: 'Share Tech Mono, monospace', fontSize: 12, color: '#e2e8f0' }}>
      <div style={{ color: '#00f5ff', fontWeight: 700 }}>${payload[0].value.toLocaleString()}</div>
      {payload[0].payload.t && <div style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>{payload[0].payload.t}</div>}
    </div>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={42}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="p" stroke={color} dot={false} strokeWidth={1.8} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StockMarket() {
  const [view, setView] = useState('market');   // market | detail | portfolio | bonds | watchlist
  const [assetType, setAssetType] = useState('stocks'); // stocks | bonds
  const [sector, setSector] = useState('All');
  const [bondType, setBondType] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [tf, setTf] = useState('1D');
  const [chartData, setChartData] = useState([]);
  const [livePrices, setLivePrices] = useState(() => {
    const m = {};
    [...STOCKS, ...BONDS].forEach(a => { m[a.id] = a.basePrice; });
    return m;
  });
  const [prevPrices, setPrevPrices] = useState({});
  const [orderMode, setOrderMode] = useState('buy'); // buy | sell
  const [orderType, setOrderType] = useState('market'); // market | limit | stop
  const [qty, setQty] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [watchlist, setWatchlist] = useState(['AAPL', 'MSFT', 'NVDA', 'US10Y']);
  const [step, setStep] = useState(1); // 1=form 2=confirm 3=done
  const [orderRef, setOrderRef] = useState('');
  const [loading, setLoading] = useState(false);
  const priceFlash = useRef({});

  // Live price simulation
  useEffect(() => {
    const id = setInterval(() => {
      setPrevPrices(p => ({ ...p, ...livePrices }));
      setLivePrices(prev => {
        const next = { ...prev };
        [...STOCKS, ...BONDS].forEach(a => {
          const vol = a.type === 'Government' || a.type === 'Corporate' ? 0.0008 : 0.003;
          next[a.id] = +(prev[a.id] * (1 + (Math.random() - 0.495) * vol)).toFixed(2);
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // Chart refresh on asset/tf change
  useEffect(() => {
    if (!selected) return;
    const vol = selected.type === 'Government' ? 0.003 : selected.type === 'Corporate' ? 0.005 : 0.025;
    setChartData(genChart(selected.basePrice, tf, vol));
  }, [selected, tf]);

  const filteredStocks = STOCKS.filter(s => {
    const matchSector = sector === 'All' || s.sector === sector;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    return matchSector && matchSearch;
  });

  const filteredBonds = BONDS.filter(b => {
    const matchType = bondType === 'All' || b.type === bondType;
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const openDetail = (asset) => { setSelected(asset); setStep(1); setQty(''); setLimitPrice(''); setView('detail'); };
  const toggleWatchlist = (id) => {
    setWatchlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
    toast(watchlist.includes(id) ? `Removed from watchlist` : `Added to watchlist ⭐`, { duration: 1800 });
  };

  const placeOrder = async () => {
    if (!qty || +qty <= 0) return toast.error('Enter a valid quantity');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setOrderRef('ORD-' + Math.random().toString(36).slice(2, 10).toUpperCase());
    setStep(3);
    setLoading(false);
    toast.success(`${orderMode === 'buy' ? 'Buy' : 'Sell'} order placed for ${selected?.id}! 🚀`);
  };

  const cp = selected ? livePrices[selected.id] : 0;
  const pp = selected ? (prevPrices[selected.id] || selected?.basePrice) : 0;
  const dayChange = selected ? ((cp - selected.basePrice) / selected.basePrice * 100) : 0;
  const isUp = dayChange >= 0;
  const chartColor = isUp ? '#00ff88' : '#ff4466';

  // Portfolio calculations
  const portfolioValue = PORTFOLIO.reduce((sum, p) => {
    const price = livePrices[p.id] || 0;
    return sum + p.qty * price;
  }, 0);
  const portfolioCost = PORTFOLIO.reduce((sum, p) => sum + p.qty * p.avgCost, 0);
  const portfolioPnl = portfolioValue - portfolioCost;

  const orderTotal = qty && cp ? (+qty * cp).toFixed(2) : '0.00';

  return (
    <div style={{ fontFamily: "'Rajdhani', 'Share Tech Mono', sans-serif", color: '#e2e8f0', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap');
        .sm-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; transition: all 0.22s cubic-bezier(.4,0,.2,1); }
        .sm-card:hover { border-color: rgba(0,245,255,0.3); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,245,255,0.08); }
        .sm-row { transition: all 0.18s; cursor: pointer; border-radius: 8px; }
        .sm-row:hover { background: rgba(255,255,255,0.04); }
        .sm-btn { cursor: pointer; transition: all 0.18s; border: none; }
        .sm-btn:hover { opacity: 0.88; transform: scale(1.02); }
        .sm-tab { cursor: pointer; transition: all 0.2s; border: none; }
        .sm-flash-up { animation: flashUp 0.5s ease; }
        .sm-flash-dn { animation: flashDn 0.5s ease; }
        @keyframes flashUp { 0%,100%{background:transparent} 50%{background:rgba(0,255,136,0.18)} }
        @keyframes flashDn { 0%,100%{background:transparent} 50%{background:rgba(255,68,102,0.18)} }
        .sm-slide { animation: smSlide 0.28s ease; }
        @keyframes smSlide { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        input:focus,select:focus { outline: none; border-color: #00f5ff !important; box-shadow: 0 0 0 2px rgba(0,245,255,0.15); }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
        .badge-aaa { color:#00ff88; } .badge-aa { color:#38bdf8; } .badge-a { color:#fbbf24; } .badge-bb { color:#fb923c; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, background: 'linear-gradient(90deg,#00f5ff,#a78bfa,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            📈 GALAXY MARKETS
          </div>
          <div style={{ fontSize: 10, color: '#475569', letterSpacing: 2, fontFamily: 'Share Tech Mono, monospace' }}>STOCKS · BONDS · CHARTS</div>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[['market','🏪 Market'], ['portfolio','💼 Portfolio'], ['watchlist','⭐ Watchlist'], ['bonds','🏛️ Bonds']].map(([v, label]) => (
            <button key={v} onClick={() => { setView(v); setSelected(null); }} className="sm-tab" style={{ padding: '8px 14px', borderRadius: 8, background: view === v ? 'linear-gradient(135deg,rgba(0,245,255,0.15),rgba(167,139,250,0.15))' : 'rgba(255,255,255,0.03)', color: view === v ? '#00f5ff' : '#64748b', fontSize: 12, fontWeight: 600, letterSpacing: 0.5, border: `1px solid ${view === v ? 'rgba(0,245,255,0.35)' : 'rgba(255,255,255,0.07)'}` }}>
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search symbol..." style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: 13, width: 200, fontFamily: 'Share Tech Mono, monospace' }} />
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 20px' }}>

        {/* ══════════ MARKET ══════════ */}
        {view === 'market' && (
          <div className="sm-slide">
            {/* Index Summary Bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
              {[['S&P 500', 5248.94, '+0.74%', true], ['NASDAQ', 16742.39, '+1.02%', true], ['DOW', 39127.14, '+0.20%', true], ['VIX', 14.82, '-5.12%', false], ['10Y Yield', 4.42, '+0.03%', true], ['Gold', 2345.80, '-0.18%', false]].map(([name, val, chg, up]) => (
                <div key={name} className="sm-card" style={{ padding: '10px 18px', flexShrink: 0, minWidth: 140 }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'Share Tech Mono, monospace', marginBottom: 3 }}>{name}</div>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{typeof val === 'number' && val > 100 ? val.toLocaleString() : val}%</div>
                  <div style={{ fontSize: 11, color: up ? '#00ff88' : '#ff4466', fontFamily: 'Share Tech Mono, monospace' }}>{up ? '▲' : '▼'} {chg}</div>
                </div>
              ))}
            </div>

            {/* Asset type toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[['stocks', '📊 Stocks'], ['bonds', '🏛️ Bonds']].map(([t, label]) => (
                <button key={t} onClick={() => setAssetType(t)} className="sm-tab" style={{ padding: '9px 20px', borderRadius: 8, background: assetType === t ? 'linear-gradient(135deg,rgba(0,245,255,0.2),rgba(167,139,250,0.2))' : 'rgba(255,255,255,0.03)', color: assetType === t ? '#00f5ff' : '#64748b', border: `1px solid ${assetType === t ? 'rgba(0,245,255,0.4)' : 'rgba(255,255,255,0.07)'}`, fontFamily: "'Orbitron',monospace", fontSize: 12, letterSpacing: 1 }}>
                  {label}
                </button>
              ))}

              <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
                {(assetType === 'stocks' ? SECTORS : BOND_TYPES).map(f => (
                  <button key={f} onClick={() => assetType === 'stocks' ? setSector(f) : setBondType(f)} className="sm-tab" style={{ padding: '7px 12px', borderRadius: 6, background: (assetType === 'stocks' ? sector : bondType) === f ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.03)', color: (assetType === 'stocks' ? sector : bondType) === f ? '#a78bfa' : '#475569', border: `1px solid ${(assetType === 'stocks' ? sector : bondType) === f ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.06)'}`, fontSize: 11, fontWeight: 600 }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Stocks Table */}
            {assetType === 'stocks' && (
              <div className="sm-card" style={{ padding: '8px 0', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 100px 80px', gap: 8, padding: '8px 20px', fontSize: 10, color: '#475569', fontFamily: 'Share Tech Mono, monospace', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span>SYMBOL</span><span>COMPANY</span><span style={{ textAlign: 'right' }}>PRICE</span><span style={{ textAlign: 'right' }}>CHANGE</span><span style={{ textAlign: 'right' }}>MKT CAP</span><span style={{ textAlign: 'right' }}>P/E</span><span>TREND</span><span>ACTION</span>
                </div>
                {filteredStocks.map(stock => {
                  const price = livePrices[stock.id];
                  const prev = prevPrices[stock.id] || stock.basePrice;
                  const chgPct = ((price - stock.basePrice) / stock.basePrice * 100);
                  const up = price >= prev;
                  const inWL = watchlist.includes(stock.id);
                  const miniData = genChart(stock.basePrice, '1D', 0.015);
                  return (
                    <div key={stock.id} className="sm-row" onClick={() => openDetail(stock)} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 100px 80px', gap: 8, padding: '12px 20px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 22, lineHeight: 1 }}>{stock.icon}</div>
                        <div>
                          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{stock.id}</div>
                          <div style={{ fontSize: 10, color: '#475569' }}>{stock.sector}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: '#94a3b8' }}>{stock.name}</div>
                      <div style={{ textAlign: 'right', fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: up ? '#00ff88' : '#ff4466' }}>${price.toFixed(2)}</div>
                      <div style={{ textAlign: 'right', fontSize: 12, color: chgPct >= 0 ? '#00ff88' : '#ff4466', fontFamily: 'Share Tech Mono, monospace' }}>
                        {chgPct >= 0 ? '▲' : '▼'} {Math.abs(chgPct).toFixed(2)}%
                      </div>
                      <div style={{ textAlign: 'right', fontSize: 12, color: '#64748b', fontFamily: 'Share Tech Mono, monospace' }}>{stock.cap}</div>
                      <div style={{ textAlign: 'right', fontSize: 12, color: '#64748b', fontFamily: 'Share Tech Mono, monospace' }}>{stock.pe}x</div>
                      <div style={{ height: 36 }}><Sparkline data={miniData} color={chgPct >= 0 ? '#00ff88' : '#ff4466'} /></div>
                      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => toggleWatchlist(stock.id)} className="sm-btn" style={{ padding: '5px 8px', borderRadius: 6, background: inWL ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${inWL ? 'rgba(251,191,36,0.35)' : 'rgba(255,255,255,0.1)'}`, color: inWL ? '#fbbf24' : '#475569', fontSize: 12 }}>⭐</button>
                        <button onClick={() => openDetail(stock)} className="sm-btn" style={{ padding: '5px 10px', borderRadius: 6, background: 'linear-gradient(135deg,rgba(0,245,255,0.15),rgba(167,139,250,0.15))', border: '1px solid rgba(0,245,255,0.3)', color: '#00f5ff', fontSize: 11, fontFamily: "'Orbitron',monospace" }}>TRADE</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bonds Table */}
            {assetType === 'bonds' && (
              <div className="sm-card" style={{ padding: '8px 0', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 80px', gap: 8, padding: '8px 20px', fontSize: 10, color: '#475569', fontFamily: 'Share Tech Mono, monospace', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span>BOND</span><span>NAME</span><span style={{ textAlign: 'right' }}>PRICE</span><span style={{ textAlign: 'right' }}>YIELD</span><span style={{ textAlign: 'right' }}>RATING</span><span style={{ textAlign: 'right' }}>DURATION</span><span>ACTION</span>
                </div>
                {filteredBonds.map(bond => {
                  const price = livePrices[bond.id];
                  const chg = ((price - bond.basePrice) / bond.basePrice * 100);
                  const ratingClass = bond.rating.startsWith('AAA') ? 'badge-aaa' : bond.rating.startsWith('AA') ? 'badge-aa' : bond.rating.startsWith('A') ? 'badge-a' : 'badge-bb';
                  return (
                    <div key={bond.id} className="sm-row" onClick={() => openDetail(bond)} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 80px', gap: 8, padding: '12px 20px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 22 }}>{bond.icon}</div>
                        <div>
                          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{bond.id}</div>
                          <div style={{ fontSize: 10, color: '#475569' }}>{bond.type}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{bond.name}</div>
                      <div style={{ textAlign: 'right', fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: chg >= 0 ? '#00ff88' : '#ff4466' }}>${price.toFixed(2)}</div>
                      <div style={{ textAlign: 'right', fontSize: 13, color: '#fbbf24', fontFamily: 'Share Tech Mono, monospace', fontWeight: 600 }}>{bond.yield}</div>
                      <div style={{ textAlign: 'right', fontFamily: "'Orbitron',monospace", fontSize: 12 }} className={ratingClass}>{bond.rating}</div>
                      <div style={{ textAlign: 'right', fontSize: 12, color: '#64748b', fontFamily: 'Share Tech Mono, monospace' }}>{bond.duration}yr</div>
                      <button onClick={(e) => { e.stopPropagation(); openDetail(bond); }} className="sm-btn" style={{ padding: '5px 10px', borderRadius: 6, background: 'linear-gradient(135deg,rgba(251,191,36,0.15),rgba(167,139,250,0.15))', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', fontSize: 11, fontFamily: "'Orbitron',monospace" }}>TRADE</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════ DETAIL + CHART + ORDER ══════════ */}
        {view === 'detail' && selected && (
          <div className="sm-slide">
            <button onClick={() => setView('market')} style={{ background: 'none', border: 'none', color: '#00f5ff', cursor: 'pointer', fontFamily: "'Orbitron',monospace", fontSize: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              ← BACK TO MARKET
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
              {/* LEFT: Chart + Stats */}
              <div>
                {/* Asset Header */}
                <div className="sm-card" style={{ padding: '24px 28px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ fontSize: 48 }}>{selected.icon}</div>
                      <div>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 24, fontWeight: 900, color: '#e2e8f0' }}>{selected.id}</div>
                        <div style={{ fontSize: 14, color: '#64748b' }}>{selected.name}</div>
                        <div style={{ fontSize: 11, color: '#475569', fontFamily: 'Share Tech Mono, monospace', marginTop: 2 }}>{selected.sector || selected.type}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <motion.div key={cp} initial={{ opacity: 0.5, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ fontFamily: "'Orbitron',monospace", fontSize: 32, fontWeight: 900, color: isUp ? '#00ff88' : '#ff4466' }}>
                        ${cp.toFixed(2)}
                      </motion.div>
                      <div style={{ fontSize: 15, color: isUp ? '#00ff88' : '#ff4466', fontFamily: 'Share Tech Mono, monospace' }}>
                        {isUp ? '▲' : '▼'} {Math.abs(dayChange).toFixed(2)}% today
                      </div>
                      <button onClick={() => toggleWatchlist(selected.id)} className="sm-btn" style={{ marginTop: 8, padding: '6px 14px', borderRadius: 6, background: watchlist.includes(selected.id) ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${watchlist.includes(selected.id) ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.1)'}`, color: watchlist.includes(selected.id) ? '#fbbf24' : '#64748b', fontSize: 12 }}>
                        {watchlist.includes(selected.id) ? '⭐ Watchlisted' : '☆ Add to Watchlist'}
                      </button>
                    </div>
                  </div>

                  {/* Timeframe selector */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                    {TIMEFRAMES.map(t => (
                      <button key={t} onClick={() => setTf(t)} className="sm-tab" style={{ padding: '5px 14px', borderRadius: 6, background: tf === t ? chartColor : 'rgba(255,255,255,0.04)', border: 'none', color: tf === t ? (isUp ? '#003822' : '#3b0010') : '#64748b', fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 700 }}>
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* MAIN CHART */}
                  <div style={{ height: 280, marginBottom: 8 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="t" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Share Tech Mono, monospace' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Share Tech Mono, monospace' }} axisLine={false} tickLine={false} width={72} tickFormatter={v => `$${v < 10 ? v.toFixed(2) : v.toLocaleString()}`} domain={['auto', 'auto']} />
                        <Tooltip content={<ChartTip />} />
                        <ReferenceLine y={selected.basePrice} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
                        <Area type="monotone" dataKey="p" stroke={chartColor} strokeWidth={2} fill="url(#grad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Volume Chart */}
                  <div style={{ height: 60 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <Bar dataKey="v" fill={`${chartColor}44`} radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Key Stats */}
                <div className="sm-card" style={{ padding: 20 }}>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: '#00f5ff', marginBottom: 14, letterSpacing: 1 }}>KEY STATISTICS</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {selected.cap && [
                      ['Mkt Cap', selected.cap],
                      ['Div Yield', selected.yield],
                      ['P/E Ratio', selected.pe + 'x'],
                      ['52W High', '$' + (selected.basePrice * 1.35).toFixed(2)],
                      ['52W Low', '$' + (selected.basePrice * 0.72).toFixed(2)],
                      ['Avg Vol', '42.3M'],
                      ['Beta', '1.24'],
                      ['Float', '15.4B'],
                    ].map(([label, val]) => (
                      <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ fontSize: 10, color: '#475569', fontFamily: 'Share Tech Mono, monospace', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{val}</div>
                      </div>
                    ))}
                    {selected.yield && !selected.cap && [
                      ['Coupon Yield', selected.yield],
                      ['Rating', selected.rating],
                      ['Maturity', selected.maturity],
                      ['Duration', selected.duration + 'yr'],
                      ['Type', selected.type],
                      ['Face Value', '$1,000'],
                      ['Min Buy', '$1,000'],
                      ['Frequency', 'Semi-annual'],
                    ].map(([label, val]) => (
                      <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ fontSize: 10, color: '#475569', fontFamily: 'Share Tech Mono, monospace', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: Order Panel */}
              <div>
                <div className="sm-card" style={{ padding: 24, position: 'sticky', top: 80 }}>
                  <AnimatePresence mode="wait">
                    {/* STEP 1: Order Form */}
                    {step === 1 && (
                      <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 900, color: '#e2e8f0', marginBottom: 18, letterSpacing: 1 }}>PLACE ORDER</div>

                        {/* Buy/Sell Toggle */}
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3, marginBottom: 18 }}>
                          {['buy', 'sell'].map(m => (
                            <button key={m} onClick={() => setOrderMode(m)} className="sm-tab" style={{ flex: 1, padding: '9px', borderRadius: 6, border: 'none', background: orderMode === m ? (m === 'buy' ? 'linear-gradient(135deg,#059669,#0d9488)' : 'linear-gradient(135deg,#dc2626,#9f1239)') : 'transparent', color: orderMode === m ? '#fff' : '#475569', fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
                              {m === 'buy' ? '🟢 BUY' : '🔴 SELL'}
                            </button>
                          ))}
                        </div>

                        {/* Order Type */}
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: 'block', fontSize: 10, color: '#64748b', fontFamily: 'Share Tech Mono, monospace', letterSpacing: 1, marginBottom: 6 }}>ORDER TYPE</label>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {['market', 'limit', 'stop'].map(ot => (
                              <button key={ot} onClick={() => setOrderType(ot)} className="sm-tab" style={{ flex: 1, padding: '7px 4px', borderRadius: 6, background: orderType === ot ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${orderType === ot ? 'rgba(0,245,255,0.35)' : 'rgba(255,255,255,0.07)'}`, color: orderType === ot ? '#00f5ff' : '#475569', fontSize: 10, fontFamily: "'Orbitron',monospace", letterSpacing: 0.5 }}>
                                {ot.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Current Price */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'Share Tech Mono, monospace' }}>MARKET PRICE</span>
                          <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 700, color: isUp ? '#00ff88' : '#ff4466' }}>${cp.toFixed(2)}</span>
                        </div>

                        {/* Limit Price (if limit/stop) */}
                        {(orderType === 'limit' || orderType === 'stop') && (
                          <div style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', fontSize: 10, color: '#64748b', fontFamily: 'Share Tech Mono, monospace', letterSpacing: 1, marginBottom: 6 }}>{orderType === 'limit' ? 'LIMIT PRICE' : 'STOP PRICE'}</label>
                            <input type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value)} placeholder={cp.toFixed(2)} style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fbbf24', fontSize: 15, fontFamily: "'Orbitron',monospace" }} />
                          </div>
                        )}

                        {/* Quantity */}
                        <div style={{ marginBottom: 14 }}>
                          <label style={{ display: 'block', fontSize: 10, color: '#64748b', fontFamily: 'Share Tech Mono, monospace', letterSpacing: 1, marginBottom: 6 }}>SHARES / UNITS</label>
                          <div style={{ position: 'relative' }}>
                            <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" min="0" style={{ width: '100%', padding: '10px 60px 10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#e2e8f0', fontSize: 16, fontFamily: "'Orbitron',monospace" }} />
                            <button onClick={() => setQty(Math.floor(10000 / cp).toString())} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: '3px 8px', background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 4, color: '#00f5ff', fontSize: 10, fontFamily: "'Orbitron',monospace", cursor: 'pointer' }}>MAX</button>
                          </div>
                          {/* Quick qty buttons */}
                          <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                            {[1, 5, 10, 25, 100].map(n => (
                              <button key={n} onClick={() => setQty(n.toString())} className="sm-tab" style={{ flex: 1, padding: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, color: '#475569', fontSize: 10, fontFamily: 'Share Tech Mono, monospace' }}>{n}</button>
                            ))}
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div style={{ background: `rgba(${orderMode === 'buy' ? '5,150,105' : '220,38,38'},0.08)`, border: `1px solid rgba(${orderMode === 'buy' ? '5,150,105' : '220,38,38'},0.25)`, borderRadius: 8, padding: '12px 16px', marginBottom: 18 }}>
                          {[['Est. Total', `$${orderTotal}`], ['Commission', '$0.00'], ['Settlement', 'T+2']].map(([l, v]) => (
                            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                              <span style={{ color: '#64748b', fontFamily: 'Share Tech Mono, monospace' }}>{l}</span>
                              <span style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, color: '#e2e8f0' }}>{v}</span>
                            </div>
                          ))}
                        </div>

                        <button onClick={() => setStep(2)} disabled={!qty} className="sm-btn" style={{ width: '100%', padding: '13px', borderRadius: 10, background: !qty ? 'rgba(255,255,255,0.05)' : orderMode === 'buy' ? 'linear-gradient(135deg,#059669,#0d9488)' : 'linear-gradient(135deg,#dc2626,#9f1239)', color: '#fff', fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, letterSpacing: 1, opacity: qty ? 1 : 0.5 }}>
                          REVIEW {orderMode.toUpperCase()} ORDER →
                        </button>
                      </motion.div>
                    )}

                    {/* STEP 2: Confirm */}
                    {step === 2 && (
                      <motion.div key="confirm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 900, color: orderMode === 'buy' ? '#00ff88' : '#ff4466', marginBottom: 20, textAlign: 'center' }}>
                          {orderMode === 'buy' ? '🟢 CONFIRM BUY' : '🔴 CONFIRM SELL'}
                        </div>
                        {[['Asset', `${selected.icon} ${selected.id}`], ['Type', orderType.toUpperCase()], ['Mode', orderMode.toUpperCase()], ['Quantity', `${qty} shares`], ['Price', orderType === 'market' ? `$${cp.toFixed(2)} (market)` : `$${limitPrice}`], ['Est. Total', `$${orderTotal}`], ['Settlement', 'T+2 Business Days']].map(([l, v]) => (
                          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                            <span style={{ color: '#64748b', fontFamily: 'Share Tech Mono, monospace' }}>{l}</span>
                            <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: '#e2e8f0', textAlign: 'right', maxWidth: 160, wordBreak: 'break-all' }}>{v}</span>
                          </div>
                        ))}
                        <div style={{ padding: '10px 14px', background: 'rgba(255,159,0,0.08)', border: '1px solid rgba(255,159,0,0.25)', borderRadius: 8, marginTop: 14, fontSize: 11, color: '#f59e0b', fontFamily: 'Share Tech Mono, monospace' }}>
                          ⚠️ Market orders execute at best available price. This action cannot be reversed.
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                          <button onClick={() => setStep(1)} className="sm-btn" style={{ flex: 1, padding: '11px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', fontFamily: "'Orbitron',monospace", fontSize: 11 }}>← BACK</button>
                          <button onClick={placeOrder} disabled={loading} className="sm-btn" style={{ flex: 2, padding: '11px', borderRadius: 8, background: orderMode === 'buy' ? 'linear-gradient(135deg,#059669,#0d9488)' : 'linear-gradient(135deg,#dc2626,#9f1239)', color: '#fff', fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 700 }}>
                            {loading ? '⏳ PLACING...' : `✅ CONFIRM ${orderMode.toUpperCase()}`}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: Done */}
                    {step === 3 && (
                      <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                        <motion.div animate={{ scale: [0, 1.2, 1], rotate: [0, 10, -5, 0] }} transition={{ duration: 0.6 }} style={{ fontSize: 64, marginBottom: 16 }}>{orderMode === 'buy' ? '🚀' : '💰'}</motion.div>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 900, color: orderMode === 'buy' ? '#00ff88' : '#ff4466', marginBottom: 8 }}>ORDER PLACED!</div>
                        <div style={{ fontSize: 13, color: '#64748b', fontFamily: 'Share Tech Mono, monospace', marginBottom: 16 }}>{qty} × {selected.id} @ ${cp.toFixed(2)}</div>
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px', marginBottom: 20, fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: '#475569' }}>
                          REF: {orderRef}
                        </div>
                        <button onClick={() => setStep(1)} className="sm-btn" style={{ width: '100%', padding: '11px', borderRadius: 8, background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.25)', color: '#00f5ff', fontFamily: "'Orbitron',monospace", fontSize: 12 }}>PLACE ANOTHER</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ PORTFOLIO ══════════ */}
        {view === 'portfolio' && (
          <div className="sm-slide">
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
              {[
                ['Total Value', `$${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '#00f5ff'],
                ['Total Cost', `$${portfolioCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '#64748b'],
                ['Total P&L', `${portfolioPnl >= 0 ? '+' : ''}$${portfolioPnl.toFixed(2)}`, portfolioPnl >= 0 ? '#00ff88' : '#ff4466'],
                ['Return %', `${portfolioPnl >= 0 ? '+' : ''}${((portfolioPnl / portfolioCost) * 100).toFixed(2)}%`, portfolioPnl >= 0 ? '#00ff88' : '#ff4466'],
              ].map(([label, val, color]) => (
                <div key={label} className="sm-card" style={{ padding: '18px 20px' }}>
                  <div style={{ fontSize: 10, color: '#475569', fontFamily: 'Share Tech Mono, monospace', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Holdings Table */}
            <div className="sm-card" style={{ padding: '8px 0', overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: '#00f5ff', padding: '12px 20px 8px', letterSpacing: 1 }}>HOLDINGS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr 80px', gap: 8, padding: '6px 20px', fontSize: 10, color: '#475569', fontFamily: 'Share Tech Mono, monospace', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span>ASSET</span><span style={{ textAlign: 'right' }}>QTY</span><span style={{ textAlign: 'right' }}>AVG COST</span><span style={{ textAlign: 'right' }}>CUR PRICE</span><span style={{ textAlign: 'right' }}>VALUE</span><span style={{ textAlign: 'right' }}>P&L</span><span></span>
              </div>
              {PORTFOLIO.map(holding => {
                const allAssets = [...STOCKS, ...BONDS];
                const asset = allAssets.find(a => a.id === holding.id);
                if (!asset) return null;
                const curPrice = livePrices[holding.id] || asset.basePrice;
                const value = holding.qty * curPrice;
                const cost = holding.qty * holding.avgCost;
                const pnl = value - cost;
                const pnlPct = (pnl / cost) * 100;
                return (
                  <div key={holding.id} className="sm-row" onClick={() => openDetail(asset)} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr 80px', gap: 8, padding: '14px 20px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontSize: 22 }}>{asset.icon}</div>
                      <div>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{asset.id}</div>
                        <div style={{ fontSize: 10, color: '#475569' }}>{asset.name.slice(0, 18)}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'Share Tech Mono, monospace', fontSize: 13, color: '#94a3b8' }}>{holding.qty}</div>
                    <div style={{ textAlign: 'right', fontFamily: 'Share Tech Mono, monospace', fontSize: 12, color: '#64748b' }}>${holding.avgCost.toFixed(2)}</div>
                    <div style={{ textAlign: 'right', fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: curPrice >= holding.avgCost ? '#00ff88' : '#ff4466' }}>${curPrice.toFixed(2)}</div>
                    <div style={{ textAlign: 'right', fontFamily: "'Orbitron',monospace", fontSize: 13, color: '#e2e8f0' }}>${value.toFixed(2)}</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 700, color: pnl >= 0 ? '#00ff88' : '#ff4466' }}>{pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: pnl >= 0 ? '#00ff88' : '#ff4466', fontFamily: 'Share Tech Mono, monospace' }}>{pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); openDetail(asset); }} className="sm-btn" style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.25)', color: '#00f5ff', fontSize: 10, fontFamily: "'Orbitron',monospace" }}>TRADE</button>
                  </div>
                );
              })}
            </div>

            {/* Allocation Chart */}
            <div className="sm-card" style={{ padding: 20 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: '#00f5ff', marginBottom: 14, letterSpacing: 1 }}>SECTOR ALLOCATION</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[['Technology', 72, '#6366f1'], ['Bonds', 18, '#fbbf24'], ['Finance', 10, '#00f5ff']].map(([label, pct, color]) => (
                  <div key={label} style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: '#94a3b8' }}>{label}</span>
                      <span style={{ fontFamily: 'Share Tech Mono, monospace', color }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: color, borderRadius: 3, boxShadow: `0 0 8px ${color}66` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ WATCHLIST ══════════ */}
        {view === 'watchlist' && (
          <div className="sm-slide">
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 900, marginBottom: 20, color: '#fbbf24' }}>⭐ YOUR WATCHLIST</div>
            {watchlist.length === 0 ? (
              <div className="sm-card" style={{ padding: 60, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, color: '#475569' }}>YOUR WATCHLIST IS EMPTY</div>
                <div style={{ fontSize: 13, color: '#334155', marginTop: 8 }}>Click ⭐ on any asset to add it here</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
                {watchlist.map(id => {
                  const asset = [...STOCKS, ...BONDS].find(a => a.id === id);
                  if (!asset) return null;
                  const price = livePrices[id];
                  const chg = ((price - asset.basePrice) / asset.basePrice * 100);
                  const up = chg >= 0;
                  const miniData = genChart(asset.basePrice, '1D', 0.018);
                  return (
                    <div key={id} className="sm-card" style={{ padding: 20, cursor: 'pointer' }} onClick={() => openDetail(asset)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ fontSize: 32 }}>{asset.icon}</div>
                          <div>
                            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{asset.id}</div>
                            <div style={{ fontSize: 11, color: '#475569' }}>{asset.name.slice(0, 20)}</div>
                          </div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); toggleWatchlist(id); }} style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', fontSize: 18 }}>⭐</button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color: up ? '#00ff88' : '#ff4466' }}>${price.toFixed(2)}</div>
                          <div style={{ fontSize: 12, color: up ? '#00ff88' : '#ff4466', fontFamily: 'Share Tech Mono, monospace' }}>{up ? '▲' : '▼'} {Math.abs(chg).toFixed(2)}%</div>
                        </div>
                        <div style={{ width: 120, height: 50 }}><Sparkline data={miniData} color={up ? '#00ff88' : '#ff4466'} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════ BONDS ══════════ */}
        {view === 'bonds' && (
          <div className="sm-slide">
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 900, marginBottom: 8, color: '#fbbf24' }}>🏛️ FIXED INCOME MARKETS</div>
            <div style={{ fontSize: 13, color: '#475569', fontFamily: 'Share Tech Mono, monospace', marginBottom: 20 }}>Government, Corporate & Municipal Bonds</div>

            {/* Yield Curve Banner */}
            <div className="sm-card" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: '#fbbf24', marginBottom: 14, letterSpacing: 1 }}>US TREASURY YIELD CURVE</div>
              <div style={{ height: 100 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { m: '1M', y: 5.45 }, { m: '3M', y: 5.42 }, { m: '6M', y: 5.38 },
                    { m: '1Y', y: 5.18 }, { m: '2Y', y: 4.72 }, { m: '5Y', y: 4.38 },
                    { m: '10Y', y: 4.42 }, { m: '20Y', y: 4.68 }, { m: '30Y', y: 4.61 },
                  ]}>
                    <defs>
                      <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="m" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Share Tech Mono, monospace' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Share Tech Mono, monospace' }} axisLine={false} tickLine={false} domain={[3.5, 6]} tickFormatter={v => v + '%'} width={40} />
                    <Tooltip formatter={(v) => [v.toFixed(2) + '%', 'Yield']} contentStyle={{ background: 'rgba(8,8,30,0.97)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 6, fontFamily: 'Share Tech Mono, monospace', fontSize: 11 }} />
                    <Area type="monotone" dataKey="y" stroke="#fbbf24" strokeWidth={2} fill="url(#yieldGrad)" dot={{ fill: '#fbbf24', r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {BOND_TYPES.map(bt => (
                <button key={bt} onClick={() => setBondType(bt)} className="sm-tab" style={{ padding: '7px 14px', borderRadius: 6, background: bondType === bt ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${bondType === bt ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.07)'}`, color: bondType === bt ? '#fbbf24' : '#475569', fontSize: 11, fontFamily: "'Orbitron',monospace" }}>{bt}</button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
              {filteredBonds.map(bond => {
                const price = livePrices[bond.id];
                const chg = ((price - bond.basePrice) / bond.basePrice * 100);
                const ratingColor = bond.rating.startsWith('AAA') ? '#00ff88' : bond.rating.startsWith('AA') ? '#38bdf8' : bond.rating.startsWith('A') ? '#fbbf24' : '#fb923c';
                return (
                  <div key={bond.id} className="sm-card" style={{ padding: 20, cursor: 'pointer' }} onClick={() => openDetail(bond)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontSize: 32 }}>{bond.icon}</div>
                        <div>
                          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{bond.id}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{bond.name}</div>
                          <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{bond.type} · Matures {bond.maturity}</div>
                        </div>
                      </div>
                      <div style={{ padding: '4px 10px', borderRadius: 6, background: `${ratingColor}18`, border: `1px solid ${ratingColor}44`, fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 700, color: ratingColor }}>
                        {bond.rating}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                      {[['PRICE', `$${price.toFixed(2)}`, chg >= 0 ? '#00ff88' : '#ff4466'], ['YIELD', bond.yield, '#fbbf24'], ['DURATION', `${bond.duration}yr`, '#94a3b8']].map(([l, v, c]) => (
                        <div key={l} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '8px 10px' }}>
                          <div style={{ fontSize: 9, color: '#475569', fontFamily: 'Share Tech Mono, monospace', letterSpacing: 1, marginBottom: 4 }}>{l}</div>
                          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: c }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={e => { e.stopPropagation(); openDetail(bond); setOrderMode('buy'); }} className="sm-btn" style={{ flex: 1, padding: '9px', background: 'linear-gradient(135deg,rgba(5,150,105,0.2),rgba(13,148,136,0.2))', border: '1px solid rgba(5,150,105,0.35)', borderRadius: 8, color: '#00ff88', fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 700 }}>🟢 BUY</button>
                      <button onClick={e => { e.stopPropagation(); openDetail(bond); setOrderMode('sell'); }} className="sm-btn" style={{ flex: 1, padding: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#64748b', fontFamily: "'Orbitron',monospace", fontSize: 11 }}>📊 CHART</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}