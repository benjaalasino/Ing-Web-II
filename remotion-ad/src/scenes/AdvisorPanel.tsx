import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const C = {
  bg: "#f5f8fc", primary: "#166534", accent: "#059669", accentSoft: "#d9fbe8",
  ink: "#142315", muted: "#4a5f4d", line: "#d7e6da", surface: "#ffffff",
  orange: "#f59e0b", blue: "#3b82f6", purple: "#8b5cf6", gold: "#d97706",
};

const GridBg: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(to right, rgba(22,101,52,0.05) 1px, transparent 1px),linear-gradient(to bottom, rgba(22,101,52,0.05) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
);

interface UserRow { name: string; spent: string; alert: boolean; avatar: string; }
interface Comment { user: string; avatar: string; text: string; date: string; type: "warning" | "tip" | "positive"; }

const users: UserRow[] = [
  { name: "María García", spent: "$241.300", alert: false, avatar: "MG" },
  { name: "Carlos Ruiz", spent: "$387.900", alert: true, avatar: "CR" },
  { name: "Ana López", spent: "$98.450", alert: false, avatar: "AL" },
  { name: "Diego Pérez", spent: "$512.000", alert: true, avatar: "DP" },
];

const comments: Comment[] = [
  { user: "Carlos Ruiz", avatar: "CR", text: "🔴 Superaste tu presupuesto de ocio en 35%. Revisá suscripciones duplicadas.", date: "Hace 2 hs", type: "warning" },
  { user: "María García", avatar: "MG", text: "✅ Excelente mes. Tu ahorro creció 18%. Aumentá la meta de vacaciones.", date: "Ayer", type: "positive" },
  { user: "Ana López", avatar: "AL", text: "💡 Con este ritmo, alcanzarás tu fondo de emergencia en 4 meses.", date: "Ayer", type: "tip" },
  { user: "Diego Pérez", avatar: "DP", text: "⚠️ Tu gasto en transporte es 2x el promedio. ¿Evaluaste alternativas?", date: "20 Abr", type: "warning" },
];

const typeBg: Record<string, string> = { warning: "#fef2f2", tip: "#eff6ff", positive: "#f0fdf4" };
const typeColor: Record<string, string> = { warning: "#dc2626", tip: C.blue, positive: C.accent };
const typeBorder: Record<string, string> = { warning: "#dc262640", tip: `${C.blue}40`, positive: `${C.accent}40` };

export const AdvisorPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerOp = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: "clamp" });
  const headerY = interpolate(frame, [0, 22], [-20, 0], { extrapolateRight: "clamp" });
  const badgeS = spring({ frame, fps, config: { damping: 12, stiffness: 100 }, durationInFrames: 30 });

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: "'Manrope',sans-serif", overflow: "hidden" }}>
      <GridBg />
      <div style={{ position: "absolute", inset: 0, padding: "60px 56px", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ opacity: headerOp, transform: `translateY(${headerY}px)`, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: C.gold, textTransform: "uppercase", letterSpacing: "0.22em" }}>ROL ASESOR</p>
            <div style={{ background: `${C.gold}20`, border: `1px solid ${C.gold}55`, borderRadius: 8, padding: "4px 14px", transform: `scale(${badgeS})` }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: C.gold, textTransform: "uppercase", letterSpacing: "0.1em" }}>advisor@wisepocket.com</span>
            </div>
          </div>
          <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 46, fontWeight: 900, color: C.ink }}>Panel del Asesor</h2>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 26, opacity: headerOp }}>
          {[
            { label: "Usuarios", value: "24", icon: "👥", accent: false },
            { label: "Alertas", value: "6", icon: "🔔", accent: true },
            { label: "Prom. gasto", value: "$184K", icon: "📊", accent: false },
          ].map((s, i) => (
            <div key={s.label} style={{ background: s.accent ? `${C.orange}12` : C.surface, border: `1.5px solid ${s.accent ? `${C.orange}44` : C.line}`, borderRadius: 20, padding: "18px 16px", textAlign: "center", boxShadow: "0 4px 16px rgba(20,35,21,0.06)", opacity: interpolate(frame, [10 + i * 8, 28 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateY(${interpolate(frame, [10 + i * 8, 28 + i * 8], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>
              <p style={{ margin: 0, fontSize: 26 }}>{s.icon}</p>
              <p style={{ margin: "6px 0 0", fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 900, color: s.accent ? C.orange : C.primary }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 12, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* User table */}
        <div style={{ background: C.surface, border: `1.5px solid ${C.line}`, borderRadius: 24, overflow: "hidden", marginBottom: 22, boxShadow: "0 6px 22px rgba(20,35,21,0.07)", opacity: interpolate(frame, [18, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: C.ink }}>Mis usuarios</h3>
            <div style={{ background: C.accentSoft, borderRadius: 10, padding: "6px 16px", fontSize: 13, color: C.muted, fontWeight: 600 }}>Buscar...</div>
          </div>
          {users.map((u, i) => (
            <div key={u.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderBottom: i < users.length - 1 ? `1px solid ${C.line}` : "none", background: u.alert ? `${C.orange}07` : "transparent", opacity: interpolate(frame, [28 + i * 9, 46 + i * 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateX(${interpolate(frame, [28 + i * 9, 46 + i * 9], [-22, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: u.alert ? `${C.orange}22` : C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: u.alert ? C.orange : C.primary, flexShrink: 0 }}>{u.avatar}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.ink }}>{u.name}</p>
              </div>
              <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 900, color: C.ink }}>{u.spent}</p>
              <div style={{ background: u.alert ? `${C.orange}20` : `${C.accent}20`, color: u.alert ? C.orange : C.accent, borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                {u.alert ? "⚠ Alerta" : "✓ OK"}
              </div>
            </div>
          ))}
        </div>

        {/* Comments */}
        <div style={{ background: C.surface, border: `1.5px solid ${C.line}`, borderRadius: 24, overflow: "hidden", boxShadow: "0 6px 22px rgba(20,35,21,0.07)", flex: 1, opacity: interpolate(frame, [30, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.line}` }}>
            <h3 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: C.ink }}>Recomendaciones enviadas</h3>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {comments.map((c, i) => (
              <div key={i} style={{ background: typeBg[c.type], border: `1.5px solid ${typeBorder[c.type]}`, borderLeft: `4px solid ${typeColor[c.type]}`, borderRadius: 14, padding: "14px 16px", opacity: interpolate(frame, [42 + i * 10, 60 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateX(${interpolate(frame, [42 + i * 10, 60 + i * 10], [22, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${typeColor[c.type]}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: typeColor[c.type] }}>{c.avatar}</div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: C.ink, flex: 1 }}>{c.user}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>{c.date}</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: C.ink, lineHeight: 1.45, fontWeight: 600 }}>{c.text}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: "14px 18px", borderTop: `1px solid ${C.line}`, opacity: interpolate(frame, [78, 96], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            <div style={{ background: "#eef7f0", border: `1.5px solid ${C.line}`, borderRadius: 14, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 14, color: C.muted, flex: 1 }}>Escribir recomendación...</span>
              <div style={{ background: C.primary, color: "#fff", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 800 }}>Enviar</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 22, right: 28, background: C.gold, color: "#fff", borderRadius: 12, padding: "8px 18px", fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", opacity: interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        Panel Asesor
      </div>
    </AbsoluteFill>
  );
};
