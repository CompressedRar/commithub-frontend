import { useEffect, useRef, useState } from "react";

const T = {
  primaryDarker:   "#0019b3",
  primaryDark:     "#162dbf",
  primary:         "rgb(35, 68, 255)",
  primaryLight:    "rgb(89, 114, 255)",
  primaryLighter:  "#dae0ff",
  secondaryDarker: "#cc9900",
  secondaryDark:   "#ffcc33",
  secondary:       "rgb(255, 212, 95)",
  secondaryLight:  "#ffe18f",
  secondaryLighter:"#fff5d6",
  textPrimary:     "rgb(82, 82, 82)",
  textSecondary:   "rgb(114, 114, 114)",
  bg:              "#ffffff",
  bgSoft:          "#f5f6ff",
  bgMid:           "#eef0ff",
  border:          "rgba(35,68,255,0.12)",
  borderMid:       "rgba(35,68,255,0.22)",
};

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Digitized IPCR & OPCR",
    desc: "Submit and track performance commitments online. No more manual tallying, inconsistent templates, or misplaced paper forms.",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Excel Export",
    desc: "Download official IPCR and OPCR forms as formatted Excel spreadsheets — ready for printing, signing, and CSC submission.",
    highlight: true,
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 21v-8H7v8M7 3v5h8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Supporting Documents",
    desc: "Attach certificates and evidence to each task. Compile all uploads into a single downloadable report per IPCR.",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Review Workflow",
    desc: "Structured approval chain — faculty submission to head review to president approval — with a full audit trail.",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Performance Analytics",
    desc: "Real-time dashboards for administrators and heads. Track ratings, identify trends, and monitor submissions by department.",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Formula Engine",
    desc: "Configurable rating formulas for Quantity, Efficiency, and Timeliness with department-level overrides.",
  },
];

