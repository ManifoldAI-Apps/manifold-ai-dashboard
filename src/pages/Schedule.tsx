import { Button } from '../components/ui/Button';
import { Calendar, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Schedule() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 animate-slide-in-right">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Logo Image & Text with Float Animation */}
                        <img src="/logo.png" alt="MANIFOLD AI Logo" className="h-10 w-auto" />
                        <span className="text-2xl md:text-3xl font-bold tracking-tight">
                            <span style={{ color: '#004aad' }}>MANIFOLD</span> <span style={{ color: '#bd5aff' }}>AI</span>
                        </span>
                    </div>
                    <Button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 animate-gradient text-white border-none shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                            backgroundSize: '200% 100%'
                        }}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Button>
                </div>
            </header>

            {/* Background Glows */}
            <div
                className="fixed top-20 left-0 w-[600px] h-[600px] rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse-glow"
                style={{ backgroundColor: 'rgba(0, 74, 173, 0.08)' }}
            />
            <div
                className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse-glow"
                style={{ backgroundColor: 'rgba(189, 90, 255, 0.08)' }}
            />

            <div className="pt-32 pb-20 px-6 container mx-auto max-w-5xl">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
                        Agende sua <span style={{ color: '#004aad' }}>Sessão Estratégica</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Descubra como nossa <span style={{ color: '#bd5aff' }}>IA</span> pode escalar seu negócio. Preencha o formulário abaixo para iniciarmos o diagnóstico.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-start">
                    {/* Left Column: Context/Benefits */}
                    <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-200 animate-fade-in-up hover:shadow-xl transition-all duration-300" style={{ animationDelay: '0.1s' }}>
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Calendar className="h-5 w-5" style={{ color: '#004aad' }} />
                            O que esperar desta reunião:
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3 group hover:translate-x-2 transition-transform duration-300">
                                <div className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }}>
                                    <CheckCircle2 className="h-4 w-4" style={{ color: '#004aad' }} />
                                </div>
                                <span className="text-slate-600">Diagnóstico completo dos seus processos atuais.</span>
                            </li>
                            <li className="flex gap-3 group hover:translate-x-2 transition-transform duration-300">
                                <div className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }}>
                                    <CheckCircle2 className="h-4 w-4" style={{ color: '#004aad' }} />
                                </div>
                                <span className="text-slate-600">Identificação de gargalos operacionais e financeiros.</span>
                            </li>
                            <li className="flex gap-3 group hover:translate-x-2 transition-transform duration-300">
                                <div className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }}>
                                    <CheckCircle2 className="h-4 w-4" style={{ color: '#004aad' }} />
                                </div>
                                <span className="text-slate-600">Demonstração de como a <span style={{ color: '#bd5aff' }}>IA</span> pode automatizar suas vendas.</span>
                            </li>
                            <li className="flex gap-3 group hover:translate-x-2 transition-transform duration-300">
                                <div className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(0, 74, 173, 0.15)' }}>
                                    <CheckCircle2 className="h-4 w-4" style={{ color: '#004aad' }} />
                                </div>
                                <span className="text-slate-600">Plano de implementação personalizado.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Right Column: n8n Form Placeholder */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 animate-fade-in-up hover:shadow-2xl transition-all duration-300" style={{ animationDelay: '0.2s' }}>
                        <div className="space-y-4">
                            <div className="p-6 rounded-xl text-center border animate-shimmer" style={{
                                backgroundColor: 'rgba(189, 90, 255, 0.05)',
                                borderColor: 'rgba(189, 90, 255, 0.2)'
                            }}>
                                <p className="font-medium mb-2" style={{ color: '#bd5aff' }}>Formulário de Agendamento</p>
                                <p className="text-sm text-slate-500">
                                    (O formulário n8n será carregado aqui)
                                </p>
                            </div>

                            {/* Temporary Inputs for Visual Representation until n8n is connected */}
                            <div className="group">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    className="w-full h-10 px-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all group-hover:border-slate-400"
                                    placeholder="Seu nome"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Corporativo</label>
                                <input
                                    type="email"
                                    className="w-full h-10 px-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all group-hover:border-slate-400"
                                    placeholder="voce@empresa.com"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                                <input
                                    type="text"
                                    className="w-full h-10 px-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all group-hover:border-slate-400"
                                    placeholder="Nome da sua empresa"
                                />
                            </div>
                            <Button
                                className="w-full animate-gradient text-white border-none mt-2 hover:scale-105 transition-all duration-300 shadow-lg"
                                style={{
                                    backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                                    backgroundSize: '200% 100%',
                                    boxShadow: '0 10px 30px rgba(0, 74, 173, 0.2)'
                                }}
                            >
                                Solicitar Agendamento
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-16 text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <p className="text-sm text-slate-500 mb-4">Empresas que confiam na Manifold AI</p>
                    <div className="flex flex-wrap justify-center gap-8 items-center opacity-40">
                        <div className="h-12 w-32 bg-slate-200 rounded-lg animate-pulse"></div>
                        <div className="h-12 w-32 bg-slate-200 rounded-lg animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                        <div className="h-12 w-32 bg-slate-200 rounded-lg animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-12 w-32 bg-slate-200 rounded-lg animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-200 bg-white text-slate-500 text-sm">
                <div className="container mx-auto px-6 flex justify-center text-center">
                    <div>
                        © 2025 Manifold AI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
