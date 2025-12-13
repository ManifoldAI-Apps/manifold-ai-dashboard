import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { DetailSheet } from '../../components/ui/DetailSheet';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Plus, ArrowUpRight, ArrowDownRight, Calendar, Eye, EyeOff, Lock, Mail, Link as LinkIcon, Bell, BellOff } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Financials() {
    const [activeTab, setActiveTab] = useState<'cashflow' | 'saas'>('cashflow');
    const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
    const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
    const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({});
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');

    // Subscription card interactivity
    const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleCardClick = (subscription: any) => {
        setSelectedSubscription(subscription);
        setIsDetailOpen(true);
    };

    const handleEdit = () => {
        setIsDetailOpen(false);
        setSelectedSubscription(selectedSubscription);
        setIsSubscriptionDialogOpen(true);
    };

    const handleDelete = () => {
        setIsDetailOpen(false);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        // In real app: delete subscription from database
        setIsDeleteDialogOpen(false);
        setSelectedSubscription(null);
    };

    const data = [
        { month: 'Jan', receita: 45000, despesas: 28000 },
        { month: 'Fev', receita: 52000, despesas: 31000 },
        { month: 'Mar', receita: 48000, despesas: 29000 },
        { month: 'Abr', receita: 61000, despesas: 35000 },
        { month: 'Mai', receita: 55000, despesas: 32000 },
        { month: 'Jun', receita: 67000, despesas: 38000 },
    ];

    const transactions: any[] = [];

    const subscriptions: any[] = [];

    const togglePassword = (id: number) => {
        setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getDaysUntilRenewal = (date: string | null) => {
        if (!date) return null;
        const renewal = new Date(date);
        const today = new Date();
        const diff = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const getStatusBadge = (status: string) => {
        const styles: { [key: string]: string } = {
            'paid': 'bg-green-100 text-green-700',
            'pending': 'bg-yellow-100 text-yellow-700',
            'scheduled': 'bg-blue-100 text-blue-700'
        };
        const labels: { [key: string]: string } = {
            'paid': 'Pago',
            'pending': 'Pendente',
            'scheduled': 'Agendado'
        };
        return <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{labels[status]}</span>;
    };

    const totalMonthlyCost = subscriptions
        .filter(s => s.frequency === 'monthly')
        .reduce((sum, s) => sum + s.cost, 0);

    const activeSubscriptions = subscriptions.length;
    const expiringSubscriptions = subscriptions.filter(s => {
        if (!s.renewalDate) return false;
        const days = getDaysUntilRenewal(s.renewalDate);
        return days !== null && days <= 7 && days >= 0;
    }).length;

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Premium */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                        <span style={{ color: '#004aad' }}>Finanças</span>
                    </h1>
                    <p className="text-slate-600 text-lg">Fluxo de Caixa & Gestão de Assinaturas SaaS</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('cashflow')}
                    className={`px-4 py-2 font-medium transition-all flex items-center gap-2 ${activeTab === 'cashflow'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <DollarSign className="h-4 w-4" />
                    Fluxo de Caixa
                </button>
                <button
                    onClick={() => setActiveTab('saas')}
                    className={`px-4 py-2 font-medium transition-all flex items-center gap-2 ${activeTab === 'saas'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <CreditCard className="h-4 w-4" />
                    SaaS & Ferramentas
                </button>
            </div>

            {/* Tab: Fluxo de Caixa */}
            {activeTab === 'cashflow' && (
                <div className="space-y-8 animate-fade-in-up">
                    {/* Stats Cards */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: 'rgba(0, 74, 173, 0.2)' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }} />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Receita Total</CardTitle>
                                <TrendingUp className="h-5 w-5" style={{ color: '#10b981' }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: '#10b981' }}>R$ 328.000</div>
                                <p className="text-xs text-slate-500 mt-1">+15% vs mês anterior</p>
                            </CardContent>
                        </Card>

                        <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }} />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Despesas Totais</CardTitle>
                                <TrendingDown className="h-5 w-5" style={{ color: '#ef4444' }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: '#ef4444' }}>R$ 193.000</div>
                                <p className="text-xs text-slate-500 mt-1">+8% vs mês anterior</p>
                            </CardContent>
                        </Card>

                        <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: 'rgba(0, 74, 173, 0.2)' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }} />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Lucro Líquido</CardTitle>
                                <DollarSign className="h-5 w-5" style={{ color: '#004aad' }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: '#004aad' }}>R$ 135.000</div>
                                <p className="text-xs text-slate-500 mt-1">Margem de 41%</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart */}
                    <Card className="border-slate-200 hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold">Evolução Financeira</CardTitle>
                                <p className="text-sm text-slate-500 mt-1">Receitas vs Despesas (últimos 6 meses)</p>
                            </div>
                            <Button
                                onClick={() => setIsTransactionDialogOpen(true)}
                                className="animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                style={{
                                    backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                                    backgroundSize: '200% 100%'
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Nova Movimentação
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="receita" stroke="#10b981" fillOpacity={1} fill="url(#colorReceita)" />
                                    <Area type="monotone" dataKey="despesas" stroke="#ef4444" fillOpacity={1} fill="url(#colorDespesas)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Transactions List */}
                    <Card className="border-slate-200 hover:shadow-xl transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Movimentações Recentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {transactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-all border border-slate-200"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`h-12 w-12 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                                                    }`}
                                            >
                                                {transaction.type === 'income' ? (
                                                    <ArrowUpRight className="h-5 w-5 text-green-700" />
                                                ) : (
                                                    <ArrowDownRight className="h-5 w-5 text-red-700" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{transaction.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-slate-500">{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">{transaction.category}</span>
                                                    {getStatusBadge(transaction.status)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`text-xl font-bold ${transaction.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                                            {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tab: SaaS & Ferramentas */}
            {activeTab === 'saas' && (
                <div className="space-y-8 animate-fade-in-up">
                    {/* Stats Cards */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: 'rgba(0, 74, 173, 0.2)' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }} />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Custo Mensal Total</CardTitle>
                                <DollarSign className="h-5 w-5" style={{ color: '#004aad' }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: '#004aad' }}>R$ {totalMonthlyCost.toLocaleString('pt-BR')}</div>
                                <p className="text-xs text-slate-500 mt-1">Assinaturas mensais</p>
                            </CardContent>
                        </Card>

                        <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }} />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Assinaturas Ativas</CardTitle>
                                <CreditCard className="h-5 w-5" style={{ color: '#10b981' }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: '#10b981' }}>{activeSubscriptions}</div>
                                <p className="text-xs text-slate-500 mt-1">Ferramentas em uso</p>
                            </CardContent>
                        </Card>

                        <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }} />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Expirando em Breve</CardTitle>
                                <Calendar className="h-5 w-5" style={{ color: '#f59e0b' }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: '#f59e0b' }}>{expiringSubscriptions}</div>
                                <p className="text-xs text-slate-500 mt-1">Próximos 7 dias</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Add Subscription Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={() => setIsSubscriptionDialogOpen(true)}
                            className="animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                            style={{
                                backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                                backgroundSize: '200% 100%'
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Assinatura
                        </Button>
                    </div>

                    {/* Subscriptions List */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {subscriptions.map((sub, index) => {
                            const daysUntil = getDaysUntilRenewal(sub.renewalDate);
                            const isExpiring = daysUntil !== null && daysUntil <= 7 && daysUntil >= 0;

                            return (
                                <Card
                                    key={sub.id}
                                    className={`group relative overflow-hidden border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer ${isExpiring ? 'border-yellow-300' : 'border-slate-200'
                                        }`}
                                    onClick={() => handleCardClick(sub)}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }} />
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-xl font-bold mb-2">{sub.service}</CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-bold" style={{ color: '#004aad' }}>
                                                        R$ {sub.cost}
                                                    </span>
                                                    <span className="text-sm text-slate-500">/ {sub.frequency === 'monthly' ? 'mês' : sub.frequency === 'annual' ? 'ano' : 'trimestre'}</span>
                                                </div>
                                            </div>
                                            {sub.reminder ? (
                                                <Bell className="h-5 w-5 text-blue-500" />
                                            ) : (
                                                <BellOff className="h-5 w-5 text-slate-400" />
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Renewal Date */}
                                        {sub.renewalDate && (
                                            <div className={`p-3 rounded-lg ${isExpiring ? 'bg-yellow-50' : 'bg-slate-50'}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-slate-600" />
                                                        <span className="text-sm text-slate-600">Renovação</span>
                                                    </div>
                                                    <span className="text-sm font-medium">{new Date(sub.renewalDate).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                                {daysUntil !== null && (
                                                    <p className={`text-xs mt-1 ${isExpiring ? 'text-yellow-700 font-medium' : 'text-slate-500'}`}>
                                                        {daysUntil > 0 ? `${daysUntil} dias restantes` : daysUntil === 0 ? 'Vence hoje!' : 'Vencido'}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Login */}
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Mail className="h-4 w-4 text-slate-600" />
                                                <span className="text-xs text-slate-500">Login</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-900">{sub.login}</p>
                                        </div>

                                        {/* Password */}
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Lock className="h-4 w-4 text-slate-600" />
                                                    <span className="text-xs text-slate-500">Senha</span>
                                                </div>
                                                <button
                                                    onClick={() => togglePassword(sub.id)}
                                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showPasswords[sub.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <p className="text-sm font-mono text-slate-900">
                                                {showPasswords[sub.id] ? sub.password : '••••••••••••'}
                                            </p>
                                        </div>

                                        {/* Login URL */}
                                        <a
                                            href={sub.loginUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <LinkIcon className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm text-blue-600 font-medium">Abrir ferramenta</span>
                                        </a>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Transaction Dialog */}
            <Dialog isOpen={isTransactionDialogOpen} onClose={() => setIsTransactionDialogOpen(false)} title="Nova Movimentação">
                <form className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Tipo *</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setTransactionType('income')}
                                className={`p-4 border-2 rounded-lg transition-all ${transactionType === 'income'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <ArrowUpRight className="h-6 w-6 mx-auto mb-2" style={{ color: transactionType === 'income' ? '#10b981' : '#64748b' }} />
                                <p className="text-sm font-medium">Receita</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setTransactionType('expense')}
                                className={`p-4 border-2 rounded-lg transition-all ${transactionType === 'expense'
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <ArrowDownRight className="h-6 w-6 mx-auto mb-2" style={{ color: transactionType === 'expense' ? '#ef4444' : '#64748b' }} />
                                <p className="text-sm font-medium">Despesa</p>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição *</label>
                        <Input type="text" placeholder="Ex: Pagamento Cliente XYZ" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Valor *</label>
                        <Input type="number" placeholder="0.00" step="0.01" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Categoria *</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Selecione...</option>
                            <option value="impostos">Impostos</option>
                            <option value="pessoal">Pessoal</option>
                            <option value="infraestrutura">Infraestrutura</option>
                            <option value="vendas">Vendas</option>
                            <option value="marketing">Marketing</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data de Competência *</label>
                        <Input type="date" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Selecione...</option>
                            <option value="paid">Pago</option>
                            <option value="pending">Pendente</option>
                            <option value="scheduled">Agendado</option>
                        </select>
                    </div>
                    <Button
                        type="submit"
                        className="w-full animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                            backgroundSize: '200% 100%'
                        }}
                    >
                        Adicionar Movimentação
                    </Button>
                </form>
            </Dialog>

            {/* Subscription Dialog */}
            <Dialog isOpen={isSubscriptionDialogOpen} onClose={() => setIsSubscriptionDialogOpen(false)} title="Nova Assinatura SaaS">
                <form className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Serviço *</label>
                        <Input type="text" placeholder='Ex: "ChatGPT Plus", "Vercel Pro"' />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Valor Recorrente *</label>
                            <Input type="number" placeholder="0.00" step="0.01" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Frequência *</label>
                            <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Selecione...</option>
                                <option value="monthly">Mensal</option>
                                <option value="quarterly">Trimestral</option>
                                <option value="annual">Anual</option>
                            </select>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Credenciais de Acesso (Vault)
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Login / Usuário *</label>
                                <Input type="text" placeholder="Email ou username" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Senha de Acesso *</label>
                                <Input type="password" placeholder="••••••••" />
                                <p className="text-xs text-slate-500 mt-1">Será armazenada de forma mascarada</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Link de Login</label>
                                <Input type="url" placeholder="https://..." />
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Datas e Prazos</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Renovação / Vencimento (Opcional)</label>
                                <Input type="date" />
                                <p className="text-xs text-slate-500 mt-1">Deixe em branco para ferramentas gratuitas ou lifetime</p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Lembrete de Pagamento</p>
                                    <p className="text-xs text-slate-500">Receber notificação antes do vencimento</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                            backgroundSize: '200% 100%'
                        }}
                    >
                        Adicionar Assinatura
                    </Button>
                </form>
            </Dialog>

            {/* Subscription Detail Sheet */}
            <DetailSheet
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={selectedSubscription?.service || ''}
                onEdit={handleEdit}
                onDelete={handleDelete}
            >
                <div className="space-y-6">
                    {/* Cost */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-sm font-medium text-slate-700">Custo</span>
                        <div className="text-right">
                            <span className="text-2xl font-bold" style={{ color: '#004aad' }}>
                                R$ {selectedSubscription?.cost}
                            </span>
                            <span className="text-sm text-slate-500 ml-2">
                                / {selectedSubscription?.frequency === 'monthly' ? 'mês' : selectedSubscription?.frequency === 'annual' ? 'ano' : 'trimestre'}
                            </span>
                        </div>
                    </div>

                    {/* Renewal Date */}
                    {selectedSubscription?.renewalDate && (
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-sm font-medium text-slate-700">Data de Renovação</span>
                            <span className="font-medium text-slate-900">
                                {new Date(selectedSubscription.renewalDate).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                    )}

                    {/* Login Email */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <h4 className="text-xs font-medium text-slate-500 mb-2">Login</h4>
                        <p className="font-medium text-slate-900">{selectedSubscription?.login}</p>
                    </div>

                    {/* Password */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <h4 className="text-xs font-medium text-slate-500 mb-2">Senha</h4>
                        <p className="font-mono text-slate-900">{selectedSubscription?.password}</p>
                    </div>

                    {/* Login URL */}
                    {selectedSubscription?.loginUrl && (
                        <a
                            href={selectedSubscription.loginUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                        >
                            <LinkIcon className="h-5 w-5 text-blue-600" />
                            <span className="text-sm text-blue-600 font-medium">Abrir ferramenta</span>
                        </a>
                    )}

                    {/* Reminder Status */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-sm font-medium text-slate-700">Lembrete de Renovação</span>
                        {selectedSubscription?.reminder ? (
                            <div className="flex items-center gap-2 text-blue-600">
                                <Bell className="h-4 w-4" />
                                <span className="text-sm font-medium">Ativo</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-400">
                                <BellOff className="h-4 w-4" />
                                <span className="text-sm font-medium">Desativado</span>
                            </div>
                        )}
                    </div>
                </div>
            </DetailSheet>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Excluir Assinatura"
                message="Tem certeza que deseja excluir esta assinatura? As credenciais serão perdidas."
                itemName={selectedSubscription?.service}
            />
        </div>
    );
}
