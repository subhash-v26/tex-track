import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SidebarComponent as Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Production } from './pages/Production';
import { ProductionFormPage } from './pages/ProductionFormPage';
import { Inventory } from './pages/Inventory';
import { DispatchedHistory } from './pages/DispatchedHistory';
import { DispatchFormPage } from './pages/DispatchFormPage';
import { Payroll } from './pages/Payroll';
import { Employees } from './pages/Employees';
import { EmployeeFormPage } from './pages/EmployeeFormPage';
import { Products } from './pages/Products';
import { ProductFormPage } from './pages/ProductFormPage';
import { Accounts } from './pages/Accounts';
import { TransactionFormPage } from './pages/TransactionFormPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Settings } from './pages/Settings';
import { DataProvider, useData } from './services/DataService';
import { Menu, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react';

// Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoMode } = useData();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('texflow_sidebar_collapsed') === 'true';
  });

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('texflow_sidebar_collapsed', String(next));
      return next;
    });
  };

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname === '/production/summary') return 'Production Analysis';
    if (location.pathname === '/production/reports') return 'Production Reports';
    if (location.pathname === '/production/view') return 'Production Ledger';
    if (location.pathname.startsWith('/production')) return 'Production Hub';
    if (location.pathname === '/inventory/summary') return 'Inventory Analysis';
    if (location.pathname === '/inventory/reports') return 'Inventory Reports';
    if (location.pathname === '/inventory/ledger') return 'Stock Ledger';
    if (location.pathname.startsWith('/inventory')) return 'Finished Goods Inventory';
    if (location.pathname.startsWith('/dispatch')) return 'Stock Dispatch';
    if (location.pathname.startsWith('/accounts')) return 'Accounts & Finance';
    if (location.pathname.includes('/employees')) return 'Workforce';
    if (location.pathname.includes('/products')) return 'Catalog';
    
    const path = location.pathname.substring(1).split('/')[0];
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 md:px-8 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Drawer Trigger */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>

            {/* Desktop Sidebar Collapse Toggle */}
            <button 
              onClick={handleToggleCollapse}
              className="hidden lg:flex p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              title={isCollapsed ? "Expand sidebar (full width)" : "Collapse sidebar (icons only)"}
            >
              {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>

            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight leading-none">
                {getPageTitle()}
              </h2>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5 hidden sm:block">
                TexFlow Manufacturing Workspace
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 md:space-x-4">
            {isDemoMode && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                <Sparkles size={13} className="text-amber-500" />
                Demo Mode
              </span>
            )}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {user.role}
              </span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-200 shrink-0">
               {user.name.charAt(0)}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { user } = useData();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
      
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      
      <Route path="/production" element={<Layout><Production /></Layout>} />
      <Route path="/production/add" element={<Layout><ProductionFormPage /></Layout>} />
      <Route path="/production/edit/:id" element={<Layout><ProductionFormPage /></Layout>} />
      <Route path="/production/view" element={<Layout><Production /></Layout>} />
      <Route path="/production/summary" element={<Layout><Production /></Layout>} />
      <Route path="/production/reports" element={<Layout><Production /></Layout>} />
      
      <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
      <Route path="/inventory/dispatched-history" element={<Layout><DispatchedHistory /></Layout>} />
      <Route path="/inventory/ledger" element={<Layout><Inventory /></Layout>} />
      <Route path="/inventory/summary" element={<Layout><Inventory /></Layout>} />
      <Route path="/inventory/reports" element={<Layout><Inventory /></Layout>} />
      <Route path="/dispatch/add" element={<Layout><DispatchFormPage /></Layout>} />
      
      <Route path="/employees" element={<Layout><Employees /></Layout>} />
      <Route path="/employees/add" element={<Layout><EmployeeFormPage /></Layout>} />
      <Route path="/employees/edit/:id" element={<Layout><EmployeeFormPage /></Layout>} />
      
      <Route path="/payroll" element={<Layout><Payroll /></Layout>} />
      
      <Route path="/products" element={<Layout><Products /></Layout>} />
      <Route path="/products/add" element={<Layout><ProductFormPage /></Layout>} />
      <Route path="/products/edit/:id" element={<Layout><ProductFormPage /></Layout>} />
      
      <Route path="/accounts" element={<Layout><Accounts /></Layout>} />
      <Route path="/accounts/add" element={<Layout><TransactionFormPage /></Layout>} />
      <Route path="/accounts/view" element={<Layout><Accounts /></Layout>} />
      <Route path="/accounts/summary" element={<Layout><Accounts /></Layout>} />
      <Route path="/accounts/reports" element={<Layout><Accounts /></Layout>} />
      
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <Router>
        <AppRoutes />
      </Router>
    </DataProvider>
  );
};

export default App;