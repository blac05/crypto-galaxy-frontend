
import { useState, useEffect } from "react";
import { G, API_BASE, COINGECKO, btnStyle, inputStyle, fmt, pct, col, MOCK_PRICES, MOCK_PORTFOLIO, CHART_POINTS } from "../constants";
import Sparkline from "../components/Sparkline";

export default function MarketPage({ onTrade }) {
  const [coins,      setCoins]      = useState(MOCK_PRICES);
  const [selected,   setSelected]   = useState(MOCK_PRICES[0]);
  const [orderType,  setOrderType]  = useState("buy");
  const [orderMode,  setOrderMode]  = useState("market");
  const [amount,     setAmount]     = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [sortBy,     setSortBy]     = useState("mcap");
  const portfolio = MOCK_PORTFOLIO;

  // ── Live prices (CoinGecko, every 30s) ─────────────────────
  useEffect(() => {
    async function fetchPrices() {
      try {
        const res  = await fetch(
          `${COINGECKO}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          setCoins(
            data.map((c) => ({
              id:     c.id,
              symbol: c.symbol.toUpperCase(),
              name:   c.name,
              price:  c.current_price,
              change: c.price_change_percentage_24h,
              mcap:   fmt(c.market_cap),
              vol:    fmt(c.total_volume),
              img:    c.symbol.toUpperCase()[0],
            }))
          );
        }
      } catch {}
    }
    fetchPrices();
    const t = setInterval(fetchPrices, 30000);
    return () => clearInterval(t);
  }, []);

  // ── Place order ─────────────────────────────────────────────
  async function placeOrder() {
    const qty = parseFloat(amount);
    if (!qty) return;
    try {
      const res  = await fetch(`${API_BASE}/trades`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coin:  selected.id,
          type:  orderType,
          mode:  orderMode,
          amount: qty,
          price:  orderMode === "limit" ? parseFloat(limitPrice) : selected.price,
        }),
      });
      const data = await res.json();
      onTrade?.({ ...data, coin: selected.symbol, type: orderType, amount: qty });
    } catch {
      onTrade?.({ coin: selected.symbol, type: orderType, amount: qty, price: selected.price, status: "filled" });
    }
    setAmount("");
  }

  const orderTotal =
    parseFloat(amount || 0) *
    (orderMode === "limit" ? parseFloat(limitPrice || 0) : selected.price);

  // ── Render ──────────────────────────────────────────────────
  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: G.text, fontSize: 22, fontWeight: 800, margin: 0 }}>
          📈 Market
        </h1>
        <p style={{ color: G.muted, fontSize: 13, marginTop: 4 }}>
          Live crypto prices, charts, and order execution.
        </p>
      </div>

      <div style={{ display: "flex", gap: 20 }}>

        {/* ── Coin list ───────────────────────────────────── */}
        <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
            {["mcap", "price", "change"].map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                style={{ ...btnStyle(sortBy === s ? G.accent : G.border, sortBy === s ? "#fff" : G.muted), fontSize: 11, padding: "4px 8px" }}
              >
                {s}
              </button>
            ))}
          </div>

          {[...coins]
            .sort((a, b) =>
              sortBy === "price"  ? b.price  - a.price  :
              sortBy === "change" ? b.change - a.change : 0
            )
            .map((c) => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                style={{ background: selected.id === c.id ? G.accent + "22" : G.card, border: `1px solid ${selected.id === c.id ? G.accent : G.border}`, borderRadius: 12, padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, background: G.accent + "22", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: G.accent }}>
                    {c.img}
                  </div>
                  <div>
                    <div style={{ color: G.text, fontWeight: 700, fontSize: 13 }}>{c.symbol}</div>
                    <div style={{ color: G.muted, fontSize: 11 }}>{c.name}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: G.text, fontWeight: 600, fontSize: 12 }}>
                    ${c.price < 1 ? c.price.toFixed(4) : c.price.toLocaleString()}
                  </div>
                  <div style={{ color: col(c.change), fontSize: 11, fontWeight: 600 }}>{pct(c.change)}</div>
                </div>
              </div>
            ))}
        </div>

        {/* ── Chart + order panel ──────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Price header + chart */}
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, background: G.accent + "22", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: G.accent }}>
                    {selected.img}
                  </div>
                  <div>
                    <div style={{ color: G.text, fontWeight: 800, fontSize: 18 }}>{selected.name}</div>
                    <div style={{ color: G.muted, fontSize: 12 }}>{selected.symbol}/USD</div>
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <span style={{ color: G.text, fontSize: 28, fontWeight: 800 }}>
                    ${selected.price < 1 ? selected.price.toFixed(4) : selected.price.toLocaleString()}
                  </span>
                  <span style={{ color: col(selected.change), fontWeight: 700, fontSize: 16, marginLeft: 10 }}>
                    {pct(selected.change)}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {[["Market Cap", selected.mcap], ["24h Volume", selected.vol]].map(([k, v]) => (
                  <div key={k} style={{ textAlign: "right" }}>
                    <div style={{ color: G.muted, fontSize: 11 }}>{k}</div>
                    <div style={{ color: G.text, fontWeight: 700 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div style={{ background: G.panel, borderRadius: 12, padding: 16 }}>
              <svg width="100%" height="100" viewBox={`0 0 ${CHART_POINTS.length * 20} 100`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={G.accent} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={G.accent} stopOpacity="0"   />
                  </linearGradient>
                </defs>
                {(() => {
                  const mn  = Math.min(...CHART_POINTS);
                  const mx  = Math.max(...CHART_POINTS);
                  const pts = CHART_POINTS.map((v, i) =>
                    `${i * 20},${100 - ((v - mn) / (mx - mn)) * 90 - 5}`
                  ).join(" ");
                  return (
                    <>
                      <polyline points={`0,100 ${pts} ${(CHART_POINTS.length - 1) * 20},100`} fill="url(#cg)" stroke="none" />
                      <polyline points={pts} fill="none" stroke={G.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  );
                })()}
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((r) => (
                  <button key={r} style={{ ...btnStyle(G.border, G.muted), fontSize: 11, padding: "3px 8px" }}>{r}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Order panel */}
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 20 }}>
            {/* Buy / Sell toggle */}
            <div style={{ display: "flex", marginBottom: 16, background: G.panel, borderRadius: 10, padding: 4 }}>
              {["buy", "sell"].map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", background: orderType === t ? (t === "buy" ? G.green : G.red) : "transparent", color: orderType === t ? "#000" : G.muted, fontWeight: 700, fontSize: 13, transition: "all 0.2s" }}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Order mode */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {["market", "limit", "stop"].map((m) => (
                <button
                  key={m}
                  onClick={() => setOrderMode(m)}
                  style={{ ...btnStyle(orderMode === m ? G.accent : G.border, orderMode === m ? "#fff" : G.muted), fontSize: 11, padding: "5px 12px" }}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {orderMode === "limit" && (
                <input
                  type="number"
                  placeholder="Limit price (USD)"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  style={inputStyle}
                />
              )}
              <input
                type="number"
                placeholder={`Amount (${selected.symbol})`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={inputStyle}
              />
              {amount && (
                <div style={{ display: "flex", justifyContent: "space-between", color: G.muted, fontSize: 12 }}>
                  <span>Total</span>
                  <span style={{ color: G.text, fontWeight: 700 }}>
                    ${orderTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <button
                onClick={placeOrder}
                style={{ background: orderType === "buy" ? G.green : G.red, color: "#000", border: "none", borderRadius: 10, padding: "12px 0", fontWeight: 800, fontSize: 14, cursor: "pointer", width: "100%" }}
              >
                {orderType.toUpperCase()} {selected.symbol}
              </button>
            </div>
          </div>
        </div>

        {/* ── Portfolio sidebar ────────────────────────────── */}
        <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 16 }}>
            <div style={{ color: G.muted, fontSize: 11, marginBottom: 4 }}>Portfolio Value</div>
            <div style={{ color: G.text, fontWeight: 800, fontSize: 20 }}>{fmt(portfolio.totalUSD)}</div>
            <div style={{ color: col(portfolio.change24h), fontSize: 12, fontWeight: 600 }}>{pct(portfolio.change24h)} today</div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {portfolio.holdings.map((h) => (
                <div key={h.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: G.text, fontSize: 12, fontWeight: 600 }}>{h.symbol}</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: G.text, fontSize: 12 }}>{fmt(h.valueUSD)}</div>
                    <div style={{ color: G.muted, fontSize: 10 }}>{h.amount} {h.symbol}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 16 }}>
            <div style={{ color: G.text, fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Recent Orders</div>
            {[
              { side: "BUY",  sym: "BTC", qty: 0.01, status: "filled"  },
              { side: "SELL", sym: "ETH", qty: 0.5,  status: "filled"  },
              { side: "BUY",  sym: "SOL", qty: 5,    status: "pending" },
            ].map((o, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <span style={{ color: o.side === "BUY" ? G.green : G.red, fontWeight: 700, fontSize: 11 }}>{o.side}</span>
                  <span style={{ color: G.text, fontSize: 11 }}> {o.qty} {o.sym}</span>
                </div>
                <span style={{ fontSize: 10, color: o.status === "pending" ? G.gold : G.muted }}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}