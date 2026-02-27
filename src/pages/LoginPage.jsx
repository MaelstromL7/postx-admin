import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, KeyRound } from 'lucide-react';

export default function LoginPage() {
    const [step, setStep] = useState('login'); // 'login' or '2fa'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');

    const { login, verify2FA, loading, error, setError } = useAuth();
    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await login(email, password);
            if (result?.status === '2fa_required') {
                setStep('2fa');
                setOtpCode(''); // reset just in case
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            // Error is handled by context
        }
    };

    const handle2FASubmit = async (e) => {
        e.preventDefault();
        try {
            await verify2FA(email, otpCode);
            navigate('/dashboard');
        } catch (err) {
            // Error is handled by context
        }
    };

    return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-extrabold text-accent tracking-tighter mb-2 italic">PostX</h1>
                    <p className="text-gray-400 font-medium">Panel de Administración de Plataforma</p>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm transition-all duration-300">
                    {step === 'login' ? (
                        <form onSubmit={handleLoginSubmit} className="space-y-6 animate-fade-in">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email Administrador</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                                        placeholder="admin@postx.mx"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center space-x-2 text-red-500 bg-red-500/10 p-4 rounded-xl text-sm border border-red-500/20 animate-pulse">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-dark bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verificando credenciales...' : 'Continuar'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handle2FASubmit} className="space-y-6 animate-fade-in">
                            <div className="text-center mb-6">
                                <KeyRound className="mx-auto h-12 w-12 text-accent mb-4" />
                                <h2 className="text-xl font-bold text-white mb-2">Verificación en dos pasos</h2>
                                <p className="text-sm text-gray-400">
                                    Hemos enviado un código de 6 dígitos a <br />
                                    <span className="text-white font-medium">{email}</span>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2 text-center">Código de seguridad</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    className="block w-full text-center tracking-[0.5em] text-2xl py-3 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                                    placeholder="000000"
                                />
                            </div>

                            {error && (
                                <div className="flex items-center space-x-2 text-red-500 bg-red-500/10 p-4 rounded-xl text-sm border border-red-500/20 animate-pulse">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={loading || otpCode.length < 6}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-dark bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Verificando código...' : 'Acceder al Panel'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('login');
                                        setError(null);
                                    }}
                                    className="w-full flex justify-center py-3 px-4 border border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-transparent hover:bg-gray-800 transition-all"
                                >
                                    Cancelar y volver atrás
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <p className="mt-8 text-center text-gray-500 text-xs">
                    &copy; {new Date().getFullYear()} PostX - Acceso exclusivo para administradores
                </p>
            </div>
        </div>
    );
}
