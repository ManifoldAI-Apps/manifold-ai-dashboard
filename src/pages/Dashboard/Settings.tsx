import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Lock, Shield, Bell, Globe, Smartphone, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
    const [activeTab, setActiveTab] = useState<'account' | 'security' | 'apps'>('account');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const connectedApps = [
        { id: 1, name: 'Google Calendar', icon: '📅', status: 'connected', lastSync: '2024-06-15 14:30' },
        { id: 2, name: 'Slack', icon: '💬', status: 'connected', lastSync: '2024-06-15 12:00' },
        { id: 3, name: 'GitHub', icon: '🐙', status: 'connected', lastSync: '2024-06-14 18:45' },
        { id: 4, name: 'Trello', icon: '📋', status: 'disconnected', lastSync: null },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Premium */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                        <span style={{ color: '#004aad' }}>Configurações</span>
                    </h1>
                    <p className="text-slate-600 text-lg">Gerencie sua conta e preferências</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('account')}
                    className={`px-4 py-2 font-medium transition-all flex items-center gap-2 ${activeTab === 'account'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <User className="h-4 w-4" />
                    Conta
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`px-4 py-2 font-medium transition-all flex items-center gap-2 ${activeTab === 'security'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Shield className="h-4 w-4" />
                    Segurança
                </button>
                <button
                    onClick={() => setActiveTab('apps')}
                    className={`px-4 py-2 font-medium transition-all flex items-center gap-2 ${activeTab === 'apps'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Smartphone className="h-4 w-4" />
                    Aplicativos
                </button>
            </div>

            {/* Account Tab */}
            {activeTab === 'account' && (
                <div className="grid gap-6">
                    <Card className="border-slate-200 hover:shadow-xl transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Informações da Conta</CardTitle>
                            <p className="text-sm text-slate-500 mt-1">Atualize suas informações pessoais</p>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                                        <Input type="text" placeholder="Seu nome" defaultValue="Admin" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Sobrenome</label>
                                        <Input type="text" placeholder="Seu sobrenome" defaultValue="Manifold" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <Input type="email" placeholder="seu@email.com" defaultValue="admin@manifold.ai" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                                    <Input type="tel" placeholder="+55 11 98765-4321" defaultValue="+55 11 98765-4321" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
                                    <Input type="text" placeholder="Seu cargo" defaultValue="Administrador" />
                                </div>
                                <Button
                                    type="submit"
                                    className="animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                    style={{
                                        backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                                        backgroundSize: '200% 100%'
                                    }}
                                >
                                    Salvar Alterações
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 hover:shadow-xl transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Preferências</CardTitle>
                            <p className="text-sm text-slate-500 mt-1">Personalize sua experiência</p>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Idioma</label>
                                    <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="pt-BR">Português (Brasil)</option>
                                        <option value="en-US">English (US)</option>
                                        <option value="es-ES">Español</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fuso Horário</label>
                                    <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                                        <option value="America/New_York">New York (GMT-5)</option>
                                        <option value="Europe/London">London (GMT+0)</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Bell className="h-5 w-5 text-slate-600" />
                                        <div>
                                            <p className="font-medium text-slate-900">Notificações por Email</p>
                                            <p className="text-xs text-slate-500">Receba atualizações importantes</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <Button
                                    type="submit"
                                    className="animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                    style={{
                                        backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                                        backgroundSize: '200% 100%'
                                    }}
                                >
                                    Salvar Preferências
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="grid gap-6">
                    <Card className="border-slate-200 hover:shadow-xl transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Alterar Senha</CardTitle>
                            <p className="text-sm text-slate-500 mt-1">Mantenha sua conta segura</p>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Senha Atual</label>
                                    <div className="relative">
                                        <Input
                                            type={showCurrentPassword ? "text" : "password"}
                                            placeholder="Digite sua senha atual"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha</label>
                                    <div className="relative">
                                        <Input
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="Digite sua nova senha"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nova Senha</label>
                                    <Input type="password" placeholder="Confirme sua nova senha" />
                                </div>
                                <Button
                                    type="submit"
                                    className="animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                    style={{
                                        backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                                        backgroundSize: '200% 100%'
                                    }}
                                >
                                    Atualizar Senha
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 hover:shadow-xl transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Autenticação de Dois Fatores</CardTitle>
                            <p className="text-sm text-slate-500 mt-1">Adicione uma camada extra de segurança</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Lock className="h-5 w-5 text-slate-600" />
                                        <div>
                                            <p className="font-medium text-slate-900">2FA via SMS</p>
                                            <p className="text-xs text-slate-500">Receba códigos por mensagem</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="h-5 w-5 text-slate-600" />
                                        <div>
                                            <p className="font-medium text-slate-900">2FA via App</p>
                                            <p className="text-xs text-slate-500">Use Google Authenticator ou similar</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 hover:shadow-xl transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Histórico de Login</CardTitle>
                            <p className="text-sm text-slate-500 mt-1">Últimos acessos à sua conta</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { device: 'Chrome - Windows', location: 'São Paulo, BR', time: '2024-06-15 14:30', current: true },
                                    { device: 'Safari - iPhone', location: 'São Paulo, BR', time: '2024-06-14 09:15', current: false },
                                    { device: 'Chrome - macOS', location: 'Rio de Janeiro, BR', time: '2024-06-13 16:45', current: false },
                                ].map((login, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Globe className="h-4 w-4 text-slate-400" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{login.device}</p>
                                                <p className="text-xs text-slate-500">{login.location} • {login.time}</p>
                                            </div>
                                        </div>
                                        {login.current && (
                                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Atual</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Apps Tab */}
            {activeTab === 'apps' && (
                <Card className="border-slate-200 hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Aplicativos Conectados</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">Gerencie integrações de terceiros</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {connectedApps.map((app) => (
                                <div
                                    key={app.id}
                                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl">{app.icon}</div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{app.name}</p>
                                            {app.status === 'connected' ? (
                                                <p className="text-xs text-slate-500">Última sincronização: {app.lastSync}</p>
                                            ) : (
                                                <p className="text-xs text-slate-500">Não conectado</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {app.status === 'connected' ? (
                                            <>
                                                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">Conectado</span>
                                                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                                                    Desconectar
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                className="animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                                style={{
                                                    backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                                                    backgroundSize: '200% 100%'
                                                }}
                                            >
                                                Conectar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
