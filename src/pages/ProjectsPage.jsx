import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { apiRequest } from '../api/client';
import {
    Search,
    MoreVertical,
    CheckCircle,
    XCircle,
    Loader2,
    Filter
} from 'lucide-react';

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await apiRequest('/admin/projects');
            setProjects(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleLicense = async (id, currentStatus) => {
        try {
            setActionLoading(id);
            const endpoint = currentStatus ? `/admin/projects/${id}/activate` : `/admin/projects/${id}/deactivate`;
            await apiRequest(endpoint, { method: 'POST' });
            await fetchProjects();
        } catch (err) {
            alert('Error al actualizar el estado de la licencia');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-dark min-h-screen">
            <Sidebar />
            <main className="pl-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Proyectos</h1>
                        <p className="text-gray-400 mt-1">Gestión de licencias y estados</p>
                    </div>

                    <div className="flex space-x-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar proyecto..."
                                className="bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all w-64"
                            />
                        </div>
                        <button className="bg-gray-800 p-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white transition-colors">
                            <Filter size={20} />
                        </button>
                    </div>
                </header>

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/80">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Tipo</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Creado</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-accent">
                                        <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                                        <span className="text-sm">Obteniendo proyectos...</span>
                                    </td>
                                </tr>
                            ) : filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-gray-500">
                                        No se encontraron proyectos.
                                    </td>
                                </tr>
                            ) : (
                                filteredProjects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-800/30 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-white">{project.name}</td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">{project.project_type || 'FEATURE'}</td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {project.is_blocked ? (
                                                <div className="flex items-center space-x-1.5 text-red-500 bg-red-500/10 px-2 py-1 rounded-full text-xs font-bold w-fit">
                                                    <XCircle size={14} />
                                                    <span>BLOQUEADO</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-1.5 text-green-500 bg-green-500/10 px-2 py-1 rounded-full text-xs font-bold w-fit">
                                                    <CheckCircle size={14} />
                                                    <span>ACTIVO</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {actionLoading === project.id ? (
                                                <Loader2 className="animate-spin text-accent ml-auto" size={18} />
                                            ) : (
                                                <button
                                                    onClick={() => toggleLicense(project.id, project.is_blocked)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${project.is_blocked
                                                            ? 'bg-green-500 text-dark hover:bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                                                            : 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30'
                                                        }`}
                                                >
                                                    {project.is_blocked ? 'ACTIVAR' : 'DESACTIVAR'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
