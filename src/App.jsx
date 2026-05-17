import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Inline SVG icons ────────────────────────────────────────────────────────
const Ico = {
  Plus: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <line x1="10" y1="3" x2="10" y2="17" /><line x1="3" y1="10" x2="17" y2="10" />
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
      <path d="M18.5 1.5L9 11M18.5 1.5l-5.5 17L9 11M18.5 1.5L1.5 7l7.5 4" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Gear: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" width="14" height="14">
      <circle cx="10" cy="10" r="2.5"/>
      <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.1 4.1l1.1 1.1M14.8 14.8l1.1 1.1M4.1 15.9l1.1-1.1M14.8 5.2l1.1-1.1"/>
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
      <line x1="3" y1="6" x2="17" y2="6" strokeLinecap="round"/>
      <line x1="3" y1="10" x2="17" y2="10" strokeLinecap="round"/>
      <line x1="3" y1="14" x2="17" y2="14" strokeLinecap="round"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <line x1="4" y1="4" x2="16" y2="16" strokeLinecap="round"/>
      <line x1="16" y1="4" x2="4" y2="16" strokeLinecap="round"/>
    </svg>
  ),
  Msg: () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" width="12" height="12">
      <path d="M18 13a2 2 0 0 1-2 2H6l-3 3V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2z"/>
    </svg>
  ),
};

// ─── Canvas: ambient lightning energy background ──────────────────────────────
function EnergyCanvas() {
  return (
    <div className="lux-bg">
      <div className="lux-glow glow-1"></div>
      <div className="lux-glow glow-2"></div>
      <div className="lux-grid"></div>
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const HISTORY = [
  { id: 1, title: "Market intelligence Q4", time: "2h ago" },
  { id: 2, title: "Quantum computing primer", time: "Yesterday" },
  { id: 3, title: "Investment thesis draft", time: "2 days ago" },
  { id: 4, title: "Neural architecture review", time: "3 days ago" },
];

const PROMPTS = [
  { em: "⚡", text: "Analyze emerging AI market sectors" },
  { em: "🌐", text: "Explain quantum entanglement elegantly" },
  { em: "💎", text: "Craft a luxury brand statement" },
  { em: "🔮", text: "Forecast geopolitical shifts ahead" },
];

const REPLIES = [
  "A precise inquiry. Drawing on expansive knowledge, I can illuminate this with clarity. The domain you've raised touches fundamental principles governing both macro and micro dynamics — let me guide you through the core layers.",
  "Excellent framing. The subject spans multiple tiers of complexity. I'll synthesize the essential frameworks to equip you with both understanding and strategic clarity across every relevant dimension.",
  "Your question resonates with depth. The answer unfolds across several dimensions, each revealing richer understanding. I'll navigate these with you — empirical foundations first, then strategic implications.",
  "A compelling question. The landscape here is layered with nuance — from foundational theory to cutting-edge developments reshaping the paradigm. Here's the distilled picture you need.",
];
let ri = 0;
const nextReply = () => REPLIES[ri++ % REPLIES.length];

// ─── Framer variants ──────────────────────────────────────────────────────────
const sidebarV = {
  open:   { x: 0, transition: { type: "spring", stiffness: 320, damping: 34 } },
  closed: { x: "-100%", transition: { type: "spring", stiffness: 320, damping: 34 } },
};

const msgV = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 340, damping: 28 } },
};

const overlayV = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.18 } },
};

const modalV = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  show:   { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 360, damping: 30 } },
};

