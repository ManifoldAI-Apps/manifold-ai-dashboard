import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Shield, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';

interface AuditLog {
    id: number;
    actor: { name: string; avatar: string; email: string };
    action: 'created' | 'updated' | 'deleted';
    targetType: 'project' | 'client' | 'goal' | 'task' | 'team' | 'subscription';
    targetName: string;
    timestamp: string;
    details: object;
}

export default function AuditLogs() {
    const [expandedLog, setExpandedLog] = useState<number | null>(null);
    const [filterUser, setFilterUser] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const logs: AuditLog[] = [];

    const getActionBadge = (action: string) => {
        const styles: { [key: string]: string } = {
            'created': 'bg-green-100 text-green-700',
            'updated': 'bg-yellow-100 text-yellow-700',
            'deleted': 'bg-red-100 text-red-700'
        };
        const labels: { [key: string]: string } = {
            'created': '🟢 CRIOU',
            'updated': '🟡 EDITOU',
            'deleted': '🔴 EXCLUIU'
        };
        return <span className={`px-3 py-1 text-xs font-bold rounded-full ${styles[action]}`}>{labels[action]}</span>;
    };

    const getTargetTypeLabel = (type: string) => {
        const labels: { [key: string]: string } = {
            'project': 'Projeto',
            'client': 'Cliente',
            'goal': 'Meta',
            'task': 'Tarefa',
            'team': 'Membro',
            'subscription': 'Assinatura'
        };
        return labels[type] || type;
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredLogs = logs.filter(log => {
        if (filterUser && !log.actor.name.toLowerCase().includes(filterUser.toLowerCase())) return false;
        if (filterAction && log.action !== filterAction) return false;
        if (filterDate && !log.timestamp.startsWith(filterDate)) return false;
        return true;
    });

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        <span style={{ color: '#004aad' }}>Audit Logs</span>
                    </h1>
                    <p className="text-slate-600 text-lg">Histórico de Alterações do Sistema</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros de Busca
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Buscar por nome..."
                                    value={filterUser}
                                    onChange={(e) => setFilterUser(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Ação</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                            >
                                <option value="">Todas as ações</option>
                                <option value="created">Criou</option>
                                <option value="updated">Editou</option>
                                <option value="deleted">Excluiu</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                            <Input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setFilterUser('');
                                    setFilterAction('');
                                    setFilterDate('');
                                }}
                                className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                            >
                                Limpar Filtros
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card className="border-slate-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold">Registros de Auditoria</CardTitle>
                        <span className="text-sm text-slate-500">{filteredLogs.length} registros</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {filteredLogs.map((log) => (
                            <div key={log.id} className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                                    {/* Actor */}
                                    <div className="flex items-center gap-3 flex-shrink-0 w-48">
                                        <div
                                            className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                                            style={{ background: 'linear-gradient(135deg, #004aad, #bd5aff)' }}
                                        >
                                            {log.actor.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-slate-900 truncate">{log.actor.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{log.actor.email}</p>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="flex-shrink-0 w-32">
                                        {getActionBadge(log.action)}
                                    </div>

                                    {/* Target */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {getTargetTypeLabel(log.targetType)}: {log.targetName}
                                        </p>
                                    </div>

                                    {/* Timestamp */}
                                    <div className="flex-shrink-0 w-40 text-right">
                                        <p className="text-sm text-slate-600">{formatTimestamp(log.timestamp)}</p>
                                    </div>

                                    {/* Expand Button */}
                                    <button
                                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                        className="flex-shrink-0 p-2 hover:bg-slate-100 rounded-md transition-colors"
                                    >
                                        {expandedLog === log.id ? (
                                            <ChevronUp className="h-5 w-5 text-slate-600" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-slate-600" />
                                        )}
                                    </button>
                                </div>

                                {/* Expanded Details */}
                                {expandedLog === log.id && (
                                    <div className="px-4 pb-4 pt-2 bg-slate-50 border-t border-slate-200">
                                        <p className="text-xs font-semibold text-slate-700 mb-2">Detalhes (JSON):</p>
                                        <pre className="bg-slate-900 text-green-400 p-4 rounded-md text-xs overflow-x-auto">
                                            {JSON.stringify(log.details, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ))}

                        {filteredLogs.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-slate-500">Nenhum registro encontrado com os filtros aplicados.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
