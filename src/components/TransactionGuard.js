import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '../store';
import toast from 'react-hot-toast';

// ── Pending Transaction Banner ─────────────────────────────────────────────
export function PendingTransactionBanner() {
  const { pendingTransaction, cancelTransaction, isLocked } = useWalletStore();

  if (!pendingTransaction && !isLocked) return null;

  const handleCancel = () => {
    const result = cancelTransaction();
    if (result?.locked) {
      toast.error('🚫 Account locked due to suspicious activity. Contact support.', { duration: 6000 });
    } else {
      toast('Transaction cancelled.', { icon: '❌', duration: 3000 });
    }
  };

  const elapsed = pendingTransaction
    ? Math.floor((Date.now() - new Date(pendingTransaction.startedAt).getTime()) / 1000)
    : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        style={{
          marginBottom: 20,
          borderRadius: 14,
          overflow: 'hidden',
          border: `1px solid ${isLocked ? 'rgba(255,49,49,0.5)' : 'rgba(255,165,0,0.4)'}`,
          background: isLocked ? 'rgba(255,49,49,0.07)' : 'rgba(255,165,0,0.06)',
        }}
      >
        {/* Top bar */}
        <div style={{
          padding: '10px 20px',
          background: isLocked ? 'rgba(255,49,49,0.15)' : 'rgba(255,165,0,0.12)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ fontSize: 18 }}
          >
            {isLocked ? '🚫' : '⏳'}
          </motion.span>
          <span style={{
            fontFamily: 'Orbitron, monospace', fontSize: 13, fontWeight: 700,
            color: isLocked ? '#FF3131' : '#FFA500', letterSpacing: 1,
          }}>
            {isLocked ? 'ACCOUNT LOCKED -- SUSPICIOUS ACTIVITY DETECTED' : 'TRANSACTION IN PROGRESS -- NEW TRANSACTIONS BLOCKED'}
          </span>
        </div>

        {/* Details */}
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {pendingTransaction && !isLocked && (
            <>
              <div style={{ display: 'flex', gap: 20, flex: 1, flexWrap: 'wrap' }}>
                {[
                  { label: 'TX ID', value: pendingTransaction.id },
                  { label: 'TYPE', value: pendingTransaction.type?.toUpperCase() },
                  { label: 'COIN', value: pendingTransaction.coin },
                  { label: 'AMOUNT', value: pendingTransaction.amount },
                  { label: 'ELAPSED', value: `${elapsed}s` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Orbitron, monospace', letterSpacing: 1, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, color: 'white', fontFamily: 'Share Tech Mono, monospace' }}>{value}</div>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleCancel}
                style={{
                  padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
                  background: 'rgba(255,49,49,0.12)',
                  border: '1px solid rgba(255,49,49,0.35)',
                  color: '#FF3131', fontFamily: 'Orbitron, monospace',
                  fontSize: 11, letterSpacing: 1, transition: 'all 0.2s',
                }}
              >
                CANCEL TX
              </motion.button>
            </>
          )}

          {isLocked && (
            <div style={{ flex: 1 }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Share Tech Mono, monospace', fontSize: 13, margin: 0 }}>
                Your account has been temporarily locked due to repeated suspicious actions.
                Please contact support to restore access. No transactions can be made until unlocked.
              </p>
            </div>
          )}
        </div>

        {/* Anti-fraud notice */}
        {!isLocked && (
          <div style={{
            padding: '8px 20px',
            borderTop: '1px solid rgba(255,165,0,0.15)',
            background: 'rgba(0,0,0,0.2)',
          }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Share Tech Mono, monospace', margin: 0 }}>
              🛡️ ONE ACTIVE TRANSACTION POLICY · Prevents double-spending and protects against fraud.
              Complete or cancel your current transaction to proceed.
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Account Locked Full-Screen Overlay ────────────────────────────────────
export function AccountLockedOverlay() {
  const { isLocked } = useWalletStore();

  if (!isLocked) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 16,
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ fontSize: 72, marginBottom: 20 }}
      >
        🔒
      </motion.div>

      <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: 20, color: '#FF3131', marginBottom: 10, textAlign: 'center' }}>
        ACCOUNT LOCKED
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Share Tech Mono, monospace', fontSize: 13, textAlign: 'center', maxWidth: 320 }}>
        Suspicious activity was detected on your account. All transactions are blocked.
        Please contact support to restore access.
      </p>
      <div style={{
        marginTop: 24, padding: '10px 24px',
        border: '1px solid rgba(255,49,49,0.3)',
        borderRadius: 8, background: 'rgba(255,49,49,0.08)',
        fontFamily: 'Orbitron, monospace', fontSize: 12,
        color: '#FF3131', letterSpacing: 1,
      }}>
        📧 support@cryptogalaxy.io
      </div>
    </motion.div>
  );
}

// ── Fraud Warning Toast Helper ─────────────────────────────────────────────
export function showFraudWarning(message) {
  toast(message || '⚠️ Suspicious activity flagged on your account.', {
    icon: '🛡️',
    duration: 6000,
    style: {
      background: 'rgba(255,49,49,0.12)',
      color: '#FF3131',
      border: '1px solid rgba(255,49,49,0.4)',
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '14px',
    },
  });
}