import { AbsoluteFill, interpolate } from "remotion";

export const SlideTransition: React.FC<{ progress: number; direction?: "left" | "right" | "up" }> = ({
  progress,
  direction = "left",
}) => {
  const opacity = interpolate(progress, [0, 0.5, 1], [0, 1, 0]);

  const transforms: Record<string, string> = {
    left: `scaleX(${interpolate(progress, [0, 0.5, 1], [0, 1, 0])})`,
    right: `scaleX(${interpolate(progress, [0, 0.5, 1], [0, 1, 0])})`,
    up: `scaleY(${interpolate(progress, [0, 0.5, 1], [0, 1, 0])})`,
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 100 }}>
      <div style={{
        position: "absolute",
        inset: 0,
        background: "#142315",
        opacity,
        transformOrigin: direction === "right" ? "right" : "left",
        transform: transforms[direction],
      }} />
    </AbsoluteFill>
  );
};
