export function MonthlyTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>Tendencia Mensual</h3>
        <div className="empty-state-compact">
          <p>No hay datos disponibles para este período</p>
        </div>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => Math.max(d.total || 0, d.completed || 0)));

  return (
    <div className="chart-container">
      <h3>Tendencia Mensual</h3>
      <div className="simple-bars">
        {data.map((item, i) => (
          <div key={i} className="simple-bar-row">
            <span className="simple-bar-label">{item.month}</span>
            <div className="simple-bar-track">
              <div
                className="simple-bar-fill"
                style={{
                  width: `${max > 0 ? ((item.total || 0) / max) * 100 : 0}%`,
                  backgroundColor: "#3b82f6",
                }}
              />
              <div
                className="simple-bar-fill"
                style={{
                  width: `${max > 0 ? ((item.completed || 0) / max) * 100 : 0}%`,
                  backgroundColor: "#22c55e",
                }}
              />
            </div>
            <span className="simple-bar-value">{item.total}</span>
          </div>
        ))}
      </div>
      <div className="simple-legend">
        <span><span className="legend-dot" style={{ background: "#3b82f6" }} /> Total</span>
        <span><span className="legend-dot" style={{ background: "#22c55e" }} /> Completadas</span>
      </div>
    </div>
  );
}
