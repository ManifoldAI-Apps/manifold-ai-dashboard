import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { logAudit } from '../lib/auditLog';

interface Client {
    id: string;
    name: string;
    razao_social?: string;
    cnpj?: string;
    sector?: string;
    website?: string;
    linkedin_url?: string;
    decisor_name?: string;
    decisor_cargo?: string;
    decisor_email?: string;
    decisor_phone?: string;
    dor_principal?: string;
    origem?: string;
    status: 'lead_frio' | 'qualificacao' | 'proposta' | 'ativo' | 'churn';
    mrr?: number;
    owner_id?: string;
    created_at?: string;
    updated_at?: string;
}

export function useClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('clients')
                .select(`
                    *,
                    owner:profiles(full_name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setClients(data || []);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching clients:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .insert([clientData])
                .select()
                .single();

            if (error) throw error;

            // Log audit
            await logAudit({
                action: 'created',
                targetType: 'client',
                targetId: data.id,
                targetName: data.name,
                details: { status: data.status, mrr: data.mrr }
            });

            await fetchClients();
            return data;
        } catch (err: any) {
            console.error('Error creating client:', err);
            throw err;
        }
    };

    const updateClient = async (id: string, updates: Partial<Client>) => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Log audit
            await logAudit({
                action: 'updated',
                targetType: 'client',
                targetId: id,
                targetName: data.name,
                details: updates
            });

            await fetchClients();
            return data;
        } catch (err: any) {
            console.error('Error updating client:', err);
            throw err;
        }
    };

    const deleteClient = async (id: string, name: string) => {
        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Log audit
            await logAudit({
                action: 'deleted',
                targetType: 'client',
                targetId: id,
                targetName: name
            });

            await fetchClients();
        } catch (err: any) {
            console.error('Error deleting client:', err);
            throw err;
        }
    };

    return {
        clients,
        loading,
        error,
        createClient,
        updateClient,
        deleteClient,
        refetch: fetchClients
    };
}
