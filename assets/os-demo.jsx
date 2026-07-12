const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ============================================================
   NULLBERRY LIVE DEMOS
   1) MARK-1 hardware · Nullberry OS (GrapheneOS-inspired,
      sharp full-screen slab, no notch)
   2) iPhone · iOS companion app (Liquid-Glass styling,
      dynamic island, relay-address contacts)
   Everything runs in-browser. Nothing is transmitted.
   ============================================================ */

/* ---------- utils ---------- */
const rnd = (a, b) => a + Math.random() * (b - a);
const irnd = (a, b) => Math.round(rnd(a, b));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const SPRING = "cubic-bezier(0.32, 0.72, 0, 1)";
const IOS_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', 'Segoe UI', sans-serif";
const DROID_FONT = "'Inter', Roboto, 'Segoe UI', sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', Consolas, monospace";
const BRAND = "#ffb454";

const relayAddr = () => "relay" + Math.random().toString(36).slice(2, 12) + "@nullberrysecure.net";

function useNow(intervalMs) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs || 15000);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
const fmtTime = (d) => { let h = d.getHours() % 12; if (h === 0) h = 12; return h + ":" + String(d.getMinutes()).padStart(2, "0"); };

/* ---------- shared mesh data ---------- */
const NAME_POOL = ["Yahaira", "Marcus", "Priya", "Diego", "Wren", "Sofia", "Elias", "June", "Theo", "Amara", "Nikolai", "Rosa", "Caleb", "Ingrid", "Mateo", "Zoe"];
const AVATAR_HUES = [198, 262, 12, 152, 32, 330, 210, 88];

const SCRIPTS = [
  [
    { d: "in", t: "third seed is up on the ridge, mesh picked it up instantly" },
    { d: "out", t: "nice. what's the hop count back to camp?" },
    { d: "in", t: "two hops through the garden stem. RSSI −71" },
    { d: "out", t: "perfect. drop the last one by the creek crossing" },
    { d: "in", t: "on my way now 🌲" },
  ],
  [
    { d: "in", t: "storm cell moving in from the west, maybe 40 min out" },
    { d: "out", t: "copy. everyone's checked in except the north team" },
    { d: "in", t: "they pinged the trunk 10 min ago, still moving" },
    { d: "out", t: "ok. switching to reduced signature until it passes" },
    { d: "in", t: "smart. see you at the shelter" },
  ],
  [
    { d: "out", t: "supply list for tomorrow: LiFePO4 packs, antenna wire, zip ties" },
    { d: "in", t: "add a spare telescoping mast, the garden one is bent" },
    { d: "out", t: "noted. anything else?" },
    { d: "in", t: "coffee. lots of coffee ☕" },
  ],
  [
    { d: "in", t: "you seeing the latency on L2? feels snappier since the update" },
    { d: "out", t: "yeah, new routing weights. 433 gets preference through the tree line" },
    { d: "in", t: "penetration is unreal, i'm getting packets from inside the barn" },
    { d: "out", t: "that's the whole point 😄" },
  ],
  [
    { d: "in", t: "ETA 25 min, coming up the fire road" },
    { d: "out", t: "copy. gate's unlocked, follow the seed trail in" },
    { d: "in", t: "my map shows every node on the way, this is so cool" },
  ],
  [
    { d: "out", t: "angle the yagi about 10° east, root site says signal is drifting" },
    { d: "in", t: "adjusting now" },
    { d: "in", t: "−63 dBm. best we've had all week" },
    { d: "out", t: "lock it down. that's our backbone link" },
  ],
  [
    { d: "in", t: "morning check: all 4 seeds green, stem battery 82%" },
    { d: "out", t: "any packet loss overnight?" },
    { d: "in", t: "0.3% on L1, nothing on L2. dead drop cache is empty" },
    { d: "out", t: "beautiful. quiet night on the tree" },
  ],
];

const REPLIES = ["copy that", "on it", "got it, relaying now", "👍", "roger", "signal's clean on L1", "will do", "ack. mesh looks healthy", "received, 2 hops", "sounds good"];
const TIMES = ["2m", "11m", "26m", "1h", "3h", "Yesterday", "Yesterday"];

function genContacts() {
  const names = shuffle(NAME_POOL).slice(0, SCRIPTS.length);
  const scripts = shuffle(SCRIPTS);
  return names.map((name, i) => ({
    id: "c" + i,
    name,
    addr: relayAddr(),
    hue: AVATAR_HUES[i % AVATAR_HUES.length],
    time: TIMES[i % TIMES.length],
    unread: i < 2 ? irnd(1, 3) : 0,
    route: pick(["L1 LoRa 915", "L2 LoRa 433", "L3 WiFi", "L4 BLE"]),
    hops: irnd(1, 4),
    msgs: scripts[i].map((m, j) => ({ id: "m" + i + "_" + j, d: m.d, t: m.t })),
  }));
}

const NODE_TYPES = { seed: { c: "#30d158", label: "Seed" }, stem: { c: "#60a5fa", label: "Stem" }, trunk: { c: "#ff9f0a", label: "Trunk" }, root: { c: BRAND, label: "Root" } };
const NODE_SPOTS = ["Ridge", "Garden", "Creek", "Barn", "Gate", "Meadow", "Oak", "North", "Well", "Quarry", "Bluff"];

function genNodes() {
  const spots = shuffle(NODE_SPOTS);
  const mk = (type, i, dist) => ({
    id: NODE_TYPES[type].label + "·" + spots[i],
    type,
    batt: type === "root" ? 100 : irnd(41, 98),
    rssi: irnd(-96, -58),
    hops: type === "root" ? 0 : irnd(1, 4),
    seen: irnd(1, 40),
    online: Math.random() > 0.12,
    angle: rnd(0, Math.PI * 2),
    dist: dist || rnd(0.25, 1),
  });
  const nodes = [];
  for (let i = 0; i < 5; i++) nodes.push(mk("seed", i));
  for (let i = 5; i < 8; i++) nodes.push(mk("stem", i));
  nodes.push(mk("trunk", 8));
  nodes.push({ ...mk("root", 9, 0.95), online: true });
  return nodes;
}

const FEED_TPL = [
  (n) => `${n.id} relayed ${irnd(2, 14)} packets`,
  (n) => `ping ${n.id} → ${irnd(38, 420)}ms`,
  (n) => `${n.id} solar +${rnd(0.4, 2.1).toFixed(1)}W`,
  (n) => `route recalc via ${n.id}`,
  (n) => `L${irnd(1, 4)} fallback drill passed on ${n.id}`,
  () => `mesh key rotation complete`,
];

