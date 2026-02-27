import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { apiRequest } from '../api/client';
import {
    Mail,
    Calendar,
    ShieldAlert,
    ShieldCheck,
    Loader2,
    Search
} from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await apiRequest('/admin/users');
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (id, currentIsSuspended) => {
        try {
            setActionLoading(id);
            const endpoint = currentIsSuspended ? `/admin/users/${id}/reactivate` : `/admin/users/${id}/suspend`;
            await apiRequest(endpoint, { method: 'POST' });
            await fetchUsers();
        } catch (err) {
            alert('Error alcambiar el estado del usuario');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-dark min-h-screen">
            <Sidebar />
            <main className="pl-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Usuarios</h1>
                        <p className="text-gray-400 mt-1">Control de acceso global</p>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por email..."
                            className="bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all w-64"
                        />
                    </div>
                </header>

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/80">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Usuario</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Registro</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Última Conexión</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Proyectos / Permisos</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-accent">
                                        <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                                        <span className="text-sm">Cargando usuarios...</span>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-gray-500">
                                        No se encontraron usuarios.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-800/30 transition-colors border-l-2 border-transparent hover:border-accent">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                                                    <Mail size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white">{user.first_name} {user.last_name}</span>
                                                    <span className="text-gray-500 text-xs">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2 text-gray-400 text-sm">
                                                <Calendar size={14} />
                                                <span>{new Date(user.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-sm text-gray-400">
                                                {user.last_login_at ? (
                                                    <>
                                                        <span className="text-white font-medium">{new Date(user.last_login_at).toLocaleDateString()}</span>
                                                        <span className="text-[10px] text-gray-500">{new Date(user.last_login_at).toLocaleTimeString()}</span>
                                                        {user.last_login_location && (
                                                            <span className="text-[10px] text-accent/70 mt-0.5">{user.last_login_location}</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="italic text-gray-600">Nunca</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                                                {user.project_access?.length > 0 ? (
                                                    user.project_access.map((pa, idx) => (
                                                        <div key={idx} className="bg-gray-900 border border-gray-700/50 rounded px-2 py-0.5 text-[10px]">
                                                            <span className="text-accent font-bold uppercase tracking-tighter mr-1">
                                                                {pa.role === 'POST_PRODUCER' ? 'PP' :
                                                                    pa.role === 'POST_COORDINATOR' ? 'PC' :
                                                                        pa.role === 'VFX_SUPERVISOR' ? 'VFX' : 'U'}
                                                            </span>
                                                            <span className="text-gray-300">{pa.project_name}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-600 text-xs italic">Sin proyectos asignados</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {actionLoading === user.id ? (
                                                <Loader2 className="animate-spin text-accent ml-auto" size={18} />
                                            ) : (
                                                <button
                                                    onClick={() => toggleUserStatus(user.id, user.is_suspended)}
                                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${user.is_suspended
                                                        ? 'bg-accent/10 text-accent border-accent/30 hover:bg-accent/20'
                                                        : 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20'
                                                        }`}
                                                >
                                                    {user.is_suspended ? 'REACTIVAR' : 'SUSPENDER'}
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
