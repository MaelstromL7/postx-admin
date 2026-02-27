import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { apiRequest } from '../api/client';
import {
    Mail, Calendar, ShieldAlert, ShieldCheck, Loader2, Search,
    UserCog, MonitorSmartphone, X, Plus, Trash2, Shield, RefreshCcw
} from 'lucide-react';

const ROLES = ['POST_PRODUCER', 'POST_COORDINATOR', 'VFX_SUPERVISOR'];

// ─── INVITE MODAL ────────────────────────────────────────────────────────────
function InviteModal({ projects, onClose, onSuccess }) {
    const [form, setForm] = useState({ email: '', first_name: '', last_name: '', project_id: '', role: 'POST_COORDINATOR', modules_enabled: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.project_id) { setError('Selecciona un proyecto.'); return; }
        setLoading(true); setError(null);
        try {
            await apiRequest(`/admin/projects/${form.project_id}/members`, {
                method: 'POST',
                body: JSON.stringify({ email: form.email, first_name: form.first_name, last_name: form.last_name, role: form.role, modules_enabled: [] })
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'Error al invitar al usuario.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Plus size={20} className="text-accent" /> Invitar Usuario</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Nombre</label>
                            <input required value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Apellido</label>
                            <input required value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Email</label>
                        <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Proyecto</label>
                        <select required value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                            <option value="">Seleccionar proyecto...</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Rol</label>
                        <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm rounded-lg bg-accent text-dark font-bold hover:bg-accent/80 transition-colors disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Invitar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── DEVICES MODAL ───────────────────────────────────────────────────────────
function DevicesModal({ user, onClose }) {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState(null);

    useEffect(() => { fetchDevices(); }, []);

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const data = await apiRequest(`/admin/users/${user.id}/devices`);
            setDevices(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const revokeDevice = async (deviceId) => {
        setRevoking(deviceId);
        try {
            await apiRequest(`/admin/users/${user.id}/devices/${deviceId}`, { method: 'DELETE' });
            setDevices(d => d.filter(dev => dev.id !== deviceId));
        } catch (err) { alert('Error al revocar dispositivo.'); }
        finally { setRevoking(null); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2"><MonitorSmartphone size={20} className="text-accent" /> Dispositivos de Confianza</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3">
                    {loading ? (
                        <div className="text-center text-accent py-10"><Loader2 className="animate-spin mx-auto" size={32} /></div>
                    ) : devices.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            <Shield size={40} className="mx-auto mb-3 text-gray-700" />
                            <p className="text-sm">No hay dispositivos de confianza registrados.</p>
                        </div>
                    ) : devices.map(device => (
                        <div key={device.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate">{device.device_name || 'Dispositivo desconocido'}</p>
                                <p className="text-gray-500 text-[11px] mt-0.5">IP: {device.last_login_ip || '—'} · Expira: {new Date(device.expires_at).toLocaleDateString()}</p>
                                <p className="text-gray-600 text-[10px]">Registrado: {new Date(device.created_at).toLocaleString()}</p>
                            </div>
                            <button onClick={() => revokeDevice(device.id)} disabled={revoking === device.id} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors disabled:opacity-50 whitespace-nowrap">
                                {revoking === device.id ? <Loader2 className="animate-spin" size={14} /> : 'Revocar'}
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-800">
                    <button onClick={onClose} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Cerrar</button>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, SUSPENDED, ADMIN
    const [showInvite, setShowInvite] = useState(false);
    const [devicesUser, setDevicesUser] = useState(null);
    const [impersonating, setImpersonating] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, projectsData] = await Promise.all([
                apiRequest('/admin/users'),
                apiRequest('/admin/projects'),
            ]);
            setUsers(usersData);
            setProjects(projectsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (id, currentIsSuspended) => {
        try {
            setActionLoading(id + '_toggle');
            const endpoint = currentIsSuspended ? `/admin/users/${id}/reactivate` : `/admin/users/${id}/suspend`;
            await apiRequest(endpoint, { method: 'POST' });
            await fetchData();
        } catch (err) {
            alert('Error al cambiar el estado del usuario');
        } finally {
            setActionLoading(null);
        }
    };

    const handleHardDeleteUser = async (id, email) => {
        if (!confirm(`¿Estás seguro de ELIMINAR PERMANENTEMENTE al usuario ${email}?\n\nEsta acción no se puede deshacer. Los proyectos que este usuario haya creado no se borrarán, pero su autoría quedará anonimizada.`)) return;

        const confirmation = prompt(`Escribe el email del usuario (${email}) para confirmar el borrado definitivo:`);
        if (confirmation !== email) {
            alert("El email no coincide. Operación cancelada.");
            return;
        }

        try {
            setActionLoading(id + '_delete');
            await apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
            await fetchData();
        } catch (err) {
            alert('Error al eliminar usuario: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleImpersonate = async (user) => {
        try {
            setImpersonating(user.id);
            const data = await apiRequest(`/admin/impersonate/${user.id}`, { method: 'POST' });
            localStorage.setItem('postx_impersonate_token', data.access_token);
            localStorage.setItem('postx_impersonate_user', user.email);
            window.open('https://app.postx.mx', '_blank');
        } catch (err) {
            alert('Error al impersonar usuario: ' + (err.message || 'desconocido'));
        } finally {
            setImpersonating(null);
        }
    };

    const exportToCSV = () => {
        const headers = ['Nombre', 'Email', 'Estado', 'Platform Admin', 'Creado', 'Último Login', 'IP', 'Ubicación', 'Proyectos'];
        const rows = filteredUsers.map(u => [
            `${u.first_name} ${u.last_name}`,
            u.email,
            u.is_suspended ? 'SUSPENDIDO' : 'ACTIVO',
            u.is_platform_admin ? 'SÍ' : 'NO',
            new Date(u.created_at).toLocaleDateString(),
            u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'NUNCA',
            u.last_login_ip || '',
            u.last_login_location || '',
            u.project_access?.map(pa => pa.project_name).join('; ') || ''
        ]);

        const csvContent = [headers, ...rows].map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `usuarios_postx_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());

        if (statusFilter === 'ACTIVE') return matchesSearch && !u.is_suspended;
        if (statusFilter === 'SUSPENDED') return matchesSearch && u.is_suspended;
        if (statusFilter === 'ADMIN') return matchesSearch && u.is_platform_admin;
        return matchesSearch;
    });

    return (
        <div className="bg-dark min-h-screen">
            <Sidebar />
            {showInvite && <InviteModal projects={projects} onClose={() => setShowInvite(false)} onSuccess={fetchData} />}
            {devicesUser && <DevicesModal user={devicesUser} onClose={() => setDevicesUser(null)} />}

            <main className="pl-64 p-8">
                <header className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Usuarios</h1>
                        <p className="text-gray-400 mt-1 font-medium">Control de acceso global y seguridad</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <div className="flex gap-3">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-accent transition-colors"><Search size={18} /></div>
                                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar usuario..." className="bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all w-60 text-sm" />
                            </div>
                            <button onClick={exportToCSV} className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 text-sm font-bold hover:bg-gray-700 transition-all active:scale-95">CSV</button>
                            <button onClick={fetchData} className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors"><RefreshCcw size={18} /></button>
                            <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-dark text-sm font-black rounded-xl hover:shadow-[0_0_20px_rgba(180,250,50,0.3)] transition-all active:scale-95 uppercase tracking-wide">
                                <Plus size={16} strokeWidth={3} /> Invitar
                            </button>
                        </div>
                        <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
                            {['ALL', 'ACTIVE', 'SUSPENDED', 'ADMIN'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setStatusFilter(f)}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${statusFilter === f ? 'bg-accent text-dark' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {f === 'ALL' ? 'TODOS' : f === 'ACTIVE' ? 'ACTIVOS' : f === 'SUSPENDED' ? 'SUSPENDIDOS' : 'ADMINS'}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-950/50">
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Usuario</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Registro</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Último Login</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Acceso Proyectos</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] text-right">Seguridad</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                <tr><td colSpan="5" className="py-24 text-center text-accent"><Loader2 className="animate-spin mx-auto mb-3" size={32} /><span className="text-xs font-bold tracking-widest uppercase opacity-50">Sincronizando Usuarios...</span></td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="5" className="py-24 text-center text-gray-500"><div className="flex flex-col items-center gap-2 opacity-30"><Search size={40} /><span className="font-medium">No se encontraron usuarios</span></div></td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className={`hover:bg-accent/5 transition-all group ${user.is_suspended ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-xl border transition-colors ${user.is_suspended ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-accent/10 border-accent/20 text-accent'}`}>
                                                    <Mail size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white text-sm group-hover:text-accent transition-colors">{user.first_name} {user.last_name}</span>
                                                    <span className="text-gray-500 text-xs font-medium">{user.email}</span>
                                                    <div className="flex gap-1.5 mt-1">
                                                        {user.is_suspended && <span className="text-[9px] font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 uppercase tracking-tighter">Suspendido</span>}
                                                        {user.is_platform_admin && <span className="text-[9px] font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20 uppercase tracking-tighter">Admin</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-400 text-sm font-medium">
                                            {new Date(user.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col text-sm">
                                                {user.last_login_at ? (
                                                    <>
                                                        <span className="text-white font-bold">{new Date(user.last_login_at).toLocaleDateString()}</span>
                                                        <span className="text-[10px] text-gray-500 font-medium uppercase">{new Date(user.last_login_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {user.last_login_location && <span className="text-[9px] text-accent/80 font-bold bg-accent/5 px-1 rounded-sm mt-1 w-fit border border-accent/10">{user.last_login_location}</span>}
                                                    </>
                                                ) : <span className="text-gray-700 italic font-medium">Sin actividad</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                                                {user.project_access?.length > 0 ? (
                                                    user.project_access.map((pa, idx) => (
                                                        <div key={idx} className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-2 py-1 text-[9px] flex items-center gap-1.5 hover:border-accent/40 transition-colors">
                                                            <span className="text-accent font-black tracking-tighter opacity-80 border-r border-gray-600 pr-1.5">
                                                                {pa.role === 'POST_PRODUCER' ? 'PP' : pa.role === 'POST_COORDINATOR' ? 'PC' : pa.role === 'VFX_SUPERVISOR' ? 'VFX' : 'U'}
                                                            </span>
                                                            <span className="text-gray-300 font-bold truncate">{pa.project_name}</span>
                                                        </div>
                                                    ))
                                                ) : <span className="text-gray-700 text-xs italic font-medium">Sin acceso</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2.5">
                                                {!user.is_platform_admin && (
                                                    <>
                                                        {/* Impersonar */}
                                                        <button
                                                            onClick={() => handleImpersonate(user)}
                                                            disabled={impersonating === user.id}
                                                            title="ENTRAR COMO USUARIO (SUPPORT MODE)"
                                                            className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all active:scale-95 disabled:opacity-50"
                                                        >
                                                            {impersonating === user.id ? <Loader2 className="animate-spin" size={16} /> : <UserCog size={16} />}
                                                        </button>

                                                        {/* Dispositivos */}
                                                        <button
                                                            onClick={() => setDevicesUser(user)}
                                                            title="GESTIONAR DISPOSITIVOS 2FA"
                                                            className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all active:scale-95"
                                                        >
                                                            <MonitorSmartphone size={16} />
                                                        </button>

                                                        {/* Suspender / Reactivar */}
                                                        {actionLoading === user.id + '_toggle' ? (
                                                            <div className="w-12 flex justify-center"><Loader2 className="animate-spin text-accent" size={20} /></div>
                                                        ) : (
                                                            <button
                                                                onClick={() => toggleUserStatus(user.id, user.is_suspended)}
                                                                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all active:scale-95 tracking-wider ${user.is_suspended
                                                                    ? 'bg-accent text-dark hover:shadow-[0_0_15px_rgba(180,250,50,0.3)]'
                                                                    : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                                                                    }`}
                                                            >
                                                                {user.is_suspended ? 'REACTIVAR' : 'SUSPENDER'}
                                                            </button>
                                                        )}

                                                        {/* Eliminar Definitivamente */}
                                                        {actionLoading === user.id + '_delete' ? (
                                                            <div className="w-12 flex justify-center"><Loader2 className="animate-spin text-red-500" size={20} /></div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleHardDeleteUser(user.id, user.email)}
                                                                title="ELIMINAR PERMANENTEMENTE"
                                                                className="p-2 rounded-xl bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600/30 transition-all active:scale-95"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
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
