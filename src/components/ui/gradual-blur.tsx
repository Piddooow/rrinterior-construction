/**
 * GradualBlur — blur progresif di tepi viewport (default: tepi bawah).
 *
 * Enam lapisan bertumpuk: setiap lapisan menambah blur yang sama, dan mask
 * gradien membuat lapisan yang paling dekat tepi menerima tumpukan
 * terbanyak — jadi kekaburan meningkat mulus ke arah tepi tanpa garis
 * batas yang terlihat. Murni CSS (backdrop-filter + mask), tanpa JS,
 * pointer-events-none, dan statis (aman untuk reduced-motion).
 *
 * Dipasang global di layout publik (admin memakai layout sendiri).
 */
export function GradualBlur({
  position = "bottom",
  height = "4rem",
  strength = 2,
  divCount = 6,
  className,
}: {
  position?: "top" | "bottom";
  height?: string;
  /** Kekuatan total (blur maksimum di tepi = strength × 6 px). */
  strength?: number;
  divCount?: number;
  className?: string;
}) {
  const blurPx = (strength * 6) / divCount;
  const toEdge = position === "bottom" ? "to top" : "to bottom";

  const layers = Array.from({ length: divCount }, (_, index) => {
    const startPct = ((divCount - 1 - index) / divCount) * 100;
    const endPct = ((divCount - index) / divCount) * 100;
    const mask = `linear-gradient(${toEdge}, #000 0%, #000 ${startPct.toFixed(
      2
    )}%, transparent ${endPct.toFixed(2)}%)`;
    return (
      <div
        key={index}
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backdropFilter: `blur(${blurPx.toFixed(2)}px)`,
          WebkitBackdropFilter: `blur(${blurPx.toFixed(2)}px)`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
    );
  });

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 z-30 ${
        position === "bottom" ? "bottom-0" : "top-0"
      }${className ? ` ${className}` : ""}`}
      style={{ height }}
    >
      {layers}
    </div>
  );
}
