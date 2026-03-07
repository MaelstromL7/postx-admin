import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { apiRequest, parseDate } from '../api/client';
import { Megaphone, Plus, Pencil, Trash2, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';

const TYPE_CONFIG = {
    MAINTENANCE: { label: 'Mantenimiento', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
    INFO:        { label: 'Información',   color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
    WARNING:     { label: 'Advertencia',   color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
    CRITICAL:    { label: 'Crítico',       color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

const EMPTY_FORM = {
    type: 'MAINTENANCE',
    title: '',
    message: '',
    starts_at: '',
    ends_at: '',
    is_active: true,
};

function toLocalInput(isoStr) {
    if (!isoStr) return '';
    const d = parseDate(isoStr);
    if (!d) return '';
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toUTC(localStr) {
    if (!localStr) return null;
    return new Date(localStr).toISOString();
}

function AnnouncementModal({ initial, onClose, onSaved }) {
    const [form, setForm] = useState(
        initial
            ? {
                  type: initial.type,
                  title: initial.title,
                  message: initial.message,
                  starts_at: toLocalInput(initial.starts_at),
                  ends_at: toLocalInput(initial.ends_at),
                  is_active: initial.is_active,
              }
            : { ...EMPTY_FORM }
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const body = {
                type: form.type,
                title: form.title,
                message: form.message,
                starts_at: toUTC(form.starts_at),
                ends_at: toUTC(form.ends_at),
                is_active: form.is_active,
            };
            if (initial) {
                await apiRequest(`/admin/announcements/${initial.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(body),
                });
            } else {
                await apiRequest('/admin/announcements', {
                    method: 'POST',
                    body: JSON.stringify(body),
                });
            }
            onSaved();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-5">
                    {initial ? 'Editar anuncio' : 'Nuevo anuncio'}
                </h2>

                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tipo</label>
                        <select
                            value={form.type}
                            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent"
                        >
                            {Object.entries(TYPE_CONFIG).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Título</label>
                        <input
                            required
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="Ej: Mantenimiento programado"
                            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-accent"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Mensaje</label>
                        <textarea
                            required
                            rows={3}
                            value={form.message}
                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                            placeholder="Describe el anuncio..."
                            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-accent resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Inicio (opcional)</label>
                            <input
                                type="datetime-local"
                                value={form.starts_at}
                                onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))}
                                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Fin (opcional)</label>
                            <input
                                type="datetime-local"
                                value={form.ends_at}
                                onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))}
                                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent"
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                            className="w-4 h-4 accent-[#B4FA32] rounded"
                        />
                        <span className="text-sm text-gray-300">Activo al crear</span>
                    </label>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {initial ? 'Guardar cambios' : 'Crear anuncio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function formatDate(isoStr) {
    const d = parseDate(isoStr);
    if (!d) return '—';
    return d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [togglingId, setTogglingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiRequest('/admin/announcements');
            setAnnouncements(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleToggle = async (a) => {
        setTogglingId(a.id);
        try {
            await apiRequest(`/admin/announcements/${a.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ is_active: !a.is_active }),
            });
            await fetchData();
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (a) => {
        if (!confirm(`¿Eliminar el anuncio "${a.title}"?`)) return;
        setDeletingId(a.id);
        try {
            await apiRequest(`/admin/announcements/${a.id}`, { method: 'DELETE' });
            await fetchData();
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-dark min-h-screen">
            <Sidebar />
            <main className="pl-64 p-8">
                <header className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Megaphone className="text-accent" size={28} />
                            <h1 className="text-3xl font-bold text-white">Anuncios</h1>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Mantenimientos programados y avisos de sistema para los usuarios.
                        </p>
                    </div>
                    <button
                        onClick={() => { setEditTarget(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-black font-semibold rounded-xl hover:bg-accent/90 transition-colors text-sm"
                    >
                        <Plus size={16} />
                        Nuevo anuncio
                    </button>
                </header>

                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm flex items-center gap-2">
                        {error}
                        <button onClick={fetchData} className="ml-auto underline">Reintentar</button>
                    </div>
                )}

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Tipo</th>
                                <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Título</th>
                                <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Mensaje</th>
                                <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Inicio</th>
                                <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Fin</th>
                                <th className="text-center px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Activo</th>
                                <th className="text-right px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="text-center py-16 text-gray-500">
                                        <Loader2 className="animate-spin mx-auto" size={28} />
                                    </td>
                                </tr>
                            )}
                            {!loading && announcements.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-16 text-gray-500">
                                        No hay anuncios. Crea el primero.
                                    </td>
                                </tr>
                            )}
                            {!loading && announcements.map(a => {
                                const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.INFO;
                                return (
                                    <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full border ${cfg.color}`}>
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-white font-medium max-w-[160px] truncate">{a.title}</td>
                                        <td className="px-5 py-4 text-gray-400 max-w-[220px] truncate">{a.message}</td>
                                        <td className="px-5 py-4 text-gray-400 whitespace-nowrap">{formatDate(a.starts_at)}</td>
                                        <td className="px-5 py-4 text-gray-400 whitespace-nowrap">{formatDate(a.ends_at)}</td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => handleToggle(a)}
                                                disabled={togglingId === a.id}
                                                className="inline-flex items-center justify-center disabled:opacity-50"
                                                title={a.is_active ? 'Desactivar' : 'Activar'}
                                            >
                                                {togglingId === a.id
                                                    ? <Loader2 size={20} className="animate-spin text-gray-500" />
                                                    : a.is_active
                                                        ? <ToggleRight size={24} className="text-accent" />
                                                        : <ToggleLeft size={24} className="text-gray-600" />
                                                }
                                            </button>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditTarget(a); setShowModal(true); }}
                                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(a)}
                                                    disabled={deletingId === a.id}
                                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Eliminar"
                                                >
                                                    {deletingId === a.id
                                                        ? <Loader2 size={15} className="animate-spin" />
                                                        : <Trash2 size={15} />
                                                    }
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>

            {showModal && (
                <AnnouncementModal
                    initial={editTarget}
                    onClose={() => setShowModal(false)}
                    onSaved={fetchData}
                />
            )}
        </div>
    );
}
