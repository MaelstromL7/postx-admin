export default function StatCard({ label, value, icon: Icon, colorClass = "text-accent" }) {
    return (
        <div className="bg-dark border border-gray-800 p-6 rounded-xl hover:border-accent/40 transition-colors shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">{label}</span>
                <div className={`p-2 rounded-lg bg-gray-800 ${colorClass}`}>
                    <Icon size={20} />
                </div>
            </div>
            <div className="text-3xl font-bold text-white">{value}</div>
        </div>
    );
}
