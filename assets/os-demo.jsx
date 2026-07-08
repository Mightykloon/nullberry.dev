const { useState, useEffect, useRef, useCallback } = React;
// ============================================================
// NULLBERRY OS — MARK-0 CONCEPTUAL PROTOTYPE
// ============================================================
const COLORS = {
  bg: "#0a0a0a",
  surface: "#141414",
  surface2: "#1c1c1c",
  surface3: "#252525",
  border: "#2a2a2a",
  text: "#e8e8e8",
  textDim: "#888888",
  textMuted: "#555555",
  accent: "#c77dff",
  accentDim: "#9d5ce820",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#60a5fa",
};
const FONT = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace";
const SANS = "'DM Sans', 'SF Pro', system-ui, sans-serif";
// ============================================================
// ICONS (inline SVG for zero dependencies)
// ============================================================
const Icon = ({ name, size = 20, color = COLORS.text }) => {
  const icons = {
    lock: <path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zm-7-7a4 4 0 00-4 4v4h8V8a4 4 0 00-4-4z" fill="none" stroke={color} strokeWidth="1.5"/>,
    message: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke={color} strokeWidth="1.5"/>,
    map: <><circle cx="12" cy="10" r="3" fill="none" stroke={color} strokeWidth="1.5"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="none" stroke={color} strokeWidth="1.5"/></>,
    radio: <><circle cx="12" cy="12" r="2" fill={color}/><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" fill="none" stroke={color} strokeWidth="1.5"/></>,
    leaf: <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L7 19c4-4 8-4 12-7 0 0 1-4-2-11z" fill="none" stroke={color} strokeWidth="1.5"/>,
    book: <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V5.5A2.5 2.5 0 016.5 3H20v14" fill="none" stroke={color} strokeWidth="1.5"/>,
    settings: <><circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth="1.5"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" fill="none" stroke={color} strokeWidth="1.5"/></>,
    send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" fill="none" stroke={color} strokeWidth="1.5"/>,
    back: <path d="M19 12H5m7-7l-7 7 7 7" fill="none" stroke={color} strokeWidth="1.5"/>,
    mic: <><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" fill="none" stroke={color} strokeWidth="1.5"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4m-4 0h8" fill="none" stroke={color} strokeWidth="1.5"/></>,
    search: <><circle cx="11" cy="11" r="8" fill="none" stroke={color} strokeWidth="1.5"/><path d="M21 21l-4.35-4.35" fill="none" stroke={color} strokeWidth="1.5"/></>,
    nav: <path d="M3 11l19-9-9 19-2-8-8-2z" fill="none" stroke={color} strokeWidth="1.5"/>,
    wifi: <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" fill="none" stroke={color} strokeWidth="1.5"/>,
    battery: <><rect x="1" y="6" width="18" height="12" rx="2" fill="none" stroke={color} strokeWidth="1.5"/><path d="M23 10v4" stroke={color} strokeWidth="1.5"/><rect x="3" y="8" width="10" height="8" rx="1" fill={COLORS.accent} opacity="0.6"/></>,
    plus: <path d="M12 5v14m-7-7h14" fill="none" stroke={color} strokeWidth="1.5"/>,
    walking: <><circle cx="12" cy="5" r="2" fill="none" stroke={color} strokeWidth="1.5"/><path d="M10 22l2-7 4 3v6M14 13l-2-2-4 4" fill="none" stroke={color} strokeWidth="1.5"/></>,
    car: <path d="M5 17h14M7 11l1.5-4.5h7L17 11M5 17a2 2 0 01-2-2v-2a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M7 17a1 1 0 11-2 0 1 1 0 012 0zm12 0a1 1 0 11-2 0 1 1 0 012 0z" fill="none" stroke={color} strokeWidth="1.5"/>,
    bike: <><circle cx="5.5" cy="17.5" r="3.5" fill="none" stroke={color} strokeWidth="1.5"/><circle cx="18.5" cy="17.5" r="3.5" fill="none" stroke={color} strokeWidth="1.5"/><path d="M15 6a1 1 0 100-2 1 1 0 000 2zm-3 11.5V14l-3-3 4-3 2 3h3" fill="none" stroke={color} strokeWidth="1.5"/></>,
    hike: <path d="M13 4v16m-5-8l5-4 5 4M3 20l5-8 5 8 5-8 2 4" fill="none" stroke={color} strokeWidth="1.5"/>,
    ai: <><path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke={color} strokeWidth="1.5"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke={color} strokeWidth="1.5"/></>,
    waypoint: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" fill="none" stroke={color} strokeWidth="1.5"/><circle cx="12" cy="10" r="3" fill={color} opacity="0.4"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none">{icons[name]}</svg>;
};
// ============================================================
// MOCK DATA
// ============================================================
const MOCK_NODES = [
  { id: 1, name: "Seed Alpha", type: "seed", lat: 34.2694, lng: -118.7815, battery: 87, signal: -68, status: "online", lastSeen: "now" },
  { id: 2, name: "Seed Beta", type: "seed", lat: 34.2734, lng: -118.7725, battery: 64, signal: -82, status: "online", lastSeen: "2m ago" },
  { id: 3, name: "Stem Garden", type: "stem", lat: 34.2650, lng: -118.7900, battery: 92, signal: -55, status: "online", lastSeen: "now" },
  { id: 4, name: "Trunk Rooftop", type: "trunk", lat: 34.2800, lng: -118.7600, battery: 78, signal: -42, status: "online", lastSeen: "now" },
  { id: 5, name: "Seed Charlie", type: "seed", lat: 34.2580, lng: -118.7950, battery: 12, signal: -95, status: "low battery", lastSeen: "15m ago" },
];
const MOCK_CONTACTS = [
  { id: 1, name: "Yahaira", lastMsg: "just deployed the third seed", time: "2m", unread: 2, online: true },
  { id: 2, name: "Marcus", lastMsg: "trunk is live on oak ridge", time: "18m", unread: 0, online: true },
  { id: 3, name: "Relay:Stem-Garden", lastMsg: "[telemetry] batt 92% / solar 340mA", time: "5m", unread: 0, online: true },
  { id: 4, name: "Ava", lastMsg: "can you check the node on elm st?", time: "1h", unread: 1, online: false },
];
const MOCK_MESSAGES = [
  { from: "them", text: "hey are you on the bush?", time: "10:41" },
  { from: "me", text: "yeah just booted up. 3 seeds and the trunk are live", time: "10:42" },
  { from: "them", text: "nice. i can see your nodes from here", time: "10:42" },
  { from: "them", text: "just deployed the third seed", time: "10:44" },
];
const TRANSPORT_STATUS = [
  { name: "LoRa 915", status: "active", icon: "radio" },
  { name: "LoRa 433", status: "active", icon: "radio" },
  { name: "WiFi", status: "standby", icon: "wifi" },
  { name: "BLE", status: "standby", icon: "radio" },
  { name: "IR", status: "ready", icon: "radio" },
  { name: "Acoustic", status: "ready", icon: "mic" },
  { name: "USB", status: "disconnected", icon: "radio" },
];
// ============================================================
// COMPONENTS
// ============================================================
const StatusBar = ({ time }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 16px", background: COLORS.bg, fontFamily: FONT, fontSize: 11, color: COLORS.textDim, borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
    <span>{time}</span>
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <span style={{ color: COLORS.accent, fontSize: 10 }}>BUSH</span>
      <span style={{ color: COLORS.accent, fontWeight: 700 }}>4</span>
      <span style={{ color: COLORS.textMuted }}>|</span>
      <span style={{ fontSize: 10, color: COLORS.textDim }}>GPS</span>
      <Icon name="battery" size={16} color={COLORS.accent} />
    </div>
  </div>
);
const NavBar = ({ active, onNav }) => {
  const items = [
    { id: "messages", icon: "message", label: "Messages" },
    { id: "map", icon: "map", label: "Map" },
    { id: "bush", icon: "leaf", label: "Bush" },
    { id: "knowledge", icon: "book", label: "Know" },
    { id: "settings", icon: "settings", label: "Settings" },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "space-around", padding: "8px 0 12px", background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
      {items.map(item => (
        <button key={item.id} onClick={() => onNav(item.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 12px" }}>
          <Icon name={item.icon} size={20} color={active === item.id ? COLORS.accent : COLORS.textMuted} />
          <span style={{ fontFamily: SANS, fontSize: 9, color: active === item.id ? COLORS.accent : COLORS.textMuted, fontWeight: active === item.id ? 600 : 400, letterSpacing: 0.5 }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
};
const BackHeader = ({ title, onBack, right }) => (
  <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 12, borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
    <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Icon name="back" size={18} color={COLORS.textDim} /></button>
    <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: COLORS.text, flex: 1 }}>{title}</span>
    {right}
  </div>
);
// ============================================================
// LOCK SCREEN
// ============================================================
const LockScreen = ({ onUnlock }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const handleKey = (k) => {
    if (k === "del") { setPin(p => p.slice(0, -1)); setError(false); return; }
    const next = pin + k;
    if (next.length <= 6) setPin(next);
    if (next.length === 4) {
      setTimeout(() => onUnlock(), 200);
    }
  };
  const keys = ["1","2","3","4","5","6","7","8","9","","0","del"];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: COLORS.bg, fontFamily: SANS, padding: 24 }}>
      <div style={{ fontSize: 11, letterSpacing: 4, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 8 }}>Nullberry OS</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.text, marginBottom: 4, fontFamily: FONT }}>MARK-1</div>
      <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 40 }}>enter pin to unlock</div>
      <div style={{ display: "flex", gap: 12, marginBottom: 40 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: 7, border: `2px solid ${pin.length > i ? COLORS.accent : COLORS.border}`, background: pin.length > i ? COLORS.accent : "transparent", transition: "all 0.15s" }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 64px)", gap: 12 }}>
        {keys.map((k, i) => (
          <button key={i} onClick={() => k && handleKey(k)} style={{ width: 64, height: 52, borderRadius: 12, border: k ? `1px solid ${COLORS.border}` : "none", background: k ? COLORS.surface2 : "transparent", color: k === "del" ? COLORS.textDim : COLORS.text, fontFamily: k === "del" ? SANS : FONT, fontSize: k === "del" ? 12 : 20, fontWeight: 500, cursor: k ? "pointer" : "default", transition: "background 0.1s" }}>
            {k === "del" ? "\u2190" : k}
          </button>
        ))}
      </div>
    </div>
  );
};
// ============================================================
// MESSAGES
// ============================================================
const MessagesScreen = ({ onOpenChat }) => (
  <div style={{ flex: 1, overflow: "auto" }}>
    <div style={{ padding: "16px 16px 8px", fontFamily: SANS, fontSize: 22, fontWeight: 700, color: COLORS.text }}>Messages</div>
    <div style={{ padding: "8px 16px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", background: COLORS.surface2, borderRadius: 10, padding: "8px 12px", gap: 8 }}>
        <Icon name="search" size={16} color={COLORS.textMuted} />
        <span style={{ fontFamily: SANS, fontSize: 13, color: COLORS.textMuted }}>search messages</span>
      </div>
    </div>
    {MOCK_CONTACTS.map(c => (
      <button key={c.id} onClick={() => onOpenChat(c)} style={{ display: "flex", width: "100%", padding: "12px 16px", gap: 12, alignItems: "center", background: "none", border: "none", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer", textAlign: "left" }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: c.online ? COLORS.accentDim : COLORS.surface3, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${c.online ? COLORS.accent : COLORS.border}`, flexShrink: 0 }}>
          <span style={{ fontFamily: FONT, fontSize: 14, color: c.online ? COLORS.accent : COLORS.textDim }}>{c.name[0]}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: COLORS.text }}>{c.name}</span>
            <span style={{ fontFamily: FONT, fontSize: 10, color: COLORS.textMuted }}>{c.time}</span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: COLORS.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.lastMsg}</div>
        </div>
        {c.unread > 0 && <div style={{ width: 20, height: 20, borderRadius: 10, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontFamily: FONT, fontSize: 10, color: COLORS.bg, fontWeight: 700 }}>{c.unread}</span></div>}
      </button>
    ))}
  </div>
);
const ChatScreen = ({ contact, onBack }) => {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView(); }, [messages]);
  const handleSend = () => {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { from: "me", text: msg.trim(), time: new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) }]);
    setMsg("");
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <BackHeader title={contact.name} onBack={onBack} right={
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: contact.online ? COLORS.accent : COLORS.textMuted }} />
          <span style={{ fontFamily: FONT, fontSize: 10, color: contact.online ? COLORS.accent : COLORS.textMuted }}>{contact.online ? "on bush" : "offline"}</span>
        </div>
      } />
      <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontFamily: FONT, fontSize: 10, color: COLORS.textMuted, textAlign: "center", padding: "8px 0" }}>end-to-end encrypted via NullRNS</div>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "75%", padding: "8px 12px", borderRadius: 14, background: m.from === "me" ? COLORS.accent : COLORS.surface3, color: m.from === "me" ? COLORS.bg : COLORS.text, fontFamily: SANS, fontSize: 13, lineHeight: 1.4, borderBottomRightRadius: m.from === "me" ? 4 : 14, borderBottomLeftRadius: m.from === "me" ? 14 : 4 }}>
              {m.text}
              <div style={{ fontSize: 9, color: m.from === "me" ? "rgba(0,0,0,0.4)" : COLORS.textMuted, textAlign: "right", marginTop: 2, fontFamily: FONT }}>{m.time}</div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", padding: "8px 12px", gap: 8, borderTop: `1px solid ${COLORS.border}`, alignItems: "center", flexShrink: 0 }}>
        <button style={{ background: COLORS.surface3, border: "none", borderRadius: 20, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><Icon name="mic" size={16} color={COLORS.textDim} /></button>
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="message..." style={{ flex: 1, background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "8px 14px", color: COLORS.text, fontFamily: SANS, fontSize: 13, outline: "none" }} />
        <button onClick={handleSend} style={{ background: msg.trim() ? COLORS.accent : COLORS.surface3, border: "none", borderRadius: 20, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "background 0.15s" }}><Icon name="send" size={16} color={msg.trim() ? COLORS.bg : COLORS.textMuted} /></button>
      </div>
    </div>
  );
};
// ============================================================
// MAP
// ============================================================
const MapScreen = () => {
  const canvasRef = useRef(null);
  const [routeMode, setRouteMode] = useState(null);
  const [waypoints, setWaypoints] = useState([
    { name: "Home Base", x: 0.5, y: 0.45 },
    { name: "Observation Point", x: 0.72, y: 0.28 },
  ]);
  const [selectedNode, setSelectedNode] = useState(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const dw = w / 2, dh = h / 2;
    // dark map background
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, dw, dh);
    // grid
    ctx.strokeStyle = "#1a2332";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < dw; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, dh); ctx.stroke(); }
    for (let y = 0; y < dh; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(dw, y); ctx.stroke(); }
    // roads
    ctx.strokeStyle = "#1e2d3d";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, dh*0.4); ctx.lineTo(dw, dh*0.42); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(dw*0.3, 0); ctx.lineTo(dw*0.32, dh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, dh*0.7); ctx.quadraticCurveTo(dw*0.5, dh*0.65, dw, dh*0.72); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(dw*0.6, 0); ctx.quadraticCurveTo(dw*0.58, dh*0.5, dw*0.65, dh); ctx.stroke();
    ctx.strokeStyle = "#253545";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, dh*0.55); ctx.quadraticCurveTo(dw*0.4, dh*0.5, dw, dh*0.53); ctx.stroke();
    // terrain shading
    ctx.fillStyle = "rgba(34,197,94,0.03)";
    ctx.beginPath(); ctx.ellipse(dw*0.2, dh*0.25, 80, 60, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(dw*0.75, dh*0.7, 60, 45, 0.3, 0, Math.PI*2); ctx.fill();
    // route (if mode selected)
    if (routeMode) {
      ctx.strokeStyle = COLORS.accent;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(dw*0.5, dh*0.45);
      ctx.quadraticCurveTo(dw*0.55, dh*0.38, dw*0.62, dh*0.35);
      ctx.quadraticCurveTo(dw*0.68, dh*0.32, dw*0.72, dh*0.28);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // mesh lines between nodes
    const nodePositions = MOCK_NODES.map(n => ({ x: ((n.lng + 118.8) / 0.05) * dw, y: ((34.285 - n.lat) / 0.035) * dh }));
    ctx.strokeStyle = "rgba(74,222,128,0.12)";
    ctx.lineWidth = 1;
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i+1; j < nodePositions.length; j++) {
        const dx = nodePositions[i].x - nodePositions[j].x;
        const dy = nodePositions[i].y - nodePositions[j].y;
        if (Math.sqrt(dx*dx+dy*dy) < dw*0.5) {
          ctx.beginPath(); ctx.moveTo(nodePositions[i].x, nodePositions[i].y); ctx.lineTo(nodePositions[j].x, nodePositions[j].y); ctx.stroke();
        }
      }
    }
    // node markers
    MOCK_NODES.forEach((n, idx) => {
      const pos = nodePositions[idx];
      const colors = { seed: "#4ade80", stem: "#60a5fa", trunk: "#f59e0b" };
      const sizes = { seed: 5, stem: 7, trunk: 9 };
      const c = colors[n.type];
      const s = sizes[n.type];
      // pulse ring
      ctx.beginPath(); ctx.arc(pos.x, pos.y, s + 6, 0, Math.PI*2);
      ctx.fillStyle = c + "15"; ctx.fill();
      // dot
      ctx.beginPath(); ctx.arc(pos.x, pos.y, s, 0, Math.PI*2);
      ctx.fillStyle = c; ctx.fill();
      ctx.strokeStyle = "#0d1117"; ctx.lineWidth = 1.5; ctx.stroke();
    });
    // waypoints
    waypoints.forEach(wp => {
      const px = wp.x * dw, py = wp.y * dh;
      ctx.fillStyle = COLORS.danger;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = "#0d1117"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = COLORS.danger + "30";
      ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI*2); ctx.fill();
      ctx.font = `9px ${SANS}`;
      ctx.fillStyle = COLORS.text;
      ctx.textAlign = "center";
      ctx.fillText(wp.name, px, py - 14);
    });
    // my position
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath(); ctx.arc(dw*0.5, dh*0.45, 6, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "#0d1117"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = COLORS.accent + "20";
    ctx.beginPath(); ctx.arc(dw*0.5, dh*0.45, 20, 0, Math.PI*2); ctx.fill();
    // compass
    ctx.fillStyle = COLORS.text;
    ctx.font = `bold 10px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("N", dw - 20, 18);
    ctx.strokeStyle = COLORS.textMuted;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(dw-20, 22); ctx.lineTo(dw-20, 32); ctx.stroke();
  }, [routeMode, waypoints]);
  const modes = [
    { id: "drive", icon: "car", label: "Drive" },
    { id: "walk", icon: "walking", label: "Walk" },
    { id: "bike", icon: "bike", label: "Bike" },
    { id: "hike", icon: "hike", label: "Hike" },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ padding: "12px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: COLORS.text }}>Map</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => {}} style={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "4px 10px", fontFamily: FONT, fontSize: 10, color: COLORS.accent, cursor: "pointer" }}>+ waypoint</button>
        </div>
      </div>
      {/* route mode selector */}
      <div style={{ display: "flex", padding: "0 16px 8px", gap: 6, flexShrink: 0 }}>
        {modes.map(m => (
          <button key={m.id} onClick={() => setRouteMode(routeMode === m.id ? null : m.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 0", borderRadius: 8, border: `1px solid ${routeMode === m.id ? COLORS.accent : COLORS.border}`, background: routeMode === m.id ? COLORS.accentDim : COLORS.surface2, cursor: "pointer" }}>
            <Icon name={m.icon} size={14} color={routeMode === m.id ? COLORS.accent : COLORS.textDim} />
            <span style={{ fontFamily: SANS, fontSize: 9, color: routeMode === m.id ? COLORS.accent : COLORS.textDim }}>{m.label}</span>
          </button>
        ))}
      </div>
      {/* canvas map */}
      <div style={{ flex: 1, position: "relative", margin: "0 8px 8px", borderRadius: 12, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
        {routeMode && (
          <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, background: COLORS.surface + "ee", borderRadius: 10, padding: "10px 14px", backdropFilter: "blur(8px)", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: COLORS.accent, marginBottom: 2 }}>Route to: Observation Point</div>
            <div style={{ fontFamily: FONT, fontSize: 11, color: COLORS.textDim }}>1.3 mi · {routeMode === "drive" ? "4 min" : routeMode === "walk" ? "26 min" : routeMode === "bike" ? "9 min" : "32 min"} · {routeMode}</div>
          </div>
        )}
      </div>
      {/* node legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, padding: "0 16px 8px", flexShrink: 0 }}>
        {[{c:"#4ade80",l:"Seed"},{c:"#60a5fa",l:"Stem"},{c:"#f59e0b",l:"Trunk"},{c:COLORS.danger,l:"Waypoint"}].map(i => (
          <div key={i.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: i.c }} />
            <span style={{ fontFamily: SANS, fontSize: 9, color: COLORS.textDim }}>{i.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
// ============================================================
// BUSH MANAGER (FindMy for nodes)
// ============================================================
const BushScreen = () => {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ padding: "16px 16px 8px", fontFamily: SANS, fontSize: 22, fontWeight: 700, color: COLORS.text }}>The Bush</div>
      <div style={{ padding: "0 16px 12px", display: "flex", gap: 8 }}>
        <div style={{ flex: 1, background: COLORS.surface2, borderRadius: 10, padding: "10px 12px", border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: COLORS.accent }}>4</div>
          <div style={{ fontFamily: SANS, fontSize: 10, color: COLORS.textDim }}>nodes online</div>
        </div>
        <div style={{ flex: 1, background: COLORS.surface2, borderRadius: 10, padding: "10px 12px", border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: COLORS.warning }}>1</div>
          <div style={{ fontFamily: SANS, fontSize: 10, color: COLORS.textDim }}>needs attention</div>
        </div>
        <div style={{ flex: 1, background: COLORS.surface2, borderRadius: 10, padding: "10px 12px", border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: COLORS.text }}>847</div>
          <div style={{ fontFamily: SANS, fontSize: 10, color: COLORS.textDim }}>relayed today</div>
        </div>
      </div>
      {MOCK_NODES.map(n => (
        <button key={n.id} onClick={() => setSelected(selected === n.id ? null : n.id)} style={{ display: "flex", width: "100%", padding: "12px 16px", gap: 12, alignItems: "center", background: selected === n.id ? COLORS.surface2 : "transparent", border: "none", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}>
          <div style={{ width: 36, height: 36, borderRadius: n.type === "seed" ? 18 : n.type === "stem" ? 8 : 6, background: n.battery < 20 ? COLORS.danger + "20" : COLORS.accentDim, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${n.battery < 20 ? COLORS.danger : COLORS.accent}`, flexShrink: 0 }}>
            <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: n.battery < 20 ? COLORS.danger : COLORS.accent }}>{n.type === "seed" ? "S" : n.type === "stem" ? "ST" : "T"}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: COLORS.text }}>{n.name}</div>
            <div style={{ fontFamily: FONT, fontSize: 10, color: COLORS.textDim }}>{n.signal} dBm · {n.lastSeen}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: n.battery < 20 ? COLORS.danger : n.battery < 50 ? COLORS.warning : COLORS.accent }}>{n.battery}%</div>
            <div style={{ fontFamily: SANS, fontSize: 9, color: n.status === "online" ? COLORS.accent : COLORS.warning }}>{n.status}</div>
          </div>
        </button>
      ))}
      {selected && (
        <div style={{ margin: "0 16px 12px", background: COLORS.surface2, borderRadius: 12, padding: 14, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>Node Details</div>
          {(() => {
            const n = MOCK_NODES.find(x => x.id === selected);
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontFamily: FONT, fontSize: 10 }}>
                <div style={{ color: COLORS.textDim }}>type</div><div style={{ color: COLORS.text }}>{n.type}</div>
                <div style={{ color: COLORS.textDim }}>coords</div><div style={{ color: COLORS.text }}>{n.lat.toFixed(4)}, {n.lng.toFixed(4)}</div>
                <div style={{ color: COLORS.textDim }}>signal</div><div style={{ color: COLORS.text }}>{n.signal} dBm</div>
                <div style={{ color: COLORS.textDim }}>battery</div><div style={{ color: n.battery < 20 ? COLORS.danger : COLORS.text }}>{n.battery}%</div>
                <div style={{ color: COLORS.textDim }}>firmware</div><div style={{ color: COLORS.text }}>NullNode v0.1.2</div>
                <div style={{ color: COLORS.textDim }}>uptime</div><div style={{ color: COLORS.text }}>4d 7h 22m</div>
              </div>
            );
          })()}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1px solid ${COLORS.accent}`, background: "transparent", fontFamily: SANS, fontSize: 11, color: COLORS.accent, cursor: "pointer" }}>locate</button>
            <button style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "transparent", fontFamily: SANS, fontSize: 11, color: COLORS.textDim, cursor: "pointer" }}>ping</button>
            <button style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "transparent", fontFamily: SANS, fontSize: 11, color: COLORS.textDim, cursor: "pointer" }}>update</button>
          </div>
        </div>
      )}
    </div>
  );
};
// ============================================================
// KNOWLEDGE (Wikipedia + Claude AI)
// ============================================================
const KnowledgeScreen = () => {
  const [tab, setTab] = useState("wiki");
  const [search, setSearch] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { from: "ai", text: "i'm your local knowledge base. i have all of Wikipedia stored offline plus general knowledge. ask me anything. no internet needed." }
  ]);
  const handleAiSend = () => {
    if (!aiInput.trim()) return;
    const q = aiInput.trim();
    setAiMessages(prev => [...prev, { from: "user", text: q }]);
    setAiInput("");
    setTimeout(() => {
      setAiMessages(prev => [...prev, { from: "ai", text: `searching local knowledge base for "${q}"...\n\nthis would query the onboard compressed Wikipedia dump (~22GB on eMMC) and/or connect to Claude via MCP when mesh internet bridge is available. results rendered here with citations.` }]);
    }, 800);
  };
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 16px 8px", fontFamily: SANS, fontSize: 22, fontWeight: 700, color: COLORS.text }}>Knowledge</div>
      <div style={{ display: "flex", margin: "0 16px 12px", borderRadius: 10, border: `1px solid ${COLORS.border}`, overflow: "hidden", flexShrink: 0 }}>
        {[{id:"wiki",label:"Wikipedia"},{id:"ai",label:"AI Assistant"}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "8px 0", background: tab === t.id ? COLORS.accent : COLORS.surface2, border: "none", fontFamily: SANS, fontSize: 12, fontWeight: 600, color: tab === t.id ? COLORS.bg : COLORS.textDim, cursor: "pointer", transition: "all 0.15s" }}>{t.label}</button>
        ))}
      </div>
      {tab === "wiki" ? (
        <div style={{ flex: 1, overflow: "auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", background: COLORS.surface2, borderRadius: 10, padding: "8px 12px", gap: 8, marginBottom: 12 }}>
            <Icon name="search" size={16} color={COLORS.textMuted} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search wikipedia offline..." style={{ flex: 1, background: "transparent", border: "none", color: COLORS.text, fontFamily: SANS, fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.textMuted, marginBottom: 12 }}>6.7M articles stored locally - no connection needed</div>
          {["Radio propagation","LoRa","Mesh networking","Frequency-hopping spread spectrum","Emergency communication system","Amateur radio"].map((article, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer" }}>
              <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: COLORS.info }}>{article}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.textDim, marginTop: 2 }}>tap to read full article offline</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflow: "auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {aiMessages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: 14, background: m.from === "user" ? COLORS.accent : COLORS.surface3, color: m.from === "user" ? COLORS.bg : COLORS.text, fontFamily: SANS, fontSize: 12, lineHeight: 1.5, whiteSpace: "pre-wrap", borderBottomRightRadius: m.from === "user" ? 4 : 14, borderBottomLeftRadius: m.from === "user" ? 14 : 4 }}>
                  {m.from === "ai" && <div style={{ fontFamily: FONT, fontSize: 9, color: COLORS.accent, marginBottom: 4, letterSpacing: 1 }}>NULLBERRY AI</div>}
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", padding: "8px 12px", gap: 8, borderTop: `1px solid ${COLORS.border}`, alignItems: "center", flexShrink: 0 }}>
            <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAiSend()} placeholder="ask anything..." style={{ flex: 1, background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "8px 14px", color: COLORS.text, fontFamily: SANS, fontSize: 13, outline: "none" }} />
            <button onClick={handleAiSend} style={{ background: aiInput.trim() ? COLORS.accent : COLORS.surface3, border: "none", borderRadius: 20, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><Icon name="send" size={16} color={aiInput.trim() ? COLORS.bg : COLORS.textMuted} /></button>
          </div>
        </div>
      )}
    </div>
  );
};
// ============================================================
// SETTINGS
// ============================================================
const SettingsScreen = () => (
  <div style={{ flex: 1, overflow: "auto" }}>
    <div style={{ padding: "16px 16px 12px", fontFamily: SANS, fontSize: 22, fontWeight: 700, color: COLORS.text }}>Settings</div>

    <div style={{ padding: "0 16px 8px", fontFamily: FONT, fontSize: 10, letterSpacing: 1, color: COLORS.textMuted, textTransform: "uppercase" }}>Identity</div>
    <div style={{ margin: "0 16px 16px", background: COLORS.surface2, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
      {[{l:"Display Name",v:"Damian"},{l:"Mesh Address",v:"a7c3...f291"},{l:"Public Key",v:"tap to view / share QR"}].map((r,i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", borderBottom: i < 2 ? `1px solid ${COLORS.border}` : "none" }}>
          <span style={{ fontFamily: SANS, fontSize: 13, color: COLORS.text }}>{r.l}</span>
          <span style={{ fontFamily: FONT, fontSize: 12, color: COLORS.textDim }}>{r.v}</span>
        </div>
      ))}
    </div>
    <div style={{ padding: "0 16px 8px", fontFamily: FONT, fontSize: 10, letterSpacing: 1, color: COLORS.textMuted, textTransform: "uppercase" }}>Transport Layers</div>
    <div style={{ margin: "0 16px 16px", background: COLORS.surface2, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
      {TRANSPORT_STATUS.map((t, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: i < TRANSPORT_STATUS.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
          <span style={{ fontFamily: SANS, fontSize: 13, color: COLORS.text }}>{t.name}</span>
          <span style={{ fontFamily: FONT, fontSize: 10, padding: "2px 8px", borderRadius: 4, background: t.status === "active" ? COLORS.accent + "20" : t.status === "standby" ? COLORS.info + "20" : COLORS.surface3, color: t.status === "active" ? COLORS.accent : t.status === "standby" ? COLORS.info : COLORS.textMuted }}>{t.status}</span>
        </div>
      ))}
    </div>
    <div style={{ padding: "0 16px 8px", fontFamily: FONT, fontSize: 10, letterSpacing: 1, color: COLORS.textMuted, textTransform: "uppercase" }}>Operational Mode</div>
    <div style={{ margin: "0 16px 16px", background: COLORS.surface2, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
      {["Full Mesh","Reduced Signature","Whisper","Silent (RF Dark)","Dead Drop"].map((m,i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: i < 4 ? `1px solid ${COLORS.border}` : "none", cursor: "pointer" }}>
          <span style={{ fontFamily: SANS, fontSize: 13, color: i === 0 ? COLORS.accent : COLORS.text }}>{m}</span>
          {i === 0 && <span style={{ fontFamily: FONT, fontSize: 10, color: COLORS.accent }}>active</span>}
        </div>
      ))}
    </div>
    <div style={{ padding: "0 16px 8px", fontFamily: FONT, fontSize: 10, letterSpacing: 1, color: COLORS.textMuted, textTransform: "uppercase" }}>System</div>
    <div style={{ margin: "0 16px 16px", background: COLORS.surface2, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
      {[{l:"Nullberry OS",v:"v0.1.0-mk0"},{l:"NullRNS",v:"v0.1.2"},{l:"NullNode FW",v:"v0.1.2"},{l:"Spectrum Guardian",v:"standby"},{l:"Wikipedia DB",v:"6.7M articles"},{l:"Storage",v:"8.2 / 16 GB"}].map((r,i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: i < 5 ? `1px solid ${COLORS.border}` : "none" }}>
          <span style={{ fontFamily: SANS, fontSize: 13, color: COLORS.text }}>{r.l}</span>
          <span style={{ fontFamily: FONT, fontSize: 11, color: COLORS.textDim }}>{r.v}</span>
        </div>
      ))}
    </div>
    <div style={{ padding: "16px", textAlign: "center" }}>
      <div style={{ fontFamily: FONT, fontSize: 10, color: COLORS.textMuted, letterSpacing: 2 }}>NULLBERRY LLC</div>
      <div style={{ fontFamily: SANS, fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>building what's missing.</div>
    </div>
  </div>
);
// ============================================================
// MAIN APP
// ============================================================
function NullberryOS() {
  const [screen, setScreen] = useState("lock");
  const [activeTab, setActiveTab] = useState("messages");
  const [chatContact, setChatContact] = useState(null);
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    update();
    const i = setInterval(update, 30000);
    return () => clearInterval(i);
  }, []);
  const handleNav = (tab) => {
    setChatContact(null);
    setActiveTab(tab);
  };
  const renderScreen = () => {
    if (screen === "lock") return <LockScreen onUnlock={() => setScreen("home")} />;

    if (chatContact) return <ChatScreen contact={chatContact} onBack={() => setChatContact(null)} />;
    switch (activeTab) {
      case "messages": return <MessagesScreen onOpenChat={setChatContact} />;
      case "map": return <MapScreen />;
      case "bush": return <BushScreen />;
      case "knowledge": return <KnowledgeScreen />;
      case "settings": return <SettingsScreen />;
      default: return <MessagesScreen onOpenChat={setChatContact} />;
    }
  };
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 16, fontFamily: SANS }}>
      {/* phone frame */}
      <div style={{ width: 375, height: 720, background: COLORS.bg, borderRadius: 32, border: `2px solid ${COLORS.border}`, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(74,222,128,0.05), 0 20px 40px rgba(0,0,0,0.5)" }}>
        {/* notch */}
        <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 0", flexShrink: 0 }}>
          <div style={{ width: 120, height: 4, borderRadius: 2, background: COLORS.surface3 }} />
        </div>
        {screen !== "lock" && <StatusBar time={time} />}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {renderScreen()}
        </div>
        {screen !== "lock" && !chatContact && <NavBar active={activeTab} onNav={handleNav} />}
      </div>
    </div>
  );
}

// Mount
const container = document.getElementById("os-demo-root");
if (container) {
  ReactDOM.render(<NullberryOS />, container);
}
