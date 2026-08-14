export function ProfessionalTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="professionals-section">
        <h3>Top Profesionales</h3>
        <div className="empty-state-compact">
          <p>No hay datos de profesionales para este período</p>
        </div>
      </div>
    );
  }

  return (
    <div className="professionals-section">
      <h3>Top Profesionales</h3>
      <div className="table-container">
        <table className="profesional-table" aria-label="Rendimiento de profesionales">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Nombre</th>
              <th scope="col">Total Citas</th>
              <th scope="col">Completadas</th>
              <th scope="col">Eficiencia</th>
            </tr>
          </thead>
          <tbody>
            {data.map((prof, index) => {
              const efficiency =
                prof.total > 0
                  ? Math.round((prof.completed / prof.total) * 100)
                  : 0;
              return (
                <tr key={prof.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 500 }}>{prof.name}</td>
                  <td>{prof.total}</td>
                  <td>{prof.completed}</td>
                  <td>
                    <div className="efficiency-bar">
                      <span>{efficiency}%</span>
                      <div className="efficiency-fill">
                        <div
                          className="efficiency-fill-bar"
                          style={{
                            width: `${efficiency}%`,
                            backgroundColor:
                              efficiency >= 80
                                ? "var(--success)"
                                : efficiency >= 60
                                ? "var(--warning)"
                                : "var(--error)",
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
