// ── PassDrop Cards — PassCard, CardStack, CardDetail, helpers ──

const PASS_DATA = [
  { id:"gc-1", category:"Gift Cards", name:"Starbucks",   sub:"Gift Card",           balance:"$47.50",             code:"7823 0041 9912 3847",  color:"#3d5248", codeType:"barcode" },
  { id:"gc-2", category:"Gift Cards", name:"Amazon",      sub:"Gift Card",           balance:"$120.00",            code:"X7YQ-PVMJ-2938-KLTB",  color:"#4a3629", codeType:"qr" },
  { id:"gc-3", category:"Gift Cards", name:"Nike",        sub:"Gift Card",           balance:"$75.00",             code:"NK-20384-19283-00112",  color:"#2e3542", codeType:"barcode" },
  { id:"tr-1", category:"Transport",  name:"City Metro",  sub:"Monthly Pass",        balance:"Valid until May 31", code:"MT-9920-3847-2211",     color:"#2b3e52", codeType:"qr" },
  { id:"tr-2", category:"Transport",  name:"FlixBus",     sub:"Return Ticket",       balance:"Apr 30 → May 02",   code:"FX2938400112",          color:"#2e4a3a", codeType:"barcode" },
  { id:"cp-1", category:"Coupons",    name:"H&M",         sub:"20% off purchase",    balance:"Expires May 15",    code:"HM-OFF20-2938475",      color:"#4a2e35", codeType:"barcode" },
  { id:"cp-2", category:"Coupons",    name:"Subway",      sub:"Buy One Get One",     balance:"Expires Apr 30",    code:"SWY-BOGO-00234",        color:"#3a3520", codeType:"qr" },
  { id:"ly-1", category:"Loyalty",    name:"Coffee Club", sub:"Loyalty Card",        balance:"840 pts — Gold",    code:"CC-00293847",           color:"#3e2e1e", codeType:"barcode" },
  { id:"ly-2", category:"Loyalty",    name:"Sephora",     sub:"Beauty Insider",      balance:"2,310 pts — Rouge", code:"SEP-0192837465",        color:"#3a2638", codeType:"qr" },
];

// ── Deterministic rand ───────────────────────────────────────────────────────
function seededRand(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  return function () { h ^= h << 13; h ^= h >> 17; h ^= h << 5; return (h >>> 0) / 0xffffffff; };
}

// ── Barcode SVG ──────────────────────────────────────────────────────────────
function BarcodeSVG({ code, color = "#fff", width = 280, height = 64 }) {
  const rand = seededRand(code);
  const bars = [];
  let x = 0;
  while (x < width) {
    const w = Math.floor(rand() * 4) + 1;
    if (rand() > 0.45) bars.push({ x, w });
    x += w;
  }
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display:"block" }}>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={height} fill={color} />
      ))}
    </svg>
  );
}

// ── QR Code SVG ──────────────────────────────────────────────────────────────
function QRCodeSVG({ code, color = "#fff", size = 100 }) {
  const rand = seededRand(code);
  const cells = 21;
  const cs = size / cells;
  const modules = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const inTL = r < 7 && c < 7;
      const inTR = r < 7 && c >= cells - 7;
      const inBL = r >= cells - 7 && c < 7;
      const inFinder = inTL || inTR || inBL;
      let filled;
      if (inFinder) {
        const lr = inTL ? r : inTR ? r : r - (cells - 7);
        const lc = inTL ? c : inTR ? c - (cells - 7) : c;
        const onBorder = lr === 0 || lr === 6 || lc === 0 || lc === 6;
        const inCenter = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
        filled = onBorder || inCenter;
      } else {
        filled = rand() > 0.5;
      }
      if (filled) modules.push([r, c]);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:"block" }}>
      {modules.map(([r, c], i) => (
        <rect key={i} x={c * cs} y={r * cs} width={cs} height={cs} fill={color} />
      ))}
    </svg>
  );
}

// ── Grain overlay ─────────────────────────────────────────────────────────────
function GrainOverlay({ id }) {
  return (
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.15, pointerEvents:"none" }} aria-hidden>
      <filter id={`g${id}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="100%" height="100%" filter={`url(#g${id})`}/>
    </svg>
  );
}

