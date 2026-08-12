/**
 * Subtle mountain-peak backdrop inspired by the Aberdeen logo's two triangles
 * ("reminiscent of the two mountain peaks from our original logo" — Style Guide).
 * Rendered as SVG so it scales cleanly and takes zero payload.
 */
export function MountainsBackdrop({
  className = "",
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "hero";
}) {
  if (variant === "hero") {
    return (
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      >
        {/* Left navy triangle (echoes the "A" mark on the logo) */}
        <svg
          viewBox="0 0 800 600"
          className="absolute -left-40 top-24 h-[520px] w-[520px] opacity-[0.06]"
          fill="none"
        >
          <path
            d="M400 40 L740 560 L60 560 Z"
            stroke="#09375F"
            strokeWidth="1.5"
          />
        </svg>
        {/* Right teal triangle (mirrored) */}
        <svg
          viewBox="0 0 800 600"
          className="absolute -right-32 top-40 h-[600px] w-[600px] opacity-[0.10]"
          fill="none"
        >
          <path
            d="M320 20 L720 560 L20 560 Z"
            stroke="#44B0B1"
            strokeWidth="1.5"
          />
          <path
            d="M320 20 L720 560 L20 560 Z"
            fill="url(#tealFade)"
          />
          <defs>
            <linearGradient id="tealFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#44B0B1" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#44B0B1" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        {/* Diagonal wash — echo of Style Guide cover */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(68,176,177,0.10),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(9,55,95,0.06),transparent_55%)]" />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 1200 400"
        className="absolute inset-x-0 bottom-0 h-64 w-full opacity-[0.06]"
        fill="none"
      >
        <path
          d="M0 400 L280 120 L440 260 L680 60 L900 220 L1200 100 L1200 400 Z"
          fill="#09375F"
        />
        <path
          d="M0 400 L220 200 L400 320 L620 180 L840 300 L1050 200 L1200 260 L1200 400 Z"
          fill="#44B0B1"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}
