import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Target, Wallet, Settings, LogOut, Menu, ListCheck, Calendar, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function DashboardLayout() {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const mainContentRef = useRef<HTMLDivElement>(null);

    // Scroll to top when navigating between pages
    useEffect(() => {
        if (mainContentRef.current) {
            mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location.pathname]);

    const user = { name: 'Admin User', role: 'admin' }; // Mock user for demonstration

    const navItems = [
        { label: 'Visão Geral', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Clientes', icon: Users, href: '/dashboard/clients' },
        { label: 'Projetos', icon: Briefcase, href: '/dashboard/projects' },
        { label: 'Metas', icon: Target, href: '/dashboard/goals' },
        { label: 'Finanças', icon: Wallet, href: '/dashboard/finances' },
        { label: 'Atividades', icon: ListCheck, href: '/dashboard/tasks' },
        { label: 'Equipe', icon: Users, href: '/dashboard/team' },
        { label: 'Reuniões', icon: Calendar, href: '/dashboard/meetings' },
        { label: 'Configurações', icon: Settings, href: '/dashboard/settings' },
        // Audit Logs only for admin
        ...(user.role === 'admin' ? [{ label: 'Audit Logs', icon: Shield, href: '/dashboard/audit-logs' }] : []),
    ];

    return (
        <div className="min-h-screen bg-white flex relative overflow-hidden">
            {/* Background Glows */}
            <div
                className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse-glow"
                style={{ backgroundColor: 'rgba(0, 74, 173, 0.05)' }}
            />
            <div
                className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse-glow"
                style={{ backgroundColor: 'rgba(189, 90, 255, 0.05)' }}
            />

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3 animate-fade-in-up pt-2">
                    <img src="/logo.png" alt="Manifold AI Logo" className="h-8 w-auto animate-float" />
                    <span className="text-xl font-bold tracking-tight">
                        <span style={{ color: '#004aad' }}>MANIFOLD</span> <span style={{ color: '#bd5aff' }}>AI</span>
                    </span>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${isActive
                                    ? 'text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1'
                                    }`}
                                style={isActive ? {
                                    backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff)',
                                    backgroundSize: '200% 100%'
                                } : {}}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white/80 backdrop-blur-xl">
                    <div className="mb-3 px-3 py-2 bg-slate-50 rounded-md">
                        <p className="text-xs font-medium text-slate-600">Usuário</p>
                        <p className="text-sm font-semibold" style={{ color: '#004aad' }}>Admin</p>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 transition-all"
                    >
                        <LogOut className="h-4 w-4" />
                        Sair
                    </Button>
                </div>
            </aside>

            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white border border-slate-200 shadow-md hover:shadow-lg transition-all"
            >
                <Menu className="h-5 w-5" style={{ color: '#004aad' }} />
            </button>

            {/* Main Content */}
            <main ref={mainContentRef} className="flex-1 overflow-auto">
                <div className="p-6 md:p-8 animate-fade-in-up">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