/* shared hooks: telemetry drift + feed */
function useMesh() {
  const [nodes, setNodes] = useState(genNodes);
  const [feed, setFeed] = useState([]);
  useEffect(() => {
    const t = setInterval(() => {
      setNodes(ns => ns.map(n => ({
        ...n,
        batt: n.type === "root" ? 100 : clamp(n.batt + rnd(-0.5, 0.65), 8, 100),
        rssi: clamp(Math.round(n.rssi + rnd(-3, 3)), -104, -52),
        seen: Math.random() < 0.3 ? irnd(0, 4) : n.seen + 3,
        online: Math.random() < 0.985 ? n.online : !n.online,
      })));
    }, 3000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const push = () => setFeed(f => {
      const d = new Date();
      const entry = { id: Date.now() + Math.random(), time: fmtTime(d), text: pick(FEED_TPL)({ id: pick(NODE_SPOTS) ? pick(["Seed·Ridge", "Stem·Garden", "Seed·Creek", "Trunk·Oak", "Seed·Gate", "Root·West"]) : "" }) };
      return [entry, ...f].slice(0, 7);
    });
    push(); push(); push();
    const t = setInterval(push, 4600);
    return () => clearInterval(t);
  }, []);
  return [nodes, feed];
}

/* messaging behavior shared by both demos */
function useConvos(notify) {
  const [contacts, setContacts] = useState(genContacts);
  const openConvo = (id) => setContacts(cs => cs.map(c => c.id === id ? { ...c, unread: 0 } : c));
  const send = (cid, text) => {
    setContacts(cs => cs.map(c => c.id === cid ? { ...c, time: "now", msgs: [...c.msgs, { id: "u" + Date.now(), d: "out", t: text }] } : c));
    setTimeout(() => setContacts(cs => cs.map(c => c.id === cid ? { ...c, typing: true } : c)), 900);
    setTimeout(() => {
      const reply = pick(REPLIES);
      setContacts(cs => cs.map(c => c.id === cid ? { ...c, typing: false, time: "now", msgs: [...c.msgs, { id: "r" + Date.now(), d: "in", t: reply }] } : c));
      if (notify) notify(cid, reply);
    }, 2600);
  };
  return [contacts, setContacts, openConvo, send];
}

/* ---------- svg glyphs (stroke) ---------- */
const Icon = ({ d, size = 22, color = "currentColor", sw = 1.8, fill = "none", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d.map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const P = {
  msg: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
  bush: ["M12 4v7", "M12 11l-4.5 4.5", "M12 11l4.5 4.5", "M5.5 17.5h.01", "M18.5 17.5h.01", "M12 20h.01", "M12 4h.01"],
  map: ["M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z", "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  gear: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],
  term: ["M4 17l6-5-6-5", "M12 19h8"],
  back: ["M15 18l-6-6 6-6"],
  send: ["M12 19V5", "M5 12l7-7 7 7"],
  video: ["M23 7l-7 5 7 5V7z", "M14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"],
  phone: ["M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"],
  info: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 16v-4", "M12 8h.01"],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  rotate: ["M23 4v6h-6", "M20.49 15a9 9 0 1 1-2.12-9.36L23 10"],
  battery: ["M3 7h13a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z", "M22 11v2"],
  locate: ["M12 2v3", "M12 19v3", "M2 12h3", "M19 12h3", "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"],
};

/* ---------- status hardware widgets ---------- */
const SignalBars = ({ color }) => (
  <svg width="17" height="11" viewBox="0 0 18 11">
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={i * 4.6} y={10 - (4 + i * 2)} width="3.2" height={4 + i * 2} rx="1" fill={color} opacity={i < 3 ? 1 : 0.35} />
    ))}
  </svg>
);
const WifiIcon = ({ color, size = 16 }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 24 17" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round">
    <path d="M2 5.5a15 15 0 0 1 20 0" opacity="0.9" />
    <path d="M5.5 9.5a10 10 0 0 1 13 0" />
    <path d="M9 13.2a5 5 0 0 1 6 0" />
    <circle cx="12" cy="16" r="0.6" fill={color} stroke="none" />
  </svg>
);
const BatteryIcon = ({ pct, color }) => (
  <svg width="25" height="12" viewBox="0 0 25 12">
    <rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke={color} opacity="0.4" />
    <rect x="2" y="2" width={18 * clamp(pct, 0, 100) / 100} height="8" rx="1.6" fill={pct <= 20 ? "#ff453a" : color} />
    <path d="M23 4v4c1 0 1.6-.8 1.6-2S24 4 23 4z" fill={color} opacity="0.4" />
  </svg>
);

const Avatar = ({ name, hue, size = 44 }) => (
  <div style={{
    width: size, height: size, borderRadius: size / 2, flexShrink: 0,
    background: `linear-gradient(160deg, hsl(${hue} 60% 55%), hsl(${hue} 65% 38%))`,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontFamily: IOS_FONT, fontWeight: 600, fontSize: size * 0.4,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
  }}>
    {name.split(" ").map(w => w[0]).slice(0, 2).join("")}
  </div>
);

/* ════════════════════════════════════════════════════════════
   DEMO 1 — MARK-1 · NULLBERRY OS  (GrapheneOS-inspired)
   ════════════════════════════════════════════════════════════ */
const G_DARK = {
  name: "dark", bg: "#000000", surface: "#111214", surface2: "#1b1d20",
  text: "#e8eaed", text2: "#9aa0a6", text3: "#5f6368",
  sep: "rgba(255,255,255,0.09)", accent: BRAND, ok: "#30d158",
  warn: "#fdd663", danger: "#f28b82", key: "rgba(255,255,255,0.07)",
};
const G_LIGHT = {
  name: "light", bg: "#e9ebee", surface: "#ffffff", surface2: "#f1f3f4",
  text: "#17181a", text2: "#5f6368", text3: "#9aa0a6",
  sep: "rgba(0,0,0,0.1)", accent: "#9a6206", ok: "#188038",
  warn: "#b05a00", danger: "#c5221f", key: "rgba(0,0,0,0.06)",
};

function GStatus({ th, batt }) {
  const now = useNow(5000);
  return (
    <div style={{ height: 34, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px", fontFamily: DROID_FONT, position: "relative", zIndex: 40 }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: th.text }}>{fmtTime(now)}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icon d={P.bush} size={13} color={th.accent} sw={2} />
        <SignalBars color={th.text} />
        <span style={{ fontSize: 10.5, fontWeight: 600, color: th.text2, fontFamily: MONO }}>{Math.round(batt)}%</span>
        <BatteryIcon pct={batt} color={th.text} />
      </div>
    </div>
  );
}

function GLock({ th, onUnlock, unread }) {
  const now = useNow(5000);
  const [pin, setPin] = useState("");
  const press = (n) => {
    if (pin.length >= 4) return;
    const next = pin + n;
    setPin(next);
    if (next.length === 4) setTimeout(onUnlock, 300);
  };
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", background: th.bg, zIndex: 30, fontFamily: DROID_FONT }}>
      <div style={{ height: 34 }} />
      <img src="assets/logo-white.svg" alt="Nullberry" style={{ height: 38, marginTop: 26, opacity: 0.94, filter: th.name === "light" ? "invert(1)" : "none" }} />
      <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: -1, color: th.text, marginTop: 18, lineHeight: 1, fontFamily: DROID_FONT }}>{fmtTime(now)}</div>
      <div style={{ fontSize: 13, color: th.text2, marginTop: 6 }}>
        {unread > 0 ? unread + " new mesh message" + (unread > 1 ? "s" : "") : "mesh connected"}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 12, color: th.text3, marginBottom: 12 }}>Enter PIN — any 4 digits</div>
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: 2, border: `1.4px solid ${th.text2}`, background: i < pin.length ? th.accent : "transparent", borderColor: i < pin.length ? th.accent : th.text2, transition: "all 0.15s" }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 66px)", gap: 10, marginBottom: 26 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"].map((k, i) => k === null ? <div key={i} /> : (
          <button key={i} onClick={() => k === "⌫" ? setPin(pin.slice(0, -1)) : press(String(k))}
            style={{ width: 66, height: 54, borderRadius: 8, border: `1px solid ${th.sep}`, cursor: "pointer", background: th.key, color: th.text, fontSize: k === "⌫" ? 15 : 21, fontFamily: DROID_FONT, fontWeight: 400, transition: "background 0.15s" }}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

const G_APPS = [
  { id: "messages", label: "Messages", icon: P.msg },
  { id: "bush", label: "Tree", icon: P.bush },
  { id: "map", label: "Map", icon: P.map },
  { id: "terminal", label: "Terminal", icon: P.term },
  { id: "settings", label: "Settings", icon: P.gear },
];

function GLauncher({ th, onOpen, unread, nodesOnline }) {
  return (
    <div style={{ position: "absolute", inset: 0, paddingTop: 34, display: "flex", flexDirection: "column", fontFamily: DROID_FONT }}>
      <div style={{ margin: "16px 16px 8px", padding: "13px 15px", borderRadius: 10, background: th.surface, border: `1px solid ${th.sep}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: th.ok, animation: "nbPulse 2s ease-in-out infinite" }} />
          <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: 1.4, color: th.text2 }}>NULLBERRY TREE</span>
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: th.text }}>{nodesOnline} nodes online · all transports up</div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", rowGap: 26, padding: "0 22px 30px", justifyItems: "center" }}>
        {G_APPS.map(app => (
          <button key={app.id} onClick={() => onOpen(app.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 0 }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: th.surface2, border: `1px solid ${th.sep}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", color: th.text }}>
              <Icon d={app.icon} size={25} sw={1.6} />
              {app.id === "messages" && unread > 0 && (
                <div style={{ position: "absolute", top: -3, right: -3, minWidth: 17, height: 17, borderRadius: 9, background: th.accent, color: "#241503", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{unread}</div>
              )}
            </div>
            <span style={{ fontSize: 11, color: th.text2 }}>{app.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function GHeader({ th, title, onBack, right }) {
  return (
    <div style={{ paddingTop: 34, background: th.bg, borderBottom: `1px solid ${th.sep}`, position: "relative", zIndex: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px" }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: th.text, display: "flex", padding: 0 }}>
            <Icon d={P.back} size={21} sw={2} />
          </button>
        )}
        <span style={{ fontFamily: DROID_FONT, fontWeight: 600, fontSize: 17, color: th.text, flex: 1 }}>{title}</span>
        {right}
      </div>
    </div>
  );
}

function GMessages({ th, contacts, openConvo, send }) {
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);
  const active = contacts.find(c => c.id === activeId);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [activeId, active && active.msgs.length, active && active.typing]);
  return (
    <div style={{ position: "absolute", inset: 0, background: th.bg, overflow: "hidden", fontFamily: DROID_FONT }}>
      <div style={{ position: "absolute", inset: 0, transform: active ? "translateX(-24%)" : "none", transition: `transform 0.4s ${SPRING}`, display: "flex", flexDirection: "column" }}>
        <GHeader th={th} title="Mesh Messages" right={<Icon d={P.shield} size={16} color={th.accent} sw={2} />} />
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 40 }}>
          {contacts.map(c => (
            <button key={c.id} onClick={() => { openConvo(c.id); setActiveId(c.id); }} style={{ display: "flex", gap: 11, alignItems: "center", width: "100%", padding: "11px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBottom: `1px solid ${th.sep}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 6, background: th.surface2, border: `1px solid ${th.sep}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 14, fontWeight: 600, color: th.accent, flexShrink: 0 }}>
                {c.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: th.text }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: th.text3, fontFamily: MONO }}>{c.time}</span>
                </div>
                <div style={{ fontSize: 12.5, color: c.unread ? th.text : th.text2, fontWeight: c.unread ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>
                  {c.typing ? "typing…" : c.msgs[c.msgs.length - 1].t}
                </div>
              </div>
              {c.unread > 0 && <div style={{ width: 8, height: 8, borderRadius: 4, background: th.accent, flexShrink: 0 }} />}
            </button>
          ))}
          <div style={{ textAlign: "center", padding: "13px 0", fontFamily: MONO, fontSize: 9, color: th.text3, letterSpacing: 1 }}>
            X25519 · AES-256 · STORE-AND-FORWARD
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: th.bg, transform: active ? "none" : "translateX(102%)", transition: `transform 0.4s ${SPRING}`, display: "flex", flexDirection: "column" }}>
        {active && (
          <React.Fragment>
            <GHeader th={th} title={active.name} onBack={() => setActiveId(null)}
              right={<span style={{ fontFamily: MONO, fontSize: 9, color: th.text3 }}>{active.route}</span>} />
            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 12px 6px", display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 9, color: th.text3, margin: "2px 0 8px" }}>
                {active.hops} HOP{active.hops > 1 ? "S" : ""} · E2E ENCRYPTED
              </div>
              {active.msgs.map((m, i) => {
                const out = m.d === "out";
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: out ? "flex-end" : "flex-start", animation: i === active.msgs.length - 1 ? "nbBubbleIn 0.3s " + SPRING : "none" }}>
                    <div style={{ maxWidth: "76%", padding: "7px 11px", borderRadius: 8, background: out ? th.accent : th.surface2, border: out ? "none" : `1px solid ${th.sep}`, color: out ? "#241503" : th.text, fontSize: 13.5, lineHeight: 1.4, fontWeight: out ? 500 : 400 }}>{m.t}</div>
                  </div>
                );
              })}
              {active.typing && (
                <div style={{ display: "flex" }}>
                  <div style={{ padding: "10px 12px", borderRadius: 8, background: th.surface2, border: `1px solid ${th.sep}`, display: "flex", gap: 4 }}>
                    {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: th.text3, animation: `nbTyping 1.2s ${i * 0.18}s ease-in-out infinite` }} />)}
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: "8px 10px 34px", display: "flex", gap: 7, borderTop: `1px solid ${th.sep}` }}>
              <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && draft.trim()) { send(active.id, draft.trim()); setDraft(""); } }}
                placeholder="Message the mesh"
                style={{ flex: 1, borderRadius: 8, border: `1px solid ${th.sep}`, background: th.surface, color: th.text, fontFamily: DROID_FONT, fontSize: 13.5, padding: "8px 12px", outline: "none" }} />
              <button onClick={() => { if (draft.trim()) { send(active.id, draft.trim()); setDraft(""); } }} style={{ width: 36, height: 36, borderRadius: 8, border: "none", cursor: "pointer", background: draft.trim() ? th.accent : th.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d={P.send} size={16} color={draft.trim() ? "#241503" : th.text3} sw={2.4} />
              </button>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

function GBush({ th, nodes, feed }) {
  const online = nodes.filter(n => n.online).length;
  const avgRssi = Math.round(nodes.filter(n => n.online).reduce((s, n) => s + n.rssi, 0) / Math.max(1, online));
  const health = clamp(Math.round(140 + avgRssi * 0.9), 55, 99);
  return (
    <div style={{ position: "absolute", inset: 0, background: th.bg, display: "flex", flexDirection: "column", fontFamily: DROID_FONT }}>
      <GHeader th={th} title="Tree" right={<span style={{ fontFamily: MONO, fontSize: 9, color: th.ok }}>● LIVE</span>} />
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 44px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {[["ONLINE", online + "/" + nodes.length, th.accent], ["HEALTH", health + "%", health > 80 ? th.ok : th.warn], ["AVG dBm", avgRssi, th.text]].map(([l, v, c]) => (
            <div key={l} style={{ flex: 1, background: th.surface, border: `1px solid ${th.sep}`, borderRadius: 8, padding: "9px 11px" }}>
              <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
              <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 1, color: th.text3, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ background: th.surface, border: `1px solid ${th.sep}`, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
          {nodes.map((n, i) => (
            <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderBottom: i < nodes.length - 1 ? `1px solid ${th.sep}` : "none", opacity: n.online ? 1 : 0.45 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: NODE_TYPES[n.type].c, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: th.text }}>{n.id}</div>
                <div style={{ fontFamily: MONO, fontSize: 8.5, color: th.text3 }}>
                  {n.online ? `${n.rssi}dBm · ${n.hops === 0 ? "backbone" : n.hops + "hop"} · ${n.seen}s` : "offline"}
                </div>
              </div>
              <span style={{ fontFamily: MONO, fontSize: 9.5, color: n.batt < 25 ? th.danger : th.text2 }}>{Math.round(n.batt)}%</span>
              <div style={{ width: 40, height: 3, borderRadius: 2, background: th.sep }}>
                <div style={{ width: `${n.batt}%`, height: "100%", borderRadius: 2, background: n.batt < 25 ? th.danger : n.batt < 55 ? th.warn : th.ok, transition: "width 1s linear" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: th.surface, border: `1px solid ${th.sep}`, borderRadius: 8, padding: "8px 12px" }}>
          {feed.map((f, i) => (
            <div key={f.id} style={{ fontFamily: MONO, fontSize: 9, lineHeight: 2, color: i === 0 ? th.accent : th.text3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", animation: i === 0 ? "nbFadeIn 0.5s ease" : "none" }}>
              <span style={{ opacity: 0.55 }}>{f.time}</span>  {f.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GMap({ th, nodes }) {
  const [pulseIdx, setPulseIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPulseIdx(i => (i + 1) % nodes.length), 1900);
    return () => clearInterval(t);
  }, [nodes.length]);
  const W = 330, H = 420, cx = W / 2, cy = H / 2;
  const pos = useMemo(() => nodes.map(n => ({
    x: cx + Math.cos(n.angle) * n.dist * (W / 2 - 32),
    y: cy + Math.sin(n.angle) * n.dist * (H / 2 - 46),
  })), [nodes.length]);
  const line = th.name === "dark" ? "rgba(255,180,84,0.16)" : "rgba(154,98,6,0.25)";
  return (
    <div style={{ position: "absolute", inset: 0, background: th.bg, display: "flex", flexDirection: "column", fontFamily: DROID_FONT }}>
      <GHeader th={th} title="Mesh Map" right={<span style={{ fontFamily: MONO, fontSize: 9, color: th.text3 }}>{nodes.filter(n => n.online).length} UP</span>} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {[56, 104, 156].map((r, i) => <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={line} strokeDasharray="2 6" />)}
          {pos.map((p, i) => {
            let best = -1, bd = 1e9;
            pos.forEach((q, j) => { if (j !== i) { const dd = (p.x - q.x) ** 2 + (p.y - q.y) ** 2; if (dd < bd) { bd = dd; best = j; } } });
            return best >= 0 && nodes[i].online && nodes[best].online ? <line key={"l" + i} x1={p.x} y1={p.y} x2={pos[best].x} y2={pos[best].y} stroke={line} strokeWidth="1" /> : null;
          })}
          {pos.map((p, i) => {
            const n = nodes[i], c = NODE_TYPES[n.type].c;
            return (
              <g key={"n" + i} opacity={n.online ? 1 : 0.3}>
                {i === pulseIdx && n.online && <circle cx={p.x} cy={p.y} r="8" fill="none" stroke={c} opacity="0.7"><animate attributeName="r" from="5" to="20" dur="1.6s" repeatCount="indefinite" /><animate attributeName="opacity" from="0.7" to="0" dur="1.6s" repeatCount="indefinite" /></circle>}
                <rect x={p.x - (n.type === "root" ? 6 : 4)} y={p.y - (n.type === "root" ? 6 : 4)} width={n.type === "root" ? 12 : 8} height={n.type === "root" ? 12 : 8} fill={c} transform={`rotate(45 ${p.x} ${p.y})`} />
                <text x={p.x} y={p.y - 12} textAnchor="middle" fill={th.text2} fontSize="7.5" fontFamily={MONO}>{n.id}</text>
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r="7" fill={th.accent}><animate attributeName="r" values="6;8;6" dur="2.4s" repeatCount="indefinite" /></circle>
          <circle cx={cx} cy={cy} r="3" fill={th.name === "dark" ? "#000" : "#fff"} />
          <text x={cx} y={cy + 22} textAnchor="middle" fill={th.text} fontSize="8.5" fontWeight="700" fontFamily={MONO}>YOU</text>
        </svg>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 14, padding: "0 0 46px" }}>
        {Object.values(NODE_TYPES).map(v => (
          <div key={v.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, background: v.c, transform: "rotate(45deg)" }} />
            <span style={{ fontFamily: MONO, fontSize: 9, color: th.text2 }}>{v.label.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GTerminal({ th, feed }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", display: "flex", flexDirection: "column" }}>
      <GHeader th={G_DARK} title="Terminal" />
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 44px", fontFamily: MONO, fontSize: 10, lineHeight: 1.9 }}>
        <div style={{ color: BRAND }}>nullberry@mark0:~$ nullrns status</div>
        <div style={{ color: "#9aa0a6" }}>NullRNS v0.4.1 · identity nb1·{Math.random().toString(36).slice(2, 8)}</div>
        <div style={{ color: "#9aa0a6" }}>transports: L1 ✓ L2 ✓ L3 ✓ L4 ✓ L5 ✓ L6 ✓ L7 ✓</div>
        <div style={{ color: "#9aa0a6" }}>hydra failover: armed · dead-drop cache: 0 pending</div>
        <div style={{ color: BRAND, marginTop: 8 }}>nullberry@mark0:~$ tail -f /var/log/mesh</div>
        {[...feed].reverse().map(f => (
          <div key={f.id} style={{ color: "#5f6368" }}>[{f.time}] {f.text}</div>
        ))}
        <span style={{ color: BRAND }}>▊</span>
      </div>
    </div>
  );
}

const G_MODES = ["Full Mesh", "Reduced Signature", "Whisper", "Silent (RF Dark)", "Dead Drop"];
const TRANSPORTS = ["LoRa 915 MHz", "LoRa 433 MHz", "WiFi Direct", "BLE Mesh", "IR Optical", "Ultrasonic", "USB Wired"];

function GToggle({ on, onChange, th }) {
  return (
    <button onClick={onChange} style={{ width: 40, height: 22, borderRadius: 4, border: `1px solid ${on ? th.accent : th.sep}`, cursor: "pointer", background: on ? th.accent : "transparent", position: "relative", transition: "all 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 2, left: on ? 19 : 2, width: 16, height: 16, borderRadius: 3, background: on ? "#241503" : th.text3, transition: `left 0.2s ${SPRING}` }} />
    </button>
  );
}

function GSettings({ th, themeName, setThemeName, mode, setMode, transports, setTransports }) {
  const Sect = ({ label }) => <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1.6, color: th.accent, margin: "18px 16px 6px" }}>{label}</div>;
  return (
    <div style={{ position: "absolute", inset: 0, background: th.bg, display: "flex", flexDirection: "column", fontFamily: DROID_FONT }}>
      <GHeader th={th} title="Settings" />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 44 }}>
        <Sect label="APPEARANCE" />
        <div style={{ display: "flex", margin: "0 14px", gap: 8 }}>
          {["dark", "light"].map(m => (
            <button key={m} onClick={() => setThemeName(m)} style={{ flex: 1, padding: "9px 0", borderRadius: 6, border: `1px solid ${themeName === m ? th.accent : th.sep}`, cursor: "pointer", fontFamily: MONO, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: themeName === m ? th.accent : th.text2, background: themeName === m ? (th.name === "dark" ? "rgba(255,180,84,0.08)" : "rgba(154,98,6,0.08)") : "transparent" }}>{m}</button>
          ))}
        </div>
        <Sect label="OPERATIONAL MODE" />
        <div style={{ margin: "0 14px", background: th.surface, border: `1px solid ${th.sep}`, borderRadius: 8, overflow: "hidden" }}>
          {G_MODES.map((m, i) => (
            <div key={m} onClick={() => setMode(m)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 13px", borderBottom: i < G_MODES.length - 1 ? `1px solid ${th.sep}` : "none", cursor: "pointer" }}>
              <span style={{ fontSize: 13.5, color: th.text }}>{m}</span>
              <div style={{ width: 14, height: 14, borderRadius: 7, border: `1.6px solid ${mode === m ? th.accent : th.text3}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {mode === m && <div style={{ width: 7, height: 7, borderRadius: 4, background: th.accent }} />}
              </div>
            </div>
          ))}
        </div>
        <Sect label="TRANSPORT LAYERS" />
        <div style={{ margin: "0 14px", background: th.surface, border: `1px solid ${th.sep}`, borderRadius: 8, overflow: "hidden" }}>
          {TRANSPORTS.map((t, i) => (
            <div key={t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 13px", borderBottom: i < TRANSPORTS.length - 1 ? `1px solid ${th.sep}` : "none" }}>
              <span style={{ fontFamily: MONO, fontSize: 11.5, color: th.text }}>L{i + 1} · {t}</span>
              <GToggle th={th} on={transports[i]} onChange={() => setTransports(ts => ts.map((v, j) => j === i ? !v : v))} />
            </div>
          ))}
        </div>
        <Sect label="ABOUT" />
        <div style={{ margin: "0 14px", background: th.surface, border: `1px solid ${th.sep}`, borderRadius: 8, overflow: "hidden" }}>
          {[["Device", "MARK-0 Prototype"], ["OS", "Nullberry OS 0.4.1"], ["Kernel", "6.9.4-nb-hardened"], ["Verified boot", "enforced"]].map(([k, v], i, arr) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 13px", borderBottom: i < arr.length - 1 ? `1px solid ${th.sep}` : "none" }}>
              <span style={{ fontSize: 13, color: th.text }}>{k}</span>
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: th.text2 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", padding: "16px 0 4px" }}>
          <img src="assets/logo-white.svg" alt="Nullberry" style={{ height: 24, margin: "0 auto", opacity: 0.55, filter: th.name === "light" ? "invert(1)" : "none" }} />
        </div>
      </div>
    </div>
  );
}

function Mark1Demo() {
  const [themeName, setThemeName] = useState("dark");
  const th = themeName === "dark" ? G_DARK : G_LIGHT;
  const [locked, setLocked] = useState(true);
  const [app, setApp] = useState(null);
  const [appVisible, setAppVisible] = useState(false);
  const [nodes, feed] = useMesh();
  const [contacts, setContacts, openConvo, send] = useConvos();
  const [batt, setBatt] = useState(irnd(62, 94));
  const [mode, setMode] = useState("Full Mesh");
  const [transports, setTransports] = useState(TRANSPORTS.map(() => true));
  const unread = contacts.reduce((s, c) => s + c.unread, 0);

  useEffect(() => {
    const t = setInterval(() => setBatt(b => Math.max(14, b - 1)), 50000);
    return () => clearInterval(t);
  }, []);

  const openApp = (id) => { setApp(id); requestAnimationFrame(() => requestAnimationFrame(() => setAppVisible(true))); };
  const goHome = () => { setAppVisible(false); setTimeout(() => setApp(null), 340); };

  return (
    <div style={{
      width: "min(370px, calc(100vw - 40px))", aspectRatio: "370 / 800",
      borderRadius: 18, padding: 7, position: "relative",
      background: "linear-gradient(170deg, #23262a 0%, #0d0e10 40%, #16181b 100%)",
      boxShadow: "inset 0 1px 1px rgba(255,255,255,0.16), 0 26px 70px rgba(0,0,0,0.55), 0 0 60px rgba(255,180,84,0.06)",
    }}>
      {/* antenna bands */}
      <div style={{ position: "absolute", top: 60, left: -1, width: 1.6, height: 15, background: "#3a3d42" }} />
      <div style={{ position: "absolute", top: 60, right: -1, width: 1.6, height: 15, background: "#3a3d42" }} />
      <div style={{ position: "absolute", bottom: 90, left: -1, width: 1.6, height: 15, background: "#3a3d42" }} />
      <div style={{ position: "absolute", right: -2.5, top: "24%", width: 3, height: 58, borderRadius: 2, background: "#26282c" }} />
      <div style={{ position: "absolute", right: -2.5, top: "35%", width: 3, height: 34, borderRadius: 2, background: "#d98a2b" }} />

      <div className="nb-screen" style={{ position: "absolute", inset: 7, borderRadius: 12, overflow: "hidden", background: th.bg, transition: "background 0.5s" }}>
        {!locked && <GStatus th={th} batt={batt} />}

        {!locked && (
          <div style={{ position: "absolute", inset: 0, transform: app && appVisible ? "scale(0.97)" : "none", opacity: app && appVisible ? 0 : 1, transition: `all 0.35s ${SPRING}`, pointerEvents: app ? "none" : "auto" }}>
            <GLauncher th={th} onOpen={openApp} unread={unread} nodesOnline={nodes.filter(n => n.online).length} />
          </div>
        )}

        {app && (
          <div style={{ position: "absolute", inset: 0, zIndex: 20, transform: appVisible ? "none" : "translateY(4%)", opacity: appVisible ? 1 : 0, transition: `all 0.32s ${SPRING}` }}>
            {app === "messages" && <GMessages th={th} contacts={contacts} openConvo={openConvo} send={send} />}
            {app === "bush" && <GBush th={th} nodes={nodes} feed={feed} />}
            {app === "map" && <GMap th={th} nodes={nodes} />}
            {app === "terminal" && <GTerminal th={th} feed={feed} />}
            {app === "settings" && <GSettings th={th} themeName={themeName} setThemeName={setThemeName} mode={mode} setMode={setMode} transports={transports} setTransports={setTransports} />}
          </div>
        )}

        {locked && <GLock th={th} unread={unread} onUnlock={() => setLocked(false)} />}

        {!locked && (
          <button onClick={goHome} aria-label="Home" style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", width: 120, height: 20, background: "none", border: "none", cursor: "pointer", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0 }}>
            <div style={{ width: 96, height: 4, borderRadius: 2, background: th.name === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)", marginBottom: 4 }} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DEMO 2 — iPHONE · iOS COMPANION APP  (Liquid Glass)
   ════════════════════════════════════════════════════════════ */
const I_DARK = {
  name: "dark", bg: "#000", grouped: "#0b0b0d", card: "rgba(28,28,30,0.86)", cardSolid: "#1c1c1e",
  text: "#fff", text2: "rgba(235,235,245,0.62)", text3: "rgba(235,235,245,0.32)",
  sep: "rgba(84,84,88,0.42)", blue: "#0a84ff", green: "#30d158", red: "#ff453a",
  glass: "rgba(30,30,34,0.6)", glassBorder: "rgba(255,255,255,0.14)",
  blur: "rgba(16,16,18,0.78)", statusText: "#fff",
};
const I_LIGHT = {
  name: "light", bg: "#f2f2f7", grouped: "#f2f2f7", card: "rgba(255,255,255,0.86)", cardSolid: "#fff",
  text: "#000", text2: "rgba(60,60,67,0.62)", text3: "rgba(60,60,67,0.3)",
  sep: "rgba(60,60,67,0.18)", blue: "#007aff", green: "#34c759", red: "#ff3b30",
  glass: "rgba(255,255,255,0.55)", glassBorder: "rgba(255,255,255,0.6)",
  blur: "rgba(249,249,249,0.82)", statusText: "#000",
};

/* recreated iOS-style default wallpaper: flowing color bloom */
const I_WALL = {
  dark: "radial-gradient(90% 60% at 75% 12%, rgba(94,92,230,0.55), transparent 60%), radial-gradient(80% 55% at 20% 35%, rgba(10,132,255,0.5), transparent 65%), radial-gradient(90% 60% at 70% 78%, rgba(255,55,95,0.38), transparent 60%), radial-gradient(70% 50% at 25% 95%, rgba(255,159,10,0.3), transparent 65%), linear-gradient(170deg, #0b0b20 0%, #05050c 100%)",
  light: "radial-gradient(90% 60% at 75% 12%, rgba(120,130,255,0.7), transparent 60%), radial-gradient(80% 55% at 20% 35%, rgba(90,200,250,0.65), transparent 65%), radial-gradient(90% 60% at 70% 78%, rgba(255,120,150,0.5), transparent 60%), radial-gradient(70% 50% at 25% 95%, rgba(255,204,120,0.5), transparent 65%), linear-gradient(170deg, #cfd8ff 0%, #eef1f8 100%)",
};

function IStatusBar({ th, batt, onIsland }) {
  const now = useNow(5000);
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 50, display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 24px 5px", zIndex: 40, pointerEvents: "none", fontFamily: IOS_FONT }}>
      <div style={{ width: 92, textAlign: "center", fontSize: 14.5, fontWeight: 600, color: th.statusText }}>{fmtTime(now)}</div>
      <div style={{ width: 96, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
        <SignalBars color={th.statusText} />
        <span style={{ fontSize: 10.5, fontWeight: 600, color: th.statusText }}>5G</span>
        <BatteryIcon pct={batt} color={th.statusText} />
      </div>
    </div>
  );
}

function Island({ activity }) {
  const active = !!activity;
  return (
    <div style={{
      position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
      width: active ? 288 : 112, height: active ? 62 : 32,
      background: "#000", borderRadius: active ? 32 : 18, zIndex: 50,
      transition: `all 0.55s ${SPRING}`, overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: active ? "flex-start" : "center",
      padding: active ? "0 14px" : 0,
      boxShadow: active ? "0 8px 26px rgba(0,0,0,0.5)" : "none",
    }}>
      {active && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", animation: "nbFadeIn 0.4s ease" }}>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: `hsl(${activity.hue || 198} 62% 46%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontFamily: IOS_FONT, fontWeight: 700, fontSize: 14 }}>
            {activity.initial || "N"}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 9.5, fontFamily: IOS_FONT, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{activity.kind}</div>
            <div style={{ color: "#fff", fontSize: 12.5, fontFamily: IOS_FONT, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{activity.text}</div>
          </div>
          <div style={{ width: 7, height: 7, borderRadius: 4, background: BRAND, boxShadow: `0 0 8px ${BRAND}`, flexShrink: 0, animation: "nbPulse 1.4s ease-in-out infinite" }} />
        </div>
      )}
    </div>
  );
}

/* ---- Apple-style app icon recreations (drawn, not Apple assets) ---- */
const Squircle = ({ children, bg, size = 57 }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.24, background: bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", boxShadow: "inset 0 0.5px 0.5px rgba(255,255,255,0.4), 0 5px 13px rgba(0,0,0,0.32)" }}>
    {children}
  </div>
);
const ICONS = {
  messages: (s) => (
    <Squircle size={s} bg="linear-gradient(180deg,#6be36a,#12b81f)">
      <svg width={s * 0.58} height={s * 0.58} viewBox="0 0 24 24"><path fill="#fff" d="M12 3C6.48 3 2 6.86 2 11.6c0 2.7 1.46 5.1 3.74 6.68-.18 1.02-.7 2.16-1.62 3.02 1.66-.14 3.2-.8 4.4-1.72 1.1.3 2.26.46 3.48.46 5.52 0 10-3.86 10-8.6S17.52 3 12 3z"/></svg>
    </Squircle>
  ),
  facetime: (s) => (
    <Squircle size={s} bg="linear-gradient(180deg,#6be36a,#12b81f)">
      <svg width={s * 0.6} height={s * 0.6} viewBox="0 0 24 24"><rect x="2.4" y="6" width="12.6" height="12" rx="3.4" fill="#fff"/><path fill="#fff" d="M16.4 10.6l4-2.9c.5-.36 1.2 0 1.2.62v7.36c0 .62-.7.98-1.2.62l-4-2.9v-2.8z"/></svg>
    </Squircle>
  ),
  phone: (s) => (
    <Squircle size={s} bg="linear-gradient(180deg,#6be36a,#12b81f)">
      <svg width={s * 0.55} height={s * 0.55} viewBox="0 0 24 24"><path fill="#fff" d="M6.62 3.2c.6-.16 1.23.1 1.55.63l1.6 2.72c.35.6.28 1.35-.18 1.87l-1.2 1.35a14.5 14.5 0 0 0 5.84 5.84l1.35-1.2c.52-.46 1.28-.53 1.87-.18l2.72 1.6c.54.32.8.95.63 1.55l-.7 2.6c-.17.63-.75 1.06-1.4 1.02C9.7 20.4 3.6 14.3 3 5.7c-.04-.65.4-1.23 1.02-1.4l2.6-.7z"/></svg>
    </Squircle>
  ),
  safari: (s) => (
    <Squircle size={s} bg="linear-gradient(180deg,#f8f9fb,#dfe3ea)">
      <svg width={s * 0.72} height={s * 0.72} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="url(#nbSafG)" />
        <defs><radialGradient id="nbSafG" cx="0.5" cy="0.35" r="0.8"><stop offset="0" stopColor="#3fc2ff"/><stop offset="1" stopColor="#1668e3"/></radialGradient></defs>
        {[...Array(12)].map((_, i) => <rect key={i} x="11.7" y="2.6" width="0.6" height="1.6" fill="rgba(255,255,255,0.8)" transform={`rotate(${i * 30} 12 12)`} />)}
        <polygon points="12,12 15.6,8.4 13.2,13.2" fill="#fff" />
        <polygon points="12,12 8.4,15.6 10.8,10.8" fill="#ff3b30" />
      </svg>
    </Squircle>
  ),
  photos: (s) => (
    <Squircle size={s} bg="#fff">
      <svg width={s * 0.66} height={s * 0.66} viewBox="0 0 24 24">
        {["#f5b427", "#e8862c", "#dd5142", "#c74e9b", "#8262c8", "#4a7bd6", "#4aa8d8", "#7fbc4e"].map((c, i) => (
          <ellipse key={i} cx="12" cy="7.2" rx="2.6" ry="4.6" fill={c} opacity="0.82" transform={`rotate(${i * 45} 12 12)`} />
        ))}
      </svg>
    </Squircle>
  ),
  camera: (s) => (
    <Squircle size={s} bg="linear-gradient(180deg,#e6e7ea,#c9cbd1)">
      <svg width={s * 0.62} height={s * 0.62} viewBox="0 0 24 24">
        <rect x="2.5" y="6" width="19" height="13" rx="3" fill="#3c3f45" />
        <path d="M8.6 6l1-1.8c.2-.34.55-.55.94-.55h2.92c.4 0 .75.2.94.55L15.4 6z" fill="#3c3f45" />
        <circle cx="12" cy="12.5" r="4.2" fill="#23252a" />
        <circle cx="12" cy="12.5" r="2.7" fill="url(#nbLens)" />
        <defs><radialGradient id="nbLens" cx="0.35" cy="0.3" r="0.9"><stop offset="0" stopColor="#7fb2e8"/><stop offset="1" stopColor="#1c2c48"/></radialGradient></defs>
      </svg>
    </Squircle>
  ),
  mail: (s) => (
    <Squircle size={s} bg="linear-gradient(180deg,#4fa8ff,#1668e3)">
      <svg width={s * 0.6} height={s * 0.6} viewBox="0 0 24 24">
        <rect x="2.6" y="5.4" width="18.8" height="13.2" rx="2.4" fill="#fff" />
        <path d="M3.4 6.6l8.6 6.4 8.6-6.4" fill="none" stroke="#1668e3" strokeWidth="1.3" />
      </svg>
    </Squircle>
  ),
  maps: (s) => (
    <Squircle size={s} bg="linear-gradient(150deg,#e8f4e0 0%, #d3ecf7 100%)">
      <svg width={s} height={s} viewBox="0 0 57 57">
        <path d="M0 34 Q18 26 30 34 T57 30 V57 H0 Z" fill="#c9e8a5" />
        <path d="M0 20 C14 16 30 24 57 14 L57 22 C30 32 14 24 0 28 Z" fill="#f7d954" opacity="0.9" />
        <rect x="24" y="0" width="7" height="57" fill="#fff" transform="rotate(18 28 28)" />
        <polygon points="28,16 36,36 28,31 20,36" fill="#1668e3" transform="rotate(24 28 26)" />
      </svg>
    </Squircle>
  ),
  clock: (s) => {
    const d = new Date();
    const hh = (d.getHours() % 12) * 30 + d.getMinutes() * 0.5, mm = d.getMinutes() * 6;
    return (
      <Squircle size={s} bg="#fff">
        <svg width={s * 0.82} height={s * 0.82} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10.6" fill="#fff" stroke="#111" strokeWidth="0.5" />
          {[...Array(12)].map((_, i) => <rect key={i} x="11.8" y="1.8" width="0.5" height="1.8" fill="#111" transform={`rotate(${i * 30} 12 12)`} />)}
          <line x1="12" y1="12" x2={12 + 4.6 * Math.sin(hh * Math.PI / 180)} y2={12 - 4.6 * Math.cos(hh * Math.PI / 180)} stroke="#111" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="12" y1="12" x2={12 + 6.8 * Math.sin(mm * Math.PI / 180)} y2={12 - 6.8 * Math.cos(mm * Math.PI / 180)} stroke="#111" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="12" y1="12.8" x2="12" y2="4.6" stroke="#ff9500" strokeWidth="0.5" transform={`rotate(${d.getSeconds() * 6} 12 12)`} />
          <circle cx="12" cy="12" r="0.9" fill="#111" />
        </svg>
      </Squircle>
    );
  },
  weather: (s) => (
    <Squircle size={s} bg="linear-gradient(180deg,#4da4f5,#1c66d4)">
      <svg width={s * 0.64} height={s * 0.64} viewBox="0 0 24 24">
        <circle cx="9" cy="9" r="4.4" fill="#ffd60a" />
        <path d="M8 18.5a3.5 3.5 0 0 1 .4-6.98A4.5 4.5 0 0 1 17 12a3.25 3.25 0 0 1-.25 6.5z" fill="#fff" />
      </svg>
    </Squircle>
  ),
  settings: (s) => (
    <Squircle size={s} bg="linear-gradient(180deg,#9a9da5,#63666e)">
      <svg width={s * 0.66} height={s * 0.66} viewBox="0 0 24 24" fill="none" stroke="#e8e9ec" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    </Squircle>
  ),
  nullberry: (s) => (
    <Squircle size={s} bg="linear-gradient(160deg,#101318,#04070a)">
      <img src="assets/favicon-dark.svg" alt="" style={{ width: "62%", height: "62%", objectFit: "contain" }} />
    </Squircle>
  ),
};

const I_GRID = [
  { id: "facetime", label: "FaceTime" },
  { id: "photos", label: "Photos" },
  { id: "camera", label: "Camera" },
  { id: "maps", label: "Maps" },
  { id: "clock", label: "Clock" },
  { id: "weather", label: "Weather" },
  { id: "mail", label: "Mail" },
  { id: "nullberry", label: "Nullberry" },
];
const I_DOCK = ["phone", "safari", "messages", "settings"];
const I_FUNCTIONAL = ["messages", "facetime", "nullberry", "settings"];

function IHome({ th, onOpen, unread }) {
  const [bounce, setBounce] = useState(null);
  const tap = (id) => {
    if (I_FUNCTIONAL.includes(id)) { onOpen(id); return; }
    setBounce(id);
    setTimeout(() => setBounce(null), 420);
  };
  const IconBtn = ({ id, label }) => (
    <button onClick={() => tap(id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: 0, width: 70, animation: bounce === id ? "nbNudge 0.4s ease" : "none" }}>
      <div style={{ position: "relative" }}>
        {ICONS[id](57)}
        {id === "messages" && unread > 0 && (
          <div style={{ position: "absolute", top: -5, right: -5, minWidth: 19, height: 19, borderRadius: 10, background: "#ff3b30", color: "#fff", fontSize: 11.5, fontWeight: 600, fontFamily: IOS_FONT, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{unread}</div>
        )}
      </div>
      {label !== "" && <span style={{ fontSize: 10.5, fontFamily: IOS_FONT, fontWeight: 500, color: th.name === "dark" ? "#fff" : "#1a1a1c", textShadow: th.name === "dark" ? "0 1px 4px rgba(0,0,0,0.6)" : "0 1px 4px rgba(255,255,255,0.5)" }}>{label}</span>}
    </button>
  );
  return (
    <div style={{ position: "absolute", inset: 0, paddingTop: 66, display: "flex", flexDirection: "column", zIndex: 5 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", justifyItems: "center", rowGap: 18, padding: "8px 12px 0" }}>
        {I_GRID.map(a => <IconBtn key={a.id} id={a.id} label={a.label} />)}
      </div>
      <div style={{ flex: 1 }} />
      {/* liquid-glass dock */}
      <div style={{ margin: "0 12px 20px", borderRadius: 30, padding: "11px 6px", background: th.glass, backdropFilter: "blur(28px) saturate(1.6)", WebkitBackdropFilter: "blur(28px) saturate(1.6)", border: `1px solid ${th.glassBorder}`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 10px 30px rgba(0,0,0,0.25)", display: "flex", justifyContent: "space-around" }}>
        {I_DOCK.map(id => <IconBtn key={id} id={id} label="" />)}
      </div>
    </div>
  );
}

function ILock({ th, onUnlocked, unread }) {
  const now = useNow(5000);
  const [stage, setStage] = useState("clock"); // clock | pin
  const [pin, setPin] = useState("");
  const press = (n) => {
    if (pin.length >= 4) return;
    const next = pin + n;
    setPin(next);
    if (next.length === 4) setTimeout(onUnlocked, 320);
  };
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const glass = { background: th.name === "dark" ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.5)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `0.5px solid ${th.glassBorder}` };
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 30, fontFamily: IOS_FONT, display: "flex", flexDirection: "column", alignItems: "center" }} onClick={() => stage === "clock" && setStage("pin")}>
      {stage === "clock" ? (
        <React.Fragment>
          <div style={{ marginTop: 74, display: "flex", alignItems: "center", gap: 6, color: th.statusText, opacity: 0.9 }}>
            <Icon d={P.shield} size={13} color={th.statusText} sw={2} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{days[now.getDay()]}, {months[now.getMonth()]} {now.getDate()}</span>
          </div>
          <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -3, color: th.statusText, lineHeight: 1.02, marginTop: 2, fontFamily: IOS_FONT }}>{fmtTime(now)}</div>
          {unread > 0 && (
            <div style={{ width: "84%", marginTop: 26, borderRadius: 22, padding: "11px 13px", display: "flex", gap: 10, alignItems: "center", ...glass }}>
              {ICONS.nullberry(36)}
              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: th.text }}>Nullberry</span>
                  <span style={{ fontSize: 11, color: th.text2 }}>now</span>
                </div>
                <div style={{ fontSize: 12.5, color: th.text2 }}>{unread} new relay message{unread > 1 ? "s" : ""} · MARK-1 connected</div>
              </div>
            </div>
          )}
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "0 44px", marginBottom: 34 }}>
            <div style={{ width: 50, height: 50, borderRadius: 25, display: "flex", alignItems: "center", justifyContent: "center", ...glass }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={th.statusText} strokeWidth="1.8"><path d="M9 2h6l1 7c0 1.5-1 2-1 2v9a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-9s-1-.5-1-2l1-7z"/><path d="M12 13v3"/></svg>
            </div>
            <div style={{ width: 50, height: 50, borderRadius: 25, display: "flex", alignItems: "center", justifyContent: "center", ...glass }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={th.statusText} strokeWidth="1.8"><rect x="2.5" y="6" width="19" height="13" rx="3"/><path d="M8.6 6l1.2-2.2h4.4L15.4 6"/><circle cx="12" cy="12.5" r="3.4"/></svg>
            </div>
          </div>
          <div style={{ fontSize: 12, color: th.statusText, opacity: 0.65, marginBottom: 14 }}>Tap to unlock</div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div style={{ marginTop: 92, fontSize: 15, fontWeight: 600, color: th.statusText }}>Enter Passcode</div>
          <div style={{ fontSize: 11.5, color: th.statusText, opacity: 0.6, marginTop: 4 }}>any 4 digits work in the demo</div>
          <div style={{ display: "flex", gap: 17, margin: "24px 0 30px" }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: 6, border: `1.2px solid ${th.statusText}`, background: i < pin.length ? th.statusText : "transparent", transition: "background 0.15s" }} />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 70px)", gap: 13 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"].map((k, i) => k === null ? <div key={i} /> : (
              <button key={i} onClick={(e) => { e.stopPropagation(); k === "⌫" ? setPin(pin.slice(0, -1)) : press(String(k)); }}
                style={{ width: 70, height: 70, borderRadius: 35, border: "none", cursor: "pointer", ...glass, color: th.statusText, fontSize: k === "⌫" ? 15 : 27, fontFamily: IOS_FONT }}>
                {k}
              </button>
            ))}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

function INavHeader({ th, title, onBack, sub, right, big }) {
  return (
    <div style={{ padding: "58px 14px 8px", background: th.blur, backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", borderBottom: `0.5px solid ${th.sep}`, position: "relative", zIndex: 5, display: "flex", alignItems: "center", gap: 4 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: th.blue, display: "flex", alignItems: "center", padding: 0 }}>
          <Icon d={P.back} size={22} color={th.blue} sw={2.2} />
        </button>
      )}
      <div style={{ flex: 1, textAlign: onBack ? "center" : "left", minWidth: 0 }}>
        <div style={{ fontFamily: IOS_FONT, fontWeight: 700, fontSize: onBack ? 15.5 : 28, letterSpacing: onBack ? 0 : -0.5, color: th.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        {sub && <div style={{ fontFamily: MONO, fontSize: 8.5, color: th.text3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>}
      </div>
      <div style={{ minWidth: onBack ? 26 : 0 }}>{right}</div>
    </div>
  );
}

function IMessages({ th, contacts, openConvo, send }) {
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);
  const active = contacts.find(c => c.id === activeId);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [activeId, active && active.msgs.length, active && active.typing]);
  return (
    <div style={{ position: "absolute", inset: 0, background: th.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: active ? "translateX(-28%)" : "none", transition: `transform 0.45s ${SPRING}`, display: "flex", flexDirection: "column" }}>
        <INavHeader th={th} title="Messages" />
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 44 }}>
          {contacts.map(c => (
            <button key={c.id} onClick={() => { openConvo(c.id); setActiveId(c.id); }} style={{ display: "flex", gap: 11, alignItems: "center", width: "100%", padding: "9px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 10, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                {c.unread > 0 && <div style={{ width: 9, height: 9, borderRadius: 5, background: th.blue }} />}
              </div>
              <Avatar name={c.name} hue={c.hue} size={42} />
              <div style={{ flex: 1, minWidth: 0, borderBottom: `0.5px solid ${th.sep}`, paddingBottom: 9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: IOS_FONT, fontWeight: 600, fontSize: 15, color: th.text }}>{c.name}</span>
                  <span style={{ fontFamily: IOS_FONT, fontSize: 12, color: th.text3 }}>{c.time}</span>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 8.5, color: th.text3, margin: "1px 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>{c.addr}</div>
                <div style={{ fontFamily: IOS_FONT, fontSize: 13, color: th.text2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 205 }}>
                  {c.typing ? "typing…" : c.msgs[c.msgs.length - 1].t}
                </div>
              </div>
            </button>
          ))}
          <div style={{ textAlign: "center", padding: "12px 0", fontFamily: IOS_FONT, fontSize: 10.5, color: th.text3 }}>
            Relayed through nullberrysecure.net · end-to-end encrypted
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: th.bg, transform: active ? "none" : "translateX(102%)", transition: `transform 0.45s ${SPRING}`, display: "flex", flexDirection: "column", boxShadow: "-12px 0 30px rgba(0,0,0,0.22)" }}>
        {active && (
          <React.Fragment>
            <INavHeader th={th} onBack={() => setActiveId(null)} title={active.name} sub={active.addr}
              right={<Icon d={P.video} size={19} color={th.blue} sw={1.9} />} />
            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 13px 6px", display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ textAlign: "center", fontFamily: IOS_FONT, fontSize: 10.5, color: th.text3, margin: "3px 0 9px" }}>
                Contact verified · relay identity pinned
              </div>
              {active.msgs.map((m, i) => {
                const out = m.d === "out";
                const isLastOut = out && i === active.msgs.length - 1;
                return (
                  <React.Fragment key={m.id}>
                    <div style={{ display: "flex", justifyContent: out ? "flex-end" : "flex-start", animation: i === active.msgs.length - 1 ? "nbBubbleIn 0.35s " + SPRING : "none" }}>
                      <div style={{ maxWidth: "74%", padding: "7px 12px", borderRadius: 18, borderBottomRightRadius: out ? 5 : 18, borderBottomLeftRadius: out ? 18 : 5, background: out ? th.blue : (th.name === "dark" ? "#26262a" : "#e9e9eb"), color: out ? "#fff" : th.text, fontFamily: IOS_FONT, fontSize: 14.5, lineHeight: 1.35 }}>{m.t}</div>
                    </div>
                    {isLastOut && <div style={{ textAlign: "right", fontFamily: IOS_FONT, fontSize: 9.5, color: th.text3, padding: "1px 6px 0" }}>Delivered · Nullberry Relay</div>}
                  </React.Fragment>
                );
              })}
              {active.typing && (
                <div style={{ display: "flex", animation: "nbBubbleIn 0.3s ease" }}>
                  <div style={{ padding: "11px 13px", borderRadius: 18, borderBottomLeftRadius: 5, background: th.name === "dark" ? "#26262a" : "#e9e9eb", display: "flex", gap: 4 }}>
                    {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: 4, background: th.text3, animation: `nbTyping 1.2s ${i * 0.18}s ease-in-out infinite` }} />)}
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: "8px 11px 42px", display: "flex", gap: 8, alignItems: "center", background: th.blur, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
              <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && draft.trim()) { send(active.id, draft.trim()); setDraft(""); } }}
                placeholder="Nullberry Relay"
                style={{ flex: 1, borderRadius: 18, border: `1px solid ${th.sep}`, background: th.name === "dark" ? "rgba(255,255,255,0.06)" : "#fff", color: th.text, fontFamily: IOS_FONT, fontSize: 14.5, padding: "8px 14px", outline: "none" }} />
              <button onClick={() => { if (draft.trim()) { send(active.id, draft.trim()); setDraft(""); } }} style={{ width: 32, height: 32, borderRadius: 16, border: "none", cursor: draft.trim() ? "pointer" : "default", background: draft.trim() ? th.blue : (th.name === "dark" ? "#26262a" : "#e9e9eb"), display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d={P.send} size={16} color={draft.trim() ? "#fff" : th.text3} sw={2.4} />
              </button>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

function IFaceTime({ th, contacts }) {
  const [call, setCall] = useState(null);
  const [sec, setSec] = useState(0);
  useEffect(() => {
    if (!call) return;
    setSec(0);
    const t = setInterval(() => setSec(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [call]);
  const recents = useMemo(() => contacts.slice(0, 6).map((c, i) => ({ ...c, kind: i % 3 === 0 ? "Outgoing" : "Incoming", when: pick(["2:14 PM", "11:02 AM", "Yesterday", "Yesterday", "Sunday"]) })), [contacts]);
  return (
    <div style={{ position: "absolute", inset: 0, background: th.bg, display: "flex", flexDirection: "column" }}>
      <INavHeader th={th} title="FaceTime" />
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 46px" }}>
        <div style={{ display: "flex", gap: 9, marginBottom: 16 }}>
          <button style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", cursor: "pointer", background: th.name === "dark" ? "#26262a" : "#e9e9eb", color: th.text, fontFamily: IOS_FONT, fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <Icon d={P.video} size={16} sw={2} /> New Link
          </button>
          <button style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", cursor: "pointer", background: th.green, color: "#fff", fontFamily: IOS_FONT, fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <Icon d={P.video} size={16} sw={2} color="#fff" /> New FaceTime
          </button>
        </div>
        <div style={{ fontFamily: IOS_FONT, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: th.text2, margin: "0 2px 6px" }}>Recents</div>
        {recents.map((c, i) => (
          <button key={c.id} onClick={() => setCall(c)} style={{ display: "flex", gap: 11, alignItems: "center", width: "100%", padding: "8px 2px", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBottom: `0.5px solid ${th.sep}` }}>
            <Avatar name={c.name} hue={c.hue} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: IOS_FONT, fontWeight: 600, fontSize: 14.5, color: c.kind === "Outgoing" ? th.text : th.text }}>{c.name}</div>
              <div style={{ fontFamily: IOS_FONT, fontSize: 11.5, color: th.text3, display: "flex", alignItems: "center", gap: 4 }}>
                <Icon d={c.kind === "Outgoing" ? P.send : P.phone} size={10} color={th.text3} sw={2} style={{ transform: c.kind === "Outgoing" ? "rotate(45deg)" : "none" }} />
                {c.kind} · Nullberry Relay Audio
              </div>
            </div>
            <span style={{ fontFamily: IOS_FONT, fontSize: 12, color: th.text3 }}>{c.when}</span>
            <Icon d={P.info} size={17} color={th.blue} sw={1.8} />
          </button>
        ))}
        <div style={{ textAlign: "center", padding: "14px 0", fontFamily: IOS_FONT, fontSize: 10.5, color: th.text3 }}>
          Video unavailable over LoRa · audio relays through your MARK-1
        </div>
      </div>
      {call && (
        <div style={{ position: "absolute", inset: 0, zIndex: 30, background: `radial-gradient(120% 90% at 50% 0%, hsl(${call.hue} 40% 22%), #060608)`, display: "flex", flexDirection: "column", alignItems: "center", animation: "nbFadeIn 0.35s ease" }}>
          <div style={{ marginTop: 110 }}><Avatar name={call.name} hue={call.hue} size={92} /></div>
          <div style={{ fontFamily: IOS_FONT, fontSize: 24, fontWeight: 700, color: "#fff", marginTop: 16 }}>{call.name}</div>
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: "rgba(255,255,255,0.5)", marginTop: 5 }}>{call.addr}</div>
          <div style={{ fontFamily: IOS_FONT, fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: 4, background: BRAND, animation: "nbPulse 1.2s infinite" }} />
            {sec < 3 ? "Connecting via mesh relay…" : `Mesh audio · ${String(Math.floor(sec / 60)).padStart(1, "0")}:${String(sec % 60).padStart(2, "0")}`}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 22, marginBottom: 64 }}>
            {[["mic", "rgba(255,255,255,0.18)"], ["spk", "rgba(255,255,255,0.18)"]].map(([k, bg]) => (
              <div key={k} style={{ width: 56, height: 56, borderRadius: 28, background: bg, backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d={k === "mic" ? ["M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z", "M19 10v2a7 7 0 0 1-14 0v-2", "M12 19v4"] : ["M11 5L6 9H2v6h4l5 4V5z", "M15.5 8.5a5 5 0 0 1 0 7"]} size={22} color="#fff" sw={1.8} />
              </div>
            ))}
            <button onClick={() => setCall(null)} style={{ width: 56, height: 56, borderRadius: 28, border: "none", cursor: "pointer", background: "#ff3b30", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(135deg)" }}>
              <Icon d={P.phone} size={24} color="#fff" sw={0} fill="#fff" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function INullberryApp({ th, nodes, feed }) {
  const [myAddr, setMyAddr] = useState(relayAddr);
  const online = nodes.filter(n => n.online).length;
  const Card = ({ children, style }) => (
    <div style={{ background: th.card, backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", borderRadius: 16, border: `0.5px solid ${th.glassBorder}`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)", padding: "13px 14px", marginBottom: 12, ...style }}>{children}</div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, background: th.name === "dark" ? "radial-gradient(110% 60% at 80% 0%, rgba(255,180,84,0.09), transparent 60%), #05080b" : "radial-gradient(110% 60% at 80% 0%, rgba(255,180,84,0.16), transparent 60%), #eef4f6", display: "flex", flexDirection: "column" }}>
      <INavHeader th={th} title="Nullberry" right={<span style={{ fontFamily: MONO, fontSize: 9, color: "#30d158" }}>● PAIRED</span>} />
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 46px" }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 66, borderRadius: 7, border: `1.4px solid ${th.text3}`, background: th.name === "dark" ? "#0a0f13" : "#dfe8ec", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="assets/favicon-dark.svg" alt="" style={{ width: 20, filter: th.name === "light" ? "invert(0.2)" : "none" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: IOS_FONT, fontWeight: 700, fontSize: 15.5, color: th.text }}>Damian's MARK-1</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: th.text3, marginTop: 2 }}>Nullberry OS 0.4.1 · L1–L7 up</div>
              <div style={{ display: "flex", gap: 12, marginTop: 7 }}>
                {[["BAT", "87%"], ["SIG", "−64 dBm"], ["HOPS", "direct"]].map(([k, v]) => (
                  <div key={k}><span style={{ fontFamily: MONO, fontSize: 8, color: th.text3 }}>{k} </span><span style={{ fontFamily: MONO, fontSize: 10, color: BRAND, fontWeight: 600 }}>{v}</span></div>
                ))}
              </div>
            </div>
            <Icon d={P.locate} size={19} color={th.blue} sw={1.7} />
          </div>
        </Card>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <span style={{ fontFamily: IOS_FONT, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: th.text2 }}>My relay identity</span>
            <button onClick={() => setMyAddr(relayAddr())} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: th.blue, fontFamily: IOS_FONT, fontSize: 12, fontWeight: 600, padding: 0 }}>
              <Icon d={P.rotate} size={12} color={th.blue} sw={2.2} /> Rotate
            </button>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10.5, color: th.text, wordBreak: "break-all", background: th.name === "dark" ? "rgba(255,180,84,0.06)" : "rgba(138,85,20,0.07)", border: `1px solid ${th.name === "dark" ? "rgba(255,180,84,0.18)" : "rgba(138,85,20,0.2)"}`, borderRadius: 8, padding: "8px 10px", animation: "nbFadeIn 0.4s ease" }} key={myAddr}>
            {myAddr}
          </div>
          <div style={{ fontFamily: IOS_FONT, fontSize: 10.5, color: th.text3, marginTop: 7, lineHeight: 1.5 }}>
            Contacts only ever see this rotating relay address. Your real identity never leaves the device.
          </div>
        </Card>
        <Card>
          <div style={{ fontFamily: IOS_FONT, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: th.text2, marginBottom: 8 }}>Tree · {online}/{nodes.length} online</div>
          {nodes.slice(0, 5).map((n, i) => (
            <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "6.5px 0", borderBottom: i < 4 ? `0.5px solid ${th.sep}` : "none", opacity: n.online ? 1 : 0.45 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: NODE_TYPES[n.type].c, boxShadow: n.online ? `0 0 7px ${NODE_TYPES[n.type].c}` : "none" }} />
              <span style={{ fontFamily: IOS_FONT, fontSize: 13, fontWeight: 600, color: th.text, flex: 1 }}>{n.id}</span>
              <span style={{ fontFamily: MONO, fontSize: 9, color: th.text3 }}>{n.online ? `${n.rssi} dBm · ${Math.round(n.batt)}%` : "offline"}</span>
            </div>
          ))}
        </Card>
        <Card style={{ marginBottom: 0 }}>
          <div style={{ fontFamily: IOS_FONT, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: th.text2, marginBottom: 7 }}>Relay activity</div>
          {feed.slice(0, 4).map((f, i) => (
            <div key={f.id} style={{ fontFamily: MONO, fontSize: 9, lineHeight: 1.9, color: i === 0 ? BRAND : th.text3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              <span style={{ opacity: 0.55 }}>{f.time}</span>  {f.text}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function ISettings({ th, themeName, setThemeName }) {
  const Row = ({ label, right, last }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10.5px 15px", borderBottom: last ? "none" : `0.5px solid ${th.sep}` }}>
      <span style={{ fontFamily: IOS_FONT, fontSize: 14.5, color: th.text }}>{label}</span>{right}
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, background: th.grouped, display: "flex", flexDirection: "column" }}>
      <INavHeader th={th} title="Settings" />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 46 }}>
        <div style={{ fontFamily: IOS_FONT, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, color: th.text2, margin: "16px 18px 6px" }}>Appearance</div>
        <div style={{ background: th.cardSolid, borderRadius: 12, margin: "0 14px", padding: 8, display: "flex", gap: 6 }}>
          {["dark", "light"].map(m => (
            <button key={m} onClick={() => setThemeName(m)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: IOS_FONT, fontSize: 13.5, fontWeight: 600, textTransform: "capitalize", color: themeName === m ? (th.name === "dark" ? "#000" : "#fff") : th.text2, background: themeName === m ? th.text : "transparent", transition: `all 0.3s ${SPRING}` }}>{m}</button>
          ))}
        </div>
        <div style={{ fontFamily: IOS_FONT, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, color: th.text2, margin: "16px 18px 6px" }}>Nullberry</div>
        <div style={{ background: th.cardSolid, borderRadius: 12, margin: "0 14px", overflow: "hidden" }}>
          <Row label="Paired device" right={<span style={{ fontFamily: IOS_FONT, fontSize: 13.5, color: th.text2 }}>Damian's MARK-1</span>} />
          <Row label="Relay domain" right={<span style={{ fontFamily: MONO, fontSize: 10.5, color: th.text2 }}>nullberrysecure.net</span>} />
          <Row label="App version" last right={<span style={{ fontFamily: IOS_FONT, fontSize: 13.5, color: th.text2 }}>1.2.0</span>} />
        </div>
        <div style={{ textAlign: "center", fontFamily: IOS_FONT, fontSize: 10, color: th.text3, padding: "16px 0 6px" }}>
          Demo · runs entirely in your browser
        </div>
      </div>
    </div>
  );
}

function IPhoneDemo() {
  const [themeName, setThemeName] = useState("dark");
  const th = themeName === "dark" ? I_DARK : I_LIGHT;
  const [locked, setLocked] = useState(true);
  const [app, setApp] = useState(null);
  const [appVisible, setAppVisible] = useState(false);
  const [nodes, feed] = useMesh();
  const [activity, setActivity] = useState(null);
  const islandTimer = useRef(null);
  const notifyIsland = useCallback((act) => {
    setActivity(act);
    clearTimeout(islandTimer.current);
    islandTimer.current = setTimeout(() => setActivity(null), 3400);
  }, []);
  const [contacts, setContacts, openConvo, send] = useConvos((cid, reply) => {
    const c = contacts.find(x => x.id === cid);
    notifyIsland({ kind: "Nullberry Relay", text: reply, initial: c ? c.name[0] : "N", hue: c ? c.hue : 198 });
  });
  const [batt, setBatt] = useState(irnd(55, 92));
  const unread = contacts.reduce((s, c) => s + c.unread, 0);

  useEffect(() => {
    const t = setInterval(() => setBatt(b => Math.max(12, b - 1)), 55000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => {
      if (!locked && Math.random() < 0.35) {
        const n = pick(nodes.filter(x => x.online));
        if (n) notifyIsland({ kind: "MARK-1 · Tree", text: `${n.id} · ${n.rssi} dBm`, initial: null });
      }
    }, 10000);
    return () => clearInterval(t);
  }, [locked, nodes, notifyIsland]);

  const openApp = (id) => { setApp(id); requestAnimationFrame(() => requestAnimationFrame(() => setAppVisible(true))); };
  const goHome = () => { setAppVisible(false); setTimeout(() => setApp(null), 380); };

  return (
    <div style={{
      width: "min(384px, calc(100vw - 40px))", aspectRatio: "384 / 812",
      borderRadius: 58, padding: 5, position: "relative",
      background: "linear-gradient(160deg, #3a3d42 0%, #17181b 30%, #26282c 60%, #101114 100%)",
      boxShadow: "inset 0 1px 1px rgba(255,255,255,0.25), 0 30px 80px rgba(0,0,0,0.6)",
    }}>
      <div style={{ position: "absolute", left: -2, top: "22%", width: 3, height: 24, borderRadius: 2, background: "#26282c" }} />
      <div style={{ position: "absolute", left: -2, top: "30%", width: 3, height: 42, borderRadius: 2, background: "#26282c" }} />
      <div style={{ position: "absolute", left: -2, top: "38%", width: 3, height: 42, borderRadius: 2, background: "#26282c" }} />
      <div style={{ position: "absolute", right: -2, top: "27%", width: 3, height: 62, borderRadius: 2, background: "#26282c" }} />

      <div className="nb-screen" style={{ position: "absolute", inset: 5, borderRadius: 53, overflow: "hidden", background: "#000" }}>
        <div style={{ position: "absolute", inset: 0, background: I_WALL[themeName], transition: "opacity 0.6s ease" }} />

        <Island activity={activity} />
        <IStatusBar th={th} batt={batt} />

        {!locked && (
          <div style={{ position: "absolute", inset: 0, transform: app && appVisible ? "scale(0.92)" : "none", opacity: app && appVisible ? 0 : 1, transition: `all 0.42s ${SPRING}`, pointerEvents: app ? "none" : "auto" }}>
            <IHome th={th} onOpen={openApp} unread={unread} />
          </div>
        )}

        {app && (
          <div style={{ position: "absolute", inset: 0, zIndex: 20, transform: appVisible ? "none" : "scale(0.4) translateY(24%)", opacity: appVisible ? 1 : 0, transition: `all 0.45s ${SPRING}`, borderRadius: 42, overflow: "hidden" }}>
            {app === "messages" && <IMessages th={th} contacts={contacts} openConvo={openConvo} send={send} />}
            {app === "facetime" && <IFaceTime th={th} contacts={contacts} />}
            {app === "nullberry" && <INullberryApp th={th} nodes={nodes} feed={feed} />}
            {app === "settings" && <ISettings th={th} themeName={themeName} setThemeName={setThemeName} />}
          </div>
        )}

        {locked && <ILock th={th} unread={unread} onUnlocked={() => setLocked(false)} />}

        <button onClick={locked ? undefined : goHome} aria-label="Home" style={{ position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)", width: 140, height: 20, background: "none", border: "none", cursor: locked ? "default" : "pointer", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0 }}>
          <div style={{ width: 126, height: 5, borderRadius: 3, background: themeName === "dark" ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)", marginBottom: 3 }} />
        </button>
      </div>
    </div>
  );
}

/* ---------- mount ---------- */
const sharedKeyframes = `
  @keyframes nbPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
  @keyframes nbFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
  @keyframes nbBubbleIn { from { opacity: 0; transform: translateY(10px) scale(0.92); } to { opacity: 1; transform: none; } }
  @keyframes nbTyping { 0%,60%,100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }
  @keyframes nbNudge { 0%,100% { transform: scale(1); } 40% { transform: scale(0.9); } 70% { transform: scale(1.04); } }
  .nb-screen::-webkit-scrollbar, .nb-screen *::-webkit-scrollbar { width: 0; height: 0; }
`;
const styleTag = document.createElement("style");
styleTag.textContent = sharedKeyframes;
document.head.appendChild(styleTag);

ReactDOM.createRoot(document.getElementById("os-demo-root")).render(<Mark1Demo />);
ReactDOM.createRoot(document.getElementById("ios-demo-root")).render(<IPhoneDemo />);
