interface MetricCardProps {
  label: string;
  value: string;
  tone?: 'neutral' | 'good' | 'bad';
  hint?: string;
}

export default function MetricCard({ label, value, tone = 'neutral', hint }: MetricCardProps) {
  return (
    <div className={`metric-card tone-${tone}`}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
      {hint && <span className="metric-hint">{hint}</span>}
    </div>
  );
}
