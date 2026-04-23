import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = {
  bg: "#f5f8fc",
  primary: "#166534",
  accent: "#059669",
  accentSoft: "#d9fbe8",
  ink: "#142315",
  muted: "#4a5f4d",
  line: "#d7e6da",
  surface: "#ffffff",
  surfaceSoft: "#eef7f0",
  blue: "#3b82f6",
  orange: "#f59e0b",
  purple: "#8b5cf6",
  gold: "#d97706",
};

const GridBg: React.FC = () => (
  <div style={{
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(to right, rgba(22,101,52,0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(22,101,52,0.05) 1px, transparent 1px)
    `,
    backgroundSize: "48px 48px",
  }} />
);

interface UserRow {
  name: string;
  email: string;
  spent: string;
  budgets: number;
  alert: boolean;
  avatar: string;
}

const users: UserRow[] = [
  { name: "María García", email: "m.garcia@mail.com", spent: "$241.300", budgets: 5, alert: false, avatar: "MG" },
  { name: "Carlos Ruiz", email: "c.ruiz@mail.com", spent: "$387.900", budgets: 3, alert: true, avatar: "CR" },
  { name: "Ana López", email: "a.lopez@mail.com", spent: "$98.450", budgets: 7, alert: false, avatar: "AL" },
  { name: "Diego Pérez", email: "d.perez@mail.com", spent: "$512.000", budgets: 2, alert: true, avatar: "DP" },
];

interface Comment {
  user: string;
  avatar: string;
  text: string;
  date: string;
  type: "warning" | "tip" | "positive";
}

const comments: Comment[] = [
  {
    user: "Carlos Ruiz",
    avatar: "CR",
    text: "🔴 Superaste tu presupuesto de ocio en un 35%. Recomiendo revisar suscripciones duplicadas.",
    date: "Hace 2 hs",
    type: "warning",
  },
  {
    user: "Diego Pérez",
    avatar: "DP",
    text: "⚠️ Tu gasto en transporte es 2x mayor al promedio. ¿Evaluaste alternativas de movilidad?",
    date: "Hace 5 hs",
    type: "warning",
  },
  {
    user: "María García",
    avatar: "MG",
    text: "✅ Excelente mes, María. Tu ahorro creció 18%. Considerá aumentar la meta de vacaciones.",
    date: "Ayer",
    type: "positive",
  },
  {
    user: "Ana López",
    avatar: "AL",
    text: "💡 Con tu ritmo actual, alcanzarás tu fondo de emergencia en 4 meses. ¡Muy bien!",
    date: "Ayer",
    type: "tip",
  },
];

const typeColors: Record<string, string> = {
  warning: "#dc2626",
  tip: C.blue,
  positive: C.accent,
};

const typeBg: Record<string, string> = {
  warning: "#fef2f2",
  tip: "#eff6ff",
  positive: C.accentSoft,
};

export const AdvisorPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const headerY = interpolate(frame, [0, 25], [-20, 0], { extrapolateRight: "clamp" });

  const badgeS = spring({ frame, fps, config: { damping: 12, stiffness: 100 }, durationInFrames: 30 });

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: "'Manrope',sans-serif", overflow: "hidden" }}>
      <GridBg />

      <div style={{ position: "absolute", inset: 0, padding: "32px 60px", display: "flex", flexDirection: "column" }}>
        <div style={{
          opacity: headerOp,
          transform: `translateY(${headerY}px)`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 22,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: C.gold, textTransform: "uppercase", letterSpacing: "0.22em" }}>ROL ASESOR</p>
              <div style={{
                background: `${C.gold}18`,
                border: `1px solid ${C.gold}44`,
                borderRadius: 6,
                padding: "2px 10px",
                transform: `scale(${badgeS})`,
              }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: C.gold, textTransform: "uppercase", letterSpacing: "0.12em" }}>advisor@wisepocket.com</span>
              </div>
            </div>
            <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 34, fontWeight: 900, color: C.ink }}>Panel del Asesor</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>Gestión de clientes · comentarios · recomendaciones</p>
          </div>

          <div style={{ display: "flex", gap: 14 }}>
            {[
              { label: "Usuarios", value: "24", icon: "👥" },
              { label: "Alertas", value: "6", icon: "🔔", accent: true },
              { label: "Prom. gasto", value: "$184K", icon: "📊" },
            ].map((s, i) => (
              <div key={s.label} style={{
                background: s.accent ? `${C.orange}12` : C.surface,
                border: `1.5px solid ${s.accent ? `${C.orange}44` : C.line}`,
                borderRadius: 14,
                padding: "14px 18px",
                textAlign: "center",
                boxShadow: "0 4px 16px rgba(20,35,21,0.06)",
                opacity: interpolate(frame, [10 + i * 8, 30 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                transform: `translateY(${interpolate(frame, [10 + i * 8, 30 + i * 8], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
              }}>
                <p style={{ margin: 0, fontSize: 20 }}>{s.icon}</p>
                <p style={{ margin: "4px 0 0", fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 900, color: s.accent ? C.orange : C.primary }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24, flex: 1 }}>
          <div style={{
            background: C.surface,
            border: `1.5px solid ${C.line}`,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 8px 28px rgba(20,35,21,0.07)",
            opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: C.ink }}>Mis usuarios</h3>
              <div style={{ background: C.accentSoft, borderRadius: 8, padding: "4px 12px" }}>
                <input
                  type="text"
                  readOnly
                  value="Buscar usuario..."
                  style={{ background: "transparent", border: "none", outline: "none", fontSize: 11, color: C.muted, fontFamily: "'Manrope',sans-serif", cursor: "default", width: 120 }}
                />
              </div>
            </div>

            <div style={{ padding: "8px 0" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: 0,
                padding: "8px 20px",
                fontSize: 10,
                fontWeight: 800,
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                borderBottom: `1px solid ${C.line}`,
              }}>
                <span>Usuario</span>
                <span style={{ textAlign: "right", marginRight: 20 }}>Gasto mes</span>
                <span style={{ textAlign: "right", marginRight: 20 }}>Presupuestos</span>
                <span style={{ textAlign: "right" }}>Estado</span>
              </div>

              {users.map((u, i) => (
                <div key={u.name} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto",
                  gap: 0,
                  padding: "12px 20px",
                  borderBottom: `1px solid ${C.line}`,
                  background: i === 1 ? `${C.orange}06` : i === 3 ? `${C.orange}06` : "transparent",
                  opacity: interpolate(frame, [30 + i * 10, 50 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  transform: `translateX(${interpolate(frame, [30 + i * 10, 50 + i * 10], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
                  alignItems: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: u.alert ? `${C.orange}22` : C.accentSoft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 900,
                      color: u.alert ? C.orange : C.primary,
                    }}>
                      {u.avatar}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.ink }}>{u.name}</p>
                      <p style={{ margin: 0, fontSize: 10, color: C.muted }}>{u.email}</p>
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 900, color: C.ink, marginRight: 20 }}>{u.spent}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginRight: 20, textAlign: "center" }}>{u.budgets}</span>
                  <div style={{
                    background: u.alert ? `${C.orange}20` : `${C.accent}20`,
                    color: u.alert ? C.orange : C.accent,
                    borderRadius: 6,
                    padding: "3px 10px",
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    whiteSpace: "nowrap",
                  }}>
                    {u.alert ? "⚠ Alerta" : "✓ OK"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            background: C.surface,
            border: `1.5px solid ${C.line}`,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 8px 28px rgba(20,35,21,0.07)",
            opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.line}` }}>
              <h3 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: C.ink }}>Comentarios del asesor</h3>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: C.muted }}>Recomendaciones enviadas a usuarios</p>
            </div>

            <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 10, overflowY: "hidden" }}>
              {comments.map((c, i) => (
                <div key={i} style={{
                  background: typeBg[c.type],
                  border: `1.5px solid ${typeColors[c.type]}30`,
                  borderLeft: `3px solid ${typeColors[c.type]}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  opacity: interpolate(frame, [40 + i * 10, 60 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  transform: `translateX(${interpolate(frame, [40 + i * 10, 60 + i * 10], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: `${typeColors[c.type]}22`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 900,
                      color: typeColors[c.type],
                    }}>
                      {c.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: C.ink }}>{c.user}</span>
                    </div>
                    <span style={{ fontSize: 10, color: C.muted }}>{c.date}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: C.ink, lineHeight: 1.4, fontWeight: 600 }}>{c.text}</p>
                </div>
              ))}
            </div>

            <div style={{
              padding: "12px 16px",
              borderTop: `1px solid ${C.line}`,
              opacity: interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}>
              <div style={{ background: C.surfaceSoft, border: `1.5px solid ${C.line}`, borderRadius: 12, padding: "10px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: C.muted, flex: 1 }}>Escribir recomendación...</span>
                <div style={{ background: C.primary, color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 800 }}>
                  Enviar
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        position: "absolute",
        top: 20,
        right: 24,
        background: C.gold,
        color: "#fff",
        borderRadius: 10,
        padding: "6px 14px",
        fontFamily: "'Manrope',sans-serif",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        Panel Asesor
      </div>
    </AbsoluteFill>
  );
};
