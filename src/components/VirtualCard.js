import { useState } from "react";
import {
  G, API_BASE, btnStyle, inputStyle,
  generateCardNumber, generateCVV, generateExpiry,
  MOCK_CARD_TXN,
} from "../constants";  // ✅ Changed from "../../constants" to "../constants"

export default function VirtualCard() {
  const [card, setCard] = useState(null);
  const [balance, setBalance] = useState(0);
  const [depositAmt, setDepositAmt] = useState("");
  const [depositCoin, setDepositCoin] = useState("BTC");
  const [flipped, setFlipped] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [txns, setTxns] = useState(MOCK_CARD_TXN);
  const [filter, setFilter] = useState("all");
  const [generating, setGenerating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsTxn, setDetailsTxn] = useState(null);
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserUrl, setBrowserUrl] = useState("");

  // ── Generate card ───────────────────────────────────────────
  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/cards/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "virtual" }),
      });
      const data = await res.json();
      setCard(data.card);
      setBalance(data.card.balance || 0);
    } catch {
      setCard({
        number: generateCardNumber(),
        cvv: generateCVV(),
        expiry: generateExpiry(),
        name: "GALAXY USER",
        type: "VISA",
        tier: "PLATINUM",
      });
    }
    setGenerating(false);
  }

  // ── Deposit ─────────────────────────────────────────────────
  async function handleDeposit() {
    const amt = parseFloat(depositAmt);
    if (!amt || amt <= 0) return;
    try {
      const res = await fetch(`${API_BASE}/cards/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, coin: depositCoin }),
      });
      const data = await res.json();
      setBalance(data.newBalance ?? balance + amt);
    } catch {
      setBalance((b) => b + amt);
    }
    setTxns((prev) => [
      {
        id: `txn${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        merchant: `Deposit from ${depositCoin} Wallet`,
        amount: +amt,
        currency: "USD",
        status: "settled",
        category: "Deposit",
      },
      ...prev,
    ]);
    setDepositAmt("");
    setShowDeposit(false);
  }

  const filtered = txns.filter((t) => {
    if (filter === "deposits") return t.category === "Deposit";
    if (filter === "purchases") return t.category !== "Deposit";
    if (filter === "pending") return t.status === "pending";
    return true;
  });

  const totalSpent = txns.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalIn = txns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  const txnIcon = (cat) =>
    ({ Deposit: "⬇", Subscription: "♻", Shopping: "🛍", App: "📱" }[cat] ?? "💳");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { label: "Card Balance", value: `$${balance.toFixed(2)}`, sub: "Available to spend", color: G.cyan },
          { label: "Total Deposited", value: `$${totalIn.toFixed(2)}`, sub: "Funded from crypto wallet", color: G.green },
          { label: "Total Spent", value: `$${totalSpent.toFixed(2)}`, sub: "Across all transactions", color: G.gold },
        ].map((s) => (
          <div key={s.label} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, color: G.muted, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Card + Subscriptions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: G.text, fontWeight: 700, fontSize: 15 }}>Virtual Card</span>
            <div style={{ display: "flex", gap: 8 }}>
              {card && <button onClick={() => setFlipped((f) => !f)} style={btnStyle(G.border, G.muted)}>Flip</button>}
              {card && <button onClick={() => setShowDeposit((s) => !s)} style={btnStyle(G.accent, "#fff")}>+ Deposit</button>}
            </div>
          </div>

          {!card ? (
            <div
              onClick={generating ? undefined : handleGenerate}
              style={{ background: `linear-gradient(135deg,${G.accent}22,${G.cyan}11)`, border: `2px dashed ${G.accent}55`, borderRadius: 20, height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 12 }}
            >
              {generating
                ? <div style={{ color: G.accent, fontWeight: 700 }}>Generating…</div>
                : <>
                    <div style={{ fontSize: 36 }}>💳</div>
                    <div style={{ color: G.text, fontWeight: 600 }}>Generate Virtual Card</div>
                    <div style={{ color: G.muted, fontSize: 12 }}>Tap to create your crypto-backed card</div>
                  </>
              }
            </div>
          ) : (
            <div style={{ perspective: 700 }}>
              <div style={{ width: "100%", height: 200, position: "relative", transformStyle: "preserve-3d", transition: "transform 0.6s", transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}>
                {/* Front */}
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", background: "linear-gradient(135deg,#1a1060 0%,#6c63ff 50%,#00d4ff 100%)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: `0 20px 60px ${G.accentGlow}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: 2 }}>CRYPTO GALAXY</div>
                      <div style={{ fontSize: 12, color: "#fff", fontWeight: 700, letterSpacing: 1 }}>{card.tier}</div>
                    </div>
                    <div style={{ fontSize: 28, opacity: 0.9 }}>◈</div>
                  </div>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 17, letterSpacing: 3, color: "#fff" }}>{card.number}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>CARD HOLDER</div>
                      <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{card.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>EXPIRES</div>
                      <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{card.expiry}</div>
                    </div>
                    <div style={{ fontSize: 22, fontStyle: "italic", color: "#fff", fontWeight: 900 }}>{card.type}</div>
                  </div>
                </div>
                {/* Back */}
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg,#1a1060 0%,#4a44aa 100%)", borderRadius: 20, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, boxShadow: `0 20px 60px ${G.accentGlow}` }}>
                  <div style={{ background: "#000", height: 48 }} />
                  <div style={{ margin: "0 24px", background: "rgba(255,255,255,0.1)", borderRadius: 6, padding: "10px 16px", display: "flex", justifyContent: "flex-end" }}>
                    <span style={{ fontFamily: "'Courier New',monospace", fontSize: 18, color: "#fff", letterSpacing: 3 }}>{card.cvv}</span>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.5)", padding: "0 24px" }}>This card is powered by Crypto Galaxy. Authorized use only.</div>
                </div>
              </div>
            </div>
          )}

          {showDeposit && (
            <div style={{ marginTop: 14, background: G.panel, border: `1px solid ${G.accent}44`, borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ color: G.text, fontWeight: 600, fontSize: 13 }}>Deposit to Card</div>
              <select value={depositCoin} onChange={(e) => setDepositCoin(e.target.value)} style={inputStyle}>
                {["BTC", "ETH", "SOL", "BNB", "ADA", "XRP"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Amount in USD" value={depositAmt} onChange={(e) => setDepositAmt(e.target.value)} style={inputStyle} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleDeposit} style={{ ...btnStyle(G.accent, "#fff"), flex: 1 }}>Confirm Deposit</button>
                <button onClick={() => setShowDeposit(false)} style={btnStyle(G.border, G.muted)}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Subscriptions */}
        <div>
          <div style={{ color: G.text, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Active Subscriptions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { name: "Netflix", amount: 15.99, next: "Jun 1", icon: "🎬", color: "#e50914" },
              { name: "Spotify", amount: 9.99, next: "Jun 3", icon: "🎵", color: "#1db954" },
              { name: "Apple One", amount: 19.95, next: "Jun 5", icon: "🍎", color: "#555" },
              { name: "ChatGPT Plus", amount: 20.00, next: "Jun 8", icon: "🤖", color: "#10a37f" },
            ].map((s) => (
              <div key={s.name} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, background: s.color + "22", border: `1px solid ${s.color}44`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{s.icon}</div>
                  <div>
                    <div style={{ color: G.text, fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ color: G.muted, fontSize: 11 }}>Next: {s.next}</div>
                  </div>
                </div>
                <div style={{ color: G.red, fontWeight: 700, fontSize: 13 }}>-${s.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ color: G.text, fontWeight: 700 }}>Transaction History</span>
          <div style={{ display: "flex", gap: 6 }}>
            {["all", "deposits", "purchases", "pending"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ ...btnStyle(filter === f ? G.accent : G.border, filter === f ? "#fff" : G.muted), fontSize: 11, padding: "4px 10px" }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: G.panel, borderRadius: 10, border: `1px solid ${G.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: (t.amount > 0 ? G.green : G.red) + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  {txnIcon(t.category)}
                </div>
                <div>
                  <div style={{ color: G.text, fontSize: 13, fontWeight: 600 }}>{t.merchant}</div>
                  <div style={{ color: G.muted, fontSize: 11 }}>{t.date} · {t.category}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: t.amount > 0 ? G.green : G.red, fontWeight: 700 }}>
                  {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toFixed(2)}
                </div>
                <div style={{ fontSize: 11, color: t.status === "pending" ? G.gold : G.muted }}>{t.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}