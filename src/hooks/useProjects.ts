import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { logAudit } from '../lib/auditLog';

interface Project {
    id: string;
    name: string;
    description?: string;
    client_id?: string;
    status: 'planejamento' | 'em_andamento' | 'pausado' | 'concluido' | 'cancelado';
    priority: 'baixa' | 'media' | 'alta';
    start_date?: string;
    deadline?: string;
    progress: number;
    budget?: number;
    team_lead_id?: string;
    team_member_ids?: string[];
    project_link?: string;
    created_at?: string;
    updated_at?: string;
}

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('projects')
                .select(`
                    *,
                    client:clients(name),
                    team_lead:profiles!team_lead_id(full_name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching projects:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .insert([projectData])
                .select()
                .single();

            if (error) throw error;

            await logAudit({
                action: 'created',
                targetType: 'project',
                targetId: data.id,
                targetName: data.name,
                details: { status: data.status, priority: data.priority }
            });

            await fetchProjects();
            return data;
        } catch (err: any) {
            console.error('Error creating project:', err);
            throw err;
        }
    };

    const updateProject = async (id: string, updates: Partial<Project>) => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logAudit({
                action: 'updated',
                targetType: 'project',
                targetId: id,
                targetName: data.name,
                details: updates
            });

            await fetchProjects();
            return data;
        } catch (err: any) {
            console.error('Error updating project:', err);
            throw err;
        }
    };

    const deleteProject = async (id: string, name: string) => {
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await logAudit({
                action: 'deleted',
                targetType: 'project',
                targetId: id,
                targetName: name
            });

            await fetchProjects();
        } catch (err: any) {
            console.error('Error deleting project:', err);
            throw err;
        }
    };

    return {
        projects,
        loading,
        error,
        createProject,
        updateProject,
        deleteProject,
        refetch: fetchProjects
    };
}
