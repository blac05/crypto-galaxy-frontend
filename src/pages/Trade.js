import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';
import { useWalletStore } from '../store';
import { PendingTransactionBanner, AccountLockedOverlay } from '../components/TransactionGuard';

// ── Asset Definitions ──────────────────────────────────────────────────────
const CRYPTO = [
  { id: 'BTC',   name: 'Bitcoin',       icon: '₿',  color: '#F7931A', type: 'crypto',    basePrice: 67000 },
  { id: 'ETH',   name: 'Ethereum',      icon: 'Ξ',  color: '#627EEA', type: 'crypto',    basePrice: 3500  },
  { id: 'SOL',   name: 'Solana',        icon: '◎',  color: '#9945FF', type: 'crypto',    basePrice: 175   },
  { id: 'USDT',  name: 'Tether',        icon: '₮',  color: '#26A17B', type: 'crypto',    basePrice: 1     },
  { id: 'BNB',   name: 'BNB',           icon: '⬡',  color: '#F3BA2F', type: 'crypto',    basePrice: 580   },
  { id: 'XRP',   name: 'Ripple',        icon: '✕',  color: '#00AAE4', type: 'crypto',    basePrice: 0.58  },
  { id: 'ADA',   name: 'Cardano',       icon: '₳',  color: '#0033AD', type: 'crypto',    basePrice: 0.45  },
  { id: 'DOGE',  name: 'Dogecoin',      icon: 'Ð',  color: '#C2A633', type: 'crypto',    basePrice: 0.16  },
  { id: 'DOT',   name: 'Polkadot',      icon: '●',  color: '#E6007A', type: 'crypto',    basePrice: 7.8   },
  { id: 'MATIC', name: 'Polygon',       icon: '⬡',  color: '#8247E5', type: 'crypto',    basePrice: 0.72  },
  { id: 'AVAX',  name: 'Avalanche',     icon: '🔺', color: '#E84142', type: 'crypto',    basePrice: 38    },
  { id: 'LINK',  name: 'Chainlink',     icon: '⬡',  color: '#375BD2', type: 'crypto',    basePrice: 14    },
  { id: 'UNI',   name: 'Uniswap',       icon: '🦄', color: '#FF007A', type: 'crypto',    basePrice: 8.5   },
  { id: 'LTC',   name: 'Litecoin',      icon: 'Ł',  color: '#BFBBBB', type: 'crypto',    basePrice: 85    },
  { id: 'ATOM',  name: 'Cosmos',        icon: '⚛',  color: '#2E3148', type: 'crypto',    basePrice: 9.2   },
  { id: 'XLM',   name: 'Stellar',       icon: '*',  color: '#7D00FF', type: 'crypto',    basePrice: 0.11  },
  { id: 'ALGO',  name: 'Algorand',      icon: 'A',  color: '#00B4D8', type: 'crypto',    basePrice: 0.19  },
  { id: 'VET',   name: 'VeChain',       icon: 'V',  color: '#15BDFF', type: 'crypto',    basePrice: 0.028 },
  { id: 'SAND',  name: 'The Sandbox',   icon: '🏖', color: '#04ADEF', type: 'crypto',    basePrice: 0.42  },
  { id: 'MANA',  name: 'Decentraland',  icon: '🌐', color: '#FF2D55', type: 'crypto',   basePrice: 0.38 },
  { id: 'AXS',   name: 'Axie Infinity', icon: '🐲', color: '#00BFFF', type: 'crypto',   basePrice: 70 },
  { id: 'GALA',  name: 'Gala Games',    icon: '🎮', color: '#FF4500', type: 'crypto',   basePrice: 0.25 },
  { id: 'THETA', name: 'Theta Network', icon: 'Θ', color: '#2AB8E6', type: 'crypto',    basePrice: 6.5 },
  { id: 'FTM',   name: 'Fantom',        icon: '👻', color: '#1969FF', type: 'crypto',   basePrice: 2.1 },
  { id: 'EGLD',  name: 'Elrond',        icon: '𓂀', color: '#FF5C00', type: 'crypto',    basePrice: 250 },
  { id: 'KSM',   name: 'Kusama',        icon: '🦝', color: '#000', type: 'crypto',   basePrice: 350 },
  { id: 'ZIL',   name: 'Zilliqa',       icon: 'Z', color: '#00AFF5', type: 'crypto',    basePrice: 0.11 },
  { id: 'DASH',  name: 'Dash',          icon: 'D', color: '#1C75FF', type: 'crypto',    basePrice: 150 },
  { id: 'COMP',  name: 'Compound',      icon: '⚗', color: '#00D395', type: 'crypto',    basePrice: 400 },
  { id: 'YFI',   name: 'Yearn.Finance', icon: 'Y', color: '#007AFF', type: 'crypto',    basePrice: 30000 },
  { id: 'CRV',   name: 'Curve DAO',     icon: '∿', color: '#00B2FF', type: 'crypto',    basePrice: 3 },
  { id: 'SNX',   name: 'Synthetix',     icon: 'S', color: '#FF3E00', type: 'crypto',    basePrice: 12 },
  { id: 'REN',   name: 'Ren',           icon: 'R', color: '#00FFB2', type: 'crypto',    basePrice: 0.8 },
  { id: '1INCH', name: '1inch',         icon: '1', color: '#FF0050', type: 'crypto',    basePrice: 2.5 },
  { id: 'ZRX',   name: '0x',            icon: '0', color: '#0099FF', type: 'crypto',    basePrice: 1.2 },
  { id: 'BTT',   name: 'BitTorrent',    icon: 'B', color: '#FF6600', type: 'crypto',    basePrice: 0.003 },
  { id: 'HOT',   name: 'Holo',          icon: 'H', color: '#FF00FF', type: 'crypto',    basePrice: 0.01 },
  { id: 'CHZ',   name: 'Chiliz',        icon: 'C', color: '#FF2E00', type: 'crypto',    basePrice: 0.3 },
  { id: 'STX',   name: 'Stacks',        icon: 'S', color: '#0000FF', type: 'crypto',    basePrice: 1.5 },
  { id: 'ENJ',   name: 'Enjin Coin',    icon: 'E', color: '#00FF7F', type: 'crypto',    basePrice: 1.2 },
  { id: 'MKR',   name: 'Maker',         icon: 'M', color: '#FF0000', type: 'crypto',    basePrice: 2500 },
  { id: 'GRT',   name: 'The Graph',     icon: 'G', color: '#FF8C00', type: 'crypto',    basePrice: 0.6 },
  { id: 'CRO',   name: 'Crypto.com Coin', icon: 'C', color: '#0033FF', type: 'crypto',  basePrice: 0.5 },
  { id: 'BAT',   name: 'Basic Attention Token', icon: 'B', color: '#FF6600', type: 'crypto', basePrice: 0.9 },
];

