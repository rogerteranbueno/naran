export default function KPICard({ label, value, sub, color = '#E07A5F' }) {
  return (
    <div className="bg-white rounded-2xl border border-border/40 px-4 py-4 shadow-sm">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-semibold" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}