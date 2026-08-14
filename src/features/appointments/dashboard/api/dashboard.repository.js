import { supabase } from "../../../../lib/supabase";

export class DashboardRepository {
  // KPI: conteos generales - consulta directa sin RPC
  static async getKPIs(dateRange) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("status, scheduled_date, created_at, updated_at")
        .gte("scheduled_date", dateRange.from)
        .lte("scheduled_date", dateRange.to);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const total = data.length;
      const completed = data.filter((a) => a.status === "completed").length;
      const cancelled = data.filter((a) => a.status === "cancelled").length;
      const noShow = data.filter((a) => a.status === "no_show").length;

      const completedWithTime = data.filter(
        (a) => a.status === "completed" && a.created_at && a.updated_at
      );
      const avgDays =
        completedWithTime.length > 0
          ? completedWithTime.reduce((sum, a) => {
              const diff =
                (new Date(a.updated_at) - new Date(a.created_at)) /
                (1000 * 60 * 60 * 24);
              return sum + diff;
            }, 0) / completedWithTime.length
          : 0;

      return [
        {
          total_appointments: total,
          completed_appointments: completed,
          cancelled_appointments: cancelled,
          no_show_count: noShow,
          avg_wait_days: Math.round(avgDays * 10) / 10,
        },
      ];
    } catch (err) {
      console.error("Error KPIs:", err);
      return [];
    }
  }

  // Citas por dependencia
  static async getAppointmentsByDependency(dateRange) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          dependency_id,
          dependencies!appointments_dependency_id_fkey (name, color),
          status
        `)
        .gte("scheduled_date", dateRange.from)
        .lte("scheduled_date", dateRange.to);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const grouped = data.reduce((acc, curr) => {
        const depName = curr.dependencies?.name || "Sin dependencia";
        const color = curr.dependencies?.color || "#6b7280";
        if (!acc[depName]) {
          acc[depName] = { name: depName, color, total: 0, completed: 0, cancelled: 0 };
        }
        acc[depName].total++;
        if (curr.status === "completed") acc[depName].completed++;
        if (curr.status === "cancelled") acc[depName].cancelled++;
        return acc;
      }, {});

      return Object.values(grouped);
    } catch (err) {
      console.error("Error byDependency:", err);
      return [];
    }
  }

  // Evolución mensual - consulta directa sin RPC
  static async getMonthlyTrend(year) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("scheduled_date, status")
        .gte("scheduled_date", `${year}-01-01`)
        .lte("scheduled_date", `${year}-12-31`);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const months = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
      ];

      const grouped = data.reduce((acc, curr) => {
        const monthIndex = new Date(curr.scheduled_date).getMonth();
        const monthName = months[monthIndex];
        if (!acc[monthName]) {
          acc[monthName] = { month: monthName, total: 0, completed: 0, index: monthIndex };
        }
        acc[monthName].total++;
        if (curr.status === "completed") acc[monthName].completed++;
        return acc;
      }, {});

      return Object.values(grouped).sort((a, b) => a.index - b.index);
    } catch (err) {
      console.error("Error monthlyTrend:", err);
      return [];
    }
  }

  // Ranking de profesionales
  static async getProfessionalPerformance(dateRange) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          professional_id,
          professional:profiles!appointments_professional_id_fkey (full_name),
          status,
          scheduled_date
        `)
        .not("professional_id", "is", null)
        .gte("scheduled_date", dateRange.from)
        .lte("scheduled_date", dateRange.to);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const grouped = data.reduce((acc, curr) => {
        const profId = curr.professional_id;
        const name = curr.professional?.full_name || "sin asignar";
        if (!acc[profId]) {
          acc[profId] = { id: profId, name, total: 0, completed: 0, avgResponseTime: 0 };
        }
        acc[profId].total++;
        if (curr.status === "completed") acc[profId].completed++;
        return acc;
      }, {});

      return Object.values(grouped)
        .sort((a, b) => b.completed - a.completed)
        .slice(0, 10);
    } catch (err) {
      console.error("Error professionalPerformance:", err);
      return [];
    }
  }

  // Datos crudos para exportar
  static async getRawDataExport(dateRange) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          dependencies!appointments_dependency_id_fkey(name),
          aprendiz:profiles!appointments_user_id_fkey(full_name, document_number),
          profesional:profiles!appointments_professional_id_fkey(full_name)
        `)
        .gte("scheduled_date", dateRange.from)
        .lte("scheduled_date", dateRange.to)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error rawDataExport:", err);
      return [];
    }
  }
}
