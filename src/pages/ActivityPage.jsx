import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { apiRequest, parseDate } from '../api/client';
import {
    Activity,
    Clock,
    User as UserIcon,
    Loader2,
    RefreshCcw,
    ChevronDown,
    FolderOpen,
    ChevronRight,
} from 'lucide-react';

const PAGE_SIZE = 75;

// Human-readable table names
const TABLE_LABELS = {
    users: 'Usuario',
    projects: 'Proyecto',
    scripts: 'Guión',
    script_scenes: 'Escena',
    budget_lines: 'Línea de Presupuesto',
    vfx_shots: 'VFX Shot',
    vfx_breakdowns: 'VFX Breakdown',
    documents: 'Documento',
    user_projects: 'Miembro de Proyecto',
    work_plans: 'Plan de Trabajo',
    post_schedules: 'Post Schedule',
    cash_flows: 'Flujo de Caja',
    editorial_cuts: 'Corte Editorial',
    data_logs: 'Data Log',
    ndas: 'NDA',
    report_folders: 'Carpeta de Reporte',
    report_files: 'Archivo de Reporte',
    shooting_schedules: 'Plan de Rodaje',
    one_sheets: 'One Sheet',
    project_licenses: 'Licencia',
    trusted_devices: 'Dispositivo',
    audit_logs: 'Audit Log',
};

