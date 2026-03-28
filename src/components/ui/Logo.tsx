import React from "react";

type LogoSize = "sm" | "md" | "lg";
type LogoVariant = "light" | "dark";

interface LogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  showDot?: boolean;
  className?: string;
}

// ViewBox calibrated for ~32px font-size, weight 800, letter-spacing -0.96
// Text "NutriGenius" ≈ 176px wide; dot sits right of the trailing "s"
const VB_W = 190;
const VB_H = 36;

const SIZE_H: Record<LogoSize, number> = { sm: 20, md: 28, lg: 36 };

const COLORS: Record<LogoVariant, { nutri: string; genius: string; dot: string }> = {
  light: { nutri: "#111c2c", genius: "#00685f", dot: "#00685f" },
  dark:  { nutri: "#ebf1ff", genius: "#6bd8cb", dot: "#6bd8cb" },
};

export function Logo({
  size = "md",
  variant = "light",
  showDot = true,
  className,
}: LogoProps) {
  const h = SIZE_H[size];
  const w = Math.round((h * VB_W) / VB_H);
  const c = COLORS[variant];

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={w}
      height={h}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NutriGenius"
      role="img"
      className={className}
      style={{ overflow: "visible", flexShrink: 0 }}
    >
      <text
        y="28"
        style={{
          fontFamily:
            "var(--font-plus-jakarta, 'Plus Jakarta Sans', sans-serif)",
          fontWeight: 800,
          fontSize: "32px",
          letterSpacing: "-0.96px",
        }}
      >
        <tspan fill={c.nutri}>Nutri</tspan>
        <tspan fill={c.genius}>Genius</tspan>
      </text>
      {showDot && (
        <circle cx="183" cy="4" r="2.5" fill={c.dot} />
      )}
    </svg>
  );
}
