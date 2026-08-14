// ============================================================
// TYPES - Gestión de Citas Bienestar SENA
// Alineados con la implementación real del proyecto
// ============================================================

// ==================== ROLES Y AUTENTICACIÓN ====================

export type UserRole =
  | "SUPERADMIN"
  | "COORDINACION"
  | "PSICOLOGIA"
  | "ENFERMERIA"
  | "TRABAJO_SOCIAL"
  | "APRENDIZ";

export interface Role {
  id: string;
  name: UserRole;
  permissions?: Record<string, unknown>;
}

export interface Dependency {
  id: string;
  name: string;
  color: string;
  head_dependency_id?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  document_number: string;
  is_active: boolean;
  role_id?: string;
  dependency_id?: string;
  created_at?: string;
  updated_at?: string;
  phone?: string;
  avatar_url?: string;
  roles?: Role;
  dependencies?: Dependency;
}

export interface AuthState {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (
    email: string,
    password: string,
    userData: SignUpData
  ) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<AuthResult>;
  hasRole: (requiredRoles: UserRole | UserRole[]) => boolean;
  isAdmin: () => boolean;
  isCoordination: () => boolean;
  isProfessional: () => boolean;
  isAprendiz: () => boolean;
}

export interface SignUpData {
  full_name: string;
  document_number: string;
}

export interface AuthResult {
  success: boolean;
  data?: unknown;
  error?: string;
  needsConfirmation?: boolean;
}

// ==================== CITAS ====================

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Appointment {
  id: string;
  user_id: string;
  professional_id?: string;
  dependency_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  dependencies?: Dependency;
  profiles?: UserProfile;
  professional?: UserProfile;
}

export interface AppointmentFormData {
  dependency_id: string;
  scheduled_date: string;
  scheduled_time: string;
  reason: string;
  notes?: string;
}

export interface AppointmentFetchFilters {
  userId?: string;
  dependencyId?: string;
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface AppointmentUpdate {
  status?: AppointmentStatus;
  notes?: string;
}

// ==================== DASHBOARD Y MÉTRICAS ====================

export interface DashboardKPI {
  total_appointments: number;
  completed_appointments: number;
  avg_wait_days: number;
  no_show_count: number;
}

export interface DependencyStats {
  name: string;
  color: string;
  total: number;
  completed: number;
  cancelled: number;
}

export interface MonthlyTrendData {
  month: string;
  total: number;
  completed: number;
}

export interface ProfessionalPerformance {
  id: string;
  name: string;
  total: number;
  completed: number;
}

// ==================== FILTROS Y UTILIDADES ====================

export interface DateRange {
  from: string;
  to: string;
}

export type LoadingStatus = "idle" | "creating" | "fetching" | "updating" | "error";

// ==================== EXPORTACIÓN ====================

export interface ExportRow {
  ID: string;
  Fecha_Cita: string;
  Hora: string;
  Dependencia: string;
  Aprendiz: string;
  Documento: string;
  Profesional: string;
  Estado: string;
  Motivo: string;
  Nota: string;
  Fecha_creacion: string;
}

// ==================== RESPUESTAS API ====================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

// ==================== GESTIÓN DE USUARIOS ====================

export interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  roleId: string;
  dependencyId: string;
}

export interface UpdateUserData {
  email?: string;
  fullName?: string;
  roleId?: string;
  dependencyId?: string;
  is_active?: boolean;
}

export interface UserWithRelations extends UserProfile {
  roles?: Role;
  dependencies?: Dependency;
}
