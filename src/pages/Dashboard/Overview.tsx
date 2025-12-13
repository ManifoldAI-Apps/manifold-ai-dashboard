import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertCircle, CheckCircle2, Clock, Zap, CreditCard, Users, CheckSquare } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function Overview() {
    // Mock data - Financial KPIs
    const mrr = 125000;
    const mrrGrowth = 12;
    const netProfit = 45000;
    const runway = 4.5;
    const pipelineValue = 50000;

    // Mock data - Project Health
    const projectHealth = [
        { name: 'No Prazo', value: 3, color: '#10b981' },
        { name: 'Em Risco', value: 1, color: '#f59e0b' },
        { name: 'Atrasado', value: 1, color: '#ef4444' },
    ];

    // Mock data - OKR
    const okrProgress = 78;
    const okrGoal = 1000000;
    const okrCurrent = 780000;
    const okrRemaining = okrGoal - okrCurrent;

    // Mock data - Subscription Alerts
    const expiringSubscriptions = [
        { name: 'Vercel Pro', daysLeft: 1, cost: 200 },
        { name: 'GitHub Enterprise', daysLeft: 3, cost: 450 },
        { name: 'Figma Professional', daysLeft: 7, cost: 144 },
    ];

    // Mock data - Priority Tasks
    const myTasks = [
        { id: 1, title: 'Treinar modelo de NLP v2', priority: 'urgent', project: 'Automação' },
        { id: 2, title: 'Corrigir bug no upload', priority: 'urgent', project: 'API' },
        { id: 3, title: 'Implementar OAuth', priority: 'high', project: 'Dashboard' },
        { id: 4, title: 'Documentar endpoints', priority: 'normal', project: 'Geral' },
    ];

    // Mock data - Team Capacity
    const teamLoad = [
        { name: 'João', tasks: 5, urgent: 3 },
        { name: 'Ana', tasks: 4, urgent: 1 },
        { name: 'Carlos', tasks: 3, urgent: 0 },
        { name: 'Maria', tasks: 1, urgent: 0 },
    ];

    const getPriorityColor = (priority: string) => {
        const colors: { [key: string]: string } = {
            'urgent': '#ef4444',
            'high': '#f59e0b',
            'normal': '#3b82f6'
        };
        return colors[priority] || '#64748b';
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                    <span style={{ color: '#004aad' }}>Visão Executiva Global</span>
                </h1>
                <p className="text-slate-600 text-lg">Monitoramento de performance e KPIs em tempo real</p>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Top Row: Financial KPIs */}
                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Receita Recorrente (MRR)</CardTitle>
                        <DollarSign className="h-5 w-5" style={{ color: '#10b981' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#10b981' }}>
                            R$ {(mrr / 1000).toFixed(0)}k
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">+{mrrGrowth}%</span>
                            <span className="text-xs text-slate-500">vs mês anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Lucro Líquido</CardTitle>
                        <TrendingUp className="h-5 w-5" style={{ color: '#004aad' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#004aad' }}>
                            R$ {(netProfit / 1000).toFixed(0)}k
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Este mês</p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(189, 90, 255, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Projeção de Caixa (Runway)</CardTitle>
                        <Clock className="h-5 w-5" style={{ color: '#bd5aff' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#bd5aff' }}>
                            {runway} Meses
                        </div>
                        <p className="text-xs text-slate-500 mt-2">De caixa disponível</p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Funil de Oportunidades</CardTitle>
                        <Target className="h-5 w-5" style={{ color: '#f59e0b' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#f59e0b' }}>
                            R$ {(pipelineValue / 1000).toFixed(0)}k
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Em propostas abertas</p>
                    </CardContent>
                </Card>

                {/* Middle Row: Project Health (Large Card) */}
                <Card className="lg:col-span-2 lg:row-span-2 group relative overflow-hidden border-slate-200 hover:shadow-2xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 74, 173, 0.1)' }} />
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Panorama de Entregas</CardTitle>
                        <p className="text-sm text-slate-500">Status dos projetos ativos</p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={projectHealth}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {projectHealth.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            {projectHealth.map((item, index) => (
                                <div key={index} className="text-center p-3 rounded-lg" style={{ backgroundColor: `${item.color}10` }}>
                                    <div className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
                                    <p className="text-xs text-slate-600 mt-1">{item.name}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Middle Row: OKR Gauge (Center) */}
                <Card className="lg:col-span-1 lg:row-span-2 group relative overflow-hidden border-slate-200 hover:shadow-2xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(189, 90, 255, 0.15)' }} />
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Metas Estratégicas (OKR)</CardTitle>
                        <p className="text-sm text-slate-500">Meta Principal Q3 2024</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative pt-1">
                            <div className="flex items-center justify-center mb-4">
                                <div className="relative w-40 h-40">
                                    <svg className="transform -rotate-90 w-40 h-40">
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            stroke="#e2e8f0"
                                            strokeWidth="12"
                                            fill="none"
                                        />
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            stroke="url(#gradient)"
                                            strokeWidth="12"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * 70}`}
                                            strokeDashoffset={`${2 * Math.PI * 70 * (1 - okrProgress / 100)}`}
                                            strokeLinecap="round"
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#004aad" />
                                                <stop offset="100%" stopColor="#bd5aff" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl font-bold" style={{ color: '#004aad' }}>{okrProgress}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Meta:</span>
                                <span className="font-bold">R$ {(okrGoal / 1000).toFixed(0)}k</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Atual:</span>
                                <span className="font-bold" style={{ color: '#004aad' }}>R$ {(okrCurrent / 1000).toFixed(0)}k</span>
                            </div>
                            <div className="pt-2 border-t border-slate-200">
                                <p className="text-xs text-slate-500">Faltam <span className="font-bold text-slate-700">R$ {(okrRemaining / 1000).toFixed(0)}k</span> para bater a meta do Q3</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Middle Row: Subscription Alerts (Right) */}
                <Card className="lg:col-span-1 lg:row-span-2 group relative overflow-hidden border-slate-200 hover:shadow-2xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }} />
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Gestão de Ativos de Software
                        </CardTitle>
                        <p className="text-sm text-slate-500">Renovações próximas (7 dias)</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {expiringSubscriptions.map((sub, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border-l-4 ${sub.daysLeft <= 1 ? 'bg-red-50 border-red-500' : sub.daysLeft <= 3 ? 'bg-yellow-50 border-yellow-500' : 'bg-blue-50 border-blue-500'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-semibold text-sm text-slate-900">{sub.name}</h4>
                                        <AlertCircle className={`h-4 w-4 ${sub.daysLeft <= 1 ? 'text-red-500' : sub.daysLeft <= 3 ? 'text-yellow-500' : 'text-blue-500'}`} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-600">
                                            {sub.daysLeft === 1 ? 'Vence amanhã' : `${sub.daysLeft} dias`}
                                        </span>
                                        <span className="text-sm font-bold" style={{ color: '#004aad' }}>
                                            R$ {sub.cost}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Bottom Row: Priority Tasks (List) */}
                <Card className="lg:col-span-2 group relative overflow-hidden border-slate-200 hover:shadow-2xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 74, 173, 0.1)' }} />
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Zap className="h-5 w-5" style={{ color: '#f59e0b' }} />
                            Plano de Ação Imediato
                        </CardTitle>
                        <p className="text-sm text-slate-500">Ordenadas por urgência</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {myTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-medium text-slate-900">{task.title}</h4>
                                        <p className="text-xs text-slate-500">{task.project}</p>
                                    </div>
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Bottom Row: Team Capacity */}
                <Card className="lg:col-span-2 group relative overflow-hidden border-slate-200 hover:shadow-2xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(189, 90, 255, 0.1)' }} />
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Users className="h-5 w-5" style={{ color: '#bd5aff' }} />
                            Alocação de Recursos
                        </CardTitle>
                        <p className="text-sm text-slate-500">Carga de trabalho atual</p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={teamLoad} layout="vertical">
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip />
                                <Bar dataKey="tasks" fill="#004aad" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-4 gap-2 mt-4">
                            {teamLoad.map((member, index) => (
                                <div key={index} className="text-center p-2 rounded-lg bg-slate-50">
                                    <p className="text-xs text-slate-600">{member.name}</p>
                                    <p className="text-lg font-bold" style={{ color: member.urgent > 2 ? '#ef4444' : '#004aad' }}>
                                        {member.urgent > 0 && <span className="text-xs text-red-500">{member.urgent} 🔥</span>}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