const STOCKS = [
  { id: 'AAPL',   name: 'Apple',      icon: '🍎', color: '#A2AAAD', type: 'stock',     basePrice: 189  },
  { id: 'TSLA',   name: 'Tesla',      icon: '⚡', color: '#CC0000', type: 'stock',     basePrice: 248  },
  { id: 'MSFT',   name: 'Microsoft',  icon: '🪟', color: '#00A4EF',  type: 'stock',     basePrice: 415  },
  { id: 'AMZN',   name: 'Amazon',     icon: '📦', color: '#FF9900', type: 'stock',     basePrice: 185  },
  { id: 'GOOGL',  name: 'Google',     icon: '🔍', color: '#4285F4', type: 'stock',     basePrice: 175  },
  { id: 'NFLX',   name: 'Netflix',    icon: '🎬', color: '#E50914', type: 'stock',     basePrice: 630 },
  { id: 'FB',     name: 'Meta',       icon: '👓', color: '#0082FB', type: 'stock',     basePrice: 520 },
  { id: 'META',   name: 'Meta',       icon: '👓', color: '#0082FB', type: 'stock',     basePrice: 520  },
  { id: 'NVDA',   name: 'NVIDIA',     icon: '🎮', color: '#76B900', type: 'stock',     basePrice: 875 },
  { id: 'ADBE',   name: 'Adobe',      icon: '🎨', color: '#FF0000', type: 'stock',     basePrice: 650 },
  { id: 'INTC',   name: 'Intel',      icon: '💻', color: '#0071C5', type: 'stock',     basePrice: 55 },
  { id: 'PYPL',   name: 'PayPal',     icon: '💳', color: '#003087', type: 'stock',     basePrice: 110 },
  { id: 'CSCO',   name: 'Cisco',      icon: '📡', color: '#1BA0E1', type: 'stock',     basePrice: 45 },
  { id: 'ORCL',   name: 'Oracle',     icon: '💽', color: '#FF0000', type: 'stock',     basePrice: 90 },
  { id: 'IBM',    name: 'IBM',        icon: '👔', color: '#054ADA', type: 'stock',     basePrice: 140 },
  { id: 'CRM',    name: 'Salesforce', icon: '☁', color: '#1798C1', type: 'stock',      basePrice: 220 },
  { id: 'EBAY',   name: 'eBay',       icon: '🛍', color: '#E53238', type: 'stock',      basePrice: 47   },
  { id: 'GOLD',   name: 'Gold',       icon: '🥇', color: '#FFD700', type: 'commodity', basePrice: 2330 },
  { id: 'SILVER', name: 'Silver',     icon: '🥈', color: '#C0C0C0', type: 'commodity', basePrice: 27   },
  { id: 'OIL',    name: 'Crude Oil',  icon: '🛢', color: '#8B4513', type: 'commodity',  basePrice: 82 },
  { id: 'PLAT',   name: 'Platinum',   icon: '🥉', color: '#E5E4E2', type: 'commodity', basePrice: 1050 },
  { id: 'PALL',   name: 'Palladium',  icon: '⚱', color: '#CED0DD', type: 'commodity', basePrice: 2300 },
  { id: 'COPPER', name: 'Copper',     icon: '🔩', color: '#B87333', type: 'commodity', basePrice: 4.5 },
  { id: 'AUX',    name: 'Auxilium',   icon: '🛸', color: '#FF00FF', type: 'commodity', basePrice: 500 },
  { id: 'SILK',   name: 'Silk',       icon: '🕸', color: '#FF69B4', type: 'commodity', basePrice: 150 },
  { id: 'COFFEE', name: 'Coffee',     icon: '☕', color: '#6F4E37', type: 'commodity', basePrice: 1.2 },
  { id: 'CORN',   name: 'Corn',       icon: '🌽', color: '#FFD700', type: 'commodity', basePrice: 0.6 },
  { id: 'WHEAT',  name: 'Wheat',      icon: '🌾', color: '#F5DEB3', type: 'commodity', basePrice: 0.8 },
  { id: 'SOY',    name: 'Soybeans',   icon: '🌱', color: '#228B22', type: 'commodity', basePrice: 1.5 },
  { id: 'RICE',   name: 'Rice',       icon: '🍚', color: '#FFFFFF', type: 'commodity', basePrice: 0.5 },
  { id: 'SUGAR',  name: 'Sugar',      icon: '🍬', color: '#FFB6C1', type: 'commodity', basePrice: 0.4 },
  { id: 'COTTON', name: 'Cotton',     icon: '🧵', color: '#FFFFFF', type: 'commodity', basePrice: 0.9 },
  { id: 'LEATHER', name: 'Leather',   icon: '👞', color: '#8B4513', type: 'commodity', basePrice: 2.5 },
  { id: 'TIMBER',  name: 'Timber',     icon: '🪵', color: '#A0522D', type: 'commodity', basePrice: 0.3 },
  { id: 'WATER', name: 'Water', icon: '💧', color: '#1E90FF', type: 'commodity', basePrice: 0.002 },
];