// ── PassCard ─────────────────────────────────────────────────────────────────
function PassCard({ pass, colorOverride, onTap, peek = false }) {
  const bg = colorOverride || pass.color;
  const [pressed, setPressed] = React.useState(false);

  return (
    <div
      onClick={() => onTap && onTap(pass)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        background: bg,
        borderRadius: 20,
        padding: "20px 22px 18px",
        cursor: "pointer",
        transform: pressed ? "scale(0.978)" : "scale(1)",
        transition: "transform 0.14s ease",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 36px rgba(0,0,0,0.55)",
        aspectRatio: "1.586",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        userSelect: "none",
        width: "100%",
      }}
    >
      <GrainOverlay id={pass.id} />

      {/* Name + expiry — both visible even when peeking */}
      <div style={{ position:"relative" }}>
        <div style={{ color:"#fff", fontSize:22, fontWeight:700, letterSpacing:"-0.025em", lineHeight:1.05, marginBottom:5 }}>
          {pass.name}
        </div>
        <div style={{ color:"rgba(255,255,255,0.65)", fontSize:12, fontWeight:500, letterSpacing:"0.01em" }}>
          {pass.balance}
        </div>
      </div>

      {/* Spacer */}
      <div />

      {/* Barcode strip */}
      <div style={{ position:"relative", height:34, display:"flex", alignItems:"center", gap:10 }}>
        {pass.codeType === "barcode"
          ? <BarcodeSVG code={pass.code} color="rgba(255,255,255,0.38)" width={200} height={34} />
          : <>
              <QRCodeSVG code={pass.code} color="rgba(255,255,255,0.38)" size={34} />
              <span style={{ color:"rgba(255,255,255,0.25)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase" }}>Tap to scan</span>
            </>
        }
      </div>
    </div>
  );
}

// ── CardStack ────────────────────────────────────────────────────────────────
const PEEK = 62;

