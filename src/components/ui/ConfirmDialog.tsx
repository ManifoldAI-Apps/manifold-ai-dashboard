import { AlertCircle, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName?: string;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, itemName }: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-start gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                        <p className="text-sm text-slate-600">{message}</p>
                        {itemName && (
                            <p className="text-sm font-semibold text-slate-900 mt-2">"{itemName}"</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-slate-300 hover:bg-slate-100"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white border-none"
                    >
                        Confirmar Exclusão
                    </Button>
                </div>
            </div>
        </div>
    );
}
