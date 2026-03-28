import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { apiRequest, parseDate } from '../api/client';
import { Cpu, Loader2, RefreshCcw, Zap, Clock, Hash, FolderOpen, ChevronDown } from 'lucide-react';

const PAGE_SIZE = 75;

function TokenBadge({ tokens }) {
    if (tokens > 5000) return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/10 text-red-400 border border-red-500/20">{tokens.toLocaleString()}</span>;
    if (tokens > 1000) return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">{tokens.toLocaleString()}</span>;
    return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-500/10 text-green-400 border border-green-500/20">{tokens.toLocaleString()}</span>;
}

export default function AILogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    const fetchPage = useCallback(async (offset = 0, replace = false) => {
        try {
            replace ? setLoading(true) : setLoadingMore(true);
            setError(null);
            const data = await apiRequest(`/admin/ai-logs?limit=${PAGE_SIZE}&offset=${offset}`);
            setLogs(prev => replace ? data : [...prev, ...data]);
            setHasMore(data.length === PAGE_SIZE);
        } catch (err) {
            setError(err.message || 'Error al cargar logs de IA');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => { fetchPage(0, true); }, [fetchPage]);

    const totalTokens = logs.reduce((sum, l) => sum + (l.total_tokens || 0), 0);
    const avgLatency = logs.length > 0
        ? Math.round(logs.reduce((s, l) => s + (l.latency_ms || 0), 0) / logs.length)
        : 0;

    const exportToCSV = () => {
        const headers = ['Fecha', 'Proyecto', 'Modelo', 'Prompt Tokens', 'Completion Tokens', 'Total Tokens', 'Latencia (ms)', 'Prompt'];
        const rows = logs.map(l => [
            parseDate(l.created_at).toLocaleString(),
            l.project_name || '',
            l.model_id,
            l.prompt_tokens || 0,
            l.completion_tokens || 0,
            l.total_tokens || 0,
            l.latency_ms || 0,
            l.prompt || ''
        ]);
        const csvContent = [headers, ...rows].map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `ai_logs_postx_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-dark min-h-screen">
            <Sidebar />
            <main className="pl-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                            <Cpu className="text-accent" size={30} />
                            Logs de IA
                        </h1>
                        <p className="text-gray-400 mt-1 font-medium">
                            Registro de uso de modelos · {logs.length} llamadas cargadas
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={exportToCSV}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 text-sm font-bold hover:bg-gray-700 transition-all active:scale-95"
                        >
                            CSV
                        </button>
                        <button
                            onClick={() => fetchPage(0, true)}
                            disabled={loading}
                            className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </header>

                {/* KPIs */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
                        <div className="p-3 bg-accent/10 rounded-lg">
                            <Hash size={20} className="text-accent" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Total Tokens cargados</p>
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

                {error && (
                    <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                    {loading ? (
                        <div className="py-24 text-center text-accent">
                            <Loader2 className="animate-spin mx-auto mb-4" size={40} />
                            <p className="text-sm font-medium">Cargando logs de IA...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="py-24 text-center text-gray-500">No hay registros de IA aún.</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-800 bg-gray-900/80">
                                            <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</th>
                                            <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Proyecto</th>
                                            <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Modelo</th>
                                            <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Tokens</th>
                                            <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Latencia</th>
                                            <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Prompt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/50">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                                                <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                                                    {parseDate(log.created_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {log.project_name ? (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                                            <FolderOpen size={12} className="text-accent/60 shrink-0" />
                                                            <span className="truncate max-w-[160px]">{log.project_name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-600 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="px-2 py-1 text-[10px] font-mono font-bold bg-accent/10 text-accent rounded border border-accent/20">
                                                        {log.model_id}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex flex-col gap-0.5">
                                                        <TokenBadge tokens={log.total_tokens} />
                                                        <span className="text-[10px] text-gray-600">
                                                            {log.prompt_tokens}↑ {log.completion_tokens}↓
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-gray-400 whitespace-nowrap">
                                                    {log.latency_ms != null ? `${log.latency_ms}ms` : '—'}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-gray-400 max-w-xs truncate">
                                                    {log.prompt?.substring(0, 100)}…
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {hasMore && (
                                <div className="px-6 py-4 border-t border-gray-800 text-center">
                                    <button
                                        onClick={() => fetchPage(logs.length)}
                                        disabled={loadingMore}
                                        className="inline-flex items-center gap-2 px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        {loadingMore ? (
                                            <><Loader2 size={14} className="animate-spin" /> Cargando…</>
                                        ) : (
                                            <><ChevronDown size={14} /> Cargar más</>
                                        )}
                                    </button>
                                </div>
                            )}

                            {!hasMore && logs.length > 0 && (
                                <div className="px-6 py-3 border-t border-gray-800 text-center text-gray-600 text-xs">
                                    Mostrando todos los registros ({logs.length})
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