const ROLES = [
  { n: "01", name: "Faculty",         desc: "Submit IPCR forms, attach supporting documents, and track ratings across evaluation periods." },
  { n: "02", name: "Department Head", desc: "Review faculty IPCRs, monitor office performance, and generate OPCR reports." },
  { n: "03", name: "President",       desc: "Final approval authority for all submissions. Access institution-wide consolidated ratings." },
  { n: "04", name: "Administrator",   desc: "Manage users, configure tasks, set evaluation periods, and monitor system activity logs." },
];

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(24px)",
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function CommitHubLanding() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=DM+Mono:wght@400&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #ffffff; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

    @keyframes fadeUp {
      from { opacity:0; transform:translateY(24px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes floatCard {
      0%,100% { transform:translateY(-50%); }
      50%      { transform:translateY(calc(-50% - 10px)); }
    }
    .ch-hero-anim-1 { animation: fadeUp .7s ease .1s both; }
    .ch-hero-anim-2 { animation: fadeUp .7s ease .22s both; }
    .ch-hero-anim-3 { animation: fadeUp .7s ease .36s both; }
    .ch-hero-anim-4 { animation: fadeUp .7s ease .5s both; }
    .ch-hero-anim-5 { animation: fadeUp 1s ease .65s both; }
    .ch-card-float  { animation: floatCard 6s ease-in-out 2s infinite; }

    .ch-feature:hover { background: #eef0ff !important; }
    .ch-feature:hover .ch-feature-bar { transform: scaleX(1) !important; }
    .ch-role:hover {
      border-color: rgb(35,68,255) !important;
      transform: translateY(-4px) !important;
      box-shadow: 0 12px 36px rgba(35,68,255,.12) !important;
    }
    .ch-stat:hover { background: #eef0ff !important; }
    .ch-btn-primary:hover {
      background: #162dbf !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 10px 32px rgba(35,68,255,.35) !important;
    }
    .ch-btn-login:hover { background: #162dbf !important; }
    .ch-nav-link:hover { color: rgb(35,68,255) !important; }
  `;

  return (
    <>
      <style>{css}</style>

      {/* Subtle dot grid */}
      <div style={{
        position:"fixed", inset:0,
        backgroundImage:`radial-gradient(circle, rgba(35,68,255,0.07) 1px, transparent 1px)`,
        backgroundSize:"36px 36px",
        WebkitMaskImage:"radial-gradient(ellipse 100% 60% at 50% 0%, black 30%, transparent 100%)",
        maskImage:"radial-gradient(ellipse 100% 60% at 50% 0%, black 30%, transparent 100%)",
        pointerEvents:"none", zIndex:999,
      }} />

      <div style={{ fontFamily:"'Inter','Roboto','Helvetica','Arial',sans-serif", background:"#ffffff", color:T.textPrimary, overflowX:"hidden", lineHeight:1.5, fontWeight:400 }}>

        {/* ── Header ─────────────────────────────────────── */}
        <header style={{
          position:"fixed", top:0, left:0, right:0, zIndex:100,
          padding:"16px 60px", display:"flex", alignItems:"center", justifyContent:"space-between",
          borderBottom: scrolled ? `1px solid ${T.border}` : "1px solid transparent",
          background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          transition:"all 0.3s ease",
        }}>
          <a href="#" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
            <div style={{ width:34, height:34, border:`1.5px solid ${T.primary}`, borderRadius:6, display:"grid", placeItems:"center" }}>
              <img src="CommitHub.png" alt="CommitHub Logo" style={{ width:"100%", height:"100%", objectFit:"contain" }} />
            </div>
            <span style={{ fontSize:18, fontWeight:600, color:T.primary }}>
              Commit<span style={{ color:T.textPrimary }}>Hub</span>
            </span>
          </a>
          <nav style={{ display:"flex", alignItems:"center", gap:32 }}>
            {["Features","Roles","About"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="ch-nav-link" style={{ fontSize:13, fontWeight:400, color:T.textSecondary, textDecoration:"none", letterSpacing:"0.03em", transition:"color 0.2s" }}>{l}</a>
            ))}
          </nav>
          <a href="https://www.commithub.online" className="ch-btn-login" style={{ padding:"8px 22px", background:T.primary, color:"#ffffff", borderRadius:6, fontSize:13, fontWeight:500, textDecoration:"none", transition:"background 0.2s" }}>
            Sign In →
          </a>
        </header>

        {/* ── Hero ───────────────────────────────────────── */}
        <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", padding:"120px 60px 80px", position:"relative", overflow:"hidden", background:"#ffffff" }}>
          <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 55% 70% at 72% 50%, ${T.primaryLighter} 0%, transparent 65%), radial-gradient(ellipse 35% 40% at 15% 78%, ${T.secondaryLighter} 0%, transparent 60%)` }} />

          <div style={{ position:"relative", zIndex:2, maxWidth:620 }}>
            <div className="ch-hero-anim-1" style={{ display:"inline-flex", alignItems:"center", gap:10, fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", color:T.primary, marginBottom:24, fontWeight:500 }}>
              <span style={{ display:"block", width:28, height:2, background:T.primary, borderRadius:2 }} />
              Norzagaray College · IPCR / OPCR Platform
            </div>

            <h1 className="ch-hero-anim-2" style={{ fontSize:"clamp(40px,5.5vw,68px)", fontWeight:700, lineHeight:1.1, letterSpacing:"-0.025em", color:"rgb(20,20,20)", marginBottom:24 }}>
              Performance<br />
              review,{" "}
              <span style={{ color:T.primary }}>built for</span>
              <br />faculty.
            </h1>

            <p className="ch-hero-anim-3" style={{ fontSize:16, fontWeight:400, lineHeight:1.7, color:T.textSecondary, maxWidth:500, marginBottom:44 }}>
              CommitHub centralizes the submission, review, and approval of IPCR and OPCR forms — from planning to rating, with one-click Excel export ready for official submission.
            </p>

            <div className="ch-hero-anim-4" style={{ display:"flex", alignItems:"center", gap:16 }}>
              <a href="https://www.commithub.online" className="ch-btn-primary" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 32px", background:T.primary, color:"#ffffff", borderRadius:6, fontSize:14, fontWeight:500, textDecoration:"none", boxShadow:`0 6px 24px rgba(35,68,255,.25)`, transition:"all 0.2s" }}>
                Access CommitHub
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
              <span style={{ fontSize:12, color:"rgba(114,114,114,.6)", letterSpacing:"0.04em" }}>commithub.online</span>
            </div>
          </div>

          {/* Floating IPCR card */}
          <div className="ch-hero-anim-5 ch-card-float" style={{ position:"absolute", right:60, top:"50%", width:400 }}>
            <div style={{ position:"relative", width:400, height:320 }}>
              <div style={{ position:"absolute", top:36, left:36, width:348, height:230, background:T.primaryLighter, border:`1px solid ${T.borderMid}`, borderRadius:12, transform:"rotate(3.5deg)" }} />
              <div style={{ position:"absolute", top:16, left:8, width:368, height:262, background:"#ffffff", border:`1px solid ${T.border}`, borderRadius:12, padding:24, boxShadow:`0 16px 56px rgba(35,68,255,.1)` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", color:T.primary }}>IPCR — Rating Period 2025–2026</span>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", background:"rgba(22,163,74,.08)", border:"1px solid rgba(22,163,74,.2)", borderRadius:12, fontSize:9, color:"#15803d" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 18l2-4 1.5 2.5L13 14l2 4H8z" /></svg>
                    .xlsx
                  </span>
                </div>
                <div style={{ fontSize:13, fontWeight:500, color:"rgb(20,20,20)", marginBottom:18, paddingBottom:14, borderBottom:`1px solid ${T.border}` }}>
                  Ken Jhon L. Navos · Instructor I
                </div>
                {[["Core Function","88%","4.4"],["Support Function","72%","3.6"],["Strategic Function","80%","4.0"]].map(([label,pct,score]) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <span style={{ fontSize:11, color:T.textSecondary, width:126 }}>{label}</span>
                    <div style={{ flex:1, height:4, background:T.bgMid, borderRadius:2, margin:"0 10px", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:pct, background:`linear-gradient(90deg, ${T.primaryDark}, ${T.primaryLight})`, borderRadius:2 }} />
                    </div>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:T.primary, width:28, textAlign:"right" }}>{score}</span>
                  </div>
                ))}
                <div style={{ marginTop:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ display:"inline-block", padding:"3px 10px", background:T.secondaryLighter, border:`1px solid ${T.secondaryLight}`, borderRadius:20, fontSize:10, color:"#5a4000" }}>Very Satisfactory — 4.00</span>
                  <span style={{ fontSize:10, color:T.textSecondary, fontFamily:"'DM Mono',monospace" }}>Export →</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ──────────────────────────────────────── */}
        <Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, background:T.border, borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}` }}>
            {[["4","User Roles"],["3","Review Phases"],["xlsx","Export Format"],["∞","Periods Supported"]].map(([num, label]) => (
              <div key={label} className="ch-stat" style={{ background:"#ffffff", padding:"36px 0", textAlign:"center", transition:"background 0.2s" }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:38, color:T.primary, lineHeight:1, marginBottom:8 }}>{num}</div>
                <div style={{ fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:T.textSecondary }}>{label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── Excel export highlight ──────────────────────── */}
        <section style={{ padding:"80px 60px", background:T.bgSoft, borderBottom:`1px solid ${T.border}` }} id="features">
          <Reveal>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>
              <div>
                <div style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:T.primary, marginBottom:14, fontWeight:500 }}>Primary Export Format</div>
                <h2 style={{ fontSize:"clamp(26px,3.5vw,40px)", fontWeight:700, lineHeight:1.15, color:"rgb(20,20,20)", marginBottom:20, letterSpacing:"-0.02em" }}>
                  Official forms,<br /><span style={{ color:T.primary }}>exported to Excel.</span>
                </h2>
                <p style={{ fontSize:15, lineHeight:1.7, color:T.textSecondary, fontWeight:400, marginBottom:32 }}>
                  CommitHub generates fully formatted IPCR and OPCR spreadsheets — with computed ratings, position weights, and signature sections — ready for printing and official CSC submission.
                </p>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {["IPCR form with weighted category ratings","OPCR consolidation per department","Pre-filled formulas and rating scales","Signature and certification rows included"].map(item => (
                    <div key={item} style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:20, height:20, borderRadius:"50%", background:T.primaryLighter, display:"grid", placeItems:"center", flexShrink:0 }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke={T.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <span style={{ fontSize:14, color:T.textPrimary }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Excel mockup */}
              <div style={{ background:"#ffffff", border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden", boxShadow:`0 16px 48px rgba(35,68,255,.08)` }}>
                <div style={{ background:"rgba(22,163,74,.06)", borderBottom:"1px solid rgba(22,163,74,.12)", padding:"10px 16px", display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:11, height:11, borderRadius:"50%", background:"#ff5f57" }} />
                  <div style={{ width:11, height:11, borderRadius:"50%", background:"#febc2e" }} />
                  <div style={{ width:11, height:11, borderRadius:"50%", background:"#28c840" }} />
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:T.textSecondary, marginLeft:10 }}>IPCR_2025_2026.xlsx</span>
                </div>
                <div style={{ background:"rgba(22,163,74,.04)", borderBottom:"1px solid rgba(22,163,74,.1)", padding:"8px 16px", display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:8 }}>
                  {["MFO / Output","Q","E","T","Average"].map(h => (
                    <span key={h} style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:T.textSecondary, letterSpacing:"0.1em", textTransform:"uppercase" }}>{h}</span>
                  ))}
                </div>
                {[
                  ["Conduct Research Activities","5","4","4","4.33"],
                  ["Prepare Instructional Materials","4","5","4","4.33"],
                  ["Community Extension Programs","3","4","5","4.00"],
                  ["Administrative Functions","4","4","3","3.67"],
                ].map(([mfo,q,e,t,avg],i) => (
                  <div key={i} style={{ padding:"10px 16px", display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:8, borderBottom:`1px solid ${T.border}`, background: i%2===0 ? "#ffffff" : T.bgSoft }}>
                    <span style={{ fontSize:11, color:T.textPrimary }}>{mfo}</span>
                    {[q,e,t,avg].map((v,vi) => (
                      <span key={vi} style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color: vi===3 ? T.primary : T.textSecondary, textAlign:"center" }}>{v}</span>
                    ))}
                  </div>
                ))}
                <div style={{ padding:"12px 16px", display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:8, background:T.primaryLighter, borderTop:`1px solid ${T.borderMid}` }}>
                  <span style={{ fontSize:11, fontWeight:600, color:"rgb(20,20,20)" }}>FINAL RATING</span>
                  <span /><span /><span />
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:T.primary, fontWeight:600, textAlign:"center" }}>4.08</span>
                </div>
                <div style={{ padding:"10px 16px", background:T.secondaryLighter }}>
                  <span style={{ fontSize:10, color:T.textSecondary, letterSpacing:"0.06em" }}>Adjectival Rating: </span>
                  <span style={{ fontSize:10, color:"#5a4000", fontWeight:500, letterSpacing:"0.06em" }}>VERY SATISFACTORY</span>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Features grid ──────────────────────────────── */}
        <section style={{ padding:"100px 60px", background:"#ffffff" }}>
          <Reveal>
            <div style={{ marginBottom:56 }}>
              <div style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:T.primary, marginBottom:14, fontWeight:500 }}>What it does</div>
              <h2 style={{ fontSize:"clamp(26px,3.5vw,42px)", fontWeight:700, lineHeight:1.15, color:"rgb(20,20,20)", maxWidth:480, letterSpacing:"-0.02em" }}>
                Everything the IPCR process requires, digitized.
              </h2>
            </div>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:T.border, border:`1px solid ${T.border}`, borderRadius:4, overflow:"hidden" }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="ch-feature" style={{ background: f.highlight ? T.bgSoft : "#ffffff", padding:"36px 32px", position:"relative", overflow:"hidden", height:"100%", outline: f.highlight ? `2px solid ${T.primary}` : "none", outlineOffset:"-2px", transition:"background 0.2s" }}>
                  <div className="ch-feature-bar" style={{ position:"absolute", top:0, left:0, right:0, height:3, background:T.primary, transform:"scaleX(0)", transformOrigin:"left", transition:"transform 0.35s ease" }} />
                  {f.highlight && (
                    <div style={{ position:"absolute", top:12, right:14, padding:"3px 10px", background:T.secondary, borderRadius:20, fontSize:9, color:"#5a4000", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>Primary</div>
                  )}
                  <div style={{ width:42, height:42, background:T.primaryLighter, borderRadius:8, display:"grid", placeItems:"center", marginBottom:20, color:T.primary }}>{f.icon}</div>
                  <div style={{ fontSize:16, fontWeight:600, marginBottom:10, color:"rgb(20,20,20)" }}>{f.title}</div>
                  <div style={{ fontSize:14, lineHeight:1.65, color:T.textSecondary }}>{f.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Roles ──────────────────────────────────────── */}
        <section style={{ padding:"100px 60px", background:T.bgSoft, borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}` }} id="roles">
          <Reveal>
            <div style={{ marginBottom:56 }}>
              <div style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:T.primary, marginBottom:14, fontWeight:500 }}>Who uses it</div>
              <h2 style={{ fontSize:"clamp(26px,3.5vw,42px)", fontWeight:700, lineHeight:1.15, color:"rgb(20,20,20)", letterSpacing:"-0.02em" }}>
                Built for every role in the review process.
              </h2>
            </div>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {ROLES.map((r, i) => (
              <Reveal key={r.name} delay={i * 0.08}>
                <div className="ch-role" style={{ border:`1px solid ${T.border}`, borderRadius:10, padding:"28px 24px", background:"#ffffff", transition:"all 0.2s", cursor:"default", boxShadow:`0 2px 8px rgba(35,68,255,.04)` }}>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:T.primaryLight, letterSpacing:"0.1em", marginBottom:18 }}>{r.n}</div>
                  <div style={{ fontSize:18, fontWeight:600, color:"rgb(20,20,20)", marginBottom:10 }}>{r.name}</div>
                  <div style={{ fontSize:13, lineHeight:1.65, color:T.textSecondary }}>{r.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────── */}
        <section style={{ padding:"120px 60px", textAlign:"center", position:"relative", overflow:"hidden", background:"#ffffff" }} id="about">
          
          <Reveal>
            <span style={{ display:"block", fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:T.primary, marginBottom:18, fontWeight:500 }}>Ready to begin</span>
            <h2 style={{ fontSize:"clamp(30px,5vw,54px)", fontWeight:700, lineHeight:1.12, color:"rgb(20,20,20)", marginBottom:20, letterSpacing:"-0.025em" }}>
              Your performance,<br /><span style={{ color:T.primary }}>committed &amp; reviewed.</span>
            </h2>
            <p style={{ fontSize:16, color:T.textSecondary, maxWidth:460, margin:"0 auto 44px", lineHeight:1.7 }}>
              Access CommitHub using your Norzagaray College account credentials. IPCR and OPCR forms export directly to Excel.
            </p>
            <a href="https://www.commithub.online" className="ch-btn-primary" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 36px", background:T.primary, color:"#ffffff", borderRadius:6, fontSize:14, fontWeight:500, textDecoration:"none", boxShadow:`0 8px 28px rgba(35,68,255,.25)`, transition:"all 0.2s" }}>
              Go to CommitHub
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <span style={{ display:"block", fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:"0.08em", color:"rgba(114,114,114,.5)", marginTop:18 }}>www.commithub.online</span>
          </Reveal>
        </section>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer style={{ padding:"32px 60px", borderTop:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:T.bgSoft }}>
          <div style={{ fontSize:12, color:T.textSecondary, lineHeight:1.7 }}>
            © 2026 CommitHub — Norzagaray College<br />
            College of Computing Studies · Norzagaray, Bulacan
          </div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.1em", color:T.primaryLight, textTransform:"uppercase" }}>
            IPCR · OPCR · SPMS
          </div>
        </footer>

      </div>
    </>
  );
}