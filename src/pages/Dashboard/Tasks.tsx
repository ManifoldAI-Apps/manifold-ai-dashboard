import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { Plus, ListTodo, LayoutGrid, User, Calendar, Clock, Tag, CheckSquare, Square, X, Flame, Zap, FileText, Snowflake, Loader2 } from 'lucide-react';
import { DetailSheet } from '../../components/ui/DetailSheet';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { supabase } from '../../lib/supabaseClient';

interface Subtask {
    title: string;
    completed: boolean;
}

interface Task {
    id: string;
    title: string;
    description?: string;
    project_id?: string;
    project_name?: string;
    assigned_to?: string;
    assignee_name?: string;
    assignee_avatar?: string; // URL or null
    assignee_initials?: string;
    priority: 'urgent' | 'high' | 'normal' | 'low';
    due_date?: string; // YYYY-MM-DD
    estimate_hours?: number;
    status: 'backlog' | 'todo' | 'wip' | 'review' | 'done';
    tags: string[];
    subtasks: Subtask[]; // stored as JSONB

    // Derived for UI
    subtasks_count: number;
    completed_subtasks_count: number;
}

interface Option {
    id: string;
    name: string;
    avatar_url?: string;
}

export default function Tasks() {
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [formTab, setFormTab] = useState<'what' | 'workflow'>('what');

    // Form State
    const [subtasksList, setSubtasksList] = useState<Subtask[]>([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [formData, setFormData] = useState<Partial<Task>>({});

    // Data
    const [tasks, setTasks] = useState<Task[]>([]);
    const [availableProjects, setAvailableProjects] = useState<Option[]>([]);
    const [availableTeam, setAvailableTeam] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // DnD
    const [draggedTask, setDraggedTask] = useState<string | null>(null);

    const columns = [
        { id: 'backlog', title: 'Backlog', color: '#64748b' },
        { id: 'todo', title: 'A Fazer', color: '#3b82f6' },
        { id: 'wip', title: 'Em Andamento', color: '#f59e0b' },
        { id: 'review', title: 'Em Revisão', color: '#8b5cf6' },
        { id: 'done', title: 'Concluído', color: '#10b981' },
    ];

    useEffect(() => {
        fetchData();
        fetchOptions();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('tasks')
                .select(`
                    *,
                    projects (name),
                    profiles (full_name, avatar_url)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedTasks: Task[] = (data || []).map(t => {
                // Parse subtasks if string, otherwise use as is
                let parsedSubtasks: Subtask[] = [];
                if (typeof t.subtasks === 'string') {
                    try { parsedSubtasks = JSON.parse(t.subtasks); } catch (e) { }
                } else if (Array.isArray(t.subtasks)) {
                    parsedSubtasks = t.subtasks;
                }

                // Calculate subtask counts
                const totalSubtasks = parsedSubtasks.length;
                const completedSubtasks = parsedSubtasks.filter(s => s.completed).length;

                return {
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    project_id: t.project_id,
                    project_name: t.projects?.name,
                    assigned_to: t.assigned_to,
                    assignee_name: t.profiles?.full_name,
                    assignee_avatar: t.profiles?.avatar_url,
                    assignee_initials: t.profiles?.full_name ? t.profiles.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : '?',
                    priority: t.priority,
                    due_date: t.due_date,
                    estimate_hours: t.estimate_hours,
                    status: t.status,
                    tags: t.tags || [],
                    subtasks: parsedSubtasks,
                    subtasks_count: totalSubtasks,
                    completed_subtasks_count: completedSubtasks
                };
            });

            setTasks(formattedTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        const [projectsRes, profilesRes] = await Promise.all([
            supabase.from('projects').select('id, name'),
            supabase.from('profiles').select('id, full_name, avatar_url')
        ]);

        if (projectsRes.data) {
            setAvailableProjects(projectsRes.data.map(p => ({ id: p.id, name: p.name })));
        }
        if (profilesRes.data) {
            setAvailableTeam(profilesRes.data.map(p => ({ id: p.id, name: p.full_name, avatar_url: p.avatar_url })));
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (taskId: string) => {
        setDraggedTask(taskId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (newStatus: string) => {
        if (draggedTask === null) return;

        // Optimistic update
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === draggedTask
                    ? { ...task, status: newStatus as any }
                    : task
            )
        );

        try {
            const { error } = await supabase
                .from('tasks')
                .update({ status: newStatus })
                .eq('id', draggedTask);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating task status:', error);
            fetchData(); // Revert on error
        }

        setDraggedTask(null);
    };

    const getPriorityIcon = (priority: string) => {
        const icons: { [key: string]: any } = {
            'urgent': <Flame className="h-4 w-4" />,
            'high': <Zap className="h-4 w-4" />,
            'medium': <FileText className="h-4 w-4" />,
            'normal': <FileText className="h-4 w-4" />,
            'low': <Snowflake className="h-4 w-4" />
        };
        return icons[priority] || <FileText className="h-4 w-4" />;
    };

    const getPriorityLabel = (priority: string) => {
        const labels: { [key: string]: string } = {
            'urgent': '🔥 Urgente',
            'high': '⚡ Alta',
            'normal': '📝 Normal',
            'medium': '📝 Normal',
            'low': '🧊 Baixa'
        };
        return labels[priority] || priority;
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setSubtasksList([...subtasksList, { title: newSubtask, completed: false }]);
            setNewSubtask('');
        }
    };

    const removeSubtask = (index: number) => {
        setSubtasksList(subtasksList.filter((_, i) => i !== index));
    };

    const getTasksByStatus = (status: string) => {
        return tasks.filter(task => task.status === status);
    };

    const handleCardClick = (task: Task) => {
        setSelectedTask(task);
        setIsDetailOpen(true);
    };

    const handleEdit = () => {
        setSelectedTask(selectedTask);
        setFormData({
            title: selectedTask?.title,
            description: selectedTask?.description,
            project_id: selectedTask?.project_id,
            assigned_to: selectedTask?.assigned_to,
            priority: selectedTask?.priority,
            due_date: selectedTask?.due_date,
            estimate_hours: selectedTask?.estimate_hours,
            status: selectedTask?.status,
            tags: selectedTask?.tags
        });
        setSubtasksList(selectedTask?.subtasks || []);
        setIsDetailOpen(false);
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        setIsDetailOpen(false);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedTask?.id) return;
        try {
            const { error } = await supabase.from('tasks').delete().eq('id', selectedTask.id);
            if (error) throw error;
            setIsDeleteDialogOpen(false);
            setSelectedTask(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Erro ao excluir tarefa');
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTagsChange = (value: string) => {
        const tags = value.split(',').map(t => t.trim()).filter(t => t);
        setFormData(prev => ({ ...prev, tags }));
    };

    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                project_id: formData.project_id || null, // Ensure explicit null
                assigned_to: formData.assigned_to || null,
                priority: formData.priority || 'normal',
                due_date: formData.due_date || null,
                estimate_hours: formData.estimate_hours ? parseFloat(formData.estimate_hours.toString()) : null,
                status: formData.status || 'todo',
                tags: formData.tags || [],
                subtasks: JSON.stringify(subtasksList),
                subtasks_completed: subtasksList.filter(s => s.completed).length,
                subtasks_total: subtasksList.length
            };

            let error;
            if (selectedTask?.id) {
                const { error: updateError } = await supabase.from('tasks').update(payload).eq('id', selectedTask.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase.from('tasks').insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            setIsDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Erro ao salvar tarefa');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({});
        setSubtasksList([]);
        setSelectedTask(null);
        setFormTab('what');
        setNewSubtask('');
    };

    const toggleSubtaskCompletion = async (task: Task, subtaskIndex: number) => {
        const updatedSubtasks = task.subtasks.map((st, i) =>
            i === subtaskIndex ? { ...st, completed: !st.completed } : st
        );

        // Optimistic update
        const updatedTask = {
            ...task,
            subtasks: updatedSubtasks,
            subtasks_count: updatedSubtasks.length,
            completed_subtasks_count: updatedSubtasks.filter(s => s.completed).length
        };

        setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
        if (selectedTask?.id === task.id) setSelectedTask(updatedTask);

        try {
            await supabase.from('tasks').update({
                subtasks: JSON.stringify(updatedSubtasks),
                subtasks_completed: updatedTask.completed_subtasks_count,
                subtasks_total: updatedTask.subtasks_count
            }).eq('id', task.id);
        } catch (error) {
            console.error('Error updating subtask:', error);
            fetchData(); // Revert
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
                            resetForm();
                            setFormData({ status: 'todo', priority: 'normal' });
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
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : viewMode === 'kanban' ? (
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
                                            {task.project_name && (
                                                <p className="text-xs text-slate-500 truncate">{task.project_name}</p>
                                            )}
                                            <div className="flex flex-wrap gap-1">
                                                {task.tags.slice(0, 3).map((tag, i) => (
                                                    <span key={i} className="px-2 py-0.5 text-xs rounded-md bg-slate-100 text-slate-600">{tag}</span>
                                                ))}
                                                {task.tags.length > 3 && <span className="text-xs text-slate-400">+{task.tags.length - 3}</span>}
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 overflow-hidden">
                                                        {task.assignee_avatar ? (
                                                            <img src={task.assignee_avatar} alt={task.assignee_name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            task.assignee_initials
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                        <CheckSquare className="h-3 w-3" />
                                                        {task.completed_subtasks_count}/{task.subtasks_count}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock className="h-3 w-3" />
                                                    {task.estimate_hours || 0}h
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
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
                                                    {task.project_name && (
                                                        <span className="text-xs text-slate-500">{task.project_name}</span>
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
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 overflow-hidden">
                                                {task.assignee_avatar ? (
                                                    <img src={task.assignee_avatar} alt={task.assignee_name} className="h-full w-full object-cover" />
                                                ) : (
                                                    task.assignee_initials
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                                <CheckSquare className="h-4 w-4" />
                                                {task.completed_subtasks_count}/{task.subtasks_count}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                                <Clock className="h-4 w-4" />
                                                {task.estimate_hours || 0}h
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

                <form onSubmit={handleSaveTask} className="space-y-4">
                    {/* Tab: O Que Fazer */}
                    {formTab === 'what' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título da Atividade *</label>
                                <Input
                                    type="text"
                                    placeholder='Ex: "Treinar modelo de NLP v2"'
                                    value={formData.title || ''}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Projeto Vinculado (Opcional)</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.project_id || ""}
                                    onChange={(e) => handleInputChange('project_id', e.target.value || null)}
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
                                    value={formData.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <CheckSquare className="h-4 w-4" />
                                    Checklist de Subtarefas
                                </label>
                                <p className="text-xs text-slate-500 mb-3">Evite criar múltiplos cartões para tarefas pequenas</p>
                                <div className="space-y-2">
                                    {subtasksList.map((subtask, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                                            <Square className="h-4 w-4 text-slate-400" />
                                            <span className="text-sm flex-1">{subtask.title}</span>
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
                                    value={formData.assigned_to || ""}
                                    onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                                >
                                    <option value="">Selecione quem vai executar...</option>
                                    {availableTeam.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade *</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.priority || 'normal'}
                                    onChange={(e) => handleInputChange('priority', e.target.value)}
                                >
                                    <option value="urgent">🔥 Urgente</option>
                                    <option value="high">⚡ Alta</option>
                                    <option value="normal">📝 Normal</option>
                                    <option value="low">🧊 Baixa</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Data de Entrega *</label>
                                    <Input
                                        type="date"
                                        value={formData.due_date || ''}
                                        onChange={(e) => handleInputChange('due_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Estimativa (Horas)</label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        step="0.5"
                                        value={formData.estimate_hours || ''}
                                        onChange={(e) => handleInputChange('estimate_hours', e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Para cálculo de custo</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status Atual *</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.status || 'backlog'}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                >
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
                                <Input
                                    type="text"
                                    placeholder='Ex: "Bug", "Feature", "Infra", "Frontend" (separadas por vírgula)'
                                    value={formData.tags ? formData.tags.join(', ') : ''}
                                    onChange={(e) => handleTagsChange(e.target.value)}
                                />
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
                                disabled={saving}
                                className="ml-auto animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                style={{
                                    backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                                    backgroundSize: '200% 100%'
                                }}
                            >
                                {saving ? <Loader2 className="animate-spin h-5 w-5" /> : 'Salvar Atividade'}
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
                            <p className="font-medium text-slate-900">{selectedTask?.project_name || 'Nenhum'}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-slate-500 mb-1">Responsável</h4>
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 overflow-hidden">
                                    {selectedTask?.assignee_avatar ? (
                                        <img src={selectedTask.assignee_avatar} alt={selectedTask.assignee_name} className="h-full w-full object-cover" />
                                    ) : (
                                        selectedTask?.assignee_initials
                                    )}
                                </div>
                                <p className="font-medium text-slate-900">{selectedTask?.assignee_name || '-'}</p>
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
                                <span className="text-sm font-medium">{selectedTask?.estimate_hours || 0}h</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-medium text-slate-500 mb-1">Prazo</h4>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-medium">{selectedTask?.due_date ? new Date(selectedTask.due_date).toLocaleDateString('pt-BR') : '-'}</span>
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
                                    style={{ width: `${selectedTask && selectedTask.subtasks_count > 0 ? (selectedTask.completed_subtasks_count / selectedTask.subtasks_count) * 100 : 0}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium text-slate-600">
                                {selectedTask && selectedTask.subtasks_count > 0 ? Math.round((selectedTask.completed_subtasks_count / selectedTask.subtasks_count) * 100) : 0}%
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 text-center mb-4">
                            {selectedTask?.completed_subtasks_count} de {selectedTask?.subtasks_count} subtarefas concluídas
                        </p>

                        {/* Subtasks List with Checkboxes */}
                        {selectedTask?.subtasks && selectedTask.subtasks.length > 0 && (
                            <div className="space-y-2 mt-4">
                                <h5 className="text-xs font-medium text-slate-500 mb-2">Subtarefas</h5>
                                {selectedTask.subtasks.map((subtask, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer"
                                        onClick={() => toggleSubtaskCompletion(selectedTask, index)}
                                    >
                                        <div className="flex-shrink-0">
                                            {subtask.completed ? (
                                                <CheckSquare className="h-5 w-5 text-blue-600" />
                                            ) : (
                                                <Square className="h-5 w-5 text-slate-400" />
                                            )}
                                        </div>
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
