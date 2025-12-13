import { Button } from '../components/ui/Button';
import { ArrowRight, MessageSquare, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 overflow-x-hidden font-sans">

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

                    <div className="flex items-center gap-6">
                        <a href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            Login
                        </a>
                        <Button
                            onClick={() => navigate('/schedule')}
                            className="animate-gradient text-white border-none shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
                            style={{
                                backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                                backgroundSize: '200% 100%'
                            }}
                        >
                            Falar com Especialista
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-40 pb-32 px-6">
                {/* Animated Background Glows */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse-glow"
                    style={{ backgroundColor: 'rgba(0, 74, 173, 0.1)' }}
                />
                <div
                    className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse-glow"
                    style={{ backgroundColor: 'rgba(189, 90, 255, 0.1)' }}
                />

                <div className="container mx-auto max-w-5xl text-center animate-fade-in-up">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] text-slate-900">
                        A Nova Arquitetura da <span style={{ color: '#004aad' }}>Inteligência Corporativa</span>.
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                        Transforme a complexidade dos seus dados em um sistema de decisão claro. Conecte finanças, operação e estratégia em uma única fonte de verdade.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            onClick={() => navigate('/schedule')}
                            size="lg"
                            className="h-14 px-8 text-lg bg-slate-900 text-white hover:bg-slate-800 border-none font-semibold shadow-xl shadow-slate-200 hover:scale-105 transition-all duration-300"
                        >
                            Ver Plataforma em Ação <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <p className="text-sm text-slate-500 mt-4 sm:mt-0 sm:ml-4">
                            ou <button onClick={() => navigate('/schedule')} className="underline hover:text-slate-700">Falar com Especialista</button>
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 border-y border-slate-100 bg-slate-50/50 animate-fade-in-up">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        <div className="p-6 hover:scale-105 transition-transform duration-300">
                            <div className="text-5xl md:text-6xl font-bold mb-4" style={{ color: '#004aad' }}>
                                3x
                            </div>
                            <div className="text-xl font-semibold text-slate-900 mb-2">Mais Receita</div>
                            <p className="text-slate-600 leading-snug">
                                Empresas guiadas por dados têm 3 vezes mais chances de reportar crescimento de
                                dois dígitos (Forrester).
                            </p>
                        </div>
                        <div className="p-6 border-t md:border-t-0 md:border-l border-slate-200 hover:scale-105 transition-transform duration-300">
                            <div className="text-5xl md:text-6xl font-bold mb-4" style={{ color: '#004aad' }}>
                                -40%
                            </div>
                            <div className="text-xl font-semibold text-slate-900 mb-2">Custos Operacionais</div>
                            <p className="text-slate-600 leading-snug">
                                A automação inteligente reduz custos operacionais em até 40% já no
                                primeiro ano de implementação (McKinsey).
                            </p>
                        </div>
                        <div className="p-6 border-t md:border-t-0 md:border-l border-slate-200 hover:scale-105 transition-transform duration-300">
                            <div className="text-5xl md:text-6xl font-bold mb-4" style={{ color: '#bd5aff' }}>
                                +66%
                            </div>
                            <div className="text-xl font-semibold text-slate-900 mb-2">Produtividade</div>
                            <p className="text-slate-600 leading-snug">
                                Equipes equipadas com IA completam tarefas complexas com 66% mais
                                qualidade e velocidade (Nielsen Norman Group).
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-32 px-6 animate-fade-in-up">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">Resultados Reais, Não Apenas Ferramentas</h2>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                            Focamos no que importa: o impacto final no seu balanço.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="group relative p-8 rounded-3xl bg-white border border-slate-200 hover:border-opacity-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2" style={{ borderColor: 'rgba(0, 74, 173, 0.2)' }}>
                            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(0, 74, 173, 0.1)' }}>
                                <TrendingUp className="h-7 w-7" style={{ color: '#004aad' }} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Inteligência Centralizada</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Pare de adivinhar seu fluxo de caixa. Tenha previsibilidade financeira com precisão matemática através de projeções baseadas em dados históricos.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="group relative p-8 rounded-3xl bg-white border border-slate-200 hover:border-opacity-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2" style={{ borderColor: 'rgba(189, 90, 255, 0.2)' }}>
                            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(189, 90, 255, 0.1)' }}>
                                <Zap className="h-7 w-7" style={{ color: '#bd5aff' }} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Orquestração de Equipes</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Seu time comercial foca em fechar contratos, nossa IA foca em encontrar e qualificar os leads com maior propensão de compra.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="group relative p-8 rounded-3xl bg-white border border-slate-200 hover:border-opacity-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2" style={{ borderColor: 'rgba(0, 74, 173, 0.2)' }}>
                            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(0, 74, 173, 0.1)' }}>
                                <CheckCircle2 className="h-7 w-7" style={{ color: '#004aad' }} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Segurança Corporativa</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Identifique automaticamente onde sua empresa trava e desbloqueie o fluxo de trabalho com processos auto-gerenciáveis e alertas inteligentes.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 relative overflow-hidden bg-slate-50 animate-fade-in-up">
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-slate-900">
                        A complexidade é opcional. <br />
                        <span style={{ color: '#004aad' }}>O crescimento é mandatório.</span>
                    </h2>
                    <Button
                        onClick={() => navigate('/schedule')}
                        size="lg"
                        className="h-16 px-10 text-xl bg-slate-900 text-white hover:bg-slate-800 border-none shadow-xl shadow-slate-300 hover:scale-105 transition-all duration-300"
                    >
                        Agendar Reunião de Diagnóstico
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-200 bg-white text-slate-500 text-sm">
                <div className="container mx-auto px-6 flex justify-center text-center">
                    <div>
                        © 2025 MANIFOLD AI. All rights reserved.
                    </div>
                </div>
            </footer>

            {/* Floating Chat Widget */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    className="h-14 w-14 rounded-full text-white shadow-lg p-0 flex items-center justify-center transition-transform hover:scale-110 duration-300"
                    style={{
                        backgroundColor: '#bd5aff',
                        boxShadow: '0 10px 40px rgba(189, 90, 255, 0.3)'
                    }}
                >
                    <MessageSquare className="h-6 w-6" />
                </Button>
            </div>

            {/* n8n Chat Container */}
            <div id="n8n-chat-container"></div>
        </div>
    );
}
