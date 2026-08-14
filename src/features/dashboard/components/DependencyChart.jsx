export function DependencyChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>Citas por Dependencia</h3>
        <div className="empty-state-compact">
          <p>No hay datos disponibles para este período</p>
        </div>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.total));

  return (
    <div className="chart-container">
      <h3>Citas por Dependencia</h3>
      <div className="simple-bars">
        {data.map((item, i) => (
          <div key={i} className="simple-bar-row">
            <span className="simple-bar-label">{item.name}</span>
            <div className="simple-bar-track">
              <div
                className="simple-bar-fill"
                style={{
                  width: `${max > 0 ? (item.total / max) * 100 : 0}%`,
                  backgroundColor: item.color || "#22c55e",
                }}
              />
            </div>
            <span className="simple-bar-value">{item.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
