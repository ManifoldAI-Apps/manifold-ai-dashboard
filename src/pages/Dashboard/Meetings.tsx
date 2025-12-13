import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { Calendar, Clock, Users, Video, Plus, MapPin, Loader2, Trash2, Edit } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface Meeting {
    id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
    client_id?: string;
    project_id?: string;
    organizer_id: string;
    client_name?: string;
    project_name?: string;
    type?: 'video' | 'presencial'; // Derived from location or meta
    duration?: string; // Derived
    attendees?: number; // Derived
    participant_ids?: string[];
}

interface Option {
    id: string;
    name: string;
}

export default function Meetings() {
    const { user } = useAuth();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

    // Form Dropdown Data
    const [clients, setClients] = useState<Option[]>([]);
    const [projects, setProjects] = useState<Option[]>([]);
    const [profiles, setProfiles] = useState<Option[]>([]);

    // Form State
    const [formData, setFormData] = useState<Partial<any>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [mettingsRes, clientsRes, projectsRes, profilesRes] = await Promise.all([
                supabase.from('meetings')
                    .select('*, clients(name), projects(name)')
                    .order('start_time', { ascending: true }),
                supabase.from('clients').select('id, name'),
                supabase.from('projects').select('id, name'),
                supabase.from('profiles').select('id, full_name')
            ]);

            if (mettingsRes.error) throw mettingsRes.error;

            const formattedMeetings: Meeting[] = (mettingsRes.data || []).map(m => {
                const start = new Date(m.start_time);
                const end = new Date(m.end_time);
                const durationMs = end.getTime() - start.getTime();
                const durationMinutes = Math.floor(durationMs / 60000);

                let durationStr = `${durationMinutes} min`;
                if (durationMinutes >= 60) {
                    const hours = Math.floor(durationMinutes / 60);
                    const mins = durationMinutes % 60;
                    durationStr = mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
                }

                return {
                    ...m,
                    client_name: m.clients?.name,
                    project_name: m.projects?.name,
                    type: m.location?.toLowerCase().includes('http') || m.location?.toLowerCase().includes('zoom') || m.location?.toLowerCase().includes('meet') ? 'video' : 'presencial',
                    duration: durationStr,
                    attendees: (m.participant_ids?.length || 0) + 1, // +1 for organizer
                    dateStr: start.toLocaleDateString('pt-BR'),
                    timeStr: start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                };
            });

            setMeetings(formattedMeetings);
            setClients(clientsRes.data || []);
            setProjects(projectsRes.data || []);
            setProfiles((profilesRes.data || []).map(p => ({ id: p.id, name: p.full_name })));

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleParticipant = (profileId: string) => {
        setFormData(prev => {
            const current = (prev.participant_ids as string[]) || [];
            if (current.includes(profileId)) {
                return { ...prev, participant_ids: current.filter(id => id !== profileId) };
            } else {
                return { ...prev, participant_ids: [...current, profileId] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Calculate start_time and end_time
            const date = formData.date; // YYYY-MM-DD
            const time = formData.time; // HH:MM
            const durationMins = parseInt(formData.duration_minutes || '60');

            const startDate = new Date(`${date}T${time}:00`);
            const endDate = new Date(startDate.getTime() + durationMins * 60000);

            const meetingPayload = {
                title: formData.title,
                description: formData.description,
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
                location: formData.type === 'video' ? (formData.location || 'Google Meet') : formData.location,
                client_id: formData.client_id || null,
                project_id: formData.project_id || null,
                organizer_id: user?.id,
                participant_ids: formData.participant_ids || []
            };

            let error;
            if (selectedMeeting?.id) {
                const { error: updateError } = await supabase
                    .from('meetings')
                    .update(meetingPayload)
                    .eq('id', selectedMeeting.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('meetings')
                    .insert([meetingPayload]);
                error = insertError;
            }

            if (error) throw error;

            setIsDialogOpen(false);
            setFormData({});
            fetchData();
        } catch (error) {
            console.error('Error saving meeting:', error);
            alert('Erro ao salvar reunião.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedMeeting?.id) return;
        try {
            const { error } = await supabase
                .from('meetings')
                .delete()
                .eq('id', selectedMeeting.id);

            if (error) throw error;

            setIsDeleteDialogOpen(false);
            setSelectedMeeting(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting meeting:', error);
            alert('Erro ao excluir reunião.');
        }
    };

    const openEditDialog = (meeting: Meeting) => {
        setSelectedMeeting(meeting);
        const start = new Date(meeting.start_time);
        const end = new Date(meeting.end_time);
        const durationMins = Math.floor((end.getTime() - start.getTime()) / 60000);

        setFormData({
            title: meeting.title,
            description: meeting.description,
            date: start.toISOString().split('T')[0],
            time: start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            duration_minutes: durationMins.toString(),
            type: meeting.type,
            location: meeting.location,
            client_id: meeting.client_id,
            project_id: meeting.project_id,
            participant_ids: meeting.participant_ids || []
        });
        setIsDialogOpen(true);
    };

    // Filter upcoming meetings (future date)
    const upcomingList = meetings.filter(m => new Date(m.start_time) >= new Date());

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Premium */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                        <span style={{ color: '#004aad' }}>Reuniões</span>
                    </h1>
                    <p className="text-slate-600 text-lg">Gerencie suas reuniões e compromissos</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedMeeting(null);
                        setFormData({
                            date: new Date().toISOString().split('T')[0],
                            duration_minutes: '60',
                            type: 'video',
                            participant_ids: []
                        });
                        setIsDialogOpen(true);
                    }}
                    className="animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    style={{
                        backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                        backgroundSize: '200% 100%'
                    }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Reunião
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(0, 74, 173, 0.2)', animationDelay: '0.1s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total de Reuniões</CardTitle>
                        <div className="h-10 w-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(0, 74, 173, 0.1)' }}>
                            <Calendar className="h-5 w-5" style={{ color: '#004aad' }} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#004aad' }}>{meetings.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Total registrado</p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(189, 90, 255, 0.2)', animationDelay: '0.2s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(189, 90, 255, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Esta Semana</CardTitle>
                        <div className="h-10 w-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(189, 90, 255, 0.1)' }}>
                            <Clock className="h-5 w-5" style={{ color: '#bd5aff' }} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#bd5aff' }}>
                            {meetings.filter(m => {
                                const d = new Date(m.start_time);
                                const now = new Date();
                                const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                                return d >= now && d <= nextWeek;
                            }).length}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Próximos 7 dias</p>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', animationDelay: '0.3s' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Participantes</CardTitle>
                        <div className="h-10 w-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                            <Users className="h-5 w-5" style={{ color: '#10b981' }} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: '#10b981' }}>{profiles.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Pessoas na equipe</p>
                    </CardContent>
                </Card>
            </div>

            {/* Google Calendar Integration Placeholder */}
            <Card className="border-slate-200 hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Calendário</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">Integração com Google Calendar</p>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
                        <Calendar className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">Integração com Google Calendar</h3>
                        <p className="text-slate-500 mb-4">
                            Conecte sua conta do Google para sincronizar suas reuniões automaticamente
                        </p>
                        <Button
                            variant="outline"
                            className="border-slate-300 hover:bg-slate-100"
                        >
                            Conectar Google Calendar
                        </Button>
                        <p className="text-xs text-slate-400 mt-4">
                            Placeholder para iframe/widget do Google Calendar API
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming Meetings */}
            <Card className="border-slate-200 hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Sua Agenda</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                    ) : upcomingList.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            Nenhuma reunião agendada para o futuro.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingList.map((meeting, index) => (
                                <div
                                    key={meeting.id}
                                    className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
                                    style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                                >
                                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                                        <div
                                            className="h-12 w-12 rounded-full flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: meeting.type === 'video' ? 'rgba(0, 74, 173, 0.1)' : 'rgba(189, 90, 255, 0.1)' }}
                                        >
                                            {meeting.type === 'video' ? (
                                                <Video className="h-5 w-5" style={{ color: '#004aad' }} />
                                            ) : (
                                                <MapPin className="h-5 w-5" style={{ color: '#bd5aff' }} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 group-hover:translate-x-1 transition-transform">{meeting.title}</p>
                                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(meeting.start_time).toLocaleDateString('pt-BR')}
                                                </span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(meeting.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ({meeting.duration})
                                                </span>
                                                {meeting.client_name && (
                                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                        {meeting.client_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                                        <div className="text-sm text-slate-500 truncate max-w-[200px]">
                                            {meeting.location}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(meeting)}>
                                                <Edit className="h-4 w-4 text-slate-500 hover:text-blue-600" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                setSelectedMeeting(meeting);
                                                setIsDeleteDialogOpen(true);
                                            }}>
                                                <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Meeting Dialog */}
            <Dialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title={selectedMeeting ? "Editar Reunião" : "Nova Reunião"}
            >
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
                        <Input
                            type="text"
                            placeholder="Ex: Reunião com Cliente"
                            value={formData.title || ''}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data *</label>
                            <Input
                                type="date"
                                value={formData.date || ''}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Horário *</label>
                            <Input
                                type="time"
                                value={formData.time || ''}
                                onChange={(e) => handleInputChange('time', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Duração</label>
                        <select
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.duration_minutes || '60'}
                            onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                        >
                            <option value="30">30 minutos</option>
                            <option value="45">45 minutos</option>
                            <option value="60">1 hora</option>
                            <option value="90">1h 30min</option>
                            <option value="120">2 horas</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente (Opcional)</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.client_id || ''}
                                onChange={(e) => handleInputChange('client_id', e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Projeto (Opcional)</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.project_id || ''}
                                onChange={(e) => handleInputChange('project_id', e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Participantes</label>
                        <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-md p-2">
                            {profiles.length === 0 ? (
                                <p className="text-xs text-slate-500">Nenhum membro na equipe.</p>
                            ) : (
                                profiles.map(profile => (
                                    <div key={profile.id} className="flex items-center gap-2 py-1">
                                        <input
                                            type="checkbox"
                                            id={`p-${profile.id}`}
                                            checked={(formData.participant_ids || []).includes(profile.id)}
                                            onChange={() => toggleParticipant(profile.id)}
                                            className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`p-${profile.id}`} className="text-sm text-slate-700 cursor-pointer select-none">
                                            {profile.name}
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                        <select
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.type || 'video'}
                            onChange={(e) => handleInputChange('type', e.target.value)}
                        >
                            <option value="video">Vídeo Conferência</option>
                            <option value="presencial">Presencial</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Local/Link</label>
                        <Input
                            type="text"
                            placeholder="Ex: Google Meet, Zoom, Sala 3"
                            value={formData.location || ''}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                        />
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
                            selectedMeeting ? 'Salvar Alterações' : 'Criar Reunião'
                        )}
                    </Button>
                </form>
            </Dialog>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Excluir Reunião"
                message="Tem certeza que deseja excluir esta reunião?"
                itemName={selectedMeeting?.title}
            />
        </div>
    );
}
