import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { logAudit } from '../lib/auditLog';

interface Goal {
    id: string;
    title: string;
    description?: string;
    category: 'financeiro' | 'operacional' | 'marketing' | 'produto' | 'pessoas';
    cycle: string;
    metric_type: 'currency' | 'percentage' | 'number';
    initial_value: number;
    target_value: number;
    current_value: number;
    progress: number;
    health: 'on-track' | 'at-risk' | 'off-track';
    owner_id?: string;
    department?: string;
    update_frequency?: string;
    created_at?: string;
    updated_at?: string;
}

export function useGoals() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('goals')
                .select(`
                    *,
                    owner:profiles!owner_id(full_name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGoals(data || []);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching goals:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createGoal = async (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'progress'>) => {
        try {
            // Calculate initial progress
            const progress = Math.round(
                ((goalData.current_value - goalData.initial_value) /
                    (goalData.target_value - goalData.initial_value)) * 100
            );

            const { data, error } = await supabase
                .from('goals')
                .insert([{ ...goalData, progress }])
                .select()
                .single();

            if (error) throw error;

            await logAudit({
                action: 'created',
                targetType: 'goal',
                targetId: data.id,
                targetName: data.title,
                details: { category: data.category, target: data.target_value }
            });

            await fetchGoals();
            return data;
        } catch (err: any) {
            console.error('Error creating goal:', err);
            throw err;
        }
    };

    const updateGoal = async (id: string, updates: Partial<Goal>) => {
        try {
            // Recalculate progress if values changed
            if (updates.current_value !== undefined || updates.target_value !== undefined || updates.initial_value !== undefined) {
                const goal = goals.find(g => g.id === id);
                if (goal) {
                    const current = updates.current_value ?? goal.current_value;
                    const target = updates.target_value ?? goal.target_value;
                    const initial = updates.initial_value ?? goal.initial_value;

                    updates.progress = Math.round(((current - initial) / (target - initial)) * 100);
                }
            }

            const { data, error } = await supabase
                .from('goals')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logAudit({
                action: 'updated',
                targetType: 'goal',
                targetId: id,
                targetName: data.title,
                details: updates
            });

            await fetchGoals();
            return data;
        } catch (err: any) {
            console.error('Error updating goal:', err);
            throw err;
        }
    };

    const deleteGoal = async (id: string, title: string) => {
        try {
            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await logAudit({
                action: 'deleted',
                targetType: 'goal',
                targetId: id,
                targetName: title
            });

            await fetchGoals();
        } catch (err: any) {
            console.error('Error deleting goal:', err);
            throw err;
        }
    };

    return {
        goals,
        loading,
        error,
        createGoal,
        updateGoal,
        deleteGoal,
        refetch: fetchGoals
    };
}
