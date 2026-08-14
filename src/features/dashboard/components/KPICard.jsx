import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function KPICard({ title, value, color, subtitle, trend, icon: Icon, isLoading }) {
  if (isLoading) {
    return (
      <div className="kpi-card" aria-busy="true" aria-label={`Cargando ${title}`}>
        <div className="kpi-card-header">
          <div className="skeleton skeleton-text" style={{ width: "60%" }} />
          <div className="skeleton skeleton-circle" style={{ width: 40, height: 40 }} />
        </div>
        <div className="skeleton skeleton-text" style={{ width: "40%", height: 32, marginTop: 8 }} />
        <div className="skeleton skeleton-text-sm" style={{ width: "80%", marginTop: 8 }} />
      </div>
    );
  }

  const getTrendIcon = () => {
    if (trend === 0 || trend === undefined) return <Minus size={12} />;
    return trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />;
  };

  const getTrendClass = () => {
    if (trend === 0 || trend === undefined) return "neutral";
    return trend > 0 ? "positive" : "negative";
  };

  return (
    <div
      className="kpi-card"
      style={{ "--kpi-color": color }}
      role="article"
      aria-label={`${title}: ${value}`}
    >
      <div className="kpi-card-header">
        <span className="kpi-card-label">{title}</span>
        {Icon && (
          <div
            className="kpi-card-icon"
            style={{
              backgroundColor: `${color}15`,
              color: color,
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="kpi-card-value" style={{ color }}>
        {value}
      </div>
      {subtitle && (
        <p className="kpi-card-subtitle">{subtitle}</p>
      )}
      {trend !== undefined && (
        <span className={`kpi-card-trend ${getTrendClass()}`}>
          {getTrendIcon()}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
}
