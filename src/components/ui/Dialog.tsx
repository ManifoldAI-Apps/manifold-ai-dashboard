import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export function Dialog({ isOpen, onClose, children, title, description }: DialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    // Scroll dialog into view when opened
    useEffect(() => {
        if (isOpen && dialogRef.current) {
            setTimeout(() => {
                dialogRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
            }, 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                ref={dialogRef}
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
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
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
