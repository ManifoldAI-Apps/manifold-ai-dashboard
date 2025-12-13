import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { Plus, ListTodo, LayoutGrid, User, Calendar, Clock, Tag, CheckSquare, Square, X, Flame, Zap, FileText, Snowflake } from 'lucide-react';
import { DetailSheet } from '../../components/ui/DetailSheet';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface Task {
    id: number;
    title: string;
    project: string | null;
    assignee: string;
    avatar: string;
    priority: string;
    dueDate: string;
    estimate: number;
    status: string;
    tags: string[];
    subtasks: number;
    completed: number;
    subtaskList?: { id: number; title: string; completed: boolean }[]; // Added for checkbox functionality
}

export default function Tasks() {
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [formTab, setFormTab] = useState<'what' | 'workflow'>('what');
    const [subtasks, setSubtasks] = useState<string[]>([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [draggedTask, setDraggedTask] = useState<number | null>(null);
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: 1,
            title: 'Treinar modelo de NLP v2',
            project: 'Automação de Processos',
            assignee: 'Bruno Costa',
            avatar: 'BC',
            priority: 'urgent',
            dueDate: '2024-06-20',
            estimate: 8,
            status: 'wip',
            tags: ['AI', 'Backend'],
            subtasks: 3,
            completed: 1,
            subtaskList: [
                { id: 1, title: 'Coletar dataset de treinamento', completed: true },
                { id: 2, title: 'Configurar pipeline de treino', completed: false },
                { id: 3, title: 'Validar acurácia do modelo', completed: false }
            ]
        },
        {
            id: 2,
            title: 'Implementar autenticação OAuth',
            project: 'Dashboard Analytics',
            assignee: 'Ana Silva',
            avatar: 'AS',
            priority: 'high',
            dueDate: '2024-06-25',
            estimate: 6,
            status: 'todo',
            tags: ['Feature', 'Security'],
            subtasks: 4,
            completed: 0
        },
        {
            id: 3,
            title: 'Corrigir bug no upload de arquivos',
            project: 'Integração API',
            assignee: 'Carla Souza',
            avatar: 'CS',
            priority: 'urgent',
            dueDate: '2024-06-18',
            estimate: 2,
            status: 'review',
            tags: ['Bug', 'Frontend'],
            subtasks: 2,
            completed: 2
        },
        {
            id: 4,
            title: 'Documentar API endpoints',
            project: null,
            assignee: 'Diego Lima',
            avatar: 'DL',
            priority: 'normal',
            dueDate: '2024-07-01',
            estimate: 4,
            status: 'backlog',
            tags: ['Docs'],
            subtasks: 5,
            completed: 0
        },
        {
            id: 5,
            title: 'Otimizar queries do banco',
            project: 'Dashboard Analytics',
            assignee: 'Bruno Costa',
            avatar: 'BC',
            priority: 'high',
            dueDate: '2024-06-22',
            estimate: 5,
            status: 'wip',
            tags: ['Performance', 'Backend'],
            subtasks: 3,
            completed: 2
        },
        {
            id: 6,
            title: 'Configurar CI/CD pipeline',
            project: null,
            assignee: 'Ana Silva',
            avatar: 'AS',
            priority: 'low',
            dueDate: '2024-07-10',
            estimate: 6,
            status: 'todo',
            tags: ['Infra', 'DevOps'],
            subtasks: 6,
            completed: 0
        },
    ]);

    // Mock data - projetos disponíveis
    const availableProjects = [
        { id: 1, name: 'Automação de Processos' },
        { id: 2, name: 'Dashboard Analytics' },
        { id: 3, name: 'Integração API' },
    ];

    // Mock data - equipe disponível
    const availableTeam = [
        { id: 1, name: 'Ana Silva', avatar: 'AS' },
        { id: 2, name: 'Bruno Costa', avatar: 'BC' },
        { id: 3, name: 'Carla Souza', avatar: 'CS' },
        { id: 4, name: 'Diego Lima', avatar: 'DL' },
    ];

    const columns = [
        { id: 'backlog', title: 'Backlog', color: '#64748b' },
        { id: 'todo', title: 'A Fazer', color: '#3b82f6' },
        { id: 'wip', title: 'Em Andamento', color: '#f59e0b' },
        { id: 'review', title: 'Em Revisão', color: '#8b5cf6' },
        { id: 'done', title: 'Concluído', color: '#10b981' },
    ];

    // Drag and Drop Handlers
    const handleDragStart = (taskId: number) => {
        setDraggedTask(taskId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (newStatus: string) => {
        if (draggedTask === null) return;

        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === draggedTask
                    ? { ...task, status: newStatus }
                    : task
            )
        );
        setDraggedTask(null);
    };

    const getPriorityIcon = (priority: string) => {
        const icons: { [key: string]: any } = {
            'urgent': <Flame className="h-4 w-4" />,
            'high': <Zap className="h-4 w-4" />,
            'medium': <FileText className="h-4 w-4" />,
            'low': <Snowflake className="h-4 w-4" />
        };
        return icons[priority] || <FileText className="h-4 w-4" />;
    };

    const getPriorityLabel = (priority: string) => {
        const labels: { [key: string]: string } = {
            'urgent': '🔥 Urgente',
            'high': '⚡ Alta',
            'normal': '📝 Normal',
            'low': '🧊 Baixa'
        };
        return labels[priority];
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setSubtasks([...subtasks, newSubtask]);
            setNewSubtask('');
        }
    };

    const removeSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    const getTasksByStatus = (status: string) => {
        return tasks.filter(task => task.status === status);
    };

    const handleCardClick = (task: Task) => {
        setSelectedTask(task);
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
        if (selectedTask) {
            setTasks(tasks.filter(t => t.id !== selectedTask.id));
            setIsDeleteDialogOpen(false);
            setSelectedTask(null);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Premium */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                        <span style={{ color: '#004aad' }}>Atividades</span>
                    </h1>
                    <p className="text-slate-600 text-lg">Gestão de Tarefas - Kanban & Lista</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`px-3 py-2 rounded-md transition-all flex items-center gap-2 ${viewMode === 'kanban'
                                ? 'bg-white shadow-sm text-blue-600'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            Kanban
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 rounded-md transition-all flex items-center gap-2 ${viewMode === 'list'
                                ? 'bg-white shadow-sm text-blue-600'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <ListTodo className="h-4 w-4" />
                            Lista
                        </button>
                    </div>
                    <Button
                        onClick={() => {
                            setSelectedTask(null);
                            setIsDialogOpen(true);
                        }}
                        className="animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                            backgroundSize: '200% 100%'
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Atividade
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-5">
                {columns.map((column, index) => {
                    const count = getTasksByStatus(column.id).length;
                    return (
                        <Card key={column.id} className="group relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: `${column.color}20` }} />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">{column.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold" style={{ color: column.color }}>{count}</div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Kanban View with Drag & Drop */}
            {viewMode === 'kanban' && (
                <div className="grid grid-cols-5 gap-4 animate-fade-in-up">
                    {columns.map((column) => (
                        <div
                            key={column.id}
                            className="space-y-3"
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(column.id)}
                        >
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: column.color }} />
                                <h3 className="font-semibold text-sm text-slate-700">{column.title}</h3>
                                <span className="ml-auto text-xs text-slate-500">{getTasksByStatus(column.id).length}</span>
                            </div>
                            <div className="space-y-3 min-h-[200px] p-2 rounded-lg transition-colors" style={{ backgroundColor: draggedTask !== null ? 'rgba(0, 74, 173, 0.05)' : 'transparent' }}>
                                {getTasksByStatus(column.id).map((task) => (
                                    <Card
                                        key={task.id}
                                        draggable
                                        onDragStart={() => handleDragStart(task.id)}
                                        onClick={() => handleCardClick(task)}
                                        className="group cursor-move hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4"
                                        style={{ borderLeftColor: column.color, opacity: draggedTask === task.id ? 0.5 : 1 }}
                                    >
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-semibold text-sm text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{task.title}</h4>
                                                {getPriorityIcon(task.priority)}
                                            </div>
                                            {task.project && (
                                                <p className="text-xs text-slate-500 truncate">{task.project}</p>
                                            )}
                                            <div className="flex flex-wrap gap-1">
                                                {task.tags.map((tag, i) => (
                                                    <span key={i} className="px-2 py-0.5 text-xs rounded-md bg-slate-100 text-slate-600">{tag}</span>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                                                        {task.avatar}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                        <CheckSquare className="h-3 w-3" />
                                                        {task.completed}/{task.subtasks}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock className="h-3 w-3" />
                                                    {task.estimate}h
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <Card className="border-slate-200 hover:shadow-xl transition-all duration-300 animate-fade-in-up">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Todas as Atividades</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {tasks.map((task) => {
                                const column = columns.find(c => c.id === task.status);
                                return (
                                    <div
                                        key={task.id}
                                        onClick={() => handleCardClick(task)}
                                        className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-50 transition-all border border-slate-200 cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            {getPriorityIcon(task.priority)}
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{task.title}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    {task.project && (
                                                        <span className="text-xs text-slate-500">{task.project}</span>
                                                    )}
                                                    <div className="flex gap-1">
                                                        {task.tags.map((tag, i) => (
                                                            <span key={i} className="px-2 py-0.5 text-xs rounded-md bg-slate-100 text-slate-600">{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                                                {task.avatar}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                                <CheckSquare className="h-4 w-4" />
                                                {task.completed}/{task.subtasks}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                                <Clock className="h-4 w-4" />
                                                {task.estimate}h
                                            </div>
                                            <span className="px-3 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: `${column?.color}20`, color: column?.color }}>
                                                {column?.title}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Task Dialog with Tabs */}
            <Dialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title={selectedTask ? "Editar Atividade" : "Nova Atividade"}
            >
                {/* Form Tabs */}
                <div className="flex gap-2 border-b border-slate-200 mb-6">
                    <button
                        onClick={() => setFormTab('what')}
                        className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 ${formTab === 'what'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <FileText className="h-4 w-4" />
                        O Que Fazer
                    </button>
                    <button
                        onClick={() => setFormTab('workflow')}
                        className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 ${formTab === 'workflow'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Calendar className="h-4 w-4" />
                        Workflow
                    </button>
                </div>

                <form className="space-y-4">
                    {/* Tab: O Que Fazer */}
                    {formTab === 'what' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título da Atividade *</label>
                                <Input type="text" placeholder='Ex: "Treinar modelo de NLP v2"' defaultValue={selectedTask?.title || ''} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Projeto Vinculado (Opcional)</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    defaultValue={selectedTask?.project ? availableProjects.find(p => p.name === selectedTask.project)?.id : ""}
                                >
                                    <option value="">Selecione um projeto ou deixe em branco (Tarefa Geral)</option>
                                    {availableProjects.map(project => (
                                        <option key={project.id} value={project.id}>{project.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Deixe em branco para tarefas gerais (ex: Manutenção interna)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição Detalhada</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                    placeholder="Descreva a tarefa em detalhes. Você pode colar trechos de código ou descrever erros..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <CheckSquare className="h-4 w-4" />
                                    Checklist de Subtarefas
                                </label>
                                <p className="text-xs text-slate-500 mb-3">Evite criar múltiplos cartões para tarefas pequenas</p>
                                <div className="space-y-2">
                                    {subtasks.map((subtask, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                                            <Square className="h-4 w-4 text-slate-400" />
                                            <span className="text-sm flex-1">{subtask}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeSubtask(index)}
                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            placeholder='Ex: "Criar repo", "Configurar ENV"'
                                            value={newSubtask}
                                            onChange={(e) => setNewSubtask(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                                        />
                                        <Button type="button" onClick={addSubtask} variant="outline">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Workflow */}
                    {formTab === 'workflow' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Responsável (Assignee) *
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    defaultValue={selectedTask?.assignee ? availableTeam.find(m => m.name === selectedTask.assignee)?.id : ""}
                                >
                                    <option value="">Selecione quem vai executar...</option>
                                    {availableTeam.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.avatar} - {member.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade *</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    defaultValue={selectedTask?.priority || ""}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="urgent">🔥 Urgente</option>
                                    <option value="high">⚡ Alta</option>
                                    <option value="normal">📝 Normal</option>
                                    <option value="low">🧊 Baixa</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Data de Entrega *</label>
                                    <Input type="date" defaultValue={selectedTask?.dueDate || ''} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Estimativa (Horas)</label>
                                    <Input type="number" placeholder="0" step="0.5" defaultValue={selectedTask?.estimate || ''} />
                                    <p className="text-xs text-slate-500 mt-1">Para cálculo de custo</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status Atual *</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    defaultValue={selectedTask?.status || ""}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="backlog">Backlog</option>
                                    <option value="todo">A Fazer (To Do)</option>
                                    <option value="wip">Em Andamento (WIP)</option>
                                    <option value="review">Em Revisão (Code Review/QA)</option>
                                    <option value="done">Concluído</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">A fase de "Revisão" é crucial para empresas de IA/Software</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <Tag className="h-4 w-4" />
                                    Tags Personalizadas
                                </label>
                                <Input type="text" placeholder='Ex: "Bug", "Feature", "Infra", "Frontend" (separadas por vírgula)' />
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        {formTab !== 'what' && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormTab('what')}
                                className="border-slate-300 hover:bg-slate-100"
                            >
                                Anterior
                            </Button>
                        )}
                        {formTab !== 'workflow' ? (
                            <Button
                                type="button"
                                onClick={() => setFormTab('workflow')}
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
                                Criar Atividade
                            </Button>
                        )}
                    </div>
                </form>
            </Dialog>

            <DetailSheet
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={selectedTask?.title || ''}
                onEdit={handleEdit}
                onDelete={handleDelete}
            >
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-slate-500 mb-1">Projeto</h4>
                            <p className="font-medium text-slate-900">{selectedTask?.project || 'Nenhum'}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-slate-500 mb-1">Responsável</h4>
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                                    {selectedTask?.avatar}
                                </div>
                                <p className="font-medium text-slate-900">{selectedTask?.assignee}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                            <h4 className="text-xs font-medium text-slate-500 mb-1">Prioridade</h4>
                            <div className="flex items-center gap-2">
                                {selectedTask && getPriorityIcon(selectedTask.priority)}
                                <span className="text-sm font-medium">{selectedTask && getPriorityLabel(selectedTask.priority)}</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-medium text-slate-500 mb-1">Estimativa</h4>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-medium">{selectedTask?.estimate}h</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-medium text-slate-500 mb-1">Prazo</h4>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-medium">{selectedTask?.dueDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-3">Progresso</h4>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                    style={{ width: `${selectedTask ? (selectedTask.completed / selectedTask.subtasks) * 100 : 0}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium text-slate-600">
                                {selectedTask ? Math.round((selectedTask.completed / selectedTask.subtasks) * 100) : 0}%
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 text-center mb-4">
                            {selectedTask?.completed} de {selectedTask?.subtasks} subtarefas concluídas
                        </p>

                        {/* Subtasks List with Checkboxes */}
                        {selectedTask?.subtaskList && selectedTask.subtaskList.length > 0 && (
                            <div className="space-y-2 mt-4">
                                <h5 className="text-xs font-medium text-slate-500 mb-2">Subtarefas</h5>
                                {selectedTask.subtaskList.map((subtask) => (
                                    <div
                                        key={subtask.id}
                                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Toggle subtask completion
                                                const updatedTasks = tasks.map(t => {
                                                    if (t.id === selectedTask.id && t.subtaskList) {
                                                        const updatedSubtasks = t.subtaskList.map(st =>
                                                            st.id === subtask.id ? { ...st, completed: !st.completed } : st
                                                        );
                                                        const completedCount = updatedSubtasks.filter(st => st.completed).length;
                                                        return { ...t, subtaskList: updatedSubtasks, completed: completedCount };
                                                    }
                                                    return t;
                                                });
                                                setTasks(updatedTasks);
                                                // Update selectedTask to reflect changes
                                                const updated = updatedTasks.find(t => t.id === selectedTask.id);
                                                if (updated) setSelectedTask(updated);
                                            }}
                                            className="flex-shrink-0"
                                        >
                                            {subtask.completed ? (
                                                <CheckSquare className="h-5 w-5 text-blue-600" />
                                            ) : (
                                                <Square className="h-5 w-5 text-slate-400" />
                                            )}
                                        </button>
                                        <span className={`text-sm ${subtask.completed
                                                ? 'text-slate-400 line-through'
                                                : 'text-slate-900'
                                            }`}>
                                            {subtask.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedTask?.tags.map((tag, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </DetailSheet>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Excluir Atividade"
                message="Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita."
                itemName={selectedTask?.title}
            />
        </div>
    );
}
