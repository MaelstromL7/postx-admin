import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    Activity,
    LogOut,
    User
} from 'lucide-react';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Proyectos', path: '/projects', icon: FolderKanban },
        { label: 'Usuarios', path: '/users', icon: Users },
        { label: 'Actividad', path: '/activity', icon: Activity },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-dark border-r border-gray-800 flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-accent tracking-tighter">PostX Admin</h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-accent/10 text-accent'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-800 mt-auto">
                <div className="flex items-center space-x-3 px-4 py-3 mb-4 rounded-lg bg-gray-900/50 border border-gray-800">
                    <div className="bg-accent/20 p-2 rounded-full">
                        <User size={18} className="text-accent" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">{user?.email || 'leonard@postx.mx'}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                            Platform Admin
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Cerrar sesión</span>
                </button>
            </div>
        </aside>
    );
}
