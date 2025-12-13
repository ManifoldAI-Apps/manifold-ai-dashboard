import { supabase } from './supabaseClient';

/**
 * Input validation and sanitization utilities
 */

export function sanitizeString(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove HTML tags
        .substring(0, 1000); // Limit length
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 10;
}

export function validateURL(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Rate limiting (client-side)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = requestCounts.get(key);

    if (!record || now > record.resetTime) {
        requestCounts.set(key, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (record.count >= maxRequests) {
        return false;
    }

    record.count++;
    return true;
}

/**
 * Secure data handling
 */
export function sanitizeClientData(data: any) {
    return {
        name: sanitizeString(data.name || ''),
        razao_social: data.razao_social ? sanitizeString(data.razao_social) : undefined,
        cnpj: data.cnpj ? sanitizeString(data.cnpj).replace(/\D/g, '') : undefined,
        sector: data.sector ? sanitizeString(data.sector) : undefined,
        website: data.website && validateURL(data.website) ? data.website : undefined,
        linkedin_url: data.linkedin_url && validateURL(data.linkedin_url) ? data.linkedin_url : undefined,
        decisor_name: data.decisor_name ? sanitizeString(data.decisor_name) : undefined,
        decisor_cargo: data.decisor_cargo ? sanitizeString(data.decisor_cargo) : undefined,
        decisor_email: data.decisor_email && validateEmail(data.decisor_email) ? data.decisor_email : undefined,
        decisor_phone: data.decisor_phone ? sanitizeString(data.decisor_phone) : undefined,
        dor_principal: data.dor_principal ? sanitizeString(data.dor_principal) : undefined,
        origem: data.origem ? sanitizeString(data.origem) : undefined,
        status: data.status || 'lead_frio',
        mrr: typeof data.mrr === 'number' ? Math.max(0, data.mrr) : undefined,
        owner_id: data.owner_id
    };
}

/**
 * Error handling
 */
export function handleSupabaseError(error: any): string {
    console.error('Supabase error:', error);

    if (error.code === '23505') {
        return 'Este registro já existe.';
    }

    if (error.code === '23503') {
        return 'Erro de referência: verifique os dados relacionados.';
    }

    if (error.code === 'PGRST116') {
        return 'Registro não encontrado.';
    }

    if (error.message?.includes('JWT')) {
        return 'Sessão expirada. Faça login novamente.';
    }

    if (error.message?.includes('RLS')) {
        return 'Você não tem permissão para esta ação.';
    }

    return 'Ocorreu um erro. Tente novamente.';
}

/**
 * Session validation
 */
export async function validateSession(): Promise<boolean> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session;
    } catch {
        return false;
    }
}

/**
 * CSRF Protection (for forms)
 */
export function generateCSRFToken(): string {
    return crypto.randomUUID();
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken;
}
