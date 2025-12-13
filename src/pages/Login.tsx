import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { signIn, signUp } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                await signUp(email, password, fullName);
                alert('Conta criada! Verifique seu email para confirmar.');
            } else {
                await signIn(email, password);
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
            {/* Background Glows */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] -z-10 pointer-events-none"
                style={{ backgroundColor: 'rgba(0, 74, 173, 0.1)' }}
            />
            <div
                className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] -z-10 pointer-events-none"
                style={{ backgroundColor: 'rgba(189, 90, 255, 0.1)' }}
            />

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <img src="/logo.png" alt="Manifold AI Logo" className="h-12 w-auto" />
                        <span className="text-3xl font-bold tracking-tight">
                            <span style={{ color: '#004aad' }}>MANIFOLD</span>{' '}
                            <span style={{ color: '#bd5aff' }}>AI</span>
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        {isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}
                    </h1>
                    <p className="text-slate-600">
                        {isSignUp
                            ? 'Preencha os dados para começar'
                            : 'Entre com suas credenciais para continuar'}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Nome Completo
                                </label>
                                <Input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="João Silva"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Senha
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full animate-gradient text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                            style={{
                                backgroundImage: 'linear-gradient(90deg, #004aad, #bd5aff, #004aad)',
                                backgroundSize: '200% 100%',
                            }}
                        >
                            {loading ? (
                                'Carregando...'
                            ) : isSignUp ? (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Criar Conta
                                </>
                            ) : (
                                <>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Entrar
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                            }}
                            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            {isSignUp ? (
                                <>
                                    Já tem uma conta?{' '}
                                    <span className="font-semibold" style={{ color: '#004aad' }}>
                                        Entrar
                                    </span>
                                </>
                            ) : (
                                <>
                                    Não tem uma conta?{' '}
                                    <span className="font-semibold" style={{ color: '#004aad' }}>
                                        Criar agora
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Back to Landing */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        ← Voltar para o site
                    </button>
                </div>
            </div>
        </div>
    );
}
