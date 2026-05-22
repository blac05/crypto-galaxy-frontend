import { useState, useEffect } from "react";
import { G, API_BASE, btnStyle, inputStyle, MOCK_NEWS } from "../constants";  // ✅ Changed from "../../constants" to "../constants"

const SC = { bullish: "#00ff9d", bearish: "#ff4d6d", neutral: "#5a6080" };
const SI = { bullish: "▲", bearish: "▼", neutral: "●" };
const TAGS = ["all", "BTC", "ETH", "SOL", "BNB", "XRP", "MARKET"];

export default function NewsFeed({ onOpenBrowser }) {
  const [news, setNews] = useState(MOCK_NEWS);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [feat, setFeat] = useState(MOCK_NEWS[0]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API_BASE}/news?limit=20`);
        const d = await r.json();
        if (d.articles?.length) { setNews(d.articles); setFeat(d.articles[0]); }
      } catch { }
      setLoading(false);
    })();
  }, []);

  const filtered = news.filter(n => {
    const mt = filter === "all" || n.tag === filter;
    const ms = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.source.toLowerCase().includes(search.toLowerCase());
    return mt && ms;
  });

  function open(article) { setFeat(article); onOpenBrowser?.(article.url, article.title); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Featured */}
      <div onClick={() => open(feat)} style={{ background: `linear-gradient(135deg,#6c63ff22,#00d4ff11)`, border: `1px solid #6c63ff44`, borderRadius: 20, padding: 24, cursor: "pointer" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <span style={{ background: "#6c63ff33", color: "#6c63ff", fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>FEATURED</span>
          <span style={{ background: SC[feat.sentiment] + "22", color: SC[feat.sentiment], fontSize: 11, padding: "2px 8px", borderRadius: 20 }}>{SI[feat.sentiment]} {feat.sentiment?.toUpperCase()}</span>
        </div>
        <div style={{ color: "#e8eaff", fontSize: 18, fontWeight: 700, lineHeight: 1.4 }}>{feat.title}</div>
        <div style={{ color: "#5a6080", fontSize: 12, marginTop: 8 }}>{feat.source} · {feat.time} · Tap to read →</div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news…" style={{ ...inputStyle, flex: 1, minWidth: 200 }} />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {TAGS.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{ ...btnStyle(filter === t ? G.accent : G.border, filter === t ? "#fff" : G.muted), fontSize: 11, padding: "5px 10px" }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading
        ? <div style={{ color: G.muted, textAlign: "center", padding: 40 }}>Fetching latest news…</div>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {filtered.map(n => (
            <div key={n.id} onClick={() => open(n)}
              style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: 16, cursor: "pointer", transition: "border-color 0.2s", display: "flex", flexDirection: "column", gap: 8 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = G.accent + "66"}
              onMouseLeave={e => e.currentTarget.style.borderColor = G.border}>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ background: G.accent + "22", color: G.accent, fontSize: 10, padding: "2px 7px", borderRadius: 10, fontWeight: 700 }}>{n.tag}</span>
                <span style={{ background: SC[n.sentiment] + "22", color: SC[n.sentiment], fontSize: 10, padding: "2px 7px", borderRadius: 10 }}>{SI[n.sentiment]}</span>
              </div>
              <div style={{ color: G.text, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{n.title}</div>
              <div style={{ color: G.muted, fontSize: 11 }}>{n.source} · {n.time}</div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}