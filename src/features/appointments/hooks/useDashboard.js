import { useState, useCallback } from "react";
import { DashboardRepository } from "../dashboard/api/dashboard.repository";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, format } from "date-fns";

export function useDashboard() {
    const [kpis, setkpis] = useState(null);
    const [byDependecy, setByDependency] = useState([]);
    const [monthlyTrend, setMonthlyTrend] = useState([]);
    const [profesionals, setProfesionals] = useState([]);
    const [loading, setloading] = useState(false);

    const dateRange = {
        from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
        to: format(endOfMonth(new Date()), "yyyy-MM-dd"),

    };
    const fetchAllMetrics = useCallback(async (customRange = null) =>{
        setloading(true);
        const range = customRange || dateRange;
        try {
            const [kpiData, byData, trendData, profData] = await Promise.all([
                DashboardRepository.getKPIs(range),
                DashboardRepository.getAppointmentsByDependency(range),
                DashboardRepository.getMonthlyTrend(new Date().getFullYear()),
                DashboardRepository.getProfessionalPerformance(range),
            ]);
            setkpis(kpiData[0]);//la funcion retorna array con un objecto dentro
            setByDependency(deoData);
            setMonthlyTrend(trendData);
            setProfesionals(profData);

        }catch (err) {
            toast.errror("Error cargado metricas");
            console.error(err);
        }finally {
            setloading(false);
        }
    },[]);
    const exporToCSV = async (range = null ) => {
        try {
            const data = await DashboardRepository.getRawDataForExport(range || dateRange

            );

           //TRanformar a formato plano para excel
           const flatData = data.map((row)=> ({
            ID: row.id,
            Fecha_Cita: row.scheduled_date,
            Hora: row.scheduled_time,
            Dependencia: row.Dependencies?.name,
            Aprendiz:row.Aprendiz?.full_name,
            Documento: row.aprendiz?.document_number,
            Profesional: row.profesional?.full_name || "sin asignar",
            Estado: row.status,
            Motivo: row.reason,
            Nota:row.notes,
            Feha_creacion: row.created_at,

           }));
             //crear CSV
             const headers = Object.keys(flatData[0]);
             const csv = [
                headers.join(","),
                ...flatData.map((row) => 
                    headers.map((h) => `"${row[h] ||""}"`).join(","),
            ),
             ].join("\n");

             //Descargar archivo
             const blob = new blob([csv], { type: "text/csv;charset=utf-8"});
             const link = document.createElement("a");
             link.href =URL.createObjectURL(blob);
             link.download = `reporte_bienestar_${format(new Date(), "yyyy-MM-dd")}.csv`;
             link.click();

             toast.success("Reporte descargado");


        }catch (err) {
            toast.error("Error exportando datos");

        }
    };
    return {
        kpis,
        byDependecy,
        monthlyTrend,
        profesionals,
        
        loading,
        fetchAllMetrics,
        exporToCSV,
    };
}