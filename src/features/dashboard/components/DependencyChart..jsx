import{
    Barchart,
    Bar,
    xAXis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
export function DependencyChart({ data}) {
    return (
        <div className="chart-container">
            <h3>Citas por Dependencia</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3">
                        <xAxis data="name"/>
                        <YAxis />
                        <Tooltip/>
                        <Bar datakey="total" name="Total">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </CartesianGrid>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}