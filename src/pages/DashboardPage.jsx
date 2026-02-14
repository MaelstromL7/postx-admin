import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { apiRequest } from '../api/client';
import {
    FolderKanban,
    Users,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalUsers: 0,
        activeProjects: 0,
        blockedProjects: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [projects, users] = await Promise.all([
                apiRequest('/admin/projects'),
                apiRequest('/admin/users')
            ]);

            setStats({
                totalProjects: projects.length,
                totalUsers: users.length,
                activeProjects: projects.filter(p => !p.is_blocked).length,
                blockedProjects: projects.filter(p => p.is_blocked).length
            });
        } catch (err) {
            setError('Error al obtener estadísticas de la plataforma');
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
                            onClick={fetchStats}
                            className="mt-4 text-sm underline hover:no-underline font-bold"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            label="Total Proyectos"
                            value={stats.totalProjects}
                            icon={FolderKanban}
                        />
                        <StatCard
                            label="Usuarios Registrados"
                            value={stats.totalUsers}
                            icon={Users}
                        />
                        <StatCard
                            label="Proyectos Activos"
                            value={stats.activeProjects}
                            icon={CheckCircle}
                            colorClass="text-green-500"
                        />
                        <StatCard
                            label="Proyectos Bloqueados"
                            value={stats.blockedProjects}
                            icon={XCircle}
                            colorClass="text-red-500"
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
