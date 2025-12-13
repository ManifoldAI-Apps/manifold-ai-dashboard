import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { logAudit } from '../lib/auditLog';

interface Subtask {
    id: number;
    title: string;
    completed: boolean;
}

interface Task {
    id: string;
    title: string;
    description?: string;
    assigned_to?: string;
    project_id?: string;
    status: 'backlog' | 'todo' | 'wip' | 'review' | 'done';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    due_date?: string;
    estimate_hours?: number;
    tags?: string[];
    subtasks?: Subtask[];
    subtasks_completed: number;
    subtasks_total: number;
    created_at?: string;
    updated_at?: string;
}

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('tasks')
                .select(`
                    *,
                    assignee:profiles!assigned_to(full_name, avatar_url),
                    project:projects(name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTasks(data || []);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching tasks:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert([taskData])
                .select()
                .single();

            if (error) throw error;

            await logAudit({
                action: 'created',
                targetType: 'task',
                targetId: data.id,
                targetName: data.title,
                details: { status: data.status, priority: data.priority }
            });

            await fetchTasks();
            return data;
        } catch (err: any) {
            console.error('Error creating task:', err);
            throw err;
        }
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logAudit({
                action: 'updated',
                targetType: 'task',
                targetId: id,
                targetName: data.title,
                details: updates
            });

            await fetchTasks();
            return data;
        } catch (err: any) {
            console.error('Error updating task:', err);
            throw err;
        }
    };

    const deleteTask = async (id: string, title: string) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await logAudit({
                action: 'deleted',
                targetType: 'task',
                targetId: id,
                targetName: title
            });

            await fetchTasks();
        } catch (err: any) {
            console.error('Error deleting task:', err);
            throw err;
        }
    };

    const updateTaskStatus = async (id: string, status: Task['status']) => {
        return updateTask(id, { status });
    };

    return {
        tasks,
        loading,
        error,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        refetch: fetchTasks
    };
}
