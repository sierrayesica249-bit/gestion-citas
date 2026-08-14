import { useState, useCallback } from "react";
import { AdminRepository } from "../api/admin_repository";
import { useAuth } from "../../../../providers/AuthProvider";
import { toast } from "sonner";

export function useAdmin() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
    const [loading, setLoading] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditPagination, setAuditPagination] = useState({ total: 0, page: 1 });
    const [roles, setRoles] = useState([]);
    const [dependencies, setDependencies] = useState([]);

    const fetchUsers = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const result = await AdminRepository.getUsers(filters);
            setUsers(result.users);
            setPagination({ total: result.total, page: result.page, totalPages: result.totalPages });
        } catch (err) {
            toast.error("Error cargando usuarios");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRoles = useCallback(async () => {
        try {
            const data = await AdminRepository.getRoles();
            setRoles(data);
        } catch (err) {
            console.error("Error cargando roles", err);
        }
    }, []);

    const fetchDependencies = useCallback(async () => {
        try {
            const data = await AdminRepository.getDependencies();
            setDependencies(data);
        } catch (err) {
            console.error("Error cargando dependencias", err);
        }
    }, []);

    const createUser = useCallback(async (userData) => {
        try {
            await AdminRepository.createUser(userData, user?.id);
            toast.success("Usuario creado correctamente");
            fetchUsers();
            return { success: true };
        } catch (err) {
            toast.error("Error creando usuario: " + err.message);
            return { success: false, error: err.message };
        }
    }, [fetchUsers, user]);

    const updateUserRoles = useCallback(async (userId, updates) => {
        try {
            await AdminRepository.updateUser(userId, updates, user?.id);
            toast.success("Usuario actualizado");
            fetchUsers();
        } catch (err) {
            toast.error("Error actualizando usuario");
            console.error(err);
        }
    }, [fetchUsers, user]);

    const fetchAuditLogs = useCallback(async (filters = {}) => {
        try {
            const result = await AdminRepository.getAuditLogs(filters);
            setAuditLogs(result.logs || []);
            setAuditPagination({ total: result.total || 0, page: filters.page || 1 });
        } catch (err) {
            toast.error("Error cargando auditoria");
            console.error(err);
        }
    }, []);

    return {
        users,
        pagination,
        loading,
        fetchUsers,
        updateUserRoles,
        auditLogs,
        auditPagination,
        fetchAuditLogs,
        roles,
        fetchRoles,
        dependencies,
        fetchDependencies,
        createUser,
    };
}
