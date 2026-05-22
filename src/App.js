import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';

// Pages
import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Register       from './pages/Register';
import DashboardLayout from './pages/DashboardLayout';
import Overview       from './pages/Overview';
import Wallet         from './pages/Wallet';
import Transfer       from './pages/Transfer';
import Trade          from './pages/Trade';
import Payments       from './pages/Payments';
import GiftCardHub    from './pages/GiftCardTradingHub';
import { Notifications, Settings } from './pages/NotificationsSettings';
import VirtualCard    from './pages/VirtualCard';    // fixed: was lowercase import
import StockMarket    from './pages/StockMarket';
import NewsFeed       from './pages/NewsFeed';

// Route guards
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background:     'rgba(10,10,40,0.95)',
            color:          '#E8E8FF',
            border:         '1px solid rgba(0,245,255,0.2)',
            fontFamily:     'Rajdhani, sans-serif',
            fontSize:       '15px',
            backdropFilter: 'blur(20px)',
            borderRadius:   '12px',
          },
          success: { iconTheme: { primary:'#00FF87', secondary:'#000' }, style: { border:'1px solid rgba(0,255,135,0.3)' } },
          error:   { iconTheme: { primary:'#FF3131', secondary:'#000' }, style: { border:'1px solid rgba(255,49,49,0.3)' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected dashboard — all pages live as child routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index                   element={<Overview />} />
          <Route path="wallet"           element={<Wallet />} />
          <Route path="transfer"         element={<Transfer />} />
          <Route path="trade"            element={<Trade />} />
          <Route path="payments"         element={<Payments />} />
          <Route path="gift-cards"       element={<GiftCardHub />} />
          <Route path="notifications"    element={<Notifications />} />
          <Route path="settings"         element={<Settings />} />
          <Route path="virtual-card"     element={<VirtualCard />} />
          <Route path="stock-market"     element={<StockMarket />} />
          <Route path="news"             element={<NewsFeed />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