const ALL_ASSETS = [...CRYPTO, ...STOCKS];

function generateChartData(basePrice, points = 30, volatility = 0.03) {
  const data = [];
  let price = basePrice * (0.92 + Math.random() * 0.08);
  const now = Date.now();
  for (let i = points; i >= 0; i--) {
    price = price * (1 + (Math.random() - 0.48) * volatility);
    data.push({
      time: new Date(now - i * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: parseFloat(price.toFixed(price < 1 ? 6 : 2)),
    });
  }
  return data;
}

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(8,8,32,0.95)', border: '1px solid rgba(0,245,255,0.3)',
        borderRadius: 8, padding: '8px 14px',
        fontFamily: 'Share Tech Mono, monospace', fontSize: 13, color: 'white',
      }}>
        ${payload[0].value.toLocaleString()}
      </div>
    );
  }
  return null;
}

export default function Trade() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('buy');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartRange, setChartRange] = useState('1D');
  const [form, setForm] = useState({ amount: '', usd: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [livePrice, setLivePrice] = useState(null);
  const { balances, buyCrypto, sellCrypto, isLocked } = useWalletStore();

  const [livePrices, setLivePrices] = useState(() =>
    Object.fromEntries(ALL_ASSETS.map(a => [a.id, a.basePrice]))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrices(prev => {
        const next = { ...prev };
        ALL_ASSETS.forEach(a => {
          const change = (Math.random() - 0.495) * 0.004;
          next[a.id] = parseFloat((prev[a.id] * (1 + change)).toFixed(a.basePrice < 1 ? 6 : 2));
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedAsset) {
      const points = chartRange === '1D' ? 24 : chartRange === '1W' ? 42 : chartRange === '1M' ? 30 : 52;
      const vol = chartRange === '1D' ? 0.015 : chartRange === '1W' ? 0.03 : 0.05;
      setChartData(generateChartData(livePrices[selectedAsset.id], points, vol));
      setLivePrice(livePrices[selectedAsset.id]);
    }
  }, [selectedAsset, chartRange]);

  useEffect(() => {
    if (selectedAsset) setLivePrice(livePrices[selectedAsset.id]);
  }, [livePrices]);

  const filteredAssets = ALL_ASSETS.filter(a => {
    const matchesTab =
      tab === 'all' ? true :
      tab === 'crypto' ? a.type === 'crypto' :
      tab === 'stocks' ? a.type === 'stock' :
      a.type === 'commodity';
    
    if (!matchesTab) return false;
    
    if (!search.trim()) return true;
    
    const q = search.toLowerCase();
    return a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
  });

  const currentPrice = selectedAsset ? livePrices[selectedAsset.id] : 0;
  const priceChange = selectedAsset
    ? ((currentPrice - selectedAsset.basePrice) / selectedAsset.basePrice * 100).toFixed(2)
    : 0;
  const isUp = parseFloat(priceChange) >= 0;

  const handleSelectAsset = (asset) => {
    if (isLocked) return toast.error('🚫 Account locked. Contact support.');
    setSelectedAsset(asset);
    setForm({ amount: '', usd: '' });
    setStep(2);
  };

  const handleAmountChange = (val) => {
    setForm(p => ({ ...p, amount: val, usd: val ? (parseFloat(val) * currentPrice).toFixed(2) : '' }));
  };

  const handleUsdChange = (val) => {
    setForm(p => ({ ...p, usd: val, amount: val ? (parseFloat(val) / currentPrice).toFixed(8) : '' }));
  };

  const handleReview = () => {
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.error('Enter a valid amount');
    if (mode === 'sell' && parseFloat(form.amount) > (balances[selectedAsset.id] || 0))
      return toast.error('Insufficient balance');
    setStep(3);
  };

  const handleConfirm = async () => {
    setLoading(true);
    const fn = mode === 'buy' ? buyCrypto : sellCrypto;
    const res = await fn({ coin: selectedAsset.id, amount: parseFloat(form.amount), usd: parseFloat(form.usd) });
    setLoading(false);
    if (res.success) {
      toast.success(`${mode === 'buy' ? 'Purchased' : 'Sold'} ${form.amount} ${selectedAsset.id}! 🚀`);
      setStep(4);
    } else {
      toast.error(res.message);
    }
  };

  const reset = () => { setForm({ amount: '', usd: '' }); setStep(1); setSelectedAsset(null); };

  return (
    <div style={{ position: 'relative' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 className="font-orbitron" style={{ fontSize: 24, marginBottom: 6 }}>📈 Markets</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Trade crypto, stocks & commodities across the galaxy</p>
      </motion.div> {/* FIX: was </motion.divdiv> */}

      <PendingTransactionBanner /> 

      <AnimatePresence mode="wait"> 

        {step === 1 && (
          <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'relative' }}>
            <AccountLockedOverlay />
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {['all', 'crypto', 'stocks', 'commodities'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{
                    padding: '8px 18px', borderRadius: 20, cursor: 'pointer',
                    background: tab === t ? 'linear-gradient(135deg, var(--cosmic-blue), var(--nebula-purple))' : 'rgba(255,255,255,0.05)',
                    color: tab === t ? 'white' : 'var(--text-secondary)',
                    fontFamily: 'Orbitron, monospace', fontSize: 11, letterSpacing: 1,
                    transition: 'all 0.3s',
                    border: tab === t ? 'none' : '1px solid var(--glass-border)',
                  }}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Search bar positioned after commodities */}
            <div style={{ marginBottom: 20, position: 'relative' }}>
              <input
                className="galaxy-input"
                type="text"
                placeholder="Search BTC, Apple, Gold..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: 42, fontFamily: 'Share Tech Mono, monospace', fontSize: 14 }}
              />
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--text-secondary)', pointerEvents: 'none' }}>
                🔍
              </span>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 18 }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Results count */}
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: 12, 
              marginBottom: 12,
              fontFamily: 'Share Tech Mono, monospace'
            }}>
              {filteredAssets.length} market{filteredAssets.length !== 1 ? 's' : ''} found
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {filteredAssets.length > 0 ? filteredAssets.map((asset, i) => {
                const price = livePrices[asset.id];
                const change = ((price - asset.basePrice) / asset.basePrice * 100).toFixed(2);
                const up = parseFloat(change) >= 0;
                return (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectAsset(asset)}
                    style={{
                      padding: '16px', borderRadius: 14, cursor: 'pointer',
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${asset.color}33`,
                      transition: 'all 0.3s', backdropFilter: 'blur(10px)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.border = `1px solid ${asset.color}88`}
                    onMouseLeave={(e) => e.currentTarget.style.border = `1px solid ${asset.color}33`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 22, color: asset.color }}>{asset.icon}</span>
                        <div>
                          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, color: 'white', fontWeight: 700 }}>{asset.id}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>{asset.name}</div>
                        </div>
                      </div>
                      <div style={{
                        padding: '3px 8px', borderRadius: 6,
                        background: up ? 'rgba(0,255,135,0.1)' : 'rgba(255,49,49,0.1)',
                        border: `1px solid ${up ? 'rgba(0,255,135,0.3)' : 'rgba(255,49,49,0.3)'}`,
                        fontSize: 11, fontFamily: 'Share Tech Mono, monospace',
                        color: up ? '#00FF87' : '#FF3131',
                      }}>
                        {up ? '+' : ''}{change}%
                      </div>
                    </div>

                    <div style={{ height: 40, marginBottom: 8 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={generateChartData(asset.basePrice, 12, 0.02)}>
                          <Line type="monotone" dataKey="price" stroke={up ? '#00FF87' : '#FF3131'} dot={false} strokeWidth={1.5} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 15, color: 'white', fontWeight: 700 }}>
                      ${price < 1 ? price.toFixed(4) : price.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace', marginTop: 2 }}>
                      {asset.type.toUpperCase()}
                    </div>
                  </motion.div>
                );
              }) : (
                <div style={{ 
                  gridColumn: '1 / -1',
                  padding: 40, 
                  textAlign: 'center', 
                  color: 'var(--text-secondary)',
                  fontFamily: 'Share Tech Mono, monospace'
                }}>
                  No markets found for "{search}"
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 2 && selectedAsset && (
          <motion.div key="detail" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <button onClick={reset}
              style={{ background: 'none', border: 'none', color: 'var(--star-cyan)', cursor: 'pointer', fontFamily: 'Orbitron, monospace', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              ← BACK TO MARKETS
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
              <div className="glass-card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: `${selectedAsset.color}22`, border: `2px solid ${selectedAsset.color}66`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26, color: selectedAsset.color, boxShadow: `0 0 20px ${selectedAsset.color}33`,
                    }}>
                      {selectedAsset.icon}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 18, color: 'white', fontWeight: 700 }}>{selectedAsset.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>
                        {selectedAsset.id} · {selectedAsset.type.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <motion.div key={livePrice} initial={{ opacity: 0.5, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                      style={{ fontFamily: 'Orbitron, monospace', fontSize: 28, color: 'white', fontWeight: 700 }}>
                      ${livePrice < 1 ? livePrice?.toFixed(4) : livePrice?.toLocaleString()}
                    </motion.div>
                    <div style={{ fontSize: 14, fontFamily: 'Share Tech Mono, monospace', color: isUp ? '#00FF87' : '#FF3131' }}>
                      {isUp ? '▲' : '▼'} {Math.abs(priceChange)}% today
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {['1D', '1W', '1M', '1Y'].map(r => (
                    <button key={r} onClick={() => setChartRange(r)}
                      style={{
                        padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: chartRange === r ? selectedAsset.color : 'rgba(255,255,255,0.05)',
                        color: chartRange === r ? 'white' : 'var(--text-secondary)',
                        fontFamily: 'Orbitron, monospace', fontSize: 11, transition: 'all 0.2s',
                      }}>
                      {r}
                    </button>
                  ))}
                </div>

                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isUp ? '#00FF87' : '#FF3131'} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={isUp ? '#00FF87' : '#FF3131'} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" tick={{ fill: '#888', fontSize: 10, fontFamily: 'Share Tech Mono, monospace' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fill: '#888', fontSize: 10, fontFamily: 'Share Tech Mono, monospace' }} axisLine={false} tickLine={false} width={70}
                        tickFormatter={v => v < 1 ? v.toFixed(4) : '$' + v.toLocaleString()} domain={['auto', 'auto']} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="price" stroke={isUp ? '#00FF87' : '#FF3131'} strokeWidth={2} fill="url(#colorGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 20 }}>
                  {[
                    { label: '24H HIGH', value: `$${(currentPrice * 1.03).toFixed(currentPrice < 1 ? 4 : 2)}` },
                    { label: '24H LOW',  value: `$${(currentPrice * 0.97).toFixed(currentPrice < 1 ? 4 : 2)}` },
                    { label: 'VOLUME',   value: selectedAsset.type === 'crypto' ? '$28.4B' : '$4.2B' },
                    { label: 'MKT CAP',  value: selectedAsset.type === 'crypto' ? '$847B' : '$2.9T' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'Orbitron, monospace', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, color: 'white', fontFamily: 'Share Tech Mono, monospace' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card" style={{ padding: 24, height: 'fit-content' }}>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4, marginBottom: 20 }}>
                  {['buy', 'sell'].map((m) => (
                    <button key={m} onClick={() => setMode(m)}
                      style={{
                        flex: 1, padding: '10px', border: 'none', borderRadius: 8, cursor: 'pointer',
                        background: mode === m ? (m === 'buy' ? 'linear-gradient(135deg,#00FF87,#00B2FF)' : 'linear-gradient(135deg,#FF3131,#FF7B7B)') : 'rgba(255,255,255,0.05)',
                        color: mode === m ? 'white' : 'var(--text-secondary)',
                        fontFamily: 'Orbitron, monospace', fontSize: 13, textTransform: 'uppercase',
                        transition: 'all 0.3s',
                      }}>
                      {m}
                    </button>
                  ))}
                </div> 