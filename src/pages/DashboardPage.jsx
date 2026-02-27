import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { apiRequest } from '../api/client';
import {
    FolderKanban,
    Users,
    CheckCircle,
    XCircle,
    Loader2,
    UserCheck,
    UserX,
    Cpu
} from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        total_projects: 0,
        total_users: 0,
        active_projects: 0,
        inactive_projects: 0,
        total_scripts: 0,
        total_vfx_shots: 0,
        active_users_7d: 0,
        active_users_30d: 0,
        suspended_users: 0,
        total_ai_tokens: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsData, activityData] = await Promise.all([
                apiRequest('/admin/stats'),
                apiRequest('/admin/activity?limit=5')
            ]);

            setStats(statsData);
            setRecentActivity(activityData);
        } catch (err) {
            setError('Error al obtener datos de la plataforma');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-dark min-h-screen">
            <Sidebar />
            <main className="pl-64 p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Resumen general de la plataforma PostX</p>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-accent">
                        <Loader2 className="animate-spin mb-4" size={48} />
                        <p className="font-medium">Cargando datos...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-red-500">
                        <p>{error}</p>
                        <button
                            onClick={fetchData}
                            className="mt-4 text-sm underline hover:no-underline font-bold"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard label="Total Proyectos" value={stats.total_projects} icon={FolderKanban} />
                            <StatCard label="Usuarios Totales" value={stats.total_users} icon={Users} />
                            <StatCard label="Guiones / Scripts" value={stats.total_scripts} icon={CheckCircle} colorClass="text-green-500" />
                            <StatCard label="Shots de VFX" value={stats.total_vfx_shots} icon={XCircle} colorClass="text-accent" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard label="Activos (7 días)" value={stats.active_users_7d} icon={UserCheck} colorClass="text-green-400" />
                            <StatCard label="Activos (30 días)" value={stats.active_users_30d} icon={UserCheck} colorClass="text-blue-400" />
                            <StatCard label="Usuarios Suspendidos" value={stats.suspended_users} icon={UserX} colorClass="text-red-400" />
                            <StatCard label="Total Tokens IA" value={stats.total_ai_tokens.toLocaleString()} icon={Cpu} colorClass="text-purple-400" />
                        </div>

                        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Actividad Reciente</h2>
                                <a href="/activity" className="text-accent text-sm font-bold hover:underline font-bold uppercase tracking-widest text-[10px]">Ver todo</a>
                            </div>

                            <div className="space-y-4">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((log) => (
                                        <div key={log.id} className="flex items-start space-x-4 p-3 hover:bg-gray-800/50 rounded-xl transition-all border border-transparent hover:border-gray-700/50">
                                            <div className="w-2 h-2 rounded-full bg-accent mt-2 shadow-[0_0_8px_rgba(0,180,216,0.5)]"></div>
                                            <div className="flex-1">
                                                <p className="text-gray-300 text-sm">
                                                    <span className="text-white font-bold">{log.user_name}</span>
                                                    {' '}{log.action}{' '}
                                                    <span className="text-accent">{log.entity_table}</span>
                                                </p>
                                                <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-tighter">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm italic">No hay actividad reciente.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
