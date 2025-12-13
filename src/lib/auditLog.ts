import { supabase } from '../lib/supabaseClient';

interface AuditLogParams {
    action: 'created' | 'updated' | 'deleted';
    targetType: 'project' | 'client' | 'goal' | 'task' | 'team' | 'subscription' | 'meeting' | 'transaction';
    targetId: string;
    targetName: string;
    details?: object;
}

/**
 * Log an audit event to the database
 * Automatically captures the current user information
 */
export async function logAudit({
    action,
    targetType,
    targetId,
    targetName,
    details = {}
}: AuditLogParams): Promise<void> {
    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.warn('Cannot log audit: No authenticated user');
            return;
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, avatar_url')
            .eq('id', user.id)
            .single();

        if (!profile) {
            console.warn('Cannot log audit: Profile not found');
            return;
        }

        // Insert audit log
        const { error } = await supabase
            .from('audit_logs')
            .insert([{
                actor_id: user.id,
                actor_name: profile.full_name || 'Unknown',
                actor_email: profile.email,
                actor_avatar: profile.avatar_url,
                action,
                target_type: targetType,
                target_id: targetId,
                target_name: targetName,
                details
            }]);

        if (error) {
            console.error('Error logging audit:', error);
        }
    } catch (error) {
        console.error('Error in logAudit:', error);
    }
}

/**
 * Get audit logs with optional filters
 */
export async function getAuditLogs(filters?: {
    actorId?: string;
    action?: string;
    targetType?: string;
    limit?: number;
}) {
    try {
        let query = supabase
            .from('audit_logs')
            .select('*')
            .order('timestamp', { ascending: false });

        if (filters?.actorId) {
            query = query.eq('actor_id', filters.actorId);
        }

        if (filters?.action) {
            query = query.eq('action', filters.action);
        }

        if (filters?.targetType) {
            query = query.eq('target_type', filters.targetType);
        }

        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return [];
    }
}
