import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Scissors, 
  UserRound, 
  Package, 
  Wallet, 
  Settings, 
  LogOut, 
  X, 
  CreditCard, 
  Boxes,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Shirt
} from 'lucide-react';
import { useData } from '../services/DataService';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const SidebarComponent: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  isCollapsed = false,
  onToggleCollapse 
}) => {
  const { logout, user, isDemoMode } = useData();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', badge: undefined },
    { to: '/production', icon: Scissors, label: 'Production', badge: 'Hub' },
    { to: '/inventory', icon: Boxes, label: 'Inventory', badge: undefined },
    { to: '/employees', icon: UserRound, label: 'Workforce', badge: undefined },
    { to: '/payroll', icon: CreditCard, label: 'Payroll', badge: 'Wages' },
    { to: '/products', icon: Package, label: 'Catalog', badge: undefined },
    { to: '/accounts', icon: Wallet, label: 'Accounts', badge: undefined },
    { to: '/settings', icon: Settings, label: 'Settings', badge: undefined },
  ];

  const sidebarContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full bg-slate-900 text-white select-none">
      {/* Brand Header */}
      <div className={`p-4 border-b border-slate-800/80 flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
            <Shirt className="w-5 h-5 text-white" />
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">TexFlow</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ERP
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 truncate">Textile Factory Suite</p>
            </div>
          )}
        </div>

        {isMobile ? (
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        ) : (
          onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ${isCollapsed ? 'hidden' : 'block'}`}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeftClose size={18} />
            </button>
          )
        )}
      </div>

      {/* Mode / Live Status Pill */}
      {(!isCollapsed || isMobile) && (
        <div className="px-4 py-2.5 mx-3 mt-3 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isDemoMode ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </span>
            <span className="text-[11px] font-semibold text-slate-300">
              {isDemoMode ? 'Demo Factory Mode' : 'Connected to Supabase'}
            </span>
          </div>
          {isDemoMode && (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
              Active
            </span>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2.5 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => {
              if (isMobile) onClose();
            }}
            title={isCollapsed && !isMobile ? item.label : undefined}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isCollapsed && !isMobile ? 'justify-center px-2' : ''
              } ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            {(!isCollapsed || isMobile) && (
              <span className="flex-1 truncate tracking-wide">{item.label}</span>
            )}
            {(!isCollapsed || isMobile) && item.badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/95">
        {(!isCollapsed || isMobile) ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">{user?.name || 'Admin'}</p>
                <p className="text-[10px] font-medium text-slate-400 truncate">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                if (isMobile) onClose();
              }}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onToggleCollapse}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Expand Sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col shrink-0 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* 2. Mobile / Tablet Drawer */}
      <div className="lg:hidden">
        {isOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 transition-opacity duration-300 animate-in fade-in" 
            onClick={onClose}
          />
        )}
        <div 
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out transform ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent(true)}
        </div>
      </div>
    </>
  );
};

export const Sidebar = SidebarComponent;
