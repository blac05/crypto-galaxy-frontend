import { useState, useEffect } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "https://crypto-galaaxy-backend.onrender.com/api";

// ── Theme ─────────────────────────────────────────────────────────────────────
const G = {
  bg:     "#04050f",
  panel:  "#0a0d1e",
  card:   "#0f1328",
  border: "#1a2040",
  accent: "#6c63ff",
  cyan:   "#00d4ff",
  green:  "#00ff9d",
  red:    "#ff4d6d",
  gold:   "#ffd700",
  text:   "#e8eaff",
  muted:  "#5a6080",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateCardNumber() {
  return (
    "4" +
    Array.from({ length: 15 }, () => Math.floor(Math.random() * 10))
      .join("")
      .replace(/(.{4})/g, "$1 ")
      .trim()
  );
}
function generateCVV()    { return String(Math.floor(100 + Math.random() * 900)); }
function generateExpiry() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 3);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
}

const btn = (bg, color, extra = {}) => ({
  background: bg,
  color,
  border: `1px solid ${bg}`,
  borderRadius: 8,
  padding: "7px 16px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 12,
  ...extra,
});

const inputSt = {
  background: "#0a0d1e",
  border: `1px solid #1a2040`,
  color: "#e8eaff",
  borderRadius: 8,
  padding: "9px 12px",
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

// ── Mock fallback transactions ────────────────────────────────────────────────
const MOCK_TXN = [
  { id: "t1", date: "2025-05-15", merchant: "Netflix",                 amount: -15.99,  currency: "USD", status: "settled", category: "Subscription" },
  { id: "t2", date: "2025-05-14", merchant: "Amazon",                  amount: -89.45,  currency: "USD", status: "settled", category: "Shopping"     },
  { id: "t3", date: "2025-05-13", merchant: "Deposit from BTC Wallet", amount: +500.00, currency: "USD", status: "settled", category: "Deposit"      },
  { id: "t4", date: "2025-05-12", merchant: "Spotify Premium",         amount: -9.99,   currency: "USD", status: "settled", category: "Subscription" },
  { id: "t5", date: "2025-05-11", merchant: "Apple App Store",         amount: -4.99,   currency: "USD", status: "pending", category: "App"          },
  { id: "t6", date: "2025-05-10", merchant: "Deposit from ETH Wallet", amount: +200.00, currency: "USD", status: "settled", category: "Deposit"      },
  { id: "t7", date: "2025-05-09", merchant: "ChatGPT Plus",            amount: -20.00,  currency: "USD", status: "settled", category: "Subscription" },
  { id: "t8", date: "2025-05-08", merchant: "Uber Eats",               amount: -34.20,  currency: "USD", status: "settled", category: "Food"         },
];

const SUBSCRIPTIONS = [
  { name: "Netflix",          amount: 15.99, next: "Jun 1",  icon: "🎬", color: "#e50914" },
  { name: "Spotify",          amount: 9.99,  next: "Jun 3",  icon: "🎵", color: "#1db954" },
  { name: "Apple One",        amount: 19.95, next: "Jun 5",  icon: "🍎", color: "#888"    },
  { name: "ChatGPT Plus",     amount: 20.00, next: "Jun 8",  icon: "🤖", color: "#10a37f" },
  { name: "Adobe CC",         amount: 52.99, next: "Jun 10", icon: "🎨", color: "#ff0000" },
  { name: "HBO Max",          amount: 14.99, next: "Jun 12", icon: "📺", color: "#5b0060" },
  { name: "Amazon Prime",     amount: 14.99, next: "Jun 15", icon: "🛒", color: "#00a8e1" },
  { name: "Disney+",          amount: 7.99,  next: "Jun 20", icon: "🏰", color: "#113ccf" },
  { name: "Xbox Game Pass",   amount: 14.99, next: "Jun 25", icon: "🎮", color: "#107c10" },
  { name: "New York Times",   amount: 17.00, next: "Jun 30", icon: "🗞", color: "#000"    },
  { name: "LinkedIn Premium", amount: 29.99, next: "Jul 1",  icon: "💼", color: "#0077b5" },
  { name: "Canva Pro",        amount: 12.99, next: "Jul 5",  icon: "🖌", color: "#00c4cc" },
  { name: "Audible",          amount: 14.95, next: "Jul 10", icon: "🎧", color: "#f90"    },
  { name: "Dropbox",          amount: 11.99, next: "Jul 15", icon: "📁", color: "#007ee5" },
  { name: "Coursera Plus",    amount: 59.99, next: "Jul 20", icon: "🎓", color: "#2a73cc" },
  { name: "Strava",           amount: 5.00,  next: "Jul 25", icon: "🚴‍♂️", color: "#fc4c02" },
  { name: "Headspace",        amount: 12.99, next: "Jul 30", icon: "🧘‍♂️", color: "#ff6f61" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function VirtualCard() {
  const [card, setCard] = useState(null);
  const [balance, setBalance] = useState(0);
  const [txns, setTxns] = useState(MOCK_TXN);
  const [filter, setFilter] = useState("all");
  const [flipped, setFlipped] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmt, setDepositAmt] = useState("");
  const [depositCoin, setDepositCoin] = useState("BTC");
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/cards/generate`, { method: "POST", headers: { "Content-Type": "application/json" } })
      .then(r => r.json())
      .then(d => { if (d.card) { setCard(d.card); setBalance(d.card.balance || 0); } })
      .catch(() => {});
  }, []);

  function showToast(msg, color = G.green) {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/cards/generate`, { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      setCard(data.card);
      setBalance(data.card.balance || 0);
      showToast("Virtual card generated!");
    } catch {
      setCard({ number: generateCardNumber(), cvv: generateCVV(), expiry: generateExpiry(), name: "GALAXY USER", type: "VISA", tier: "PLATINUM" });
      showToast("Card generated (offline mode)");
    }
    setGenerating(false);
  }


  async function handleDeposit() {
    const amt = parseFloat(depositAmt);
    if (!amt || amt <= 0) return;
    try {
      const res  = await fetch(`${API_BASE}/cards/deposit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: amt, coin: depositCoin }) });
      const data = await res.json();
      setBalance(data.newBalance ?? balance + amt);
    } catch {
      setBalance(b => b + amt);
    }
    setTxns(prev => [
      { id: `t${Date.now()}`, date: new Date().toISOString().slice(0, 10), merchant: `Deposit from ${depositCoin} Wallet`, amount: +amt, currency: "USD", status: "settled", category: "Deposit" },
      ...prev,
    ]);
    showToast(`+$${amt.toFixed(2)} deposited from ${depositCoin}`);
    setDepositAmt("");
    setShowDeposit(false);
  }

  const filtered = txns.filter(t => {
    if (filter === "deposits")  return t.category === "Deposit";
    if (filter === "purchases") return t.category !== "Deposit";
    if (filter === "pending")   return t.status   === "pending";
    return true;
  });

  const totalSpent = txns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalIn    = txns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  const txnIcon = c => ({ Deposit: "⬇", Subscription: "♻", Shopping: "🛍", App: "📱", Food: "🍔" }[c] ?? "💳");

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", color: G.text, display: "flex", flexDirection: "column", gap: 24, position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, right: 28, background: toast.color + "22", border: `1px solid ${toast.color}66`, color: toast.color, borderRadius: 12, padding: "12px 20px", fontWeight: 600, fontSize: 13, zIndex: 9999, animation: "fadeUp 0.2s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* ── Stats Row ─────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { label: "Card Balance",    value: `$${balance.toFixed(2)}`,    sub: "Available to spend",        color: G.cyan  },
          { label: "Total Deposited", value: `$${totalIn.toFixed(2)}`,    sub: "Funded from crypto wallet", color: G.green },
          { label: "Total Spent",     value: `$${totalSpent.toFixed(2)}`, sub: "Across all transactions",   color: G.gold  },
        ].map(s => (
          <div key={s.label} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, color: G.muted, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Card + Subscriptions Row ──────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Card display */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Virtual Debit / Credit Card</span>
            <div style={{ display: "flex", gap: 8 }}>
              {card && <button onClick={() => setFlipped(f => !f)} style={btn(G.border, G.muted)}>Flip</button>}
              {card && <button onClick={() => setShowDeposit(s => !s)} style={btn(G.accent, "#fff")}>+ Deposit</button>}
            </div>
          </div>

          {!card ? (
            <div onClick={handleGenerate} style={{ cursor: "pointer", background: G.panel, border: `1px solid ${G.border}`, borderRadius: 18, height: 210, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12 }}
            >
              {generating
                ? <div style={{ color: G.accent, fontWeight: 700 }}>Generating card…</div>
                : <>
                    <div style={{ fontSize: 40 }}>💳</div>
                    <div style={{ fontWeight: 700 }}>Generate Your Virtual Card</div>
                    <div style={{ color: G.muted, fontSize: 12 }}>Crypto-backed · Tap to activate</div>
                  </>
              }
            </div>
          ) : (
            <div style={{ perspective: 800 }}>
              <div style={{ width: "100%", height: 210, position: "relative", transformStyle: "preserve-3d", transition: "transform 0.65s cubic-bezier(.4,0,.2,1)", transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}>
                {/* Front */}
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", background: "linear-gradient(135deg,#12094a 0%,#6c63ff 55%,#00d4ff 100%)", borderRadius: 22, padding: "22px 26px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 24px 64px #6c63ff44" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 2 }}>CRYPTO GALAXY</div>
                      <div style={{ fontSize: 12, color: "#fff", fontWeight: 800, letterSpacing: 1 }}>{card.tier}</div>
                    </div>
                    <div style={{ fontSize: 30, opacity: 0.85 }}>◈</div>
                  </div>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 18, letterSpacing: 4, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{card.number}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", letterSpacing: 1 }}>CARD HOLDER</div>
                      <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>{card.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", letterSpacing: 1 }}>EXPIRES</div>
                      <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>{card.expiry}</div>
                    </div>
                    <div style={{ fontSize: 24, fontStyle: "italic", color: "#fff", fontWeight: 900, letterSpacing: -1 }}>{card.type}</div>
                  </div>
                </div>
                {/* Back */}
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg,#12094a,#4a44aa)", borderRadius: 22, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, boxShadow: "0 24px 64px #6c63ff44" }}>
                  <div style={{ background: "#000", height: 52 }} />
                  <div style={{ margin: "0 26px", background: "rgba(255,255,255,0.1)", borderRadius: 6, padding: "10px 16px", display: "flex", justifyContent: "flex-end" }}>
                    <span style={{ fontFamily: "'Courier New',monospace", fontSize: 20, color: "#fff", letterSpacing: 4 }}>{card.cvv}</span>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.4)", padding: "0 26px" }}>Authorised use only · Powered by Crypto Galaxy</div>
                </div>
              </div>
            </div>
          )}

          {/* Deposit form */}
          {showDeposit && (
            <div style={{ marginTop: 14, background: G.panel, border: `1px solid ${G.accent}44`, borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", gap: 10, animation: "fadeUp 0.2s ease" }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Deposit to Card</div>
              <select value={depositCoin} onChange={e => setDepositCoin(e.target.value)} style={inputSt}>
                {["BTC","ETH","SOL","BNB","ADA","XRP"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Amount (USD equivalent)" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} style={inputSt} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleDeposit} style={{ ...btn(G.accent, "#fff"), flex: 1, padding: "10px 0" }}>Confirm Deposit</button>
                <button onClick={() => setShowDeposit(false)} style={btn(G.border, G.muted)}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Subscriptions */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Active Subscriptions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SUBSCRIPTIONS.map(s => (
              <div key={s.name} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, background: s.color + "22", border: `1px solid ${s.color}44`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                    <div style={{ color: G.muted, fontSize: 11 }}>Renews {s.next}</div>
                  </div>
                </div>
                <div style={{ color: G.red, fontWeight: 800, fontSize: 13 }}>-${s.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Transaction History ───────────────────────────────── */}
      <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Transaction History</span>
          <div style={{ display: "flex", gap: 6 }}>
            {["all","deposits","purchases","pending"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ ...btn(filter === f ? G.accent : G.border, filter === f ? "#fff" : G.muted), fontSize: 11, padding: "4px 10px" }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: G.panel, borderRadius: 12, border: `1px solid ${G.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: (t.amount > 0 ? G.green : G.red) + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>
                  {txnIcon(t.category)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.merchant}</div>
                  <div style={{ color: G.muted, fontSize: 11 }}>{t.date} · {t.category}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: t.amount > 0 ? G.green : G.red, fontWeight: 800, fontSize: 13 }}>{t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toFixed(2)}</div>
                <div style={{ fontSize: 11, color: t.status === "pending" ? G.gold : G.muted }}>{t.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );}
