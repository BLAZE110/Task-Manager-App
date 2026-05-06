import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../../store/useThemeStore';
import {
  LayoutDashboard, FolderKanban, Bell, LogOut, Menu, X,
  ChevronRight, User, Settings, Palette
} from 'lucide-react';

const THEMES = [
  { id: 'dark', label: 'Dark' },
  { id: 'midnight', label: 'Midnight' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'forest', label: 'Forest' }
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getAll().then(r => r.data.data),
    refetchInterval: 30000,
    enabled: !!user,
  });

  const unreadCount = notifData?.unreadCount || 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
  ];

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-surface-700/50 rounded-none" style={{ borderRadius: 0 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <FolderKanban size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white hidden sm:block">TaskFlow</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all no-underline ${
                  location.pathname.startsWith(path)
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800/50'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); setThemeOpen(false); }}
                className="relative p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all bg-transparent border-none cursor-pointer"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 glass-dropdown p-4 animate-fadeIn z-50" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white text-sm">Notifications</h3>
                    <button
                      onClick={async () => {
                        await notificationsAPI.markAllRead();
                        queryClient.invalidateQueries({ queryKey: ['notifications'] });
                        setNotifOpen(false);
                      }}
                      className="text-xs text-primary-400 hover:text-primary-300 bg-transparent border-none cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>
                  {(!notifData?.notifications || notifData.notifications.length === 0) ? (
                    <p className="text-surface-500 text-sm text-center py-4">No notifications</p>
                  ) : (
                    <div className="space-y-2">
                      {notifData.notifications.slice(0, 8).map(n => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-lg text-sm ${n.isRead ? 'text-surface-400' : 'text-white bg-surface-800/50'}`}
                        >
                          {n.message}
                          <div className="text-xs text-surface-500 mt-1">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Switcher */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => { setThemeOpen(!themeOpen); setNotifOpen(false); setProfileOpen(false); }}
                className="relative p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all bg-transparent border-none cursor-pointer"
              >
                <Palette size={20} />
              </button>

              {themeOpen && (
                <div className="absolute right-0 mt-2 w-36 glass-dropdown p-2 animate-fadeIn z-50">
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setThemeOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all border-none cursor-pointer ${theme === t.id ? 'bg-primary-500/20 text-primary-400' : 'bg-transparent text-surface-300 hover:bg-surface-800/50 hover:text-white'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); setThemeOpen(false); }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-800/50 transition-all bg-transparent border-none cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-dropdown p-2 animate-fadeIn z-50">
                  <div className="px-3 py-2 border-b border-surface-700/50 mb-1">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-surface-400">{user?.email}</p>
                    <span className={`badge mt-1 inline-block ${user?.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger rounded-lg hover:bg-surface-800/50 transition-all bg-transparent border-none cursor-pointer"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-surface-400 hover:text-white bg-transparent border-none cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fadeIn">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium no-underline ${
                  location.pathname.startsWith(path)
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-surface-400'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
