import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { Search, Plus, Briefcase, Calendar, Users, DollarSign, Clock, Target, Link as LinkIcon, Tag, AlertCircle, CheckCircle2, Pause, XCircle } from 'lucide-react';
import { DetailSheet } from '../../components/ui/DetailSheet';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface Project {
    id: number;
    name: string;
    client: string;
    status: string;
    priority: string;
    deadline: string;
    budget: string;
    team: number;
    progress: number;
}

export default function Projects() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [formTab, setFormTab] = useState<'visao' | 'cronograma' | 'squad'>('visao');

    // Mock data - clientes disponíveis
    const availableClients = [
        { id: 1, name: 'TechCorp Solutions' },
        { id: 2, name: 'Innovation Labs' },
        { id: 3, name: 'Digital Ventures' },
        { id: 4, name: 'Smart Systems' },
    ];

    // Mock data - equipe disponível
    const availableTeam = [
        { id: 1, name: 'Ana Silva', role: 'PM', avatar: 'AS' },
        { id: 2, name: 'Bruno Costa', role: 'Dev', avatar: 'BC' },
        { id: 3, name: 'Carla Souza', role: 'Designer', avatar: 'CS' },
        { id: 4, name: 'Diego Lima', role: 'Dev', avatar: 'DL' },
    ];

    const projects = [
        {
            id: 1,
            name: 'Automação de Processos',
            client: 'TechCorp Solutions',
            status: 'Em Andamento',
            priority: 'Alta',
            deadline: '2024-07-15',
            budget: 'R$ 125.000',
            team: 4,
            progress: 65
        },
        {
            id: 2,
            name: 'Dashboard Analytics',
            client: 'Innovation Labs',
            status: 'Em Planejamento',
            priority: 'Média',
            deadline: '2024-08-20',
            budget: 'R$ 89.500',
            team: 3,
            progress: 15
        },
        {
            id: 3,
            name: 'Integração API',
            client: 'Digital Ventures',
            status: 'Concluído',
            priority: 'Alta',
            deadline: '2024-06-10',
            budget: 'R$ 210.000',
            team: 5,
            progress: 100
        },
        {
            id: 4,
            name: 'Consultoria IA',
            client: 'Smart Systems',
            status: 'Pausado',
            priority: 'Baixa',
            deadline: '2024-09-30',
            budget: 'R$ 45.000',
            team: 2,
            progress: 30
        },
    ];

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
            <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${styles[status]}`}>
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
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[priority]}`}>
                {emoji[priority]} {priority}
            </span>
        );
    };

    const handleCardClick = (project: Project) => {
        setSelectedProject(project);
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
        setSelectedProject(null);
        // In a real app: setProjects(projects.filter(p => p.id !== selectedProject.id));
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
                        <div className="text-3xl font-bold" style={{ color: '#004aad' }}>24</div>
                        <p className="text-xs text-slate-500 mt-1">+3 este mês</p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', animationDelay: '0.2s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Em Andamento</CardTitle>
                        <Target className="h-5 w-5" style={{ color: '#10b981' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#10b981' }}>12</div>
                        <p className="text-xs text-slate-500 mt-1">50% do total</p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(189, 90, 255, 0.2)', animationDelay: '0.3s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(189, 90, 255, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Concluídos</CardTitle>
                        <CheckCircle2 className="h-5 w-5" style={{ color: '#bd5aff' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#bd5aff' }}>8</div>
                        <p className="text-xs text-slate-500 mt-1">33% do total</p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', animationDelay: '0.4s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Atrasados</CardTitle>
                        <AlertCircle className="h-5 w-5" style={{ color: '#ef4444' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#ef4444' }}>2</div>
                        <p className="text-xs text-slate-500 mt-1">Requer atenção</p>
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
                                    <span>Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}</span>
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

                <form className="space-y-4">
                    {/* Tab: Visão Geral */}
                    {formTab === 'visao' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Projeto *</label>
                                <Input type="text" placeholder="Ex: Automação de Processos" defaultValue={selectedProject?.name || ''} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente Associado (Opcional)</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    defaultValue={selectedProject?.client ? availableClients.find(c => c.name === selectedProject.client)?.id : ""}
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Data de Início *</label>
                                    <Input type="date" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Prazo de Entrega (Deadline) *</label>
                                    <Input type="date" defaultValue={selectedProject?.deadline || ''} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status do Projeto *</label>
                                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Selecione...</option>
                                    <option value="planejamento">Em Planejamento</option>
                                    <option value="andamento">Em Andamento</option>
                                    <option value="pausado">Pausado</option>
                                    <option value="concluido">Concluído</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade *</label>
                                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Selecione...</option>
                                    <option value="alta">🔴 Alta</option>
                                    <option value="media">🟡 Média</option>
                                    <option value="baixa">🔵 Baixa</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Tab: Squad & Financeiro */}
                    {formTab === 'squad' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Gerente do Projeto (PM) *</label>
                                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Selecione o PM...</option>
                                    {availableTeam.filter(m => m.role === 'PM').map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.avatar} - {member.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Equipe Alocada (Squad)</label>
                                <select multiple className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]">
                                    {availableTeam.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.avatar} - {member.name} ({member.role})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Segure Ctrl/Cmd para selecionar múltiplos membros</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Orçamento Total Estimado
                                </label>
                                <Input type="number" placeholder="0.00" step="0.01" defaultValue={selectedProject?.budget.replace('R$ ', '').replace('.', '') || ''} />
                                <p className="text-xs text-slate-500 mt-1">Valor total estimado para o projeto</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4" />
                                    Link Externo
                                </label>
                                <Input type="url" placeholder="https://drive.google.com/... ou https://github.com/..." />
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
                                className="ml-auto animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                style={{
                                    backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                                    backgroundSize: '200% 100%'
                                }}
                            >
                                Criar Projeto
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
                            <span className="text-sm text-slate-700">Deadline: <b>{selectedProject && new Date(selectedProject.deadline).toLocaleDateString()}</b></span>
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
