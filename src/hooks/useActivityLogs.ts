import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActivityLog {
    id: string;
    adminId: string;
    adminEmail: string;
    actionType: string;
    entityType: string;
    entityId: string;
    entityName: string | null;
    changes: Record<string, unknown> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

interface UseActivityLogsOptions {
    adminId?: string;
    actionType?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
    pageSize?: number;
}

// Transform database record (snake_case) to ActivityLog interface (camelCase)
function transformLog(dbLog: any): ActivityLog {
    return {
        id: dbLog.id,
        adminId: dbLog.admin_id,
        adminEmail: dbLog.admin_email,
        actionType: dbLog.action_type,
        entityType: dbLog.entity_type,
        entityId: dbLog.entity_id,
        entityName: dbLog.entity_name,
        changes: dbLog.changes,
        ipAddress: dbLog.ip_address,
        userAgent: dbLog.user_agent,
        createdAt: dbLog.created_at,
    };
}

export function useActivityLogs(options: UseActivityLogsOptions = {}) {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const pageSize = options.pageSize || 20;

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from("admin_activity_logs")
                .select("*")
                .order("created_at", { ascending: false })
                .range((page - 1) * pageSize, page * pageSize - 1);

            // Apply filters
            if (options.adminId) {
                query = query.eq("admin_id", options.adminId);
            }

            if (options.actionType) {
                query = query.eq("action_type", options.actionType);
            }

            if (options.entityType) {
                query = query.eq("entity_type", options.entityType);
            }

            if (options.startDate) {
                query = query.gte("created_at", options.startDate.toISOString());
            }

            if (options.endDate) {
                query = query.lte("created_at", options.endDate.toISOString());
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            if (page === 1) {
                setLogs((data || []).map(transformLog));
            } else {
                setLogs((prev) => [...prev, ...(data || []).map(transformLog)]);
            }

            setHasMore((data || []).length === pageSize);
        } catch (err) {
            console.error("Error fetching activity logs:", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [options.adminId, options.actionType, options.entityType, options.startDate, options.endDate, page, pageSize, setLoading, setError, setLogs, setHasMore]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const loadMore = () => {
        if (hasMore && !loading) {
            setPage((prev) => prev + 1);
        }
    };

    const refresh = () => {
        setPage(1);
        fetchLogs();
    };

    return {
        logs,
        loading,
        error,
        hasMore,
        loadMore,
        refresh,
    };
}
