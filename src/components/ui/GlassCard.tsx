type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  bright?: boolean;
};

export function GlassCard({ children, className = "", bright = false }: GlassCardProps) {
  return (
    <div
      className={`${
        bright ? "glass-bright" : "glass"
      } rounded-2xl p-5 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
