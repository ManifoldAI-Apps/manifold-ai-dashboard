import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { DetailSheet } from '../../components/ui/DetailSheet';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Plus, ArrowUpRight, ArrowDownRight, Calendar, Eye, EyeOff, Lock, Mail, Link as LinkIcon, Bell, BellOff, Loader2, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    status: 'paid' | 'pending' | 'scheduled';
    category: string;
    transaction_date: string; // YYYY-MM-DD
    client_id?: string;
    project_id?: string;
}

interface Subscription {
    id: string;
    service: string; // db: service_name
    cost: number;
    frequency: 'monthly' | 'quarterly' | 'annual';
    renewalDate: string | null; // db: renewal_date
    login?: string; // db: login_email
    password?: string; // db: login_password
    loginUrl?: string; // db: login_url
    reminder: boolean; // db: reminder_enabled
}

export default function Financials() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'cashflow' | 'saas'>('cashflow');
    const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
    const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
    const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

    // Selection & Deletion
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null); // For deletion confirmation
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isTransDeleteDialogOpen, setIsTransDeleteDialogOpen] = useState(false);

    // Form State
    const [transFormData, setTransFormData] = useState<Partial<any>>({ date: new Date().toISOString().split('T')[0], status: 'paid' });
    const [subFormData, setSubFormData] = useState<Partial<any>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [transRes, subsRes] = await Promise.all([
                supabase.from('financial_transactions')
                    .select('*')
                    .order('transaction_date', { ascending: false }),
                supabase.from('subscriptions')
                    .select('*')
                    .order('cost', { ascending: false })
            ]);

            if (transRes.error) throw transRes.error;
            if (subsRes.error) throw subsRes.error;

            setTransactions((transRes.data || []).map(t => ({
                id: t.id,
                description: t.description,
                amount: t.amount,
                type: t.type,
                status: t.status,
                category: t.category,
                transaction_date: t.transaction_date,
                client_id: t.client_id,
                project_id: t.project_id
            })));

            setSubscriptions((subsRes.data || []).map(s => ({
                id: s.id,
                service: s.service_name,
                cost: s.cost,
                frequency: s.frequency,
                renewalDate: s.renewal_date,
                login: s.login_email,
                password: s.login_password,
                loginUrl: s.login_url,
                reminder: s.reminder_enabled
            })));

        } catch (error) {
            console.error('Error fetching financials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTransInputChange = (field: string, value: any) => {
        setTransFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubInputChange = (field: string, value: any) => {
        setSubFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                description: transFormData.description,
                amount: parseFloat(transFormData.amount || '0'),
                type: transactionType,
                category: transFormData.category,
                transaction_date: transFormData.date,
                status: transFormData.status
            };

            const { error } = await supabase.from('financial_transactions').insert([payload]);
            if (error) throw error;

            setIsTransactionDialogOpen(false);
            setTransFormData({ date: new Date().toISOString().split('T')[0], status: 'paid' });
            fetchData();
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Erro ao salvar transação');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSubscription = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                service_name: subFormData.service,
                cost: parseFloat(subFormData.cost || '0'),
                frequency: subFormData.frequency,
                renewal_date: subFormData.renewalDate || null,
                login_email: subFormData.login,
                login_password: subFormData.password,
                login_url: subFormData.loginUrl,
                reminder_enabled: subFormData.reminder !== false // Default to true if undefined
            };

            let error;
            if (selectedSubscription?.id) {
                const { error: updateError } = await supabase
                    .from('subscriptions')
                    .update(payload)
                    .eq('id', selectedSubscription.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('subscriptions')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            setIsSubscriptionDialogOpen(false);
            setSubFormData({});
            setSelectedSubscription(null);
            fetchData();
        } catch (error) {
            console.error('Error saving subscription:', error);
            alert('Erro ao salvar assinatura');
        } finally {
            setSaving(false);
        }
    };

    const deleteSubscription = async () => {
        if (!selectedSubscription) return;
        try {
            const { error } = await supabase.from('subscriptions').delete().eq('id', selectedSubscription.id);
            if (error) throw error;
            setIsDeleteDialogOpen(false);
            setIsDetailOpen(false);
            setSelectedSubscription(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting subscription:', error);
            alert('Erro ao excluir assinatura');
        }
    };

    const deleteTransaction = async () => {
        if (!selectedTransaction) return;
        try {
            const { error } = await supabase.from('financial_transactions').delete().eq('id', selectedTransaction.id);
            if (error) throw error;
            setIsTransDeleteDialogOpen(false);
            setSelectedTransaction(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Erro ao excluir transação');
        }
    };


    const togglePassword = (id: string) => {
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

    // Calculations
    const totalIncome = transactions.filter(t => t.type === 'income' && t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense' && t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const margin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

    const totalMonthlyCost = subscriptions
        .filter(s => s.frequency === 'monthly')
        .reduce((sum, s) => sum + s.cost, 0);
    // TODO: Normalize annual/quarterly to monthly for better accuracy

    const activeSubscriptions = subscriptions.length; // Simply count for now
    const expiringSubscriptions = subscriptions.filter(s => {
        if (!s.renewalDate) return false;
        const days = getDaysUntilRenewal(s.renewalDate);
        return days !== null && days <= 7 && days >= 0;
    }).length;

    // Chart Data Preparation (Simple aggregation by month)
    const getChartData = () => {
        const months: { [key: string]: { month: string, receita: number, despesas: number } } = {};
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleString('pt-BR', { month: 'short' });
            months[key] = { month: key, receita: 0, despesas: 0 };
        }

        transactions.forEach(t => {
            if (t.status === 'paid') {
                const date = new Date(t.transaction_date);
                const key = date.toLocaleString('pt-BR', { month: 'short' });
                if (months[key]) {
                    if (t.type === 'income') months[key].receita += t.amount;
                    else months[key].despesas += t.amount;
                }
            }
        });
        return Object.values(months);
    };

    const chartData = getChartData();

    const handleCardClick = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setIsDetailOpen(true);
    };

    const handleEdit = () => {
        if (!selectedSubscription) return;
        setSubFormData({
            service: selectedSubscription.service,
            cost: selectedSubscription.cost.toString(),
            frequency: selectedSubscription.frequency,
            renewalDate: selectedSubscription.renewalDate,
            login: selectedSubscription.login,
            password: selectedSubscription.password,
            loginUrl: selectedSubscription.loginUrl,
            reminder: selectedSubscription.reminder
        });
        setIsDetailOpen(false);
        setIsSubscriptionDialogOpen(true);
    };

    const handleDelete = () => {
        setIsDetailOpen(false);
        setIsDeleteDialogOpen(true);
    };

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
                                <CardTitle className="text-sm font-medium text-slate-600">Receita Total (Pago)</CardTitle>
                                <TrendingUp className="h-5 w-5" style={{ color: '#10b981' }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: '#10b981' }}>R$ {totalIncome.toLocaleString('pt-BR')}</div>
                            </CardContent>
                        </Card>

                        <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }} />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Despesas Totais (Pago)</CardTitle>
                                <TrendingDown className="h-5 w-5" style={{ color: '#ef4444' }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: '#ef4444' }}>R$ {totalExpenses.toLocaleString('pt-BR')}</div>
                            </CardContent>
                        </Card>

                        <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: 'rgba(0, 74, 173, 0.2)' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }} />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Lucro Líquido</CardTitle>
                                <DollarSign className="h-5 w-5" style={{ color: '#004aad' }} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: '#004aad' }}>R$ {netProfit.toLocaleString('pt-BR')}</div>
                                <p className="text-xs text-slate-500 mt-1">Margem de {margin}%</p>
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
                                onClick={() => {
                                    setTransactionType('income');
                                    setIsTransactionDialogOpen(true);
                                }}
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
                                <AreaChart data={chartData}>
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
                                {loading ? (
                                    <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6" /></div>
                                ) : transactions.length === 0 ? (
                                    <p className="text-center text-slate-500 py-4">Nenhuma movimentação registrada.</p>
                                ) : (
                                    transactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="group flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-all border border-slate-200 cursor-pointer"
                                            onClick={() => { setSelectedTransaction(transaction); setIsTransDeleteDialogOpen(true); }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`h-12 w-12 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}
                                                >
                                                    {transaction.type === 'income' ? (
                                                        <ArrowUpRight className="h-5 w-5 text-green-700" />
                                                    ) : (
                                                        <ArrowDownRight className="h-5 w-5 text-red-700" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{transaction.description}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-slate-500">{new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}</span>
                                                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">{transaction.category}</span>
                                                        {getStatusBadge(transaction.status)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`text-xl font-bold ${transaction.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                                                {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR')}
                                            </div>
                                        </div>
                                    ))
                                )}
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
                            onClick={() => {
                                setIsSubscriptionDialogOpen(true);
                                setSelectedSubscription(null);
                                setSubFormData({});
                            }}
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
                        {loading ? (
                            <div className="col-span-2 flex justify-center py-6"><Loader2 className="animate-spin h-6 w-6" /></div>
                        ) : subscriptions.length === 0 ? (
                            <div className="col-span-2 text-center py-6 text-slate-500">Nenhuma assinatura cadastrada.</div>
                        ) : (
                            subscriptions.map((sub, index) => {
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
                                                <p className="text-sm font-medium text-slate-900">{sub.login || '-'}</p>
                                            </div>

                                            {/* Password */}
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Lock className="h-4 w-4 text-slate-600" />
                                                        <span className="text-xs text-slate-500">Senha</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); togglePassword(sub.id); }}
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
                                            {sub.loginUrl && (
                                                <a
                                                    href={sub.loginUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <LinkIcon className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm text-blue-600 font-medium">Abrir ferramenta</span>
                                                </a>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Transaction Dialog */}
            <Dialog isOpen={isTransactionDialogOpen} onClose={() => setIsTransactionDialogOpen(false)} title="Nova Movimentação">
                <form onSubmit={handleSaveTransaction} className="space-y-4 mt-4">
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
                        <Input
                            type="text"
                            placeholder="Ex: Pagamento Cliente XYZ"
                            value={transFormData.description || ''}
                            onChange={(e) => handleTransInputChange('description', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Valor *</label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            value={transFormData.amount || ''}
                            onChange={(e) => handleTransInputChange('amount', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Categoria *</label>
                        <select
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={transFormData.category || ''}
                            onChange={(e) => handleTransInputChange('category', e.target.value)}
                            required
                        >
                            <option value="">Selecione...</option>
                            <option value="impostos">Impostos</option>
                            <option value="pessoal">Pessoal</option>
                            <option value="infraestrutura">Infraestrutura</option>
                            <option value="vendas">Vendas</option>
                            <option value="marketing">Marketing</option>
                            <option value="outros">Outros</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data de Competência *</label>
                        <Input
                            type="date"
                            value={transFormData.date || ''}
                            onChange={(e) => handleTransInputChange('date', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                        <select
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={transFormData.status || 'paid'}
                            onChange={(e) => handleTransInputChange('status', e.target.value)}
                            required
                        >
                            <option value="paid">Pago</option>
                            <option value="pending">Pendente</option>
                            <option value="scheduled">Agendado</option>
                        </select>
                    </div>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="w-full animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                            backgroundSize: '200% 100%'
                        }}
                    >
                        {saving ? <Loader2 className="animate-spin h-5 w-5" /> : 'Adicionar Movimentação'}
                    </Button>
                </form>
            </Dialog>

            {/* Subscription Dialog */}
            <Dialog isOpen={isSubscriptionDialogOpen} onClose={() => setIsSubscriptionDialogOpen(false)} title={selectedSubscription ? "Editar Assinatura" : "Nova Assinatura SaaS"}>
                <form onSubmit={handleSaveSubscription} className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Serviço *</label>
                        <Input
                            type="text"
                            placeholder='Ex: "ChatGPT Plus", "Vercel Pro"'
                            value={subFormData.service || ''}
                            onChange={(e) => handleSubInputChange('service', e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Valor Recorrente *</label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                value={subFormData.cost || ''}
                                onChange={(e) => handleSubInputChange('cost', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Frequência *</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={subFormData.frequency || ''}
                                onChange={(e) => handleSubInputChange('frequency', e.target.value)}
                                required
                            >
                                <option value="">Selecione...</option>
                                <option value="monthly">Mensal</option>
                                <option value="quarterly">Trimestral</option>
                                <option value="annual">Anual</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data de Renovação</label>
                            <Input
                                type="date"
                                value={subFormData.renewalDate || ''}
                                onChange={(e) => handleSubInputChange('renewalDate', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center mt-6">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={subFormData.reminder !== false}
                                    onChange={(e) => handleSubInputChange('reminder', e.target.checked)}
                                />
                                <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ms-3 text-sm font-medium text-slate-700">Lembrete de renovação</span>
                            </label>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4 mt-4">
                        <h4 className="text-sm font-semibold text-slate-900 mb-3">Credenciais de Acesso</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Login / Email</label>
                                <Input
                                    type="text"
                                    placeholder="email@empresa.com"
                                    value={subFormData.login || ''}
                                    onChange={(e) => handleSubInputChange('login', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                                <div className="relative">
                                    <Input
                                        type={subFormData.showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={subFormData.password || ''}
                                        onChange={(e) => handleSubInputChange('password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                        onClick={() => handleSubInputChange('showPassword', !subFormData.showPassword)}
                                    >
                                        {subFormData.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">URL de Login</label>
                                <Input
                                    type="url"
                                    placeholder="https://app.servico.com/login"
                                    value={subFormData.loginUrl || ''}
                                    onChange={(e) => handleSubInputChange('loginUrl', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={saving}
                        className="w-full animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                            backgroundSize: '200% 100%'
                        }}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            selectedSubscription ? 'Salvar Alterações' : 'Adicionar Assinatura'
                        )}
                    </Button>
                </form>
            </Dialog>

            {/* Detail Sheet for Subscription */}
            <DetailSheet
                isOpen={isDetailOpen}
                onClose={() => { setIsDetailOpen(false); setSelectedSubscription(null); }}
                title={selectedSubscription?.service || 'Detalhes'}
            >
                {selectedSubscription && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg">
                            <div>
                                <p className="text-sm text-slate-500">Custo</p>
                                <p className="text-2xl font-bold text-slate-900">R$ {selectedSubscription.cost}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500">Frequência</p>
                                <p className="font-medium capitalize text-slate-900">
                                    {selectedSubscription.frequency === 'monthly' ? 'Mensal' :
                                        selectedSubscription.frequency === 'annual' ? 'Anual' : 'Trimestral'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-slate-500 mb-2">Renovação</h3>
                                <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg">
                                    <Calendar className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {selectedSubscription.renewalDate ? new Date(selectedSubscription.renewalDate).toLocaleDateString('pt-BR') : 'Não definida'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {selectedSubscription.reminder ? 'Lembrete ativado' : 'Sem lembrete'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-slate-500 mb-2">Acesso</h3>
                                <div className="space-y-2">
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500 mb-1">Login</p>
                                        <p className="font-medium">{selectedSubscription.login || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Senha</p>
                                            <p className="font-mono">
                                                {showPasswords[selectedSubscription.id] ? selectedSubscription.password : '••••••••••••'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => togglePassword(selectedSubscription.id)}
                                            className="text-slate-400 hover:text-slate-600"
                                        >
                                            {showPasswords[selectedSubscription.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {selectedSubscription.loginUrl && (
                                        <a
                                            href={selectedSubscription.loginUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors w-full font-medium"
                                        >
                                            <LinkIcon className="h-4 w-4" />
                                            Acessar Plataforma
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200 flex flex-col gap-3">
                            <Button
                                onClick={handleEdit}
                                variant="outline"
                                className="w-full justify-center"
                            >
                                <Calendar className="h-4 w-4 mr-2" />
                                Editar Assinatura
                            </Button>
                            <Button
                                onClick={handleDelete}
                                variant="destructive"
                                className="w-full justify-center bg-red-50 text-red-600 hover:bg-red-100 border-none"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir Assinatura
                            </Button>
                        </div>
                    </div>
                )}
            </DetailSheet>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={deleteSubscription}
                title="Excluir Assinatura"
                message={`Tem certeza que deseja excluir a assinatura de ${selectedSubscription?.service}?`}
                itemName={selectedSubscription?.service}
            />

            <ConfirmDialog
                isOpen={isTransDeleteDialogOpen}
                onClose={() => setIsTransDeleteDialogOpen(false)}
                onConfirm={deleteTransaction}
                title="Excluir Movimentação"
                message="Tem certeza que deseja excluir esta movimentação financeira?"
                itemName={selectedTransaction?.description}
            />
        </div>
    );
}
