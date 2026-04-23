import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const C = {
  primary: "#166534", accent: "#059669", accentSoft: "#d9fbe8", ink: "#142315", line: "#d7e6da",
};

const Logo: React.FC<{ size?: number }> = ({ size = 100 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="24" fill={C.primary} />
    <path d="M22 50 C22 36 34 26 50 26 C62 26 72 33 76 43" stroke="#fff" strokeWidth="7" strokeLinecap="round" fill="none" />
    <path d="M78 50 C78 64 66 74 50 74 C38 74 28 67 24 57" stroke={C.accentSoft} strokeWidth="7" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="50" r="7" fill="#fff" />
    <circle cx="50" cy="50" r="3.5" fill={C.accent} />
  </svg>
);

const GridBg: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px),linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
);

const features = [
  { icon: "📊", label: "Dashboard inteligente" },
  { icon: "🎯", label: "Presupuestos por categoría" },
  { icon: "💰", label: "Metas de ahorro" },
  { icon: "📄", label: "Tickets digitalizados" },
  { icon: "🧑‍💼", label: "Asesor financiero personal" },
  { icon: "🔒", label: "Seguridad JWT + RBAC" },
];

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoS = spring({ frame, fps, config: { damping: 14, stiffness: 120 }, durationInFrames: 35 });
  const pillOp = interpolate(frame, [18, 40], [0, 1], { extrapolateRight: "clamp" });
  const pillY = interpolate(frame, [18, 40], [20, 0], { extrapolateRight: "clamp" });
  const h1Op = interpolate(frame, [28, 52], [0, 1], { extrapolateRight: "clamp" });
  const h1Y = interpolate(frame, [28, 52], [24, 0], { extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [44, 66], [0, 1], { extrapolateRight: "clamp" });
  const urlOp = interpolate(frame, [82, 102], [0, 1], { extrapolateRight: "clamp" });
  const urlS = spring({ frame: frame - 82, fps, config: { damping: 12, stiffness: 100 }, durationInFrames: 24 });
  const btnOp = interpolate(frame, [96, 116], [0, 1], { extrapolateRight: "clamp" });
  const btnY = interpolate(frame, [96, 116], [18, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.primary} 0%, #0a3d1f 55%, #0d4a27 100%)`, fontFamily: "'Manrope',sans-serif", overflow: "hidden" }}>
      <GridBg />
      <div style={{ position: "absolute", top: -250, right: -250, width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,150,105,0.22) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: -300, left: -250, width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,251,232,0.12) 0%, transparent 70%)" }} />

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 64px", gap: 0 }}>
        <div style={{ transform: `scale(${logoS})`, marginBottom: 28 }}>
          <Logo size={120} />
        </div>

        <div style={{ opacity: pillOp, transform: `translateY(${pillY}px)`, background: "rgba(217,251,232,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "10px 28px", marginBottom: 22 }}>
          <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.9)", textTransform: "uppercase" }}>✦ Finanzas claras</span>
        </div>

        <h1 style={{ opacity: h1Op, transform: `translateY(${h1Y}px)`, fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: 80, color: "#ffffff", textAlign: "center", lineHeight: 1.0, letterSpacing: "-0.025em", margin: 0, marginBottom: 14 }}>
          Cuentas<br />Claras
        </h1>

        <p style={{ opacity: subOp, fontFamily: "'Sora',sans-serif", fontSize: 26, color: "rgba(255,255,255,0.75)", textAlign: "center", margin: "0 0 44px", letterSpacing: "-0.01em", lineHeight: 1.35 }}>
          Tu plata clara,<br />tus decisiones seguras.
        </p>

        {/* Features grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 44, width: "100%" }}>
          {features.map((f, i) => (
            <div key={f.label} style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 18, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, opacity: interpolate(frame, [42 + i * 8, 60 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateY(${interpolate(frame, [42 + i * 8, 60 + i * 8], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>
              <span style={{ fontSize: 24 }}>{f.icon}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.92)", lineHeight: 1.3 }}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* URL card */}
        <div style={{ opacity: urlOp, transform: `scale(${interpolate(urlS, [0, 1], [0.9, 1])})`, background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.28)", borderRadius: 24, padding: "24px 36px", textAlign: "center", backdropFilter: "blur(12px)", marginBottom: 28, width: "100%" }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>Accedé ahora</p>
          <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 900, color: "#ffffff", letterSpacing: "0.01em", wordBreak: "break-all" }}>
            ing-web-ii-production<br />.up.railway.app
          </p>
          <p style={{ margin: "12px 0 0", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Usuarios de prueba disponibles</p>
        </div>

        {/* Buttons */}
        <div style={{ opacity: btnOp, transform: `translateY(${btnY}px)`, display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
          <div style={{ background: "#ffffff", color: C.primary, borderRadius: 20, padding: "20px", textAlign: "center", fontWeight: 900, fontSize: 20 }}>
            Crear cuenta gratis
          </div>
          <div style={{ background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 20, padding: "20px", textAlign: "center", fontWeight: 700, fontSize: 19 }}>
            Ya tengo cuenta
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
