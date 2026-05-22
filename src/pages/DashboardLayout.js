import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import { useAuthStore, useWalletStore } from '../store';

const NAV_ITEMS = [
  { icon: '🌌', label: 'Overview',      path: '/dashboard' },
  { icon: '💼', label: 'Wallet',        path: '/dashboard/wallet' },
  { icon: '💸', label: 'Send & Receive',path: '/dashboard/transfer' },
  { icon: '🛒', label: 'Buy & Sell', path: '/dashboard/trade' },
  { icon: '💹', label: 'StockMarket', path: '/dashboard/stock-market' }, // NEW
  { icon: '💳', label: 'Payments',      path: '/dashboard/payments' },
  { icon: '🎴', label: 'Card Nexus',    path: '/dashboard/gift-cards' }, // NEW
  { icon: '🔔', label: 'Notifications', path: '/dashboard/notifications' },
  { icon: '⚙️', label: 'Settings', path: '/dashboard/settings' },
  { icon: '📰', label: 'News Feed', path: '/dashboard/news' }, // NEW
  { icon: '💳', label: 'Virtual Card', path: '/dashboard/virtual-card' }, // NEW
];

const pageVariants = {
  initial: { opacity: 0, y: 24, scale: 0.98, filter: 'blur(8px)' },
  animate: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0, y: -16, scale: 0.97, filter: 'blur(6px)',
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuthStore();
  const { fetchBalances, fetchPrices, fetchTransactions } = useWalletStore();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchBalances();
    fetchPrices();
    fetchTransactions();

    const BACKEND_URL = process.env.REACT_APP_API_URL || 'https://crypto-galaxy-backend.onrender.com';

    const socket = io(BACKEND_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => console.log('🔌 Socket connected'));
    socket.on('connect_error', (err) => console.warn('Socket error:', err.message));

    socket.on('notification', (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnread((prev) => prev + 1);
      toast(data.message, {
        icon: data.type === 'transaction' ? '💸' : data.type === 'escrow' ? '🔒' : data.type === 'login' ? '🔐' : '🔔',
        style: {
          background: 'rgba(10,10,40,0.95)',
          color: '#E8E8FF',
          border: '1px solid rgba(0,245,255,0.3)',
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '15px',
        },
      });
    });

    socket.on('transactionUpdate', (data) => {
      fetchBalances();
      fetchTransactions();
      toast.success(`Transaction ${data.status}: ${data.amount} ${data.coin}`, {
        style: {
          background: 'rgba(0,255,135,0.1)',
          color: '#00FF87',
          border: '1px solid rgba(0,255,135,0.3)',
        },
      });
    });

    return () => socket.disconnect();
  }, [token]); // eslint-disable-line

  const handleLogout = () => {
    logout();
    toast('You have left the galaxy. Come back soon! 👋', { icon: '🚀' });
    navigate('/login');
  };

  const currentPath = location.pathname;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--galaxy-black)', position: 'relative' }}>
      {/* Sidebar */}
      <motion.aside
        className="sidebar"
        style={{ zIndex: 10, position: 'relative' }}
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--glass-border)' }}>
          <Logo size="sm" />
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.div
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--cosmic-blue), var(--nebula-purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: 16,
                boxShadow: '0 0 12px rgba(0,245,255,0.4)',
              }}
              animate={{ boxShadow: ['0 0 12px rgba(0,245,255,0.4)', '0 0 20px rgba(114,9,183,0.5)', '0 0 12px rgba(0,245,255,0.4)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {user?.firstName?.[0] || 'A'}
            </motion.div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>
                {user?.email?.slice(0, 22)}{user?.email?.length > 22 ? '...' : ''}
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item, index) => (
            <motion.button
              key={item.path}
              className={`sidebar-link ${currentPath === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.97 }}
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.05 * index, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.label === 'Notifications' && unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    marginLeft: 'auto',
                    background: 'var(--nova-pink)',
                    color: 'white',
                    borderRadius: 10,
                    padding: '1px 7px',
                    fontSize: 11,
                    fontFamily: 'Orbitron, monospace',
                  }}
                >
                  {unread}
                </motion.span>
              )}
            </motion.button>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid var(--glass-border)' }}>
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%', padding: '10px', background: 'rgba(255,49,49,0.1)',
              border: '1px solid rgba(255,49,49,0.3)', borderRadius: 8,
              color: 'var(--danger-red)', fontFamily: 'Orbitron, monospace',
              fontSize: 12, letterSpacing: 1, cursor: 'pointer', transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,49,49,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,49,49,0.1)'}
          >
            🚪 EJECT
          </motion.button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="main-content" style={{ padding: '12px 32px', position: 'relative', zIndex: 5, flex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ height: '100%' }}
          >
            <Outlet context={{ notifications, unread, setUnread }} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
