import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface SheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export function Sheet({ isOpen, onClose, children, title, description }: SheetProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <div
            className={cn(
                "fixed inset-0 z-[9999] flex justify-end transition-all duration-300",
                isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
            )}
            onClick={onClose}
        >
            {/* Drawer Panel */}
            <div
                className={cn(
                    "w-full max-w-md bg-white h-full shadow-2xl transition-transform duration-300 ease-out transform flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <div>
                        {title && <h2 className="text-xl font-bold text-slate-900">{title}</h2>}
                        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
