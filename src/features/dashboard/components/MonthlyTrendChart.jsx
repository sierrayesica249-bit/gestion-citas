import{
    lineaChart,
    line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,

}from "recharts";

export function MonthlyTrendChart({ data}) {
    return (
        <div className="chart-container">
            <h3>Tendencia Anual</h3>
            <ResponsiveContainer width= "100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strKeDasharray="3 3"/>
                        <XAxis dataKey="month" />
                        <YAxis/>
                        <Tooltip/>
                        <Legend/>
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke="#39A900"
                            name="Total"
                            strKeWidth={2}
                        /> 
                        <Line
                             type="monotone"
                             dataKey="completed"
                             stroke="#22c55e"
                             name="Completed"
                        />
                   
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}