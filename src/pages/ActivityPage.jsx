import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { apiRequest } from '../api/client';
import {
    Activity,
    Clock,
    User as UserIcon,
    Database,
    Loader2,
    RefreshCcw
} from 'lucide-react';

export default function ActivityPage() {
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivity();
    }, []);

    const fetchActivity = async () => {
        try {
            setLoading(true);
            const data = await apiRequest('/admin/activity?limit=100');
            setActivity(data);
        } catch (err) {
            console.error('Error fetching activity:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-dark min-h-screen">
            <Sidebar />
            <main className="pl-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Activity className="text-accent" size={32} />
                            Actividad Global
                        </h1>
                        <p className="text-gray-400 mt-1">Historial de acciones en toda la plataforma</p>
                    </div>

                    <button
                        onClick={fetchActivity}
                        disabled={loading}
                        className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </header>

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                    {loading ? (
                        <div className="py-24 text-center text-accent">
                            <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                            <p className="font-medium">Cargando historial de actividad...</p>
                        </div>
                    ) : activity.length === 0 ? (
                        <div className="py-24 text-center text-gray-500">
                            No se registró actividad reciente.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-800 bg-gray-900/80">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Hora</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Usuario</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Acción</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Módulo</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">ID Entidad</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {activity.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-800/30 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                    <Clock size={14} />
                                                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-gray-800 rounded text-gray-400 group-hover:text-accent transition-colors">
                                                        <UserIcon size={14} />
                                                    </div>
                                                    <span className="text-white font-medium text-sm">{log.user_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.action.includes('CREATE') ? 'bg-green-500/10 text-green-500' :
                                                        log.action.includes('DELETE') ? 'bg-red-500/10 text-red-500' :
                                                            'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Database size={14} className="text-gray-500" />
                                                    {log.entity_table}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-[10px] text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
                                                    {log.entity_id}
                                                </code>
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
