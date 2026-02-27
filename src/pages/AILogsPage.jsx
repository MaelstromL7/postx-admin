import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { apiRequest } from '../api/client';
import { Cpu, Loader2, RefreshCcw, Zap, Clock, Hash } from 'lucide-react';

function TokenBadge({ tokens }) {
    if (tokens > 5000) return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/10 text-red-400 border border-red-500/20">{tokens.toLocaleString()}</span>;
    if (tokens > 1000) return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">{tokens.toLocaleString()}</span>;
    return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-500/10 text-green-400 border border-green-500/20">{tokens.toLocaleString()}</span>;
}

export default function AILogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await apiRequest('/admin/ai-logs?limit=100');
            setLogs(data);
        } catch (err) {
            console.error('Error fetching AI logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const totalTokens = logs.reduce((sum, l) => sum + (l.total_tokens || 0), 0);
    const avgLatency = logs.length > 0
        ? Math.round(logs.reduce((s, l) => s + (l.latency_ms || 0), 0) / logs.length)
        : 0;

    return (
        <div className="bg-dark min-h-screen">
            <Sidebar />
            <main className="pl-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Cpu className="text-accent" size={30} />
                            Logs de IA
                        </h1>
                        <p className="text-gray-400 mt-1">Registro de uso de modelos de inteligencia artificial</p>
                    </div>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </header>

                {/* KPIs */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
                        <div className="p-3 bg-accent/10 rounded-lg">
                            <Hash size={20} className="text-accent" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Total Tokens (100 logs)</p>
                            <p className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                            <Zap size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Llamadas registradas</p>
                            <p className="text-2xl font-bold text-white">{logs.length}</p>
                        </div>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <Clock size={20} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Latencia Promedio</p>
                            <p className="text-2xl font-bold text-white">{avgLatency}<span className="text-sm text-gray-500 ml-1">ms</span></p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                    {loading ? (
                        <div className="py-24 text-center text-accent">
                            <Loader2 className="animate-spin mx-auto mb-4" size={40} />
                            <p className="text-sm font-medium">Cargando logs de IA...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="py-24 text-center text-gray-500">No hay registros de IA aún.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-800 bg-gray-900/80">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Modelo</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Tokens</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Latencia</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Prompt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-[10px] font-mono font-bold bg-accent/10 text-accent rounded border border-accent/20">
                                                    {log.model_id}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <TokenBadge tokens={log.total_tokens} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {log.latency_ms != null ? `${log.latency_ms}ms` : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-400 max-w-sm truncate">
                                                {log.prompt?.substring(0, 120)}...
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
