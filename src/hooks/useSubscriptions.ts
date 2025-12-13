import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { logAudit } from '../lib/auditLog';
import { encryptPassword, decryptPassword } from '../lib/encryption';

interface Subscription {
    id: string;
    service_name: string;
    cost: number;
    frequency: 'monthly' | 'quarterly' | 'annual' | 'lifetime';
    renewal_date?: string;
    login_email?: string;
    login_password?: string; // Will be encrypted
    login_url?: string;
    reminder_enabled: boolean;
    created_at?: string;
    updated_at?: string;
}

export function useSubscriptions() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Decrypt passwords
            const decryptedData = await Promise.all(
                (data || []).map(async (sub) => ({
                    ...sub,
                    login_password: sub.login_password
                        ? await decryptPassword(sub.login_password)
                        : undefined
                }))
            );

            setSubscriptions(decryptedData);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching subscriptions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createSubscription = async (subData: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            // Encrypt password before saving
            const encryptedData = {
                ...subData,
                login_password: subData.login_password
                    ? await encryptPassword(subData.login_password)
                    : undefined
            };

            const { data, error } = await supabase
                .from('subscriptions')
                .insert([encryptedData])
                .select()
                .single();

            if (error) throw error;

            await logAudit({
                action: 'created',
                targetType: 'subscription',
                targetId: data.id,
                targetName: data.service_name,
                details: { cost: data.cost, frequency: data.frequency }
            });

            await fetchSubscriptions();
            return data;
        } catch (err: any) {
            console.error('Error creating subscription:', err);
            throw err;
        }
    };

    const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
        try {
            // Encrypt password if being updated
            const encryptedUpdates = {
                ...updates,
                login_password: updates.login_password
                    ? await encryptPassword(updates.login_password)
                    : undefined
            };

            const { data, error } = await supabase
                .from('subscriptions')
                .update(encryptedUpdates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logAudit({
                action: 'updated',
                targetType: 'subscription',
                targetId: id,
                targetName: data.service_name,
                details: updates
            });

            await fetchSubscriptions();
            return data;
        } catch (err: any) {
            console.error('Error updating subscription:', err);
            throw err;
        }
    };

    const deleteSubscription = async (id: string, serviceName: string) => {
        try {
            const { error } = await supabase
                .from('subscriptions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await logAudit({
                action: 'deleted',
                targetType: 'subscription',
                targetId: id,
                targetName: serviceName
            });

            await fetchSubscriptions();
        } catch (err: any) {
            console.error('Error deleting subscription:', err);
            throw err;
        }
    };

    return {
        subscriptions,
        loading,
        error,
        createSubscription,
        updateSubscription,
        deleteSubscription,
        refetch: fetchSubscriptions
    };
}
