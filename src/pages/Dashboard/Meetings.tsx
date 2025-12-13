import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { Calendar, Clock, Users, Video, Plus, MapPin } from 'lucide-react';

export default function Meetings() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const upcomingMeetings: any[] = [];

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
                    onClick={() => setIsDialogOpen(true)}
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
                        <div className="text-3xl font-bold" style={{ color: '#004aad' }}>0</div>
                        <p className="text-xs text-slate-500 mt-1">Este mês</p>
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
                        <div className="text-3xl font-bold" style={{ color: '#bd5aff' }}>0</div>
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
                        <div className="text-3xl font-bold" style={{ color: '#10b981' }}>0</div>
                        <p className="text-xs text-slate-500 mt-1">Pessoas envolvidas</p>
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
                    <CardTitle className="text-2xl font-bold">Próximas Reuniões</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {upcomingMeetings.map((meeting, index) => (
                            <div
                                key={meeting.id}
                                className="group flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-200"
                                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="h-12 w-12 rounded-full flex items-center justify-center"
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
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(meeting.date).toLocaleDateString('pt-BR')}
                                            </span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {meeting.time} ({meeting.duration})
                                            </span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {meeting.attendees} pessoas
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-slate-500">
                                    {meeting.location}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Add Meeting Dialog */}
            <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Nova Reunião">
                <form className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                        <Input type="text" placeholder="Ex: Reunião com Cliente" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                            <Input type="date" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Horário</label>
                            <Input type="time" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Duração</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="30min">30 minutos</option>
                            <option value="1h">1 hora</option>
                            <option value="1h30">1h 30min</option>
                            <option value="2h">2 horas</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="video">Vídeo Conferência</option>
                            <option value="presencial">Presencial</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Local/Link</label>
                        <Input type="text" placeholder="Ex: Google Meet, Zoom, Sala 3" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Participantes</label>
                        <Input type="text" placeholder="Emails separados por vírgula" />
                    </div>
                    <Button
                        type="submit"
                        className="w-full animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                            backgroundSize: '200% 100%'
                        }}
                    >
                        Criar Reunião
                    </Button>
                </form>
            </Dialog>
        </div>
    );
}
