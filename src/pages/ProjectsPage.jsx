import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { apiRequest } from '../api/client';
import {
    Search, CheckCircle, XCircle, Loader2, Filter,
    Users, ChevronRight, X, Plus, Trash2, ArrowLeft
} from 'lucide-react';

const ROLES = ['POST_PRODUCER', 'POST_COORDINATOR', 'VFX_SUPERVISOR'];

const roleColor = (role) => {
    if (role === 'POST_PRODUCER') return 'text-accent bg-accent/10 border-accent/20';
    if (role === 'POST_COORDINATOR') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
};

const roleLabel = (role) => {
    if (role === 'POST_PRODUCER') return 'PP';
    if (role === 'POST_COORDINATOR') return 'PC';
    return 'VFX';
};

// ─── MEMBERS DRAWER ──────────────────────────────────────────────────────────
function MembersDrawer({ project, onClose }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState({ email: '', first_name: '', last_name: '', role: 'POST_COORDINATOR' });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState(null);

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ first_name: '', last_name: '', role: '' });
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => { fetchMembers(); }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const data = await apiRequest(`/admin/projects/${project.id}/members`);
            setMembers(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const removeMember = async (userId) => {
        if (!confirm('¿Estás seguro de quitar este miembro?')) return;
        setRemoving(userId);
        try {
            await apiRequest(`/admin/projects/${project.id}/members/${userId}`, { method: 'DELETE' });
            setMembers(m => m.filter(mem => mem.user_id !== userId));
        } catch (err) { alert('Error al eliminar miembro.'); }
        finally { setRemoving(null); }
    };

    const addMember = async (e) => {
        e.preventDefault();
        setAddLoading(true); setAddError(null);
        try {
            const newMember = await apiRequest(`/admin/projects/${project.id}/members`, {
                method: 'POST',
                body: JSON.stringify({ ...addForm, modules_enabled: [] })
            });
            setMembers(m => [...m, newMember]);
            setAddForm({ email: '', first_name: '', last_name: '', role: 'POST_COORDINATOR' });
            setShowAddForm(false);
        } catch (err) {
            setAddError(err.message || 'Error al invitar miembro.');
        } finally {
            setAddLoading(false);
        }
    };

    const startEdit = (member) => {
        setEditingId(member.user_id);
        setEditForm({
            first_name: member.first_name || '',
            last_name: member.last_name || '',
            role: member.role
        });
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            const updated = await apiRequest(`/admin/projects/${project.id}/members/${editingId}`, {
                method: 'PATCH',
                body: JSON.stringify(editForm)
            });
            setMembers(m => m.map(mem => mem.user_id === editingId ? updated : mem));
            setEditingId(null);
        } catch (err) {
            alert('Error al actualizar miembro: ' + err.message);
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            {/* Drawer */}
            <div className="w-full max-w-md bg-gray-950 border-l border-gray-800 flex flex-col h-full shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Users size={20} className="text-accent" /> Miembros
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-sm text-gray-400">{project.name}</p>
                </div>

                {/* Members List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="text-center text-accent py-10"><Loader2 className="animate-spin mx-auto" size={28} /></div>
                    ) : members.length === 0 ? (
                        <div className="text-center text-gray-500 py-10 text-sm">No hay miembros en este proyecto.</div>
                    ) : members.map(member => (
                        <div key={member.user_id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 transition-all">
                            {editingId === member.user_id ? (
                                <form onSubmit={saveEdit} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <input required value={editForm.first_name} onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} className="bg-gray-950 border border-gray-800 rounded-lg px-2 py-1.5 text-white text-xs" />
                                        <input required value={editForm.last_name} onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} className="bg-gray-950 border border-gray-800 rounded-lg px-2 py-1.5 text-white text-xs" />
                                    </div>
                                    <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2 py-1.5 text-white text-xs">
                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                    <div className="flex gap-2 pt-1">
                                        <button type="submit" disabled={editLoading} className="flex-1 py-1.5 bg-accent text-dark font-bold text-[10px] rounded uppercase disabled:opacity-50">
                                            {editLoading ? 'Guardando...' : 'Guardar'}
                                        </button>
                                        <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-gray-800 text-gray-400 font-bold text-[10px] rounded uppercase">Cancelar</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap text-xs">
                                            <p className="text-white font-medium">{member.first_name} {member.last_name}</p>
                                            <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded border ${roleColor(member.role)}`}>
                                                {roleLabel(member.role)}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-[10px] mt-0.5 truncate">{member.email}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => startEdit(member)} className="p-1.5 text-gray-500 hover:text-accent transition-colors"><Plus size={14} className="rotate-45" /></button>
                                        <button
                                            onClick={() => removeMember(member.user_id)}
                                            disabled={removing === member.user_id}
                                            className="p-1.5 text-red-400/60 hover:text-red-400 transition-colors disabled:opacity-50"
                                        >
                                            {removing === member.user_id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add Member Form */}
                <div className="p-4 border-t border-gray-800 bg-gray-900/30">
                    {showAddForm ? (
                        <form onSubmit={addMember} className="space-y-3 p-2">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-white uppercase tracking-wider">Agregar Miembro</p>
                                <button type="button" onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-white"><X size={16} /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input required placeholder="Nombre" value={addForm.first_name} onChange={e => setAddForm(f => ({ ...f, first_name: e.target.value }))} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
                                <input required placeholder="Apellido" value={addForm.last_name} onChange={e => setAddForm(f => ({ ...f, last_name: e.target.value }))} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
                            </div>
                            <input required type="email" placeholder="Email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
                            <select value={addForm.role} onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent">
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            {addError && <p className="text-red-400 text-xs">{addError}</p>}
                            <button type="submit" disabled={addLoading} className="w-full py-2 text-sm font-bold bg-accent text-dark rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50 shadow-lg shadow-accent/20">
                                {addLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Invitar al Proyecto'}
                            </button>
                        </form>
                    ) : (
                        <button onClick={() => setShowAddForm(true)} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold border border-dashed border-gray-700 text-gray-400 hover:text-accent hover:border-accent/40 rounded-xl transition-all">
                            <Plus size={16} /> NUEVO MIEMBRO
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [showBlockedOnly, setShowBlockedOnly] = useState(false);

    useEffect(() => { fetchProjects(); }, []);

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

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = showBlockedOnly ? p.is_blocked : true;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="bg-dark min-h-screen">
            <Sidebar />
            {selectedProject && <MembersDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />}

            <main className="pl-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Proyectos</h1>
                        <p className="text-gray-400 mt-1 font-medium">Gestión de licencias, estados y miembros</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-accent transition-colors"><Search size={18} /></div>
                            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar proyecto..." className="bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all w-64 text-sm" />
                        </div>
                        <button
                            onClick={() => setShowBlockedOnly(!showBlockedOnly)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-bold ${showBlockedOnly ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
                        >
                            <Filter size={16} />
                            {showBlockedOnly ? 'Solo Bloqueados' : 'Filtrar'}
                        </button>
                    </div>
                </header>

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-950/50">
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Nombre</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Tipo</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Creado</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Estado</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] text-right">Mantenimiento</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                <tr><td colSpan="5" className="py-24 text-center text-accent"><Loader2 className="animate-spin mx-auto mb-3" size={32} /><span className="text-xs font-bold tracking-widest uppercase opacity-50">Sincronizando...</span></td></tr>
                            ) : filteredProjects.length === 0 ? (
                                <tr><td colSpan="5" className="py-24 text-center text-gray-500 flex flex-col items-center gap-2"><Filter size={40} className="opacity-10 mb-2" /><span className="font-medium text-sm">No se encontraron proyectos con estos filtros.</span></td></tr>
                            ) : (
                                filteredProjects.map((project) => (
                                    <tr key={project.id} className="hover:bg-accent/5 transition-all group">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-white group-hover:text-accent transition-colors">{project.name}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[10px] font-black text-gray-500 bg-gray-800 px-2 py-0.5 rounded uppercase">{project.project_type || project.type || 'FEATURE'}</span>
                                        </td>
                                        <td className="px-6 py-5 text-gray-400 text-sm font-medium">{new Date(project.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        <td className="px-6 py-5">
                                            {project.is_blocked ? (
                                                <div className="flex items-center space-x-2 text-red-500 bg-red-500/10 px-3 py-1 rounded-lg text-xs font-black w-fit border border-red-500/20"><XCircle size={14} /><span>BLOQUEADO</span></div>
                                            ) : (
                                                <div className="flex items-center space-x-2 text-green-500 bg-green-500/10 px-3 py-1 rounded-lg text-xs font-black w-fit border border-green-500/20"><CheckCircle size={14} /><span>LICENCIA ACTIVA</span></div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-3">
                                                {/* Ver miembros */}
                                                <button
                                                    onClick={() => setSelectedProject(project)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all active:scale-95"
                                                >
                                                    <Users size={14} /> Miembros
                                                </button>

                                                {/* Activar / Desactivar */}
                                                {actionLoading === project.id ? (
                                                    <div className="w-10 flex justify-center"><Loader2 className="animate-spin text-accent" size={20} /></div>
                                                ) : (
                                                    <button
                                                        onClick={() => toggleLicense(project.id, project.is_blocked)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 ${project.is_blocked
                                                            ? 'bg-accent text-dark hover:shadow-[0_0_20px_rgba(180,250,50,0.4)]'
                                                            : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                                                            }`}
                                                    >
                                                        {project.is_blocked ? 'ACTIVAR' : 'BLOQUEAR'}
                                                    </button>
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
