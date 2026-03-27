import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { apiRequest, parseDate } from '../api/client';
import {
    Loader2,
    Search,
    RefreshCw,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    Send,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Bot,
    User,
} from 'lucide-react';

const STATUS_CONFIG = {
    OPEN: { label: 'Abierto', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
    IN_REVIEW: { label: 'En revisión', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    RESOLVED: { label: 'Resuelto', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
    CLOSED: { label: 'Cerrado', color: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
};

const PRIORITY_CONFIG = {
    LOW: { label: 'Baja', color: 'text-gray-400' },
    MEDIUM: { label: 'Normal', color: 'text-blue-400' },
    HIGH: { label: 'Alta', color: 'text-amber-400' },
    CRITICAL: { label: 'Crítica', color: 'text-red-400' },
};

const STATUS_OPTIONS = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${cfg.color}`}>
            {cfg.label}
        </span>
    );
}

function PriorityLabel({ priority }) {
    const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
    return <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
}

function ConversationPanel({ conversation }) {
    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
        return <p className="text-gray-500 text-sm italic">Sin conversación con el agente IA</p>;
    }
    return (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {conversation.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                    <div key={i} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {!isUser && (
                            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot size={14} className="text-accent" />
                            </div>
                        )}
                        <div
                            className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                                isUser
                                    ? 'bg-accent/15 text-gray-200 border border-accent/30'
                                    : 'bg-gray-800 text-gray-300 border border-gray-700'
                            }`}
                        >
                            {msg.content}
                            {msg.timestamp && (
                                <div className="text-[10px] text-gray-500 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                        </div>
                        {isUser && (
                            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                                <User size={14} className="text-gray-400" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function TicketDetailPanel({ ticket, onUpdate, updating }) {
    const [status, setStatus] = useState(ticket.status);
    const [priority, setPriority] = useState(ticket.priority);
    const [adminReply, setAdminReply] = useState(ticket.admin_reply || '');
    const [adminNotes, setAdminNotes] = useState(ticket.admin_notes || '');
    const [showConversation, setShowConversation] = useState(false);

    useEffect(() => {
        setStatus(ticket.status);
        setPriority(ticket.priority);
        setAdminReply(ticket.admin_reply || '');
        setAdminNotes(ticket.admin_notes || '');
    }, [ticket]);

    const hasChanges =
        status !== ticket.status ||
        priority !== ticket.priority ||
        adminReply !== (ticket.admin_reply || '') ||
        adminNotes !== (ticket.admin_notes || '');

    const handleSave = () => {
        const payload = {};
        if (status !== ticket.status) payload.status = status;
        if (priority !== ticket.priority) payload.priority = priority;
        if (adminReply !== (ticket.admin_reply || '')) payload.admin_reply = adminReply;
        if (adminNotes !== (ticket.admin_notes || '')) payload.admin_notes = adminNotes;
        onUpdate(ticket.id, payload);
    };

    const created = parseDate(ticket.created_at);

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{ticket.subject}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{ticket.user_name} ({ticket.user_email})</span>
                        <span>•</span>
                        <span>{created?.toLocaleDateString()} {created?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {ticket.ai_resolved && (
                            <>
                                <span>•</span>
                                <span className="text-green-400 flex items-center gap-1">
                                    <Bot size={12} /> Resuelto por IA
                                </span>
                            </>
                        )}
                    </div>
                </div>
                {ticket.screenshot_url && (
                    <a
                        href={ticket.screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline flex-shrink-0"
                    >
                        Ver screenshot
                    </a>
                )}
            </div>

            {/* Description */}
            <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Descripción</label>
                <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* AI Conversation */}
            <div>
                <button
                    onClick={() => setShowConversation(!showConversation)}
                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-accent transition-colors"
                >
                    <MessageSquare size={14} />
                    Conversación con IA
                    {showConversation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showConversation && (
                    <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        <ConversationPanel conversation={ticket.ai_conversation} />
                    </div>
                )}
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Estado</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Prioridad</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                    >
                        {PRIORITY_OPTIONS.map((p) => (
                            <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Admin Reply */}
            <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
                    Respuesta al usuario
                </label>
                <textarea
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    rows={3}
                    placeholder="Escribe una respuesta para el usuario..."
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-accent focus:outline-none resize-none"
                />
                {ticket.admin_replied_at && (
                    <p className="text-[11px] text-gray-600 mt-1">
                        Última respuesta: {parseDate(ticket.admin_replied_at)?.toLocaleString()}
                    </p>
                )}
            </div>

            {/* Admin Notes (internal) */}
            <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
                    Notas internas <span className="text-gray-600">(no visibles al usuario)</span>
                </label>
                <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={2}
                    placeholder="Notas internas del equipo..."
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-accent focus:outline-none resize-none"
                />
            </div>

            {/* Save button */}
            {hasChanges && (
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={updating}
                        className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-dark font-semibold px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
                    >
                        {updating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Guardar cambios
                    </button>
                </div>
            )}
        </div>
    );
}

export default function SupportTicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [expandedId, setExpandedId] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiRequest('/support/admin/tickets');
            setTickets(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Error loading tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (ticketId, payload) => {
        try {
            setUpdating(true);
            const updated = await apiRequest(`/support/admin/tickets/${ticketId}`, {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });
            setTickets((prev) =>
                prev.map((t) => (t.id === ticketId ? { ...t, ...updated } : t))
            );
        } catch (err) {
            setError(err.message || 'Error al actualizar el ticket.');
        } finally {
            setUpdating(false);
        }
    };

    const filteredTickets = tickets.filter((t) => {
        const matchesSearch =
            (t.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.user_email || '').toLowerCase().includes(searchTerm.toLowerCase());
        if (statusFilter === 'ALL') return matchesSearch;
        return matchesSearch && t.status === statusFilter;
    });

    const counts = {
        ALL: tickets.length,
        OPEN: tickets.filter((t) => t.status === 'OPEN').length,
        IN_REVIEW: tickets.filter((t) => t.status === 'IN_REVIEW').length,
        RESOLVED: tickets.filter((t) => t.status === 'RESOLVED').length,
        CLOSED: tickets.filter((t) => t.status === 'CLOSED').length,
    };

    const statusIcon = (s) => {
        switch (s) {
            case 'OPEN': return <AlertCircle size={14} className="text-cyan-400" />;
            case 'IN_REVIEW': return <Clock size={14} className="text-amber-400" />;
            case 'RESOLVED': return <CheckCircle2 size={14} className="text-green-400" />;
            case 'CLOSED': return <XCircle size={14} className="text-gray-400" />;
            default: return null;
        }
    };

    return (
        <div className="bg-dark min-h-screen">
            <Sidebar />
            <main className="pl-64 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Tickets de Soporte</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {counts.OPEN} abiertos · {counts.IN_REVIEW} en revisión
                        </p>
                    </div>
                    <button
                        onClick={fetchTickets}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-accent transition-colors"
                    >
                        <RefreshCw size={14} /> Actualizar
                    </button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar por asunto o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
                        {['ALL', ...STATUS_OPTIONS].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                                    statusFilter === s
                                        ? 'bg-accent text-dark'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {s === 'ALL' ? `Todos (${counts.ALL})` : `${STATUS_CONFIG[s].label} (${counts[s]})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-accent" />
                    </div>
                )}

                {/* Ticket list */}
                {!loading && !error && (
                    <div className="space-y-3">
                        {filteredTickets.length === 0 && (
                            <p className="text-center text-gray-500 py-12">No hay tickets que mostrar</p>
                        )}
                        {filteredTickets.map((ticket) => {
                            const isExpanded = expandedId === ticket.id;
                            const created = parseDate(ticket.created_at);
                            return (
                                <div key={ticket.id} className="border border-gray-800 rounded-lg overflow-hidden">
                                    {/* Row */}
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                                        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-accent/5 transition-colors text-left"
                                    >
                                        {statusIcon(ticket.status)}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-white truncate">
                                                    {ticket.subject}
                                                </span>
                                                {ticket.ai_resolved && (
                                                    <Bot size={12} className="text-green-400 flex-shrink-0" />
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {ticket.user_name} · {created?.toLocaleDateString()}
                                            </span>
                                        </div>
                                        <PriorityLabel priority={ticket.priority} />
                                        <StatusBadge status={ticket.status} />
                                        {isExpanded ? (
                                            <ChevronUp size={16} className="text-gray-500" />
                                        ) : (
                                            <ChevronDown size={16} className="text-gray-500" />
                                        )}
                                    </button>

                                    {/* Expanded detail */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5">
                                            <TicketDetailPanel
                                                ticket={ticket}
                                                onUpdate={handleUpdate}
                                                updating={updating}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
