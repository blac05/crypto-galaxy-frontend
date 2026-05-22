
import { useState, useRef } from "react";
import { G, btnStyle, navBtnStyle } from "../constants";

const BOOKMARKS = [
  { label: "CoinMarketCap", url: "https://coinmarketcap.com", icon: "📊" },
  { label: "CoinGecko",     url: "https://coingecko.com",     icon: "🦎" },
  { label: "Binance",       url: "https://binance.com",       icon: "🔶" },
  { label: "CoinDesk",      url: "https://coindesk.com",      icon: "📰" },
  { label: "TradingView",   url: "https://tradingview.com",   icon: "📈" },
  { label: "Decrypt",       url: "https://decrypt.co",        icon: "🔓" },
];

export default function InAppBrowser({
  url:   initUrl   = "https://coinmarketcap.com",
  title: initTitle = "",
  onClose,
}) {
  const [url,      setUrl]      = useState(initUrl);
  const [inputUrl, setInputUrl] = useState(initUrl);
  const [loading,  setLoading]  = useState(true);
  const [history,  setHistory]  = useState([initUrl]);
  const [histIdx,  setHistIdx]  = useState(0);
  const iframeRef              = useRef(null);

  function navigate(target) {
    let u = target.trim();
    if (!u.startsWith("http")) u = "https://" + u;
    setUrl(u);
    setInputUrl(u);
    setLoading(true);
    setHistory((h) => [...h.slice(0, histIdx + 1), u]);
    setHistIdx((i) => i + 1);
  }

  function goBack() {
    if (histIdx > 0) {
      const u = history[histIdx - 1];
      setUrl(u); setInputUrl(u); setHistIdx((i) => i - 1); setLoading(true);
    }
  }

  function goForward() {
    if (histIdx < history.length - 1) {
      const u = history[histIdx + 1];
      setUrl(u); setInputUrl(u); setHistIdx((i) => i + 1); setLoading(true);
    }
  }

  function refresh() {
    setLoading(true);
    const current = url;
    setUrl(""); setTimeout(() => setUrl(current), 50);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: G.bg, zIndex: 1000, display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Browser chrome */}
      <div style={{ background: G.panel, borderBottom: `1px solid ${G.border}`, padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8 }}>

        {/* Nav row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={goBack}    disabled={histIdx === 0}                 style={navBtnStyle(histIdx === 0)}>←</button>
            <button onClick={goForward} disabled={histIdx >= history.length - 1} style={navBtnStyle(histIdx >= history.length - 1)}>→</button>
            <button onClick={refresh}                                             style={navBtnStyle(false)}>↻</button>
          </div>

          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: G.muted, fontSize: 12 }}>🔒</span>
            <input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && navigate(inputUrl)}
              style={{ background: G.card, border: `1px solid ${G.border}`, color: G.text, borderRadius: 8, padding: "7px 12px 7px 30px", fontSize: 12, outline: "none", width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <button onClick={onClose} style={{ ...btnStyle(G.red + "33", G.red), padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>
            X Close
          </button>
        </div>

        {/* Bookmarks */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {BOOKMARKS.map((b) => (
            <button
              key={b.url}
              onClick={() => navigate(b.url)}
              style={{ ...btnStyle(G.card, G.muted), padding: "4px 10px", fontSize: 11, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4, border: `1px solid ${G.border}` }}
            >
              {b.icon} {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Iframe */}
      <div style={{ flex: 1, position: "relative" }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: G.bg, zIndex: 1, flexDirection: "column", gap: 14 }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${G.accent}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div style={{ color: G.muted, fontSize: 13 }}>Loading {url}...</div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url}
          title={initTitle || "In-App Browser"}
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          style={{ width: "100%", height: "100%", border: "none", background: "#fff" }}
        />
      </div>
    </div>
  );
}
