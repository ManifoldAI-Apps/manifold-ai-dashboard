import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { DetailSheet } from '../../components/ui/DetailSheet';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Users, Shield, Briefcase, Mail, User, Calendar, DollarSign, Tag, Crown, Eye, Edit, UserCheck, UserX, Clock } from 'lucide-react';

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: string;
    department: string;
    position: string;
    avatar: string;
    status: string;
    skills: string[];
    hourlyRate: number;
    startDate: string;
    projectsCount: number;
}

export default function Team() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formTab, setFormTab] = useState<'perfil' | 'acesso' | 'alocacao'>('perfil');
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [members, setMembers] = useState<TeamMember[]>([
        {
            id: 1,
            name: 'Ana Silva',
            email: 'ana.silva@manifold.ai',
            role: 'Admin',
            department: 'Diretoria',
            position: 'CEO',
            avatar: 'AS',
            status: 'active',
            skills: ['Gestão', 'Estratégia', 'Vendas'],
            hourlyRate: 250,
            startDate: '2023-01-15',
            projectsCount: 12
        },
        {
            id: 2,
            name: 'Bruno Costa',
            email: 'bruno.costa@manifold.ai',
            role: 'Manager',
            department: 'Engenharia',
            position: 'Tech Lead',
            avatar: 'BC',
            status: 'active',
            skills: ['Python', 'React', 'AI/ML'],
            hourlyRate: 180,
            startDate: '2023-03-20',
            projectsCount: 8
        },
        {
            id: 3,
            name: 'Carla Souza',
            email: 'carla.souza@manifold.ai',
            role: 'Editor',
            department: 'Design',
            position: 'UX Designer',
            avatar: 'CS',
            status: 'active',
            skills: ['Figma', 'UI/UX', 'Branding'],
            hourlyRate: 120,
            startDate: '2023-06-10',
            projectsCount: 6
        },
        {
            id: 4,
            name: 'Diego Lima',
            email: 'diego.lima@manifold.ai',
            role: 'Viewer',
            department: 'Customer Success',
            position: 'CS Manager',
            avatar: 'DL',
            status: 'active',
            skills: ['Negociação', 'Suporte', 'CRM'],
            hourlyRate: 100,
            startDate: '2023-08-05',
            projectsCount: 4
        },
        {
            id: 5,
            name: 'Elena Martins',
            email: 'elena.martins@manifold.ai',
            role: 'Editor',
            department: 'Vendas',
            position: 'SDR',
            avatar: 'EM',
            status: 'pending',
            skills: ['Prospecção', 'LinkedIn'],
            hourlyRate: 80,
            startDate: '2024-01-10',
            projectsCount: 0
        },
    ]);

    const handleCardClick = (member: TeamMember) => {
        setSelectedMember(member);
        setIsDetailOpen(true);
    };

    const handleEdit = () => {
        setIsDetailOpen(false);
        // Pre-fill form with selected member data
        if (selectedMember) {
            // Form will open with selectedMember data available
            // The form inputs should read from selectedMember when in edit mode
        }
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (selectedMember) {
            setMembers(members.filter(m => m.id !== selectedMember.id));
            setSelectedMember(null);
        }
    };

    const getRoleBadge = (role: string) => {
        const styles: { [key: string]: string } = {
            'Admin': 'bg-purple-100 text-purple-700',
            'Manager': 'bg-blue-100 text-blue-700',
            'Editor': 'bg-green-100 text-green-700',
            'Viewer': 'bg-slate-100 text-slate-700'
        };
        const icons: { [key: string]: JSX.Element } = {
            'Admin': <Crown className="h-3 w-3" />,
            'Manager': <Shield className="h-3 w-3" />,
            'Editor': <Edit className="h-3 w-3" />,
            'Viewer': <Eye className="h-3 w-3" />
        };
        return (
            <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${styles[role]}`}>
                {icons[role]}
                {role}
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const styles: { [key: string]: string } = {
            'active': 'bg-green-100 text-green-700',
            'suspended': 'bg-red-100 text-red-700',
            'pending': 'bg-yellow-100 text-yellow-700'
        };
        const icons: { [key: string]: JSX.Element } = {
            'active': <UserCheck className="h-3 w-3" />,
            'suspended': <UserX className="h-3 w-3" />,
            'pending': <Clock className="h-3 w-3" />
        };
        const labels: { [key: string]: string } = {
            'active': 'Ativo',
            'suspended': 'Suspenso',
            'pending': 'Pendente'
        };
        return (
            <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${styles[status]}`}>
                {icons[status]}
                {labels[status]}
            </span>
        );
    };

    const activeMembers = members.filter(m => m.status === 'active').length;
    const pendingInvites = members.filter(m => m.status === 'pending').length;
    const totalProjects = members.reduce((sum, m) => sum + m.projectsCount, 0);

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Premium */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                        <span style={{ color: '#004aad' }}>Equipe</span>
                    </h1>
                    <p className="text-slate-600 text-lg">Gestão de Usuários, Permissões & Alocação</p>
                </div>
                <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    style={{
                        backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                        backgroundSize: '200% 100%'
                    }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Convidar Membro
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(0, 74, 173, 0.2)', animationDelay: '0.1s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Membros</CardTitle>
                        <Users className="h-5 w-5" style={{ color: '#004aad' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#004aad' }}>{members.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Na organização</p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', animationDelay: '0.2s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Ativos</CardTitle>
                        <UserCheck className="h-5 w-5" style={{ color: '#10b981' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#10b981' }}>{activeMembers}</div>
                        <p className="text-xs text-slate-500 mt-1">Com acesso ativo</p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(245, 158, 11, 0.2)', animationDelay: '0.3s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Convites Pendentes</CardTitle>
                        <Clock className="h-5 w-5" style={{ color: '#f59e0b' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#f59e0b' }}>{pendingInvites}</div>
                        <p className="text-xs text-slate-500 mt-1">Aguardando aceite</p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(189, 90, 255, 0.2)', animationDelay: '0.4s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(189, 90, 255, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Projetos Ativos</CardTitle>
                        <Briefcase className="h-5 w-5" style={{ color: '#bd5aff' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#bd5aff' }}>{totalProjects}</div>
                        <p className="text-xs text-slate-500 mt-1">Alocações totais</p>
                    </CardContent>
                </Card>
            </div>

            {/* Team Members Grid - NOW CLICKABLE */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                {members.map((member, index) => (
                    <Card
                        key={member.id}
                        onClick={() => handleCardClick(member)}
                        className="group relative overflow-hidden border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                        style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }} />
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center font-bold text-white text-xl group-hover:scale-110 transition-transform"
                                    style={{ background: 'linear-gradient(135deg, #004aad, #bd5aff)' }}
                                >
                                    {member.avatar}
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg font-bold mb-1">{member.name}</CardTitle>
                                    <p className="text-sm text-slate-600 mb-2">{member.position}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {getRoleBadge(member.role)}
                                        {getStatusBadge(member.status)}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail className="h-4 w-4" style={{ color: '#004aad' }} />
                                {member.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Briefcase className="h-4 w-4" style={{ color: '#004aad' }} />
                                {member.department}
                            </div>
                            <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-200">
                                {member.skills.map((skill, i) => (
                                    <span key={i} className="px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-700">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500">Projetos</p>
                                    <p className="text-lg font-bold" style={{ color: '#004aad' }}>{member.projectsCount}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Desde</p>
                                    <p className="text-sm font-medium text-slate-700">{new Date(member.startDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Detail Sheet */}
            <DetailSheet
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={selectedMember?.name || ''}
                onEdit={handleEdit}
                onDelete={() => {
                    setIsDetailOpen(false);
                    setIsDeleteDialogOpen(true);
                }}
            >
                {selectedMember && (
                    <div className="space-y-6">
                        {/* Profile Section */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <User className="h-5 w-5" style={{ color: '#004aad' }} />
                                Perfil
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="h-20 w-20 rounded-full flex items-center justify-center font-bold text-white text-2xl"
                                        style={{ background: 'linear-gradient(135deg, #004aad, #bd5aff)' }}
                                    >
                                        {selectedMember.avatar}
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">{selectedMember.name}</p>
                                        <p className="text-slate-600">{selectedMember.position}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Email</p>
                                        <p className="text-sm font-medium text-slate-900">{selectedMember.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Departamento</p>
                                        <p className="text-sm font-medium text-slate-900">{selectedMember.department}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Access Section */}
                        <div className="pt-6 border-t border-slate-200">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5" style={{ color: '#004aad' }} />
                                Acesso
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-slate-500 mb-2">Nível de Acesso</p>
                                    {getRoleBadge(selectedMember.role)}
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-2">Status da Conta</p>
                                    {getStatusBadge(selectedMember.status)}
                                </div>
                            </div>
                        </div>

                        {/* Allocation Section */}
                        <div className="pt-6 border-t border-slate-200">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Briefcase className="h-5 w-5" style={{ color: '#004aad' }} />
                                Alocação
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-2">Habilidades</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMember.skills.map((skill, i) => (
                                            <span key={i} className="px-3 py-1 text-sm rounded-md bg-blue-50 text-blue-700 font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Custo Hora</p>
                                        <p className="text-lg font-bold" style={{ color: '#004aad' }}>R$ {selectedMember.hourlyRate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Projetos Ativos</p>
                                        <p className="text-lg font-bold" style={{ color: '#004aad' }}>{selectedMember.projectsCount}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Data de Início</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {new Date(selectedMember.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DetailSheet>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Excluir Membro da Equipe"
                message="Esta ação não pode ser desfeita. O membro será removido permanentemente do sistema."
                itemName={selectedMember?.name}
            />

            {/* Team Member Dialog with Tabs (existing form) */}
            <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Convidar Membro">
                {/* Form Tabs */}
                <div className="flex gap-2 border-b border-slate-200 mb-6">
                    <button
                        onClick={() => setFormTab('perfil')}
                        className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 ${formTab === 'perfil'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <User className="h-4 w-4" />
                        Perfil
                    </button>
                    <button
                        onClick={() => setFormTab('acesso')}
                        className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 ${formTab === 'acesso'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Shield className="h-4 w-4" />
                        Acesso
                    </button>
                    <button
                        onClick={() => setFormTab('alocacao')}
                        className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 ${formTab === 'alocacao'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Briefcase className="h-4 w-4" />
                        Alocação
                    </button>
                </div>

                <form className="space-y-4">
                    {/* Tab: Perfil */}
                    {formTab === 'perfil' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                                <Input type="text" placeholder="Ex: João Silva Santos" defaultValue={selectedMember?.name || ''} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    E-mail Corporativo *
                                </label>
                                <Input type="email" placeholder="joao.silva@empresa.com" defaultValue={selectedMember?.email || ''} />
                                <p className="text-xs text-slate-500 mt-1">Será usado para login via Supabase Auth</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cargo / Função *</label>
                                    <Input type="text" placeholder='Ex: "Tech Lead", "SDR"' defaultValue={selectedMember?.position || ''} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Departamento / Squad *</label>
                                    <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Selecione...</option>
                                        <option value="engenharia">Engenharia</option>
                                        <option value="vendas">Vendas</option>
                                        <option value="cs">Customer Success</option>
                                        <option value="design">Design</option>
                                        <option value="diretoria">Diretoria</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Foto de Perfil</label>
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                                        JS
                                    </div>
                                    <div className="flex-1">
                                        <Input type="file" accept="image/*" />
                                        <p className="text-xs text-slate-500 mt-1">Ou será gerado automaticamente pelas iniciais</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Acesso */}
                    {formTab === 'acesso' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Nível de Acesso (Role) *
                                </label>
                                <p className="text-xs text-slate-500 mb-3">Define o que a pessoa pode ver ou deletar no sistema (RBAC)</p>
                                <div className="space-y-3">
                                    <label className="flex items-start gap-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-purple-300 transition-colors">
                                        <input type="radio" name="role" value="admin" className="mt-1" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Crown className="h-4 w-4 text-purple-600" />
                                                <span className="font-semibold text-slate-900">Admin</span>
                                            </div>
                                            <p className="text-xs text-slate-600">Acesso total (Financeiro, Configurações, Deletar dados)</p>
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                                        <input type="radio" name="role" value="manager" className="mt-1" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Shield className="h-4 w-4 text-blue-600" />
                                                <span className="font-semibold text-slate-900">Gerente (Manager)</span>
                                            </div>
                                            <p className="text-xs text-slate-600">Cria projetos e vê relatórios, mas não mexe em configurações globais</p>
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-green-300 transition-colors">
                                        <input type="radio" name="role" value="editor" className="mt-1" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Edit className="h-4 w-4 text-green-600" />
                                                <span className="font-semibold text-slate-900">Editor (Member)</span>
                                            </div>
                                            <p className="text-xs text-slate-600">Pode editar tarefas e clientes, mas não deleta projetos</p>
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-slate-300 transition-colors">
                                        <input type="radio" name="role" value="viewer" className="mt-1" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Eye className="h-4 w-4 text-slate-600" />
                                                <span className="font-semibold text-slate-900">Visualizador (Viewer)</span>
                                            </div>
                                            <p className="text-xs text-slate-600">Apenas leitura (ideal para stakeholders ou auditores)</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Status da Conta *</label>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Conta Ativa</p>
                                        <p className="text-xs text-slate-500">Ativo: Pode fazer login | Suspenso: Bloqueado | Pendente: Convite enviado</p>
                                    </div>
                                    <select className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="active">Ativo</option>
                                        <option value="suspended">Suspenso</option>
                                        <option value="pending">Pendente</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Alocação */}
                    {formTab === 'alocacao' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <Tag className="h-4 w-4" />
                                    Tags de Habilidade (Skills)
                                </label>
                                <Input type="text" placeholder='Ex: "Python", "React", "Negociação" (separadas por vírgula)' />
                                <p className="text-xs text-slate-500 mt-1">Útil para alocação em projetos</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Custo Hora (Opcional - Visível apenas para Admins)
                                </label>
                                <Input type="number" placeholder="0.00" step="0.01" />
                                <p className="text-xs text-slate-500 mt-1">Para calcular margem de lucro dos projetos baseada nas horas trabalhadas</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Data de Início
                                </label>
                                <Input type="date" />
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        {formTab !== 'perfil' && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    if (formTab === 'acesso') setFormTab('perfil');
                                    if (formTab === 'alocacao') setFormTab('acesso');
                                }}
                                className="border-slate-300 hover:bg-slate-100"
                            >
                                Anterior
                            </Button>
                        )}
                        {formTab !== 'alocacao' ? (
                            <Button
                                type="button"
                                onClick={() => {
                                    if (formTab === 'perfil') setFormTab('acesso');
                                    if (formTab === 'acesso') setFormTab('alocacao');
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
                                Enviar Convite
                            </Button>
                        )}
                    </div>
                </form>
            </Dialog>
        </div>
    );
}
