import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';


const api = axios.create({ baseURL: 'https://crypto-galaxy-backend.onrender.com/api' });

// Attach JWT to every request
api.interceptors.request.use((config) => {
const token = localStorage.getItem('cg_token');
if (token) config.headers.Authorization = `Bearer ${token}`;
return config;
});

export const useAuthStore = create(
persist(
(set, get) => ({
user: null,
token: null,
isAuthenticated: false,
loading: false,
error: null,

setLoading: (loading) => set({ loading }),
setError: (error) => set({ error }),
clearError: () => set({ error: null }),

register: async (data) => {
set({ loading: true, error: null });
try {
const res = await api.post('/auth/register', data);
set({ loading: false });
return { success: true, message: res.data.message };
} catch (err) {
const msg = err.response?.data?.message || 'Registration failed';
set({ loading: false, error: msg });
return { success: false, message: msg };
}
},

verifyEmail: async (email, otp) => {
set({ loading: true, error: null });
try {
const res = await api.post('/auth/verify-email', { email, otp });
set({ loading: false });
return { success: true, message: res.data.message };
} catch (err) {
const msg = err.response?.data?.message || 'Verification failed';
set({ loading: false, error: msg });
return { success: false, message: msg };
}
},

verifyPhone: async (phone, otp) => {
set({ loading: true, error: null });
try {
const res = await api.post('/auth/verify-phone', { phone, otp });
set({ loading: false });
return { success: true, message: res.data.message };
} catch (err) {
const msg = err.response?.data?.message || 'Phone verification failed';
set({ loading: false, error: msg });
return { success: false, message: msg };
}
},

login: async (email, password) => {
set({ loading: true, error: null });
try {
const res = await api.post('/auth/login', { email, password });
const { token, user } = res.data;
localStorage.setItem('cg_token', token);
set({ token, user, isAuthenticated: true, loading: false });
return { success: true };
} catch (err) {
const msg = err.response?.data?.message || 'Login failed';
set({ loading: false, error: msg });
return { success: false, message: msg };
}
},

logout: () => {
localStorage.removeItem('cg_token');
set({ user: null, token: null, isAuthenticated: false });
},

refreshUser: async () => {
try {
const res = await api.get('/auth/me');
set({ user: res.data.user });
} catch {
get().logout();
}
},
}),
{
name: 'crypto-galaxy-auth',
partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
}
)
);