const ACTION_STYLE = {
    CREATE: 'bg-green-500/10 text-green-400 border border-green-500/20',
    UPDATE: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    DELETE: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const ACTION_LABEL = {
    CREATE: 'Creó',
    UPDATE: 'Editó',
    DELETE: 'Eliminó',
};

// Builds a one-line description of what changed
function buildDescription(action, entityTable, changes) {
    const table = TABLE_LABELS[entityTable] || entityTable;
    const verb = ACTION_LABEL[action] || action;
    const changedFields = Object.keys(changes || {});

    if (action === 'CREATE') return `Creó ${table}`;
    if (action === 'DELETE') return `Eliminó ${table}`;

    if (changedFields.length === 0) return `Editó ${table}`;
    if (changedFields.length === 1) {
        const field = formatFieldName(changedFields[0]);
        return `Editó ${table} · cambió ${field}`;
    }
    return `Editó ${table} · ${changedFields.length} campos`;
}

function formatFieldName(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

function formatValue(val) {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'Sí' : 'No';
    if (typeof val === 'string' && val.length > 80) return val.slice(0, 80) + '…';
    return String(val);
}

function ChangesPanel({ changes }) {
    const entries = Object.entries(changes || {});
    if (entries.length === 0) return <p className="text-gray-500 text-xs">Sin cambios registrados.</p>;

    return (
        <div className="space-y-1.5">
            {entries.map(([field, diff]) => (
                <div key={field} className="flex flex-wrap items-start gap-x-2 gap-y-0.5 text-xs">
                    <span className="text-gray-400 font-medium min-w-[100px]">{formatFieldName(field)}</span>
                    {diff && typeof diff === 'object' && 'old' in diff ? (
                        <>
                            <span className="line-through text-red-400/70">{formatValue(diff.old)}</span>
                            <ChevronRight size={10} className="text-gray-600 mt-0.5 shrink-0" />
                            <span className="text-green-400/90">{formatValue(diff.new)}</span>
                        </>
                    ) : (
                        <span className="text-gray-300">{formatValue(diff)}</span>
                    )}
                </div>
            ))}
        </div>
    );
}

function LogRow({ log }) {
    const [expanded, setExpanded] = useState(false);
    const hasChanges = Object.keys(log.changes || {}).length > 0;
    const date = parseDate(log.timestamp);

    return (
        <>
            <tr
                className={`border-b border-gray-800/50 transition-colors group ${hasChanges ? 'cursor-pointer hover:bg-gray-800/30' : 'hover:bg-gray-800/20'}`}
                onClick={() => hasChanges && setExpanded(e => !e)}
            >
                {/* Hora */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Clock size={12} />
                        <span>{date.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                </td>

                {/* Usuario */}
                <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                        <div className="p-1 bg-gray-800 rounded text-gray-400 group-hover:text-accent transition-colors shrink-0">
                            <UserIcon size={12} />
                        </div>
                        <span className="text-white text-sm font-medium leading-tight">{log.user_name}</span>
                    </div>
                </td>

                {/* Descripción */}
                <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${ACTION_STYLE[log.action] || 'bg-gray-700 text-gray-300'}`}>
                            {ACTION_LABEL[log.action] || log.action}
                        </span>
                        <span className="text-gray-300 text-sm">
                            {buildDescription(log.action, log.entity_table, log.changes)}
                        </span>
                    </div>
                </td>

                {/* Proyecto */}
                <td className="px-5 py-3.5">
                    {log.project_name ? (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <FolderOpen size={12} className="text-accent/60 shrink-0" />
                            <span className="truncate max-w-[160px]">{log.project_name}</span>
                        </div>
                    ) : (
                        <span className="text-gray-600 text-xs">—</span>
                    )}
                </td>

                {/* Entidad */}
                <td className="px-5 py-3.5">
                    <code className="text-[10px] text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800 font-mono" title={log.entity_id}>
                        {log.entity_id.slice(0, 8)}…
                    </code>
                </td>

                {/* Expand */}
                <td className="px-4 py-3.5 text-center w-8">
                    {hasChanges && (
                        <ChevronDown
                            size={14}
                            className={`text-gray-500 mx-auto transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
                        />
                    )}
                </td>
            </tr>

            {/* Expanded changes */}
            {expanded && hasChanges && (
                <tr className="bg-gray-900/60 border-b border-gray-800/50">
                    <td colSpan={6} className="px-10 py-3">
                        <ChangesPanel changes={log.changes} />
                    </td>
                </tr>
            )}
        </>
    );
}

export default function ActivityPage() {
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    const fetchPage = useCallback(async (offset = 0, replace = false) => {
        try {
            replace ? setLoading(true) : setLoadingMore(true);
            const data = await apiRequest(`/admin/activity?limit=${PAGE_SIZE}&offset=${offset}`);
            setActivity(prev => replace ? data : [...prev, ...data]);
            setHasMore(data.length === PAGE_SIZE);
        } catch (err) {
            setError(err.message || 'Error al cargar actividad');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => { fetchPage(0, true); }, [fetchPage]);

    return (
        <div className="bg-dark min-h-screen">
            <Sidebar />
            <main className="pl-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Activity className="text-accent" size={32} />
                            Audit Log
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Historial completo de acciones en la plataforma · {activity.length} registros
                        </p>
                    </div>
                    <button
                        onClick={() => fetchPage(0, true)}
                        disabled={loading}
                        className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </header>

                {error && (
                    <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                    {loading ? (
                        <div className="py-24 text-center text-accent">
                            <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                            <p className="font-medium">Cargando historial…</p>
                        </div>
                    ) : activity.length === 0 ? (
                        <div className="py-24 text-center text-gray-500">
                            No se registró actividad reciente.
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-800 bg-gray-900/80">
                                            <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Hora</th>
                                            <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Usuario</th>
                                            <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Qué hizo</th>
                                            <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Proyecto</th>
                                            <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Entidad</th>
                                            <th className="w-8" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activity.map(log => (
                                            <LogRow key={log.id} log={log} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {hasMore && (
                                <div className="px-6 py-4 border-t border-gray-800 text-center">
                                    <button
                                        onClick={() => fetchPage(activity.length)}
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

                            {!hasMore && activity.length > 0 && (
                                <div className="px-6 py-3 border-t border-gray-800 text-center text-gray-600 text-xs">
                                    Mostrando todos los registros ({activity.length})
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