function CardStack({ cards: initialCards, colorMap, onTap }) {
  const containerRef = React.useRef(null);
  const [cardHeight, setCardHeight] = React.useState(0);
  const [order, setOrder] = React.useState(() => initialCards.map(c => c.id));
  const [dragState, setDragState] = React.useState(null);
  // dragState: { dragId, fromIdx, targetIdx, cardY }

  // Sync order when tab switches (initialCards changes)
  React.useEffect(() => {
    setOrder(initialCards.map(c => c.id));
    setDragState(null);
  }, [initialCards.map(c => c.id).join(",")]);

  // Measure card height from width
  React.useEffect(() => {
    const measure = () => {
      if (containerRef.current)
        setCardHeight(Math.round(containerRef.current.offsetWidth / 1.586));
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    else window.addEventListener("resize", measure);
    return () => { if (ro) ro.disconnect(); else window.removeEventListener("resize", measure); };
  }, []);

  const orderedCards = order.map(id => initialCards.find(c => c.id === id)).filter(Boolean);
  const n = orderedCards.length;
  const totalHeight = cardHeight > 0 ? cardHeight + (n - 1) * PEEK : 300;

  const onPointerDown = (e, passId, stackIdx) => {
    e.preventDefault();
    const containerRect = containerRef.current.getBoundingClientRect();
    const grabOffsetY = e.clientY - containerRect.top - stackIdx * PEEK;
    const startY = e.clientY;
    let isDrag = false;
    let lastTargetIdx = stackIdx;

    const onMove = (ev) => {
      ev.preventDefault();
      if (!isDrag && Math.abs(ev.clientY - startY) > 7) isDrag = true;
      if (!isDrag) return;
      const relCardTop = ev.clientY - containerRect.top - grabOffsetY;
      const cardCenter = relCardTop + cardHeight / 2;
      lastTargetIdx = Math.max(0, Math.min(n - 1, Math.round(cardCenter / PEEK)));
      setDragState({ dragId: passId, fromIdx: stackIdx, targetIdx: lastTargetIdx, cardY: relCardTop });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (!isDrag) {
        const pass = initialCards.find(c => c.id === passId);
        if (pass) onTap(pass);
      } else if (lastTargetIdx !== stackIdx) {
        setOrder(prev => {
          const arr = [...prev];
          const fi = arr.indexOf(passId);
          arr.splice(fi, 1);
          arr.splice(lastTargetIdx, 0, passId);
          return arr;
        });
      }
      setDragState(null);
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
  };

  // Compute animated positions
  const positions = orderedCards.map((c, i) => {
    if (!dragState) return { top: i * PEEK, zIndex: i + 1, scale: 1, dragging: false };
    const { dragId, fromIdx, targetIdx, cardY } = dragState;
    if (c.id === dragId) return { top: cardY, zIndex: n + 1, scale: 1.04, dragging: true, shadow: true };
    let adj = i;
    if (fromIdx < targetIdx && i > fromIdx && i <= targetIdx) adj = i - 1;
    else if (fromIdx > targetIdx && i >= targetIdx && i < fromIdx) adj = i + 1;
    return { top: adj * PEEK, zIndex: adj + 1, scale: 1, dragging: false };
  });

  if (n === 0) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:180, gap:12, opacity:0.3 }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
        <rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/>
      </svg>
      <div style={{ color:"#fff", fontSize:13 }}>No passes here yet</div>
    </div>
  );

  return (
    <div ref={containerRef} style={{ position:"relative", height: totalHeight, width:"100%", touchAction:"none" }}>
      {orderedCards.map((pass, i) => {
        const pos = positions[i];
        return (
          <div
            key={pass.id}
            onPointerDown={e => onPointerDown(e, pass.id, i)}
            style={{
              position:"absolute", left:0, right:0,
              top: pos.top,
              zIndex: pos.zIndex,
              transform: `scale(${pos.scale})`,
              transformOrigin: "center top",
              boxShadow: pos.shadow ? "0 20px 50px rgba(0,0,0,0.7)" : "none",
              transition: pos.dragging
                ? "transform 0.12s ease, box-shadow 0.12s ease"
                : "top 0.28s cubic-bezier(0.22,1,0.36,1), transform 0.15s ease",
              cursor: pos.dragging ? "grabbing" : "grab",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            <PassCard pass={pass} colorOverride={colorMap[pass.id]} onTap={null} />
          </div>
        );
      })}
    </div>
  );
}

// ── CardDetail modal ─────────────────────────────────────────────────────────
function CardDetail({ pass: initialPass, colorOverride, onClose, onUpdate }) {
  const [pass, setPass] = React.useState(initialPass);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState({ name: initialPass.name, sub: initialPass.sub, balance: initialPass.balance });
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const bg = colorOverride || pass.color;

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const saveEdit = () => {
    const updated = { ...pass, ...draft };
    setPass(updated);
    onUpdate && onUpdate(pass.id, draft);
    setEditing(false);
  };

  const Field = ({ label, value, field }) => editing
    ? <div style={{ marginBottom:14 }}>
        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:600, marginBottom:5 }}>{label}</div>
        <input
          value={draft[field]}
          onChange={e => setDraft(d => ({ ...d, [field]: e.target.value }))}
          style={{
            width:"100%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)",
            borderRadius:10, padding:"10px 12px", color:"#fff", fontSize:15, fontFamily:"inherit",
            outline:"none", fontWeight:500,
          }}
        />
      </div>
    : <div style={{ marginBottom:14 }}>
        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:600, marginBottom:4 }}>{label}</div>
        <div style={{ color:"#fff", fontSize:15, fontWeight:500 }}>{value}</div>
      </div>;

  return (
    <div
      onClick={handleClose}
      style={{
        position:"absolute", inset:0, zIndex:50,
        background:"rgba(0,0,0,0.65)",
        display:"flex", flexDirection:"column", justifyContent:"flex-end",
        opacity: visible ? 1 : 0,
        transition:"opacity 0.28s ease",
        backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:"oklch(13% 0.01 250)",
          borderRadius:"28px 28px 0 0",
          padding:"20px 22px 36px",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition:"transform 0.34s cubic-bezier(0.22,1,0.36,1)",
          maxHeight:"88%",
          overflowY:"auto",
          display:"flex",
          flexDirection:"column",
          gap:0,
        }}
      >
        {/* Handle */}
        <div style={{ width:36, height:4, background:"rgba(255,255,255,0.12)", borderRadius:2, margin:"0 auto 20px" }} />

        {/* Header row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ color:"#fff", fontSize:17, fontWeight:700, letterSpacing:"-0.02em" }}>{pass.name}</div>
          <button
            onClick={() => editing ? saveEdit() : setEditing(true)}
            style={{
              background: editing ? "#fff" : "rgba(255,255,255,0.08)",
              border:"none", borderRadius:10, padding:"7px 14px",
              color: editing ? "#000" : "rgba(255,255,255,0.6)",
              fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
              letterSpacing:"0.01em",
            }}
          >
            {editing ? "Save" : "Edit"}
          </button>
        </div>

        {/* Barcode / QR — prominent */}
        <div style={{
          background:"#fff", borderRadius:18, padding: pass.codeType === "qr" ? "28px 28px 20px" : "28px 20px 20px",
          display:"flex", flexDirection:"column", alignItems:"center", gap:14,
          marginBottom:22,
        }}>
          <div style={{ color:"#111", fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:700, opacity:0.4 }}>
            {pass.codeType === "barcode" ? "Barcode" : "QR Code"}
          </div>
          {pass.codeType === "barcode"
            ? <BarcodeSVG code={pass.code} color="#111" width={260} height={110} />
            : <QRCodeSVG  code={pass.code} color="#111" size={200} />
          }
          <div style={{ color:"#111", fontSize:12, letterSpacing:"0.18em", opacity:0.35, fontWeight:500, fontVariantNumeric:"tabular-nums" }}>
            {pass.code}
          </div>
        </div>

        {/* Editable details */}
        <div style={{ marginBottom:20 }}>
          <Field label="Card name"    value={pass.name}    field="name" />
          <Field label="Type / notes" value={pass.sub}     field="sub" />
          <Field label="Balance"      value={pass.balance} field="balance" />
        </div>

        {/* Actions */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button onClick={handleClose} style={{
            background:"rgba(255,255,255,0.08)", border:"none", borderRadius:14,
            color:"#fff", padding:"14px", fontSize:15, fontWeight:600,
            cursor:"pointer", fontFamily:"inherit",
          }}>Done</button>
          <button style={{
            background:"transparent", border:"1px solid rgba(255,80,80,0.25)", borderRadius:14,
            color:"rgba(255,100,100,0.7)", padding:"13px", fontSize:14, fontWeight:500,
            cursor:"pointer", fontFamily:"inherit",
          }}>Remove Pass</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PASS_DATA, PassCard, CardStack, CardDetail });
