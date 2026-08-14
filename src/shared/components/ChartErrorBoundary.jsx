import { Component } from "react";

export class ChartErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="chart-container">
          <h3>{this.props.title || "Gráfica"}</h3>
          <div className="empty-state-compact">
            <p>Error cargando la gráfica. Los datos están disponibles en la pestaña de Citas.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
