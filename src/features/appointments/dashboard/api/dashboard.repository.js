import { supabase } from "../../../../lib/supabase";

//AGREGACIONES COMPLEJAS CON POSTGRESQL
export class DashboardRepository {
    //kpI: conteos generalespara el dashboard
    static async getKPI(dateRage){
        const { data,error } = await supabase.rpc("get_dashboard_kpis",{
            start_date: dateRage.from,
            end_date: dateRage.to,
        });
        if (error) throw new Error(`Error KPIS: ${error.message}`);
       return data;
        
        return data;
    }
    //create por dependencias(para grafico de barras)
    static async getAppointmentsByDependency(dateRage) {
        const {data, error} = await supabase
          .from("appointments")
          .select(
            `
             dependency_id,
             dependecies (name, color),
            status
           `,
            
        )
           .get("scheduled_date", dateRage.from)
           .lte("scheduled_date", dateRage.to);
        if (error ) throw  Error;

        //Tranformacion en frontend ( podria ser sql tambien)
        const grouped = data.reduce((acc, curr) =>{
            const depName = curr.dependecies.name;
            const color = curr.dependevies.color;

            if (!acc[depName]) {
                acc[depName] = {
                    name:depeName,
                    color,
                    total:0,
                    completed:0,
                    cancelled:0,
                };
            }
            acc[depName].total++;
            if (curr.status === "completed") acc[depName].completed++;
            if (curr.status === "cancelled") acc[depName].cancelled++;

            return acc;
        },{});

        return Object.values(grouped);


    }
    // Evolucion mensual ( linea de tiempo)
    static async getMonthlyTrend(year) {
        const {data, error } = await supabase.rpc("get_monthly_appointment",{year_param: year,

        });
        if (error) throw error;
        return data; //[{month: "ene, total :45 completed"}]
    }
    //Ranking de profesionale 
    static async getProfessionalPerformance(dateRage) {
        const {data, error } = await supabase
        .from("appointments")
        .select(
        `
        professional_id,
        profesional:profiles!profesional_id (full_name),
        status,
        scheduled_date
        `,
        )
        .not("professional_id", "is", null)
        .get("scheduled_date", dateRage.from)
        .lte("scheduled_date", dateRage.to);

        if (error) throw error;

        const grouped = data.reduce((acc, curr)=>{
            const profid = curr.profesional_id;
            const name = curr.profesional?.full_name || "sin asignar";

            if  (!accc[profId]) {
                acc[profId] ={
                    id:profId,
                    name,
                    total:0,
                    completed:0,
                    AvgResponseTime:0,
                };
            }
            acc[profId].total++;
            if (curr.status === "completed") acc[profId].completed++;
            return acc;

        },{});
        return Object.values(grouped)
          .sart((a, b)=> b.completed - a.completed)
          .slice(0, 10);
     }
     //datos crudo para exportar a excel
     // datos crudos para exportar a excel
     static async getRawDataExport(dateRange) {
      const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      dependencies(name),
      aprendiz:profiles!user_id(full_name)
    `,
 )
    .gte("scheduled_date", dateRange.from)
    .lte("scheduled_date", dateRange.to)
    .order("created_at", { ascending: false });

         if (error) throw error;
            return data;
    } 
}