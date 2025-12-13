import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { Target, TrendingUp, Users, DollarSign, Plus, AlertCircle, CheckCircle2, Clock, BarChart3, Percent, Hash } from 'lucide-react';
import { DetailSheet } from '../../components/ui/DetailSheet';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface Goal {
    id: number;
    title: string;
    category: string;
    cycle: string;
    metricType: 'currency' | 'percentage' | 'number';
    initial: number;
    target: number;
    current: number;
    progress: number;
    health: string;
    owner: string;
    department: string;
    frequency: string;
}

export default function Goals() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [formTab, setFormTab] = useState<'estrategia' | 'kpis' | 'ownership'>('estrategia');
    const [metricType, setMetricType] = useState<'currency' | 'percentage' | 'number'>('currency');

    const goals: Goal[] = [];

    const getHealthBadge = (health: string) => {
        const styles: { [key: string]: string } = {
            'on-track': 'bg-green-100 text-green-700',
            'at-risk': 'bg-yellow-100 text-yellow-700',
            'off-track': 'bg-red-100 text-red-700'
        };
        const labels: { [key: string]: string } = {
            'on-track': '🟢 On Track',
            'at-risk': '🟡 At Risk',
            'off-track': '🔴 Off Track'
        };
        return <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[health]}`}>{labels[health]}</span>;
    };

    const getHealthColor = (health: string) => {
        const colors: { [key: string]: string } = {
            'on-track': '#10b981',
            'at-risk': '#f59e0b',
            'off-track': '#ef4444'
        };
        return colors[health] || '#64748b';
    };

    const formatMetricValue = (value: number, type: string) => {
        if (type === 'currency') return `R$ ${value.toLocaleString('pt-BR')}`;
        if (type === 'percentage') return `${value}%`;
        return value.toString();
    };

    const getCategoryIcon = (category: string) => {
        const icons: { [key: string]: any } = {
            'Financeiro': <DollarSign className="h-4 w-4" />,
            'Operacional': <BarChart3 className="h-4 w-4" />,
            'Marketing': <TrendingUp className="h-4 w-4" />,
            'Produto': <Target className="h-4 w-4" />,
            'Pessoas': <Users className="h-4 w-4" />
        };
        return icons[category] || <Target className="h-4 w-4" />;
    };

    const handleCardClick = (goal: Goal) => {
        setSelectedGoal(goal);
        setIsDetailOpen(true);
    };

    const handleEdit = () => {
        setIsDetailOpen(false);
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        setIsDetailOpen(false);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        setIsDeleteDialogOpen(false);
        setSelectedGoal(null);
        // In a real app: setGoals(goals.filter(g => g.id !== selectedGoal.id));
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Premium */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                        <span style={{ color: '#004aad' }}>Metas</span>
                    </h1>
                    <p className="text-slate-600 text-lg">OKRs & KPIs - Metas Mensuráveis e Científicas</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedGoal(null);
                        setIsDialogOpen(true);
                    }}
                    className="animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    style={{
                        backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                        backgroundSize: '200% 100%'
                    }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Meta
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(0, 74, 173, 0.2)', animationDelay: '0.1s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total OKRs</CardTitle>
                        <Target className="h-5 w-5" style={{ color: '#004aad' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#004aad' }}>0</div>
                        <p className="text-xs text-slate-500 mt-1">Este trimestre</p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', animationDelay: '0.2s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">On Track</CardTitle>
                        <CheckCircle2 className="h-5 w-5" style={{ color: '#10b981' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#10b981' }}>0</div>
                        <p className="text-xs text-slate-500 mt-1">58% do total</p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(245, 158, 11, 0.2)', animationDelay: '0.3s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">At Risk</CardTitle>
                        <AlertCircle className="h-5 w-5" style={{ color: '#f59e0b' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#f59e0b' }}>3</div>
                        <p className="text-xs text-slate-500 mt-1">25% do total</p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', animationDelay: '0.4s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Off Track</CardTitle>
                        <AlertCircle className="h-5 w-5" style={{ color: '#ef4444' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#ef4444' }}>2</div>
                        <p className="text-xs text-slate-500 mt-1">Requer ação</p>
                    </CardContent>
                </Card>
            </div>

            {/* OKRs Grid */}
            <div className="grid gap-6 md:grid-cols-2 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                {goals.map((goal, index) => (
                    <Card
                        key={goal.id}
                        onClick={() => handleCardClick(goal as Goal)}
                        className="group relative overflow-hidden border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                        style={{
                            borderColor: `${getHealthColor(goal.health)}33`,
                            animationDelay: `${0.6 + index * 0.1}s`
                        }}
                    >
                        <div
                            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ backgroundColor: `${getHealthColor(goal.health)}20` }}
                        />
                        <CardHeader>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-700 flex items-center gap-1">
                                            {getCategoryIcon(goal.category)}
                                            {goal.category}
                                        </span>
                                        <span className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-700 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {goal.cycle}
                                        </span>
                                    </div>
                                    <CardTitle className="text-xl font-bold group-hover:translate-x-1 transition-transform">{goal.title}</CardTitle>
                                </div>
                                {getHealthBadge(goal.health)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Metric Display */}
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">Inicial</p>
                                    <p className="text-sm font-bold text-slate-700">{formatMetricValue(goal.initial, goal.metricType)}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">Atual</p>
                                    <p className="text-sm font-bold" style={{ color: '#004aad' }}>{formatMetricValue(goal.current, goal.metricType)}</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">Alvo</p>
                                    <p className="text-sm font-bold text-green-700">{formatMetricValue(goal.target, goal.metricType)}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-slate-600">Progresso</span>
                                    <span className="font-bold" style={{ color: getHealthColor(goal.health) }}>{goal.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3">
                                    <div
                                        className="h-3 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${goal.progress}%`,
                                            backgroundColor: getHealthColor(goal.health)
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Owner & Department */}
                            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-600">{goal.owner}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-600">{goal.department}</span>
                                    <span className="text-xs text-slate-500">{goal.frequency}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* OKR Dialog with Tabs */}
            <Dialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title={selectedGoal ? "Editar Meta (OKR)" : "Nova Meta (OKR)"}
            >
                {/* Form Tabs */}
                <div className="flex gap-2 border-b border-slate-200 mb-6">
                    <button
                        onClick={() => setFormTab('estrategia')}
                        className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 ${formTab === 'estrategia'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Target className="h-4 w-4" />
                        Estratégia
                    </button>
                    <button
                        onClick={() => setFormTab('kpis')}
                        className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 ${formTab === 'kpis'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <BarChart3 className="h-4 w-4" />
                        KPIs & Alvos
                    </button>
                    <button
                        onClick={() => setFormTab('ownership')}
                        className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 ${formTab === 'ownership'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Users className="h-4 w-4" />
                        Ownership
                    </button>
                </div>

                <form className="space-y-4">
                    {/* Tab: Estratégia */}
                    {formTab === 'estrategia' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título do Objetivo *</label>
                                <Input type="text" placeholder='Ex: "Dominar o mercado de PME no Q3"' defaultValue={selectedGoal?.title || ''} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoria *</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue={selectedGoal?.category.toLowerCase() || ""}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="financeiro">💰 Financeiro</option>
                                        <option value="operacional">⚙️ Operacional</option>
                                        <option value="marketing">📈 Marketing</option>
                                        <option value="produto">🎯 Produto</option>
                                        <option value="pessoas">👥 Pessoas</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ciclo / Período *</label>
                                    <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Selecione...</option>
                                        <option value="q1">Q1 2025</option>
                                        <option value="q2">Q2 2025</option>
                                        <option value="q3">Q3 2025</option>
                                        <option value="q4">Q4 2025</option>
                                        <option value="anual">Anual 2025</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição / Motivação *</label>
                                <p className="text-xs text-slate-500 mb-2">Por que essa meta é importante agora?</p>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                    placeholder="Descreva o contexto estratégico, por que essa meta é crítica para o negócio neste momento..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Tab: KPIs & Alvos */}
                    {formTab === 'kpis' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">Tipo de Métrica *</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setMetricType('currency')}
                                        className={`p-4 border-2 rounded-lg transition-all ${metricType === 'currency'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <DollarSign className="h-6 w-6 mx-auto mb-2" style={{ color: metricType === 'currency' ? '#004aad' : '#64748b' }} />
                                        <p className="text-sm font-medium">Financeiro (R$)</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMetricType('percentage')}
                                        className={`p-4 border-2 rounded-lg transition-all ${metricType === 'percentage'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <Percent className="h-6 w-6 mx-auto mb-2" style={{ color: metricType === 'percentage' ? '#004aad' : '#64748b' }} />
                                        <p className="text-sm font-medium">Porcentagem (%)</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMetricType('number')}
                                        className={`p-4 border-2 rounded-lg transition-all ${metricType === 'number'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <Hash className="h-6 w-6 mx-auto mb-2" style={{ color: metricType === 'number' ? '#004aad' : '#64748b' }} />
                                        <p className="text-sm font-medium">Numérico (#)</p>
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor Inicial *</label>
                                    <Input type="number" placeholder="0" step="0.01" defaultValue={selectedGoal?.initial || ''} />
                                    <p className="text-xs text-slate-500 mt-1">Onde estamos hoje</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor Alvo *</label>
                                    <Input type="number" placeholder="1000000" step="0.01" defaultValue={selectedGoal?.target || ''} />
                                    <p className="text-xs text-slate-500 mt-1">Onde queremos chegar</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor Atual</label>
                                    <Input type="number" placeholder="0" step="0.01" defaultValue={selectedGoal?.current || ''} />
                                    <p className="text-xs text-slate-500 mt-1">Progresso atual</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Frequência de Atualização *</label>
                                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Selecione...</option>
                                    <option value="semanal">📅 Semanal</option>
                                    <option value="mensal">📆 Mensal</option>
                                    <option value="trimestral">🗓️ Trimestral</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Tab: Ownership */}
                    {formTab === 'ownership' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status de Saúde *</label>
                                <p className="text-xs text-slate-500 mb-2">Este status mudará a cor da barra de progresso</p>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    defaultValue={selectedGoal?.health || ""}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="on-track">🟢 On Track - No caminho certo</option>
                                    <option value="at-risk">🟡 At Risk - Em risco</option>
                                    <option value="off-track">🔴 Off Track - Fora do caminho</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Departamento Responsável *</label>
                                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Selecione...</option>
                                    <option value="vendas">💼 Vendas</option>
                                    <option value="tech">💻 Tech</option>
                                    <option value="cs">🤝 CS (Customer Success)</option>
                                    <option value="admin">⚙️ Admin</option>
                                    <option value="marketing">📣 Marketing</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Dono da Meta (Owner) *</label>
                                <p className="text-xs text-slate-500 mb-2">Quem responderá por esse número</p>
                                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Selecione...</option>
                                    <option value="1">👤 Ana Silva - PM</option>
                                    <option value="2">👤 Bruno Costa - Dev Lead</option>
                                    <option value="3">👤 Carla Souza - Designer</option>
                                    <option value="4">👤 Diego Lima - CS Manager</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        {formTab !== 'estrategia' && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    if (formTab === 'kpis') setFormTab('estrategia');
                                    if (formTab === 'ownership') setFormTab('kpis');
                                }}
                                className="border-slate-300 hover:bg-slate-100"
                            >
                                Anterior
                            </Button>
                        )}
                        {formTab !== 'ownership' ? (
                            <Button
                                type="button"
                                onClick={() => {
                                    if (formTab === 'estrategia') setFormTab('kpis');
                                    if (formTab === 'kpis') setFormTab('ownership');
                                }}
                                className="ml-auto animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                style={{
                                    backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                                    backgroundSize: '200% 100%'
                                }}
                            >
                                Próximo
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                className="ml-auto animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                style={{
                                    backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                                    backgroundSize: '200% 100%'
                                }}
                            >
                                Criar Meta (OKR)
                            </Button>
                        )}
                    </div>
                </form>
            </Dialog>

            <DetailSheet
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={selectedGoal?.title || ''}
                onEdit={handleEdit}
                onDelete={handleDelete}
            >
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {selectedGoal && getCategoryIcon(selectedGoal.category)}
                            <span className="font-medium text-slate-900">{selectedGoal?.category}</span>
                        </div>
                        <div className="px-2 py-1 bg-slate-100 rounded-md text-slate-600 text-xs font-medium">
                            {selectedGoal?.cycle}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-center">
                            <h4 className="text-xs text-slate-500 mb-1">Inicial</h4>
                            <p className="font-bold text-slate-700 text-sm">
                                {selectedGoal && formatMetricValue(selectedGoal.initial, selectedGoal.metricType)}
                            </p>
                        </div>
                        <div className="text-center border-l border-slate-200">
                            <h4 className="text-xs text-slate-500 mb-1">Atual</h4>
                            <p className="font-bold text-blue-600 text-sm">
                                {selectedGoal && formatMetricValue(selectedGoal.current, selectedGoal.metricType)}
                            </p>
                        </div>
                        <div className="text-center border-l border-slate-200">
                            <h4 className="text-xs text-slate-500 mb-1">Meta</h4>
                            <p className="font-bold text-green-600 text-sm">
                                {selectedGoal && formatMetricValue(selectedGoal.target, selectedGoal.metricType)}
                            </p>
                        </div>
                    </div>

                    {/* Health Status */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-sm font-medium text-slate-700">Status de Saúde</span>
                        {selectedGoal && getHealthBadge(selectedGoal.health)}
                    </div>

                    {/* Department & Owner */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-xs font-medium text-slate-500 mb-1">Departamento</h4>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-slate-400" />
                                <span className="font-medium text-slate-900">{selectedGoal?.department}</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-medium text-slate-500 mb-1">Owner</h4>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-slate-400" />
                                <span className="font-medium text-slate-900">{selectedGoal?.owner}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DetailSheet>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Excluir Meta"
                message="Tem certeza que deseja excluir esta meta? O histórico de progresso será perdido."
                itemName={selectedGoal?.title}
            />
        </div>
    );
}
