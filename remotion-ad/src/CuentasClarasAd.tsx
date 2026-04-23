import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Intro } from "./scenes/Intro";
import { Dashboard } from "./scenes/Dashboard";
import { Expenses } from "./scenes/Expenses";
import { Budgets } from "./scenes/Budgets";
import { Savings } from "./scenes/Savings";
import { UploadTicket } from "./scenes/UploadTicket";
import { AdvisorPanel } from "./scenes/AdvisorPanel";
import { CTA } from "./scenes/CTA";

// Scene durations in frames at 30fps
const SCENES = [
  { name: "Intro",        start: 0,   duration: 120 }, // 0-4s
  { name: "Dashboard",   start: 110,  duration: 130 }, // 3.67-8s
  { name: "Expenses",    start: 230,  duration: 110 }, // 7.67-11.33s
  { name: "Budgets",     start: 330,  duration: 115 }, // 11-14.83s
  { name: "Savings",     start: 435,  duration: 115 }, // 14.5-18.17s
  { name: "Upload",      start: 540,  duration: 120 }, // 18-22s
  { name: "Advisor",     start: 650,  duration: 130 }, // 21.67-26s
  { name: "CTA",         start: 770,  duration: 130 }, // 25.67-30s
];

const TOTAL_FRAMES = 900; // 30s at 30fps

const SceneLabel: React.FC<{ label: string; visible: boolean }> = ({ label, visible }) => (
  <div style={{
    position: "absolute",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(20,35,21,0.7)",
    backdropFilter: "blur(8px)",
    borderRadius: 99,
    padding: "6px 18px",
    fontFamily: "'Manrope',sans-serif",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.15em",
    color: "#d9fbe8",
    textTransform: "uppercase",
    opacity: visible ? 1 : 0,
    transition: "opacity 0.3s",
    pointerEvents: "none",
    zIndex: 50,
  }}>
    {label}
  </div>
);

const ProgressBar: React.FC<{ frame: number; total: number }> = ({ frame, total }) => {
  const pct = (frame / total) * 100;
  return (
    <div style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      background: "rgba(20,35,21,0.15)",
      zIndex: 100,
    }}>
      <div style={{
        height: "100%",
        width: `${pct}%`,
        background: "linear-gradient(90deg, #059669, #166534)",
      }} />
    </div>
  );
};

const FadeTransition: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const opacity = interpolate(frame, [from, (from + to) / 2, to], [0, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      background: "#142315",
      opacity,
      zIndex: 80,
      pointerEvents: "none",
    }} />
  );
};

export const CuentasClarasAd: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const transitions = [
    { from: 105, to: 125 },
    { from: 225, to: 245 },
    { from: 325, to: 345 },
    { from: 430, to: 450 },
    { from: 535, to: 555 },
    { from: 645, to: 665 },
    { from: 765, to: 780 },
  ];

  return (
    <AbsoluteFill style={{ background: "#f8faf8", overflow: "hidden" }}>
      <Sequence from={SCENES[0].start} durationInFrames={SCENES[0].duration + 20}>
        <Intro />
      </Sequence>

      <Sequence from={SCENES[1].start} durationInFrames={SCENES[1].duration + 20}>
        <Dashboard />
      </Sequence>

      <Sequence from={SCENES[2].start} durationInFrames={SCENES[2].duration + 20}>
        <Expenses />
      </Sequence>

      <Sequence from={SCENES[3].start} durationInFrames={SCENES[3].duration + 20}>
        <Budgets />
      </Sequence>

      <Sequence from={SCENES[4].start} durationInFrames={SCENES[4].duration + 20}>
        <Savings />
      </Sequence>

      <Sequence from={SCENES[5].start} durationInFrames={SCENES[5].duration + 20}>
        <UploadTicket />
      </Sequence>

      <Sequence from={SCENES[6].start} durationInFrames={SCENES[6].duration + 20}>
        <AdvisorPanel />
      </Sequence>

      <Sequence from={SCENES[7].start} durationInFrames={SCENES[7].duration + 20}>
        <CTA />
      </Sequence>

      {transitions.map((t, i) => (
        <FadeTransition key={i} frame={frame} from={t.from} to={t.to} />
      ))}

      <ProgressBar frame={frame} total={TOTAL_FRAMES} />
    </AbsoluteFill>
  );
};