export const useWalletStore = create(
persist(
    (set, get) => ({
        balances: { BTC: 0, ETH: 0, SOL: 0, USDT: 0 },
        transactions: [],
        prices: { BTC: 0, ETH: 0, SOL: 0, USDT: 1 },
        loading: false,

        // ── Transaction Lock & Anti-Fraud ──────────────────────────────
        pendingTransaction: null,   // { id, type, coin, amount, address, startedAt }
        flaggedAttempts: [],        // track suspicious activity
        isLocked: false,            // hard lock after too many flags

        // Start a pending transaction – blocks any new one
        startTransaction: (txData) => {
            const { pendingTransaction, isLocked } = get();

            if (isLocked) {
                return {
                    success: false,
                    reason: 'ACCOUNT_LOCKED',
                    message: '🚫 Your account is temporarily locked due to suspicious activity. Contact support.',
                };
            }

            if (pendingTransaction) {
                return {
                    success: false,
                    reason: 'PENDING_EXISTS',
                    message: '⚠️ You have a pending transaction. Complete or cancel it before starting a new one.',
                };
            }

            const tx = {
                id: `TX-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
                txData,
                startedAt: new Date().toISOString(),
                status: 'pending',
            };

            set({ pendingTransaction: tx });
            return { success: true, transaction: tx };
        },

        // Complete the pending transaction
        completeTransaction: () => {
                set({ pendingTransaction: null });
            },

            // Cancel the pending transaction
            cancelTransaction: () => {
                const { pendingTransaction, flaggedAttempts } = get();
                if (!pendingTransaction) return;

                const recentFlags = flaggedAttempts.filter(
                    (f) => Date.now() - new Date(f.at).getTime() < 10 * 60 * 1000
                );

                const newFlags = [
                    flaggedAttempts,
                    { reason: 'rapid_cancel', txId: pendingTransaction.id, at: new Date().toISOString() },
                ];

                const shouldLock = recentFlags.length >= 4;

                set({
                    pendingTransaction: null,
                    flaggedAttempts: newFlags,
                    isLocked: shouldLock,
                });

                return { locked: shouldLock };
        },

            // Flag a suspicious action
            flagSuspiciousActivity: (reason, details = {}) => {
                const { flaggedAttempts } = get();
                const newFlags = [
                    flaggedAttempts,
                    { reason, details, at: new Date().toISOString() },
                ];

                const recentFlags = newFlags.filter(
                    (f) => Date.now() - new Date(f.at).getTime() < 30 * 60 * 1000
                );
                const shouldLock = recentFlags.length >= 5;

                set({ flaggedAttempts: newFlags, isLocked: shouldLock });
                return { locked: shouldLock };
            },

            // Unlock account (admin/support action)
            unlockAccount: () => {
        set({ isLocked: false, flaggedAttempts: [], pendingTransaction: null });
    },

        // ── Wallet Actions ─────────────────────────────────────────────
    fetchBalances: async () => {
        try {
            const res = await api.get('/wallet/balances');
            set({ balances: res.data.balances });
        } catch (err) { console.error(err); }
    },

    fetchTransactions: async () => {
        try {
            const res = await api.get('/wallet/transactions');
            set({ transactions: res.data.transactions });
        } catch (err) { console.error(err); }
    },

    fetchPrices: async () => {
        try {
            const res = await api.get('/payments/prices');
            set({ prices: res.data.prices });
        } catch (err) { console.error(err); }
    },

    sendCrypto: async (data) => {
        const { startTransaction, completeTransaction, flagSuspiciousActivity } = get();

        const lockResult = startTransaction({
            type: 'send',
            coin: data.coin,
            amount: data.amount,
            address: data.toAddress,
        });

        if (!lockResult.success) {
            return { success: false, message: lockResult.message };
        }

        set({ loading: true });
        try {
            const res = await api.post('/wallet/send', data);
            completeTransaction();
            set({ loading: false });
            return { success: true, data: res.data };
        } catch (err) {
            flagSuspiciousActivity('failed_send', { coin: data.coin, amount: data.amount });
            completeTransaction();
            set({ loading: false });
            return { success: false, message: err.response?.data?.message || 'Transaction failed' };
        }
    },

    buyCrypto: async (data) => {
        const { startTransaction, completeTransaction } = get();

        const lockResult = startTransaction({
            type: 'buy',
            coin: data.coin,
            amount: data.amount,
        });

        if (!lockResult.success) {
            return { success: false, message: lockResult.message };
        }

        set({ loading: true });
        try {
            const res = await api.post('/wallet/buy', data);
            completeTransaction();
            set({ loading: false });
            return { success: true, data: res.data };
        } catch (err) {
            completeTransaction();
            set({ loading: false });
            return { success: false, message: err.response?.data?.message || 'Purchase failed' };
        }
    },

        sellCrypto: async (data) => {
const { startTransaction, completeTransaction } = get();

const lockResult = startTransaction({
type: 'sell',
coin: data.coin,
amount: data.amount,
});

if (!lockResult.success) {
return { success: false, message: lockResult.message };
}

set({ loading: true });
try {
const res = await api.post('/wallet/sell', data);
completeTransaction();
set({ loading: false });
return { success: true, data: res.data };
} catch (err) {
completeTransaction();
set({ loading: false });
return { success: false, message: err.response?.data?.message || 'Sale failed' };
}
},
}),
{
    name: 'crypto-galaxy-wallet',
        partialize: (state) => ({
pendingTransaction: state.pendingTransaction,
flaggedAttempts: state.flaggedAttempts,
isLocked: state.isLocked,
}),
}
)
);

export { api };