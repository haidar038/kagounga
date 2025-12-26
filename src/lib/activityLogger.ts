import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type ActionType = "create" | "update" | "delete" | "approve" | "reject" | "publish" | "unpublish" | "restore" | "bulk_action";

export type EntityType = "product" | "order" | "review" | "news" | "gallery" | "signature" | "content" | "user" | "category";

interface LogActivityParams {
    actionType: ActionType;
    entityType: EntityType;
    entityId: string;
    entityName?: string;
    changes?: {
        before?: Record<string, Json>;
        after?: Record<string, Json>;
    };
}

/**
 * Logs admin activity to the database
 * Automatically captures user info, IP, and user agent
 */
export async function logActivity({ actionType, entityType, entityId, entityName, changes }: LogActivityParams): Promise<void> {
    try {
        // Get current user
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            console.warn("Cannot log activity: No authenticated user");
            return;
        }

        // Prepare log entry
        const logEntry = {
            admin_id: user.id,
            admin_email: user.email || "unknown",
            action_type: actionType,
            entity_type: entityType,
            entity_id: entityId,
            entity_name: entityName,
            changes: changes || null,
            // IP and user agent would ideally be captured server-side
            // For now, we'll capture what we can from browser
            user_agent: navigator.userAgent,
        };

        // Insert activity log
        const { error } = await supabase.from("admin_activity_logs").insert(logEntry);

        if (error) {
            console.error("Failed to log activity:", error);
        }
    } catch (error) {
        // Silent failure - we don't want logging to break the app
        console.error("Error in logActivity:", error);
    }
}

/**
 * Helper to create a changes object from before/after values
 */
export function createChangesObject<T extends Record<string, Json>>(before: T, after: T): { before: Partial<T>; after: Partial<T> } {
    const changes: { before: Partial<T>; after: Partial<T> } = {
        before: {},
        after: {},
    };

    // Only include fields that actually changed
    Object.keys(after).forEach((key) => {
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
            changes.before[key as keyof T] = before[key] as T[keyof T];
            changes.after[key as keyof T] = after[key] as T[keyof T];
        }
    });

    return changes;
}
