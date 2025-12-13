import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { Search, Plus, Building2, Mail, Phone, MapPin, TrendingUp, Users, Linkedin, Globe, User, Briefcase, Target, DollarSign, Loader2 } from 'lucide-react';
import { DetailSheet } from '../../components/ui/DetailSheet';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    projects: number;
    revenue: string;
    status: string;
    funnel: string;
    // Additional fields from DB
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
    mrr?: number;
}

export default function Clients() {
    const { user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [formTab, setFormTab] = useState<'empresa' | 'decisor' | 'estrategia'>('empresa');
    const [saving, setSaving] = useState(false);

    // Form states
    const [formData, setFormData] = useState<Partial<Client>>({});

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedClients: Client[] = (data || []).map(client => ({
                id: client.id,
                name: client.name,
                email: client.decisor_email || '',
                phone: client.decisor_phone || '',
                location: 'Remote',
                projects: 0,
                revenue: client.mrr ? `R$ ${client.mrr.toLocaleString('pt-BR')}` : 'R$ 0,00',
                status: client.status === 'ativo' ? 'Active' : 'Inactive',
                funnel: client.status || 'lead_frio',
                ...client
            }));

            setClients(formattedClients);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const clientData = {
                name: formData.name,
                razao_social: formData.razao_social,
                cnpj: formData.cnpj,
                sector: formData.sector,
                website: formData.website,
                linkedin_url: formData.linkedin_url,
                decisor_name: formData.decisor_name,
                decisor_cargo: formData.decisor_cargo,
                decisor_email: formData.email, // mapped to email in interface
                decisor_phone: formData.phone, // mapped to phone in interface
                dor_principal: formData.dor_principal,
                origem: formData.origem,
                status: formData.funnel || 'lead_frio',
                mrr: parseFloat(formData.revenue?.replace(/[^0-9,.]/g, '').replace(',', '.') || '0'),
                owner_id: user?.id
            };

            // Remove email and phone from top level if they exist in formData but aren't columns
            // Actually, the interface properties email/phone are used for display, but in formData we used them for inputs.
            // ClientData mapping handles this.

            let error;
            if (selectedClient?.id) {
                const { error: updateError } = await supabase
                    .from('clients')
                    .update(clientData)
                    .eq('id', selectedClient.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('clients')
                    .insert([clientData]);
                error = insertError;
            }

            if (error) throw error;

            setIsDialogOpen(false);
            setFormData({});
            setFormTab('empresa');
            fetchClients(); // Refresh list
        } catch (error) {
            console.error('Error saving client:', error);
            alert('Erro ao salvar cliente. Verifique o console.');
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedClient) return;

        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', selectedClient.id);

            if (error) throw error;

            setIsDeleteDialogOpen(false);
            setSelectedClient(null);
            fetchClients(); // Refresh list
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Erro ao excluir cliente.');
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getFunnelBadge = (funnel: string) => {
        const styles: { [key: string]: string } = {
            'lead_frio': 'bg-slate-100 text-slate-700',
            'qualificacao': 'bg-blue-100 text-blue-700',
            'proposta': 'bg-yellow-100 text-yellow-700',
            'ativo': 'bg-green-100 text-green-700',
            'churn': 'bg-red-100 text-red-700'
        };
        const labels: { [key: string]: string } = {
            'lead_frio': 'Lead Frio',
            'qualificacao': 'Em Qualificação',
            'proposta': 'Proposta Enviada',
            'ativo': 'Cliente Ativo',
            'churn': 'Churn'
        };
        const key = funnel.toLowerCase();
        return <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[key] || 'bg-slate-100 text-slate-700'}`}>{labels[key] || funnel}</span>;
    };

    const handleCardClick = (client: Client) => {
        setSelectedClient(client);
        setIsDetailOpen(true);
    };

    const handleEdit = () => {
        // Populate form with selected client data
        if (selectedClient) {
            setFormData({
                ...selectedClient,
                revenue: selectedClient.mrr?.toString(),
                // Map back display fields to form fields if needed or ensure they are consistent
                email: selectedClient.decisor_email,
                phone: selectedClient.decisor_phone
            });
        }
        setIsDetailOpen(false);
        setIsDialogOpen(true);
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
                        <span style={{ color: '#004aad' }}>Clientes</span>
                    </h1>
                    <p className="text-slate-600 text-lg">CRM Inteligente para Vendas Consultivas</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedClient(null);
                        setFormData({});
                        setIsDialogOpen(true);
                    }}
                    className="animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    style={{
                        backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                        backgroundSize: '200% 100%'
                    }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Cliente
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(0, 74, 173, 0.2)', animationDelay: '0.1s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total de Clientes</CardTitle>
                        <div className="h-10 w-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(0, 74, 173, 0.1)' }}>
                            <Users className="h-5 w-5" style={{ color: '#004aad' }} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#004aad' }}>{clients.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Total cadastrado</p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(189, 90, 255, 0.2)', animationDelay: '0.2s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(189, 90, 255, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Receita Estimada</CardTitle>
                        <div className="h-10 w-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(189, 90, 255, 0.1)' }}>
                            <TrendingUp className="h-5 w-5" style={{ color: '#bd5aff' }} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#bd5aff' }}>
                            {clients.reduce((acc, client) => acc + (client.mrr || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">MRR Total</p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(0, 74, 173, 0.2)', animationDelay: '0.3s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Ativos</CardTitle>
                        <div className="h-10 w-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(0, 74, 173, 0.1)' }}>
                            <Building2 className="h-5 w-5" style={{ color: '#004aad' }} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#004aad' }}>
                            {clients.filter(c => c.funnel === 'ativo').length}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Clientes Ativos</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search Bar */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                    type="text"
                    placeholder="Buscar clientes por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
            </div>

            {/* Clients Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    Nenhum cliente encontrado. Adicione um novo cliente para começar.
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    {filteredClients.map((client, index) => (
                        <Card
                            key={client.id}
                            onClick={() => handleCardClick(client)}
                            className="group relative overflow-hidden border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                            style={{
                                borderColor: index % 2 === 0 ? 'rgba(0, 74, 173, 0.2)' : 'rgba(189, 90, 255, 0.2)',
                                animationDelay: `${0.6 + index * 0.1}s`
                            }}
                        >
                            <div
                                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ backgroundColor: index % 2 === 0 ? 'rgba(0, 74, 173, 0.15)' : 'rgba(189, 90, 255, 0.15)' }}
                            />
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-white text-lg group-hover:scale-110 transition-transform"
                                            style={{ backgroundColor: index % 2 === 0 ? '#004aad' : '#bd5aff' }}
                                        >
                                            {client.name.charAt(0)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold group-hover:translate-x-1 transition-transform">{client.name}</CardTitle>
                                            {getFunnelBadge(client.funnel || 'lead_frio')}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail className="h-4 w-4" style={{ color: index % 2 === 0 ? '#004aad' : '#bd5aff' }} />
                                    {client.email || 'Sem email'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Phone className="h-4 w-4" style={{ color: index % 2 === 0 ? '#004aad' : '#bd5aff' }} />
                                    {client.phone || 'Sem telefone'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPin className="h-4 w-4" style={{ color: index % 2 === 0 ? '#004aad' : '#bd5aff' }} />
                                    {client.location || 'Remoto'}
                                </div>
                                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-500">Projetos</p>
                                        <p className="text-lg font-bold" style={{ color: index % 2 === 0 ? '#004aad' : '#bd5aff' }}>{client.projects}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500">Receita</p>
                                        <p className="text-lg font-bold" style={{ color: index % 2 === 0 ? '#004aad' : '#bd5aff' }}>{client.revenue}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Advanced CRM Dialog with Tabs */}
            <Dialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title={selectedClient ? "Editar Cliente" : "Novo Cliente - CRM Consultivo"}
            >
                {/* Form Tabs */}
                <div className="flex gap-2 border-b border-slate-200 mb-6">
                    <button
                        onClick={() => setFormTab('empresa')}
                        className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 ${formTab === 'empresa'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Building2 className="h-4 w-4" />
                        Empresa
                    </button>
                    <button
                        onClick={() => setFormTab('decisor')}
                        className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 ${formTab === 'decisor'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <User className="h-4 w-4" />
                        Decisor
                    </button>
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
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tab: Empresa */}
                    {formTab === 'empresa' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa (Fantasia) *</label>
                                <Input
                                    type="text"
                                    placeholder="Ex: TechCorp Solutions"
                                    value={formData.name || ''}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Razão Social</label>
                                <Input
                                    type="text"
                                    placeholder="Ex: TechCorp Soluções Ltda"
                                    value={formData.razao_social || ''}
                                    onChange={(e) => handleInputChange('razao_social', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ / Tax ID</label>
                                <Input
                                    type="text"
                                    placeholder="00.000.000/0000-00"
                                    value={formData.cnpj || ''}
                                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Setor / Indústria *</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.sector || ''}
                                    onChange={(e) => handleInputChange('sector', e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="tecnologia">Tecnologia</option>
                                    <option value="varejo">Varejo</option>
                                    <option value="financas">Finanças</option>
                                    <option value="saude">Saúde</option>
                                    <option value="industria">Indústria</option>
                                    <option value="servicos">Serviços</option>
                                    <option value="outros">Outros</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        Website
                                    </label>
                                    <Input
                                        type="url"
                                        placeholder="https://empresa.com"
                                        value={formData.website || ''}
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                        <Linkedin className="h-4 w-4" />
                                        LinkedIn
                                    </label>
                                    <Input
                                        type="url"
                                        placeholder="linkedin.com/company/..."
                                        value={formData.linkedin_url || ''}
                                        onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Decisor */}
                    {formTab === 'decisor' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Responsável *</label>
                                <Input
                                    type="text"
                                    placeholder="Ex: João Silva"
                                    value={formData.decisor_name || ''}
                                    onChange={(e) => handleInputChange('decisor_name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Cargo *
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Ex: CTO, Gerente Financeiro"
                                    value={formData.decisor_cargo || ''}
                                    onChange={(e) => handleInputChange('decisor_cargo', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    E-mail Corporativo *
                                </label>
                                <Input
                                    type="email"
                                    placeholder="joao.silva@empresa.com"
                                    value={formData.email || ''}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Telefone / WhatsApp *
                                </label>
                                <Input
                                    type="tel"
                                    placeholder="+55 11 98765-4321"
                                    value={formData.phone || ''}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Tab: Estratégia */}
                    {formTab === 'estrategia' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Resumo da Solicitação / Dor Principal *</label>
                                <p className="text-xs text-slate-500 mb-2">Descreva exatamente o que o cliente precisa e qual problema está enfrentando</p>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                                    placeholder="Ex: Cliente procura automatizar conciliação bancária pois perde 10h semanais nisso. Atualmente faz tudo manual em planilhas Excel..."
                                    value={formData.dor_principal || ''}
                                    onChange={(e) => handleInputChange('dor_principal', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Origem do Lead</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.origem || ''}
                                    onChange={(e) => handleInputChange('origem', e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="google">Google</option>
                                    <option value="indicacao">Indicação</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="evento">Evento</option>
                                    <option value="cold">Cold Call</option>
                                    <option value="outros">Outros</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status do Funil *</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.funnel || ''}
                                    onChange={(e) => handleInputChange('funnel', e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="lead_frio">Lead Frio</option>
                                    <option value="qualificacao">Em Qualificação</option>
                                    <option value="proposta">Proposta Enviada</option>
                                    <option value="ativo">Cliente Ativo</option>
                                    <option value="churn">Churn</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Potencial de Receita (MRR)
                                </label>
                                <Input
                                    type="text"
                                    placeholder="0.00"
                                    value={formData.revenue || ''}
                                    onChange={(e) => handleInputChange('revenue', e.target.value)}
                                />
                                <p className="text-xs text-slate-500 mt-1">Receita mensal recorrente estimada</p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        {formTab !== 'empresa' && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    if (formTab === 'decisor') setFormTab('empresa');
                                    if (formTab === 'estrategia') setFormTab('decisor');
                                }}
                                className="border-slate-300 hover:bg-slate-100"
                            >
                                Anterior
                            </Button>
                        )}
                        {formTab !== 'estrategia' ? (
                            <Button
                                type="button"
                                onClick={() => {
                                    if (formTab === 'empresa') setFormTab('decisor');
                                    if (formTab === 'decisor') setFormTab('estrategia');
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
                                disabled={saving}
                                className="ml-auto animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
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
                                    'Cadastrar Cliente'
                                )}
                            </Button>
                        )}
                    </div>
                </form>
            </Dialog>

            <DetailSheet
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={selectedClient?.name || ''}
                onEdit={handleEdit}
                onDelete={handleDelete}
            >
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-700">
                                {selectedClient?.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{selectedClient?.name}</h3>
                                {selectedClient && getFunnelBadge(selectedClient.funnel || 'lead_frio')}
                                <div className='mt-1 text-sm text-slate-500'>
                                    {selectedClient?.sector && <span className='mr-2 font-medium'>{selectedClient.sector}</span>}
                                    {selectedClient?.website && <a href={selectedClient.website} target="_blank" rel="noreferrer" className='text-blue-500 hover:underline inline-flex items-center'><Globe className='h-3 w-3 mr-1' /> Site</a>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <h4 className="text-sm font-medium text-slate-900 mb-2">Decisor / Contato</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <User className="h-4 w-4 text-slate-400" />
                                <span className='font-medium'>{selectedClient?.decisor_name || 'N/A'}</span>
                                {selectedClient?.decisor_cargo && <span className='text-slate-400'>({selectedClient.decisor_cargo})</span>}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail className="h-4 w-4 text-slate-400" />
                                {selectedClient?.email || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone className="h-4 w-4 text-slate-400" />
                                {selectedClient?.phone || 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Strategy/BI Info */}
                    {selectedClient?.dor_principal && (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <h4 className="text-sm font-medium text-slate-900 mb-2">Dor Principal</h4>
                            <p className="text-sm text-slate-600 italic">"{selectedClient.dor_principal}"</p>
                        </div>
                    )}

                    {/* Business Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <h4 className="text-xs font-medium text-slate-500 mb-1">Receita Mensal (MRR)</h4>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="text-lg font-bold text-green-700">{selectedClient?.revenue}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <h4 className="text-xs font-medium text-slate-500 mb-1">Projetos Ativos</h4>
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-blue-600" />
                                <span className="text-lg font-bold text-blue-700">{selectedClient?.projects}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DetailSheet>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Excluir Cliente"
                message="Tem certeza que deseja excluir este cliente? Todos os dados vinculados serão perdidos."
                itemName={selectedClient?.name}
            />
        </div>
    );
}
