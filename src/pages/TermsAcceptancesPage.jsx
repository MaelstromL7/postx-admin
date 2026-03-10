import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { apiRequest, parseDate } from '../api/client';
import {
    FileCheck,
    Clock,
    RefreshCcw,
    Loader2,
    Search,
    Wifi,
    ShieldCheck,
    Download,
} from 'lucide-react';

export default function TermsAcceptancesPage() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const data = await apiRequest('/auth/admin/terms-acceptances');
            setRecords(data);
        } catch (err) {
            console.error('Error fetching terms acceptances:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = records.filter((r) => {
        const q = searchTerm.toLowerCase();
        return (
            r.email.toLowerCase().includes(q) ||
            r.first_name.toLowerCase().includes(q) ||
            r.last_name.toLowerCase().includes(q) ||
            (r.ip_address || '').includes(q)
        );
    });

    const exportCsv = () => {
        const headers = ['Fecha', 'Nombre', 'Apellido', 'Email', 'Versión T&C', 'IP'];
        const rows = filtered.map((r) => [
            parseDate(r.accepted_at).toLocaleString(),
            r.first_name,
            r.last_name,
            r.email,
            r.terms_version,
            r.ip_address || '',
        ]);
        const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'terms_acceptances.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-dark min-h-screen">
            <Sidebar />
            <main className="pl-64 p-8">
                <header className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <FileCheck className="text-accent" size={32} />
                            Aceptación de T&C
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Auditoría de usuarios que aceptaron los Términos y Condiciones
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar por email, nombre o IP..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent w-72"
                            />
                        </div>

                        <button
                            onClick={exportCsv}
                            disabled={loading || filtered.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            <Download size={16} />
                            CSV
                        </button>

                        <button
                            onClick={fetchRecords}
                            disabled={loading}
                            className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 bg-accent/10 rounded-lg">
                            <ShieldCheck size={22} className="text-accent" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{records.length}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Total aceptaciones</p>
                        </div>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <FileCheck size={22} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {[...new Set(records.map((r) => r.terms_version))].join(', ') || '—'}
                            </p>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Versiones en uso</p>
                        </div>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <Clock size={22} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {records.length > 0
                                    ? parseDate(records[0].accepted_at).toLocaleDateString()
                                    : '—'}
                            </p>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Última aceptación</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                    {loading ? (
                        <div className="py-24 text-center text-accent">
                            <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                            <p className="font-medium">Cargando registros...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-24 text-center text-gray-500">
                            {searchTerm ? 'No se encontraron resultados.' : 'Sin registros de aceptación aún.'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-800 bg-gray-900/80">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha y Hora</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Usuario</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Versión T&C</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">IP</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {filtered.map((r) => (
                                        <tr key={r.id} className="hover:bg-gray-800/30 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                    <Clock size={14} />
                                                    <span>{parseDate(r.accepted_at).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white font-medium text-sm">
                                                    {r.first_name} {r.last_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-300 text-sm">{r.email}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-accent/10 text-accent border border-accent/20">
                                                    v{r.terms_version}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Wifi size={13} className="text-gray-500" />
                                                    <code className="text-[11px] text-gray-400 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
                                                        {r.ip_address || '—'}
                                                    </code>
                                                </div>
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
