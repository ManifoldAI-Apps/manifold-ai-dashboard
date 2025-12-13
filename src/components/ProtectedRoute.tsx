import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'manager' | 'member' | 'viewer';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, profile, loading } = useAuth();

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-4 text-slate-600">Carregando...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check role-based access
    if (requiredRole && profile) {
        const roleHierarchy = {
            viewer: 0,
            member: 1,
            manager: 2,
            admin: 3,
        };

        const userRoleLevel = roleHierarchy[profile.role];
        const requiredRoleLevel = roleHierarchy[requiredRole];

        if (userRoleLevel < requiredRoleLevel) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Acesso Negado</h2>
                        <p className="text-slate-600 mb-6">
                            Você não tem permissão para acessar esta página.
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            );
        }
    }

    return <>{children}</>;
}