// ─── Settings modal ───────────────────────────────────────────────────────────
function Settings({ onClose }) {
  const [cfg, setCfg] = useState({ stream: true, markdown: true, sound: false, model: "ultra", theme: "obsidian" });
  const tog = k => setCfg(c => ({ ...c, [k]: !c[k] }));

  return (
    <motion.div className="overlay" variants={overlayV} initial="hidden" animate="show" exit="hidden"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="modal" variants={modalV} initial="hidden" animate="show" exit="hidden">
        <div className="modal-head">
          <span className="modal-title">SETTINGS</span>
          <button className="icon-btn" onClick={onClose}><Ico.X /></button>
        </div>
        <div className="modal-body">
          <span className="s-section">Preferences</span>

          {[
            { k: "stream",   label: "Response Streaming",  desc: "Stream tokens as they're generated" },
            { k: "markdown", label: "Markdown Rendering",  desc: "Rich text formatting in responses" },
            { k: "sound",    label: "Sound Effects",       desc: "Audio cues on message events" },
          ].map(({ k, label, desc }) => (
            <div className="s-row" key={k}>
              <div><div className="s-label">{label}</div><div className="s-desc">{desc}</div></div>
              <label className="tog">
                <input type="checkbox" checked={cfg[k]} onChange={() => tog(k)} />
                <span className="tog-sl" />
              </label>
            </div>
          ))}

          <span className="s-section">Model</span>

          <div className="s-row">
            <div className="s-label">AI Model</div>
            <select className="sel" value={cfg.model} onChange={e => setCfg(c => ({ ...c, model: e.target.value }))}>
              <option value="ultra">Zeus Ultra</option>
              <option value="pro">Zeus Pro</option>
              <option value="swift">Zeus Swift</option>
            </select>
          </div>

          <div className="s-row">
            <div className="s-label">Theme</div>
            <select className="sel" value={cfg.theme} onChange={e => setCfg(c => ({ ...c, theme: e.target.value }))}>
              <option value="obsidian">Obsidian Gold</option>
              <option value="midnight">Midnight Blue</option>
              <option value="onyx">Onyx Platinum</option>
            </select>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn-save" onClick={onClose}>Save Changes</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function Typing() {
  return (
    <motion.div className="msg-row" variants={msgV} initial="hidden" animate="show">
      <div className="msg-av ai">⚡</div>
      <div className="bubble ai">
        <div className="typing">
          <span className="dot" /><span className="dot" /><span className="dot" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [msgs, setMsgs]         = useState([]);
  const [input, setInput]       = useState("");
  const [busy, setBusy]         = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sbOpen, setSbOpen]     = useState(false);
  const [history, setHistory]   = useState(HISTORY);
  const [activeId, setActiveId] = useState(null);

  const bottomRef  = useRef(null);
  const taRef      = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  const autoResize = e => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const send = useCallback(async (text) => {
    const t = (text || input).trim();
    if (!t || busy) return;

    setMsgs(m => [...m, { id: Date.now(), role: "user", text: t }]);
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";

    if (msgs.length === 0) {
      const entry = { id: Date.now(), title: t.slice(0, 38) + (t.length > 38 ? "…" : ""), time: "Just now" };
      setHistory(h => [entry, ...h]);
      setActiveId(entry.id);
    }

setBusy(true);

try {
  const response = await fetch("https://zeus-ai-45ql.onrender.com/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: text,
    }),
  });

  const data = await response.json();
  console.log(data);


  setMsgs(m => [
    ...m,
    {
      id: Date.now() + 1,
      role: "ai",
      text: data.reply,
    },
  ]);

} catch (error) {
  console.error(error);

  setMsgs(m => [
    ...m,
    {
      id: Date.now() + 1,
      role: "ai",
      text: "Connection to Zeus core failed.",
    },
  ]);
}

setBusy(false);
  }, [input, busy, msgs.length]);

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const newChat = () => {
    setMsgs([]); setActiveId(null); setSbOpen(false);
    setHistory(h => h.map(x => ({ ...x })));
  };

  const isWelcome = msgs.length === 0 && !busy;

  // Welcome stagger
  const containerV = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  };
  const itemV = {
    hidden: { opacity: 0, y: 18 },
    show:   { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
  };

  return (
    <>
      <EnergyCanvas />

      <div className="shell">
        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sbOpen && (
            <motion.div className="sb-overlay visible"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSbOpen(false)} />
          )}
        </AnimatePresence>

        {/* ── Sidebar ── */}
        <motion.aside
          className="sidebar"
          initial={false}
          animate={window.innerWidth <= 700 ? (sbOpen ? "open" : "closed") : "open"}
          variants={sidebarV}
          style={window.innerWidth > 700 ? { transform: "none" } : undefined}
        >
          <div className="sb-top">
            <div className="logo-row">
              <div className="logo-mark">⚡</div>
              <span className="logo-wordmark">ZEUS AI</span>
            </div>
            <button className="new-btn" onClick={newChat}>
              <Ico.Plus /> New conversation
            </button>
          </div>

          <div className="sb-section-label">Recent</div>
          <div className="sb-history">
            {history.map(item => (
              <div
                key={item.id}
                className={`hist-item ${item.id === activeId ? "active" : ""}`}
                onClick={() => { setActiveId(item.id); setSbOpen(false); setMsgs([]); }}
              >
                <span className="hist-icon"><Ico.Msg /></span>
                <span className="hist-title">{item.title}</span>
              </div>
            ))}
          </div>

          <div className="sb-footer">
            <div className="user-pill">
              <div className="user-avatar">👤</div>
              <div>
                <div className="user-name">Sovereign</div>
              </div>
            </div>
            <button className="icon-btn" onClick={() => setShowSettings(true)} title="Settings">
              <Ico.Gear />
            </button>
          </div>
        </motion.aside>

        {/* ── Main ── */}
        <main className="main">
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-left">
              <button className="menu-btn" onClick={() => setSbOpen(o => !o)}>
                <Ico.Menu />
              </button>
              <span className="topbar-title">
                {isWelcome ? "New session" : "Active session"}
              </span>
            </div>
            <div className="model-chip">Zeus Ultra</div>
          </div>

          {/* Chat area */}
          <div className="chat-scroll">
            <div className="chat-inner">

              {/* Welcome */}
              {isWelcome && (
                <motion.div className="welcome" variants={containerV} initial="hidden" animate="show">
                  <motion.div className="welcome-glyph" variants={itemV}>⚡</motion.div>
                  <motion.h1 className="welcome-title" variants={itemV}>Zeus AI</motion.h1>
                  <motion.p className="welcome-sub" variants={itemV}>
                    Omniscient intelligence at your command. Ask anything — profound or practical — and receive answers of unmatched clarity.
                  </motion.p>
                  <motion.div className="divider" variants={itemV} />
                  <motion.div className="prompt-grid" variants={containerV}>
                    {PROMPTS.map((p, i) => (
                      <motion.div
                        key={i}
                        className="prompt-card"
                        variants={itemV}
                        whileHover={{ y: -2, transition: { duration: 0.15 } }}
                        onClick={() => send(p.text)}
                      >
                        <div className="prompt-card-em">{p.em}</div>
                        <div className="prompt-card-text">{p.text}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Messages */}
              {msgs.length > 0 && (
                <motion.div
                  className="msg-group"
                  variants={containerV}
                  initial="hidden"
                  animate="show"
                >
                  <AnimatePresence mode="popLayout">
                    {msgs.map(m => (
                      <motion.div
                        key={m.id}
                        className={`msg-row ${m.role}`}
                        variants={msgV}
                        initial="hidden"
                        animate="show"
                        layout
                      >
                        <div className={`msg-av ${m.role}`}>
                          {m.role === "ai" ? "⚡" : "👤"}
                        </div>
                        <div className={`bubble ${m.role}`}>{m.text}</div>
                      </motion.div>
                    ))}
                    {busy && <Typing key="typing" />}
                  </AnimatePresence>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div className="input-zone">
            <div className="input-max">
              <div className="input-box">
                <textarea
                  ref={taRef}
                  className="chat-ta"
                  placeholder="Ask Zeus anything…"
                  value={input}
                  rows={1}
                  onChange={e => { setInput(e.target.value); autoResize(e); }}
                  onKeyDown={handleKey}
                />
                <motion.button
                  className="send"
                  onClick={() => send()}
                  disabled={!input.trim() || busy}
                  whileHover={input.trim() && !busy ? { scale: 1.08 } : {}}
                  whileTap={input.trim() && !busy ? { scale: 0.95 } : {}}
                >
                  <Ico.Send />
                </motion.button>
              </div>
              <div className="input-foot">
                Press Enter to send · Shift+Enter for new line · Zeus Ultra
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && <Settings key="settings" onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </>
  );
}
