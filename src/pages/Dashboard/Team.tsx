import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { DetailSheet } from '../../components/ui/DetailSheet';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Users, Shield, Briefcase, Mail, User, Calendar, DollarSign, Tag, Crown, Eye, Edit, UserCheck, UserX, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface TeamMember {
    id: string; // uuid
    name: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Editor' | 'Viewer';
    department: string;
    position: string;
    avatar: string | null;
    status: 'active' | 'suspended' | 'pending';
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
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<TeamMember>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [profilesRes, projectsRes] = await Promise.all([
                supabase.from('profiles').select('*'),
                supabase.from('projects').select('id, team_members')
            ]);

            if (profilesRes.error) throw profilesRes.error;
            if (projectsRes.error) throw projectsRes.error;

            const projects = projectsRes.data || [];

            const formattedMembers: TeamMember[] = (profilesRes.data || []).map(p => {
                // Calculate project count
                const count = projects.filter(proj =>
                    proj.team_members && Array.isArray(proj.team_members) && proj.team_members.includes(p.id)
                ).length;

                return {
                    id: p.id,
                    name: p.full_name,
                    email: p.email || 'N/A', // Email might not be in profile depending on trigger, but usually is
                    role: mapRoleFromDB(p.role),
                    department: p.department || 'Geral',
                    position: p.position || 'Membro',
                    avatar: p.avatar_url,
                    status: p.status || 'active',
                    skills: p.skills || [],
                    hourlyRate: p.hourly_rate || 0,
                    startDate: p.created_at,
                    projectsCount: count
                };
            });

            setMembers(formattedMembers);
        } catch (error) {
            console.error('Error fetching team:', error);
        } finally {
            setLoading(false);
        }
    };

    const mapRoleFromDB = (role: string): any => {
        const map: { [key: string]: string } = {
            'admin': 'Admin',
            'manager': 'Manager',
            'editor': 'Editor',
            'viewer': 'Viewer'
        };
        return map[role] || 'Viewer';
    };

    const mapRoleToDB = (role: string): string => {
        return role.toLowerCase();
    };

    const handleCardClick = (member: TeamMember) => {
        setSelectedMember(member);
        setIsDetailOpen(true);
    };

    const handleEdit = () => {
        if (selectedMember) {
            setFormData({
                ...selectedMember,
                role: selectedMember.role // Ensure format matches
            });
        }
        setIsDetailOpen(false);
        setIsDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedMember) return;
        try {
            const { error } = await supabase.from('profiles').delete().eq('id', selectedMember.id);
            if (error) throw error;
            setIsDeleteDialogOpen(false);
            setSelectedMember(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting member:', error);
            alert('Erro ao remover membro. Verifique se você tem permissão de administrador.');
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSkillsChange = (value: string) => {
        const skills = value.split(',').map(s => s.trim()).filter(s => s);
        setFormData(prev => ({ ...prev, skills }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (selectedMember) {
                // Update
                const payload = {
                    full_name: formData.name,
                    // email: formData.email, // Usually can't change email easily without auth update
                    role: mapRoleToDB(formData.role as string),
                    department: formData.department,
                    position: formData.position,
                    skills: formData.skills,
                    hourly_rate: formData.hourlyRate,
                    status: formData.status
                };
                const { error } = await supabase.from('profiles').update(payload).eq('id', selectedMember.id);
                if (error) throw error;
                fetchData();
            } else {
                // Invite (Mock)
                // In a real app, this would call an Edge Function to inviteUserByEmail
                await new Promise(resolve => setTimeout(resolve, 1000));
                alert('Convite enviado com sucesso! (Simulação - O usuário deve ser criado via Auth)');
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error saving member:', error);
            alert('Erro ao salvar alterações');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({});
        setSelectedMember(null);
        setFormTab('perfil');
    };

    const getRoleBadge = (role: string) => {
        const styles: { [key: string]: string } = {
            'Admin': 'bg-purple-100 text-purple-700',
            'Manager': 'bg-blue-100 text-blue-700',
            'Editor': 'bg-green-100 text-green-700',
            'Viewer': 'bg-slate-100 text-slate-700'
        };
        const icons: Record<string, React.ReactElement> = {
            'Admin': <Crown className="h-3 w-3" />,
            'Manager': <Shield className="h-3 w-3" />,
            'Editor': <Edit className="h-3 w-3" />,
            'Viewer': <Eye className="h-3 w-3" />
        };
        return (
            <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${styles[role] || styles['Viewer']}`}>
                {icons[role] || <Eye className="h-3 w-3" />}
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
        const icons: Record<string, React.ReactElement> = {
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
            <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${styles[status] || styles['pending']}`}>
                {icons[status] || <Clock className="h-3 w-3" />}
                {labels[status] || status}
            </span>
        );
    };

    const activeMembers = members.filter(m => m.status === 'active').length;
    const pendingInvites = members.filter(m => m.status === 'pending').length;
    const totalProjects = members.reduce((sum, m) => sum + m.projectsCount, 0);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

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
                    onClick={() => { resetForm(); setIsDialogOpen(true); }}
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

            {/* Team Members Grid */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
            ) : members.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Nenhum membro encontrado.</div>
            ) : (
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
                                        className="h-16 w-16 rounded-full flex items-center justify-center font-bold text-white text-xl group-hover:scale-110 transition-transform overflow-hidden"
                                        style={{ background: 'linear-gradient(135deg, #004aad, #bd5aff)' }}
                                    >
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                                        ) : (
                                            getInitials(member.name)
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg font-bold mb-1 line-clamp-1">{member.name}</CardTitle>
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
                                    <span className="truncate">{member.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Briefcase className="h-4 w-4" style={{ color: '#004aad' }} />
                                    {member.department}
                                </div>
                                <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-200">
                                    {member.skills.slice(0, 4).map((skill, i) => (
                                        <span key={i} className="px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-700">
                                            {skill}
                                        </span>
                                    ))}
                                    {member.skills.length > 4 && <span className="text-xs text-slate-500">+{member.skills.length - 4}</span>}
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
            )}

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
                                        className="h-20 w-20 rounded-full flex items-center justify-center font-bold text-white text-2xl overflow-hidden"
                                        style={{ background: 'linear-gradient(135deg, #004aad, #bd5aff)' }}
                                    >
                                        {selectedMember.avatar ? (
                                            <img src={selectedMember.avatar} alt={selectedMember.name} className="h-full w-full object-cover" />
                                        ) : (
                                            getInitials(selectedMember.name)
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">{selectedMember.name}</p>
                                        <p className="text-slate-600">{selectedMember.position}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Email</p>
                                        <p className="text-sm font-medium text-slate-900 truncate">{selectedMember.email}</p>
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
                message="Esta ação não pode ser desfeita. O perfil do membro será removido. Para remover o acesso de login, você deve remover o usuário no painel do Supabase."
                itemName={selectedMember?.name}
            />

            {/* Team Member Dialog with Tabs */}
            <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Convidar / Editar Membro">
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

                <form onSubmit={handleSave} className="space-y-4">
                    {/* Tab: Perfil */}
                    {formTab === 'perfil' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                                <Input
                                    type="text"
                                    placeholder="Ex: João Silva Santos"
                                    value={formData.name || ''}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    required
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
                                // disabled={!!selectedMember} // Allow editing for now, though it won't change auth email
                                />
                                <p className="text-xs text-slate-500 mt-1">Será usado para login via Supabase Auth</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cargo / Função *</label>
                                    <Input
                                        type="text"
                                        placeholder='Ex: "Tech Lead", "SDR"'
                                        value={formData.position || ''}
                                        onChange={(e) => handleInputChange('position', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Departamento / Squad *</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.department || ''}
                                        onChange={(e) => handleInputChange('department', e.target.value)}
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Engenharia">Engenharia</option>
                                        <option value="Vendas">Vendas</option>
                                        <option value="Customer Success">Customer Success</option>
                                        <option value="Design">Design</option>
                                        <option value="Diretoria">Diretoria</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Geral">Geral</option>
                                    </select>
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
                                    {['Admin', 'Manager', 'Editor', 'Viewer'].map((role) => (
                                        <label key={role} className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${formData.role === role ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value={role}
                                                checked={formData.role === role}
                                                onChange={() => handleInputChange('role', role)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-slate-900">{role}</span>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Status da Conta *</label>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Conta Ativa</p>
                                        <p className="text-xs text-slate-500">Ativo: Pode fazer login | Suspenso: Bloqueado</p>
                                    </div>
                                    <select
                                        className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.status || 'active'}
                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                    >
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
                                <Input
                                    type="text"
                                    placeholder='Ex: "Python", "React", "Negociação" (separadas por vírgula)'
                                    value={formData.skills ? formData.skills.join(', ') : ''}
                                    onChange={(e) => handleSkillsChange(e.target.value)}
                                />
                                <p className="text-xs text-slate-500 mt-1">Útil para alocação em projetos</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Custo Hora (Opcional - Visível apenas para Admins)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                    value={formData.hourlyRate || ''}
                                    onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                                />
                                <p className="text-xs text-slate-500 mt-1">Para calcular margem de lucro dos projetos baseada nas horas trabalhadas</p>
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
                                disabled={saving}
                                className="ml-auto animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                style={{
                                    backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                                    backgroundSize: '200% 100%'
                                }}
                            >
                                {saving ? <Loader2 className="animate-spin h-5 w-5" /> : (selectedMember ? 'Salvar Aleterações' : 'Enviar Convite')}
                            </Button>
                        )}
                    </div>
                </form>
            </Dialog>
        </div>
    );
}
