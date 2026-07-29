export function GridOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[55] max-sm:hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
      }}
    />
  );
}
