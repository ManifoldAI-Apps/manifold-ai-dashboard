import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { Search, Plus, Briefcase, Calendar, Users, DollarSign, Clock, Target, Link as LinkIcon, Tag, AlertCircle, CheckCircle2, Pause, XCircle, Loader2 } from 'lucide-react';
import { DetailSheet } from '../../components/ui/DetailSheet';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface Project {
    id: string;
    name: string;
    client: string; // Display name
    client_id?: string;
    status: string;
    priority: string;
    deadline: string;
    budget: string; // Display format
    budget_value?: number;
    team: number;
    progress: number;
    description?: string;
    team_lead_id?: string;
    start_date?: string;
    project_link?: string;
}

interface ClientOption {
    id: string;
    name: string;
}

interface TeamOption {
    id: string;
    name: string;
    role: string;
    avatar: string;
}

export default function Projects() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [availableClients, setAvailableClients] = useState<ClientOption[]>([]);
    const [availableTeam, setAvailableTeam] = useState<TeamOption[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [formTab, setFormTab] = useState<'visao' | 'cronograma' | 'squad'>('visao');

    const [formData, setFormData] = useState<Partial<Project>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectsRes, clientsRes, profilesRes] = await Promise.all([
                supabase.from('projects')
                    .select('*, clients(name)')
                    .order('created_at', { ascending: false }),
                supabase.from('clients').select('id, name'),
                supabase.from('profiles').select('id, full_name, role, avatar_url')
            ]);

            if (projectsRes.error) throw projectsRes.error;
            if (clientsRes.error) throw clientsRes.error;
            if (profilesRes.error) throw profilesRes.error;

            // Process Projects
            const formattedProjects: Project[] = (projectsRes.data || []).map(p => ({
                id: p.id,
                name: p.name,
                client: p.clients?.name || 'Interno',
                client_id: p.client_id,
                status: mapStatusFromDB(p.status),
                priority: mapPriorityFromDB(p.priority),
                deadline: p.deadline || '',
                budget: p.budget ? `R$ ${p.budget.toLocaleString('pt-BR')}` : 'R$ 0,00',
                budget_value: p.budget,
                team: p.team_member_ids?.length || 0,
                progress: p.progress || 0,
                description: p.description,
                team_lead_id: p.team_lead_id,
                start_date: p.start_date,
                project_link: p.project_link
            }));
            setProjects(formattedProjects);

            // Process Clients
            setAvailableClients(clientsRes.data || []);

            // Process Team
            setAvailableTeam((profilesRes.data || []).map(p => ({
                id: p.id,
                name: p.full_name,
                role: p.role,
                avatar: p.full_name.charAt(0)
            })));

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const mapStatusFromDB = (status: string) => {
        const map: { [key: string]: string } = {
            'planejamento': 'Em Planejamento',
            'em_andamento': 'Em Andamento',
            'pausado': 'Pausado',
            'concluido': 'Concluído',
            'cancelado': 'Cancelado'
        };
        return map[status] || status;
    };

    const mapStatusToDB = (status: string) => {
        const map: { [key: string]: string } = {
            'Em Planejamento': 'planejamento',
            'Em Andamento': 'em_andamento',
            'Pausado': 'pausado',
            'Concluído': 'concluido',
            'Cancelado': 'cancelado'
        };
        return map[status] || status.toLowerCase();
    };

    const mapPriorityFromDB = (priority: string) => {
        const map: { [key: string]: string } = {
            'alta': 'Alta',
            'media': 'Média',
            'baixa': 'Baixa'
        };
        return map[priority] || priority;
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const projectPayload = {
                name: formData.name,
                description: formData.description,
                client_id: formData.client_id || null,
                status: mapStatusToDB(formData.status || 'Em Planejamento'),
                priority: (formData.priority || 'Média').toLowerCase(),
                start_date: formData.start_date || null,
                deadline: formData.deadline || null,
                budget: parseFloat(formData.budget?.replace(/[^0-9,.]/g, '').replace(',', '.') || '0'),
                team_lead_id: formData.team_lead_id || user?.id, // Default to creator if not set
                progress: formData.progress || 0,
                project_link: formData.project_link
                // team_member_ids: [] // TODO: Add multiple select logic
            };

            let error;
            if (selectedProject?.id) {
                const { error: updateError } = await supabase
                    .from('projects')
                    .update(projectPayload)
                    .eq('id', selectedProject.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('projects')
                    .insert([projectPayload]);
                error = insertError;
            }

            if (error) throw error;

            setIsDialogOpen(false);
            setFormData({});
            setFormTab('visao');
            fetchData();
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Erro ao salvar projeto.');
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedProject?.id) return;
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', selectedProject.id);

            if (error) throw error;

            setIsDeleteDialogOpen(false);
            setSelectedProject(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Erro ao excluir projeto.');
        }
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusIcon = (status: string) => {
        const icons: { [key: string]: any } = {
            'Em Planejamento': <Clock className="h-4 w-4" />,
            'Em Andamento': <Target className="h-4 w-4" />,
            'Pausado': <Pause className="h-4 w-4" />,
            'Concluído': <CheckCircle2 className="h-4 w-4" />,
            'Cancelado': <XCircle className="h-4 w-4" />
        };
        return icons[status] || <AlertCircle className="h-4 w-4" />;
    };

    const getStatusBadge = (status: string) => {
        const styles: { [key: string]: string } = {
            'Em Planejamento': 'bg-blue-100 text-blue-700',
            'Em Andamento': 'bg-green-100 text-green-700',
            'Pausado': 'bg-yellow-100 text-yellow-700',
            'Concluído': 'bg-slate-100 text-slate-700',
            'Cancelado': 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${styles[status] || 'bg-slate-100'}`}>
                {getStatusIcon(status)}
                {status}
            </span>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const styles: { [key: string]: string } = {
            'Alta': 'bg-red-100 text-red-700',
            'Média': 'bg-yellow-100 text-yellow-700',
            'Baixa': 'bg-blue-100 text-blue-700'
        };
        const emoji: { [key: string]: string } = {
            'Alta': '🔴',
            'Média': '🟡',
            'Baixa': '🔵'
        };
        return (
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[priority] || 'bg-slate-100'}`}>
                {emoji[priority]} {priority}
            </span>
        );
    };

    const handleCardClick = (project: Project) => {
        setSelectedProject(project);
        setIsDetailOpen(true);
    };

    const handleEdit = () => {
        if (selectedProject) {
            setFormData({
                ...selectedProject,
                budget: selectedProject.budget_value?.toString()
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
                        <span style={{ color: '#004aad' }}>Projetos</span>
                    </h1>
                    <p className="text-slate-600 text-lg">Gestão completa do ciclo de vida das entregas</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedProject(null);
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
                    Novo Projeto
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(0, 74, 173, 0.2)', animationDelay: '0.1s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Projetos</CardTitle>
                        <Briefcase className="h-5 w-5" style={{ color: '#004aad' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#004aad' }}>{projects.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Total cadastrado</p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', animationDelay: '0.2s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Em Andamento</CardTitle>
                        <Target className="h-5 w-5" style={{ color: '#10b981' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#10b981' }}>
                            {projects.filter(p => p.status === 'Em Andamento').length}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {projects.length > 0 ? Math.round((projects.filter(p => p.status === 'Em Andamento').length / projects.length) * 100) : 0}% do total
                        </p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(189, 90, 255, 0.2)', animationDelay: '0.3s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(189, 90, 255, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Concluídos</CardTitle>
                        <CheckCircle2 className="h-5 w-5" style={{ color: '#bd5aff' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#bd5aff' }}>
                            {projects.filter(p => p.status === 'Concluído').length}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {projects.length > 0 ? Math.round((projects.filter(p => p.status === 'Concluído').length / projects.length) * 100) : 0}% do total
                        </p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', animationDelay: '0.4s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Atrasados</CardTitle>
                        <AlertCircle className="h-5 w-5" style={{ color: '#ef4444' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#ef4444' }}>0</div>
                        <p className="text-xs text-slate-500 mt-1">Requer atenção (Mock)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search Bar */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                    type="text"
                    placeholder="Buscar projetos por nome ou cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
            </div>

            {/* Projects Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    Nenhum projeto encontrado. {searchTerm ? 'Tente outro termo.' : 'Crie um novo projeto.'}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    {filteredProjects.map((project, index) => (
                        <Card
                            key={project.id}
                            onClick={() => handleCardClick(project)}
                            className="group relative overflow-hidden border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                            style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }} />
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl font-bold group-hover:translate-x-1 transition-transform mb-2">{project.name}</CardTitle>
                                        <p className="text-sm text-slate-600 flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            {project.client}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                        {getStatusBadge(project.status)}
                                        {getPriorityBadge(project.priority)}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Calendar className="h-4 w-4" />
                                        <span>Prazo: {project.deadline ? new Date(project.deadline).toLocaleDateString('pt-BR') : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Users className="h-4 w-4" />
                                        <span>{project.team} pessoas</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-slate-600">Progresso</span>
                                        <span className="font-bold" style={{ color: '#004aad' }}>{project.progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${project.progress}%`,
                                                background: 'linear-gradient(90deg, #004aad, #bd5aff)'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-slate-400" />
                                        <span className="text-lg font-bold" style={{ color: '#004aad' }}>{project.budget}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Advanced Project Dialog with Tabs */}
            <Dialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title={selectedProject ? "Editar Projeto" : "Novo Projeto"}
            >
                {/* Form Tabs */}
                <div className="flex gap-2 border-b border-slate-200 mb-6">
                    <button
                        onClick={() => setFormTab('visao')}
                        className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 ${formTab === 'visao'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Target className="h-4 w-4" />
                        Visão Geral
                    </button>
                    <button
                        onClick={() => setFormTab('cronograma')}
                        className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 ${formTab === 'cronograma'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Calendar className="h-4 w-4" />
                        Cronograma & Prazos
                    </button>
                    <button
                        onClick={() => setFormTab('squad')}
                        className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 ${formTab === 'squad'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Users className="h-4 w-4" />
                        Squad & Financeiro
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tab: Visão Geral */}
                    {formTab === 'visao' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Projeto *</label>
                                <Input
                                    type="text"
                                    placeholder="Ex: Automação de Processos"
                                    value={formData.name || ''}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente Associado (Opcional)</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.client_id || ''}
                                    onChange={(e) => handleInputChange('client_id', e.target.value)}
                                >
                                    <option value="">Selecione um cliente ou deixe em branco</option>
                                    {availableClients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Deixe em branco para projetos internos ou de P&D</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição do Escopo *</label>
                                <p className="text-xs text-slate-500 mb-2">Briefing, requisitos e objetivos macro</p>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                                    placeholder="Cole aqui o briefing completo do projeto, incluindo requisitos técnicos, objetivos de negócio e entregas esperadas..."
                                    value={formData.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <Tag className="h-4 w-4" />
                                    Tags / Categorias
                                </label>
                                <select multiple className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]">
                                    <option value="consultoria">Consultoria</option>
                                    <option value="desenvolvimento">Desenvolvimento</option>
                                    <option value="ia">Inteligência Artificial</option>
                                    <option value="auditoria">Auditoria</option>
                                    <option value="design">Design</option>
                                    <option value="dados">Análise de Dados</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Segure Ctrl/Cmd para selecionar múltiplas tags</p>
                            </div>
                        </div>
                    )}

                    {/* Tab: Cronograma */}
                    {formTab === 'cronograma' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Data de Início</label>
                                    <Input
                                        type="date"
                                        value={formData.start_date || ''}
                                        onChange={(e) => handleInputChange('start_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Prazo de Entrega (Deadline)</label>
                                    <Input
                                        type="date"
                                        value={formData.deadline || ''}
                                        onChange={(e) => handleInputChange('deadline', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status do Projeto *</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.status || 'Em Planejamento'}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                >
                                    <option value="Em Planejamento">Em Planejamento</option>
                                    <option value="Em Andamento">Em Andamento</option>
                                    <option value="Pausado">Pausado</option>
                                    <option value="Concluído">Concluído</option>
                                    <option value="Cancelado">Cancelado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade *</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.priority || 'Média'}
                                    onChange={(e) => handleInputChange('priority', e.target.value)}
                                >
                                    <option value="Alta">🔴 Alta</option>
                                    <option value="Média">🟡 Média</option>
                                    <option value="Baixa">🔵 Baixa</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Tab: Squad & Financeiro */}
                    {formTab === 'squad' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Gerente do Projeto (PM) *</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.team_lead_id || ''}
                                    onChange={(e) => handleInputChange('team_lead_id', e.target.value)}
                                >
                                    <option value="">Selecione o PM...</option>
                                    {availableTeam.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.role || 'Membro'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Equipe Alocada (Squad)</label>
                                <select multiple className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]">
                                    {availableTeam.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.role || 'Membro'})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Segure Ctrl/Cmd para selecionar múltiplos membros (Mock na visualização)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Orçamento Total Estimado
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                    value={formData.budget_value || ''}
                                    onChange={(e) => handleInputChange('budget', e.target.value)}
                                />
                                <p className="text-xs text-slate-500 mt-1">Valor total estimado para o projeto</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4" />
                                    Link Externo
                                </label>
                                <Input
                                    type="url"
                                    placeholder="https://drive.google.com/... ou https://github.com/..."
                                    value={formData.project_link || ''}
                                    onChange={(e) => handleInputChange('project_link', e.target.value)}
                                />
                                <p className="text-xs text-slate-500 mt-1">Link para Drive, Figma, GitHub ou outro recurso</p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        {formTab !== 'visao' && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    if (formTab === 'cronograma') setFormTab('visao');
                                    if (formTab === 'squad') setFormTab('cronograma');
                                }}
                                className="border-slate-300 hover:bg-slate-100"
                            >
                                Anterior
                            </Button>
                        )}
                        {formTab !== 'squad' ? (
                            <Button
                                type="button"
                                onClick={() => {
                                    if (formTab === 'visao') setFormTab('cronograma');
                                    if (formTab === 'cronograma') setFormTab('squad');
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
                                    'Criar Projeto'
                                )}
                            </Button>
                        )}
                    </div>
                </form>
            </Dialog>

            <DetailSheet
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={selectedProject?.name || ''}
                onEdit={handleEdit}
                onDelete={handleDelete}
            >
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-slate-500 mb-1">Cliente</h4>
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-slate-900">{selectedProject?.client}</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-slate-500 mb-1">Orçamento</h4>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-slate-900">{selectedProject?.budget}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                            <h4 className="text-xs font-medium text-slate-500 mb-1">Status</h4>
                            {selectedProject && getStatusBadge(selectedProject.status)}
                        </div>
                        <div>
                            <h4 className="text-xs font-medium text-slate-500 mb-1">Prioridade</h4>
                            {selectedProject && getPriorityBadge(selectedProject.priority)}
                        </div>
                    </div>

                    {/* Deadline */}
                    <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-2">Prazos</h4>
                        <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-md">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <span className="text-sm text-slate-700">Deadline: <b>{selectedProject?.deadline ? new Date(selectedProject.deadline).toLocaleDateString('pt-BR') : 'N/A'}</b></span>
                        </div>
                    </div>

                    {/* Progress */}
                    <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                            <h4 className="font-medium text-slate-900">Progresso Geral</h4>
                            <span className="font-bold text-blue-600">{selectedProject?.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3">
                            <div
                                className="h-3 rounded-full transition-all duration-500"
                                style={{
                                    width: `${selectedProject?.progress}%`,
                                    background: 'linear-gradient(90deg, #004aad, #bd5aff)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </DetailSheet>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Excluir Projeto"
                message="Tem certeza que deseja excluir este projeto? Todo o histórico de progresso será perdido."
                itemName={selectedProject?.name}
            />
        </div>
    );
}
