import { useEffect, useRef, useState } from "react";

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
  { n: "01", icon: "", name: "Faculty", desc: "Submit IPCR forms, attach supporting documents, and track ratings across evaluation periods." },
  { n: "02", icon: "", name: "Department Head", desc: "Review faculty IPCRs, monitor office performance, and generate OPCR reports." },
  { n: "03", icon: "", name: "President", desc: "Final approval authority for all submissions. Access institution-wide consolidated ratings." },
  { n: "04", icon: "", name: "Administrator", desc: "Manage users, configure tasks, set evaluation periods, and monitor system activity logs." },
];

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
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
      transform: visible ? "none" : "translateY(28px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
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
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #0d2240; }
    :root {
      --navy: #0d2240;
      --navy2: #162f52;
      --blue: #1a56a0;
      --accent: #c8a84b;
      --accent2: #e8c96a;
      --white: #fffef9;
      --muted: rgba(255,254,249,0.5);
      --rule: rgba(200,168,75,0.25);
    }
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(24px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes float {
      0%,100% { transform:translateY(0); }
      50%      { transform:translateY(-10px); }
    }
    .ch-hero-anim-1 { animation: fadeUp .8s ease .1s both; }
    .ch-hero-anim-2 { animation: fadeUp .8s ease .25s both; }
    .ch-hero-anim-3 { animation: fadeUp .8s ease .4s both; }
    .ch-hero-anim-4 { animation: fadeUp .8s ease .55s both; }
    .ch-hero-anim-5 { animation: fadeUp 1.2s ease .7s both; }
    .ch-card-float  { animation: float 6s ease-in-out 2s infinite; }
    .ch-feature:hover { background: #122040 !important; }
    .ch-feature:hover .ch-feature-bar { transform: scaleX(1) !important; }
    .ch-role:hover { border-color: rgba(200,168,75,.55) !important; transform: translateY(-4px) !important; box-shadow: 0 20px 60px rgba(0,0,0,.3) !important; }
    .ch-stat:hover { background: #162f52 !important; }
    .ch-btn-primary:hover { background: #e8c96a !important; transform: translateY(-2px) !important; box-shadow: 0 12px 40px rgba(200,168,75,.35) !important; }
    .ch-btn-login:hover { background: #e8c96a !important; }
    .ch-nav-link:hover { color: #c8a84b !important; }
    .ch-highlight-ring { border: 2px solid var(--accent) !important; }
  `;

  return (
    <>
      <style>{css}</style>

      {/* Grain overlay */}
      <div style={{ position:"fixed", inset:0, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, opacity:0.04, pointerEvents:"none", zIndex:999 }} />

      <div style={{ fontFamily:"'DM Sans', sans-serif", background:"#0d2240", color:"#fffef9", overflowX:"hidden" }}>

        {/* ── Header ─────────────────────────────────────── */}
        <header style={{
          position:"fixed", top:0, left:0, right:0, zIndex:100,
          padding:"18px 60px", display:"flex", alignItems:"center", justifyContent:"space-between",
          borderBottom: scrolled ? "1px solid rgba(200,168,75,0.15)" : "1px solid transparent",
          background: scrolled ? "rgba(13,34,64,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          transition:"all 0.3s ease",
        }}>
          <a href="#" style={{ display:"flex", alignItems:"center", gap:12, textDecoration:"none" }}>
            <div style={{ width:36, height:36, border:"1.5px solid #c8a84b", borderRadius:6, display:"grid", placeItems:"center", fontFamily:"'Playfair Display',serif", fontSize:18, color:"#c8a84b" }}><img src="CommitHub.png" alt="CommitHub Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} /></div>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:"#fffef9" }}>Commit<span style={{ color:"#c8a84b" }}>Hub</span></span>
          </a>
          <nav style={{ display:"flex", alignItems:"center", gap:36 }}>
            {["Features", "Roles", "About"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="ch-nav-link" style={{ fontSize:13, fontWeight:400, color:"rgba(255,254,249,0.55)", textDecoration:"none", letterSpacing:"0.06em", textTransform:"uppercase", transition:"color 0.2s" }}>{l}</a>
            ))}
          </nav>
          <a href="https://www.commithub.online" className="ch-btn-login" style={{ padding:"9px 24px", background:"#c8a84b", color:"#0d2240", borderRadius:4, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, letterSpacing:"0.06em", textTransform:"uppercase", textDecoration:"none", transition:"background 0.2s" }}>
            Sign In →
          </a>
        </header>

        {/* ── Hero ───────────────────────────────────────── */}
        <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", padding:"120px 60px 80px", position:"relative", overflow:"hidden" }}>
          {/* bg layers */}
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 80% at 70% 50%, rgba(26,86,160,.25) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 20% 80%, rgba(200,168,75,.08) 0%, transparent 60%), linear-gradient(160deg, #0d2240 0%, #0a1c35 100%)" }} />
          <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(200,168,75,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(200,168,75,.06) 1px, transparent 1px)", backgroundSize:"60px 60px", WebkitMaskImage:"radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)", maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)" }} />

          {/* content */}
          <div style={{ position:"relative", zIndex:2, maxWidth:660 }}>
            <div className="ch-hero-anim-1" style={{ display:"inline-flex", alignItems:"center", gap:10, fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:"#c8a84b", marginBottom:28 }}>
              <span style={{ display:"block", width:32, height:1, background:"#c8a84b" }} />
              Norzagaray College · IPCR / OPCR Platform
            </div>
            <h1 className="ch-hero-anim-2" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(42px,6vw,72px)", fontWeight:700, lineHeight:1.08, letterSpacing:"-0.02em", marginBottom:28 }}>
              Performance<br />review, <em style={{ fontStyle:"italic", color:"#c8a84b" }}>built for</em><br />faculty.
            </h1>
            <p className="ch-hero-anim-3" style={{ fontSize:17, fontWeight:300, lineHeight:1.75, color:"rgba(255,254,249,0.65)", maxWidth:520, marginBottom:48 }}>
              CommitHub centralizes the submission, review, and approval of IPCR and OPCR forms — from planning to rating, with one-click Excel export ready for official submission.
            </p>
            <div className="ch-hero-anim-4" style={{ display:"flex", alignItems:"center", gap:20 }}>
              <a href="https://www.commithub.online" className="ch-btn-primary" style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"16px 36px", background:"#c8a84b", color:"#0d2240", borderRadius:4, fontSize:14, fontWeight:500, letterSpacing:"0.05em", textTransform:"uppercase", textDecoration:"none", boxShadow:"0 8px 32px rgba(200,168,75,.25)", transition:"all 0.2s" }}>
                Access CommitHub
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
              <span style={{ fontSize:12, color:"rgba(255,254,249,0.4)", letterSpacing:"0.04em" }}>commithub.online</span>
            </div>
          </div>

          {/* Floating IPCR card */}
          <div className="ch-hero-anim-5 ch-card-float" style={{ position:"absolute", right:60, top:"50%", transform:"translateY(-50%)", width:420 }}>
            <div style={{ position:"relative", width:420, height:340 }}>
              {/* back card */}
              <div style={{ position:"absolute", top:40, left:40, width:360, height:240, background:"rgba(22,47,82,.6)", border:"1px solid rgba(200,168,75,.15)", borderRadius:12, padding:24, transform:"rotate(4deg)" }} />
              {/* main card */}
              <div style={{ position:"absolute", top:20, left:10, width:380, height:270, background:"rgba(18,40,76,.95)", border:"1px solid rgba(200,168,75,.25)", borderRadius:12, padding:28, boxShadow:"0 24px 80px rgba(0,0,0,.5)" }}>
                {/* Excel badge */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", color:"#c8a84b" }}>IPCR — Rating Period 2025–2026</span>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"2px 8px", background:"rgba(33,115,70,.25)", border:"1px solid rgba(33,115,70,.4)", borderRadius:12, fontSize:9, color:"#4ade80", letterSpacing:"0.06em" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 18l2-4 1.5 2.5L13 14l2 4H8z" /></svg>
                    .xlsx
                  </span>
                </div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:13, color:"#fffef9", marginBottom:20, paddingBottom:14, borderBottom:"1px solid rgba(200,168,75,.15)" }}>
                  Ken Jhon L. Navos · Instructor I
                </div>
                {[["Core Function", "88%", "4.4"], ["Support Function", "72%", "3.6"], ["Strategic Function", "80%", "4.0"]].map(([label, pct, score]) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <span style={{ fontSize:11, color:"rgba(255,254,249,.5)", width:130 }}>{label}</span>
                    <div style={{ flex:1, height:5, background:"rgba(255,255,255,.08)", borderRadius:3, margin:"0 10px", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:pct, background:"linear-gradient(90deg, #1a56a0, #c8a84b)", borderRadius:3 }} />
                    </div>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#c8a84b", width:28, textAlign:"right" }}>{score}</span>
                  </div>
                ))}
                <div style={{ marginTop:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ display:"inline-block", padding:"3px 10px", background:"rgba(200,168,75,.15)", border:"1px solid rgba(200,168,75,.3)", borderRadius:20, fontSize:10, color:"#c8a84b", letterSpacing:"0.06em" }}>Very Satisfactory — 4.00</span>
                  <span style={{ fontSize:10, color:"rgba(255,254,249,.3)", fontFamily:"'DM Mono',monospace" }}>Export →</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ──────────────────────────────────────── */}
        <Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, background:"rgba(200,168,75,.2)", borderTop:"1px solid rgba(200,168,75,.2)", borderBottom:"1px solid rgba(200,168,75,.2)" }}>
            {[["4", "User Roles"], ["3", "Review Phases"], ["xlsx", "Export Format"], ["∞", "Periods Supported"]].map(([num, label]) => (
              <div key={label} className="ch-stat" style={{ background:"#0d2240", padding:"40px 0", textAlign:"center", transition:"background 0.2s" }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:42, color:"#c8a84b", lineHeight:1, marginBottom:8 }}>{num}</div>
                <div style={{ fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,254,249,.4)" }}>{label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── Excel export highlight ──────────────────────── */}
        <section style={{ padding:"80px 60px", background:"linear-gradient(180deg, #0d2240 0%, #0c1e3a 100%)", borderBottom:"1px solid rgba(200,168,75,.15)" }} id="features">
          <Reveal>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>
              <div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#c8a84b", marginBottom:16 }}>Primary Export Format</div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,42px)", fontWeight:700, lineHeight:1.15, marginBottom:20 }}>
                  Official forms,<br /><em style={{ fontStyle:"italic", color:"#c8a84b" }}>exported to Excel.</em>
                </h2>
                <p style={{ fontSize:15, lineHeight:1.8, color:"rgba(255,254,249,.55)", fontWeight:300, marginBottom:32 }}>
                  CommitHub generates fully formatted IPCR and OPCR spreadsheets — with computed ratings, position weights, and signature sections — ready for printing and official CSC submission.
                </p>
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  {["IPCR form with weighted category ratings", "OPCR consolidation per department", "Pre-filled formulas and rating scales", "Signature and certification rows included"].map(item => (
                    <div key={item} style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(200,168,75,.15)", border:"1px solid rgba(200,168,75,.3)", display:"grid", placeItems:"center", flexShrink:0 }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#c8a84b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <span style={{ fontSize:14, color:"rgba(255,254,249,.65)" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Excel mockup */}
              <div style={{ background:"rgba(18,40,76,.6)", border:"1px solid rgba(200,168,75,.2)", borderRadius:12, overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,.4)" }}>
                {/* toolbar */}
                <div style={{ background:"rgba(33,115,70,.2)", borderBottom:"1px solid rgba(33,115,70,.3)", padding:"10px 16px", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:12, height:12, borderRadius:"50%", background:"#ff5f57" }} />
                  <div style={{ width:12, height:12, borderRadius:"50%", background:"#febc2e" }} />
                  <div style={{ width:12, height:12, borderRadius:"50%", background:"#28c840" }} />
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"rgba(255,254,249,.4)", marginLeft:12 }}>IPCR_2025_2026.xlsx</span>
                </div>
                {/* header row */}
                <div style={{ background:"rgba(33,115,70,.15)", borderBottom:"1px solid rgba(33,115,70,.2)", padding:"8px 16px", display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:8 }}>
                  {["MFO / Output", "Q", "E", "T", "Average"].map(h => (
                    <span key={h} style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"rgba(255,254,249,.5)", letterSpacing:"0.1em", textTransform:"uppercase" }}>{h}</span>
                  ))}
                </div>
                {/* rows */}
                {[
                  ["Conduct Research Activities", "5", "4", "4", "4.33"],
                  ["Prepare Instructional Materials", "4", "5", "4", "4.33"],
                  ["Community Extension Programs", "3", "4", "5", "4.00"],
                  ["Administrative Functions", "4", "4", "3", "3.67"],
                ].map(([mfo, q, e, t, avg], i) => (
                  <div key={i} style={{ padding:"10px 16px", display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:8, borderBottom:"1px solid rgba(255,255,255,.04)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.02)" }}>
                    <span style={{ fontSize:11, color:"rgba(255,254,249,.7)" }}>{mfo}</span>
                    {[q, e, t, avg].map((v, vi) => (
                      <span key={vi} style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color: vi === 3 ? "#c8a84b" : "rgba(255,254,249,.5)", textAlign:"center" }}>{v}</span>
                    ))}
                  </div>
                ))}
                {/* total row */}
                <div style={{ padding:"12px 16px", display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:8, background:"rgba(200,168,75,.08)", borderTop:"1px solid rgba(200,168,75,.2)" }}>
                  <span style={{ fontSize:11, fontWeight:500, color:"#fffef9" }}>FINAL RATING</span>
                  <span /><span /><span />
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:"#c8a84b", fontWeight:500, textAlign:"center" }}>4.08</span>
                </div>
                <div style={{ padding:"10px 16px", background:"rgba(200,168,75,.05)" }}>
                  <span style={{ fontSize:10, color:"rgba(255,254,249,.3)", letterSpacing:"0.06em" }}>Adjectival Rating: </span>
                  <span style={{ fontSize:10, color:"#c8a84b", letterSpacing:"0.06em" }}>VERY SATISFACTORY</span>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Features grid ──────────────────────────────── */}
        <section style={{ padding:"100px 60px" }}>
          <Reveal>
            <div style={{ marginBottom:64 }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#c8a84b", marginBottom:16 }}>What it does</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,44px)", fontWeight:700, lineHeight:1.15, maxWidth:500 }}>Everything the IPCR process requires, digitized.</h2>
            </div>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:"rgba(200,168,75,.2)", border:"1px solid rgba(200,168,75,.2)", borderRadius:2, overflow:"hidden" }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.1}>
                <div className="ch-feature" style={{ background: f.highlight ? "rgba(22,48,82,.8)" : "#0d2240", padding:"40px 36px", position:"relative", overflow:"hidden", height:"100%", border: f.highlight ? "1px solid rgba(200,168,75,.4)" : "none", transition:"background 0.25s" }}>
                  <div className="ch-feature-bar" style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg, #c8a84b, transparent)", transform:"scaleX(0)", transformOrigin:"left", transition:"transform 0.4s ease" }} />
                  {f.highlight && <div style={{ position:"absolute", top:12, right:16, padding:"2px 8px", background:"rgba(200,168,75,.15)", border:"1px solid rgba(200,168,75,.3)", borderRadius:12, fontSize:9, color:"#c8a84b", letterSpacing:"0.08em", textTransform:"uppercase" }}>Primary</div>}
                  <div style={{ width:44, height:44, border:"1px solid rgba(200,168,75,.3)", borderRadius:8, display:"grid", placeItems:"center", marginBottom:24, color:"#c8a84b" }}>{f.icon}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, marginBottom:12, color:"#fffef9" }}>{f.title}</div>
                  <div style={{ fontSize:14, lineHeight:1.7, color:"rgba(255,254,249,.5)", fontWeight:300 }}>{f.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Roles ──────────────────────────────────────── */}
        <section style={{ padding:"100px 60px", background:"linear-gradient(180deg,#0d2240 0%,#0a1c35 100%)", borderTop:"1px solid rgba(200,168,75,.15)", borderBottom:"1px solid rgba(200,168,75,.15)" }} id="roles">
          <Reveal>
            <div style={{ marginBottom:64 }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#c8a84b", marginBottom:16 }}>Who uses it</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,44px)", fontWeight:700, lineHeight:1.15 }}>Built for every role in the review process.</h2>
            </div>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
            {ROLES.map((r, i) => (
              <Reveal key={r.name} delay={i * 0.1}>
                <div className="ch-role" style={{ border:"1px solid rgba(200,168,75,.18)", borderRadius:8, padding:"32px 28px", background:"rgba(26,47,80,.4)", transition:"all 0.25s", cursor:"default" }}>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"rgba(200,168,75,.4)", letterSpacing:"0.1em", marginBottom:20 }}>{r.n}</div>
                  <div style={{ fontSize:28, marginBottom:16, lineHeight:1 }}>{r.icon}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:"#fffef9", marginBottom:12 }}>{r.name}</div>
                  <div style={{ fontSize:13, lineHeight:1.7, color:"rgba(255,254,249,.45)", fontWeight:300 }}>{r.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────── */}
        <section style={{ padding:"120px 60px", textAlign:"center", position:"relative", overflow:"hidden" }} id="about">
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 80% at 50% 50%, rgba(200,168,75,.06) 0%, transparent 70%)", pointerEvents:"none" }} />
          <Reveal>
            <span style={{ display:"block", fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#c8a84b", marginBottom:20 }}>Ready to begin</span>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(32px,5vw,56px)", fontWeight:700, lineHeight:1.12, marginBottom:24 }}>
              Your performance,<br /><em style={{ fontStyle:"italic", color:"#c8a84b" }}>committed & reviewed.</em>
            </h2>
            <p style={{ fontSize:16, color:"rgba(255,254,249,.55)", maxWidth:480, margin:"0 auto 48px", lineHeight:1.7, fontWeight:300 }}>
              Access CommitHub using your Norzagaray College account credentials. IPCR and OPCR forms export directly to Excel.
            </p>
            <a href="https://www.commithub.online" className="ch-btn-primary" style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"16px 40px", background:"#c8a84b", color:"#0d2240", borderRadius:4, fontSize:14, fontWeight:500, letterSpacing:"0.05em", textTransform:"uppercase", textDecoration:"none", boxShadow:"0 8px 32px rgba(200,168,75,.25)", transition:"all 0.2s" }}>
              Go to CommitHub
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <span style={{ display:"block", fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:"0.08em", color:"rgba(255,254,249,.25)", marginTop:20 }}>www.commithub.online</span>
          </Reveal>
        </section>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer style={{ padding:"36px 60px", borderTop:"1px solid rgba(200,168,75,.2)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:12, color:"rgba(255,254,249,.3)", lineHeight:1.7 }}>
            © 2026 CommitHub — Norzagaray College<br />
            College of Computing Studies · Norzagaray, Bulacan
          </div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.1em", color:"rgba(200,168,75,.4)", textTransform:"uppercase" }}>
            IPCR · OPCR · SPMS
          </div>
        </footer>

      </div>
    </>
  );
}