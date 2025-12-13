import { X, Edit, Trash2 } from 'lucide-react';

interface DetailSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function DetailSheet({ isOpen, onClose, title, children, onEdit, onDelete }: DetailSheetProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10"
            onClick={onClose}
        >
            {/* Modal Card */}
            <div
                className="relative bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                    <div className="flex items-center gap-2">
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                className="p-2 hover:bg-blue-50 rounded-md transition-colors"
                                title="Editar"
                            >
                                <Edit className="h-5 w-5 text-blue-600" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className="p-2 hover:bg-red-50 rounded-md transition-colors"
                                title="Excluir"
                            >
                                <Trash2 className="h-5 w-5 text-red-600" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-md transition-colors"
                        >
                            <X className="h-5 w-5 text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
