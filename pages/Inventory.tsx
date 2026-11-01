import React, { useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useData } from '../services/DataService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Plus, 
  ChevronRight, 
  List, 
  BarChart3, 
  FileSpreadsheet, 
  ArrowLeft,
  Download,
  Boxes,
  Truck,
  Image as ImageIcon,
  History,
  ChevronLeft
} from 'lucide-react';

type ViewType = 'hub' | 'ledger' | 'summary' | 'reports';

export const Inventory: React.FC = () => {
  const { getInventory, dispatchLogs } = useData();
  const inventory = getInventory();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current view based on path
  const currentView = useMemo((): ViewType => {
    const path = location.pathname;
    if (path === '/inventory/ledger') return 'ledger';
    if (path === '/inventory/summary') return 'summary';
    if (path === '/inventory/reports') return 'reports';
    return 'hub';
  }, [location.pathname]);

  const stats = useMemo(() => {
    const totalItems = inventory.reduce((sum, item) => sum + item.current_stock, 0);
    const lowStockItems = inventory.filter(item => item.current_stock < 50 && item.current_stock > 0);
    
    return { 
      totalItems, 
      lowStockCount: lowStockItems.length, 
      lowStockItems
    };
  }, [inventory]);

  const stockByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    inventory.forEach(item => {
      map[item.category] = (map[item.category] || 0) + item.current_stock;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [inventory]);

  const handleExport = () => {
    const headers = ['Product', 'Category', 'Total Produced', 'Total Dispatched', 'Current Stock'];
    const csvRows = inventory.map(item => {
      return [`"${item.name}"`, `"${item.category}"`, item.total_produced, item.total_dispatched, item.current_stock].join(',');
    });
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const navCards = [
    { id: 'dispatch', path: '/dispatch/add', label: 'Stock Dispatch', desc: 'Record stock out to customers', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'history', path: '/inventory/dispatched-history', label: 'Dispatch History', desc: 'Past customer deliveries log', icon: History, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'ledger', path: '/inventory/ledger', label: 'Stock Ledger', desc: 'Real-time units on hand', icon: List, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'summary', path: '/inventory/summary', label: 'Category Analysis', desc: 'Stock breakdown by fabric and category', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'reports', path: '/inventory/reports', label: 'Export Inventory', desc: 'Download CSV stock documentation', icon: FileSpreadsheet, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const renderSubPageHeader = (title: string, subtitle: string) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => navigate('/inventory')} className="rounded-xl w-10 h-10 p-0 shadow-sm border border-slate-200">
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{title}</h2>
          <p className="text-xs font-medium text-slate-500">{subtitle}</p>
        </div>
      </div>

      {/* Subpage Quick-Switch Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto">
        <button
          onClick={() => navigate('/inventory/ledger')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            currentView === 'ledger' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Stock Ledger
        </button>
        <button
          onClick={() => navigate('/inventory/summary')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            currentView === 'summary' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Category Analysis
        </button>
        <button
          onClick={() => navigate('/inventory/reports')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            currentView === 'reports' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => navigate('/inventory/dispatched-history')}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-all whitespace-nowrap"
        >
          History
        </button>
        <button
          onClick={() => navigate('/dispatch/add')}
          className="ml-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1 whitespace-nowrap"
        >
          <Truck size={14} /> Dispatch
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. HUB VIEW */}
      {currentView === 'hub' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Finished Goods Inventory</h2>
              <p className="text-xs font-medium text-slate-500">Warehouse stock monitoring and customer deliveries</p>
            </div>
          </div>

          {/* Primary Summary Metric Card */}
          <Card className="bg-gradient-to-r from-white via-indigo-50/20 to-white border border-indigo-100 shadow-md p-6 flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden relative rounded-2xl">
            <div className="relative z-10 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 mb-2">
                <Boxes size={14} /> Global Physical Stock
              </div>
              <h4 className="text-4xl md:text-5xl font-black tabular-nums text-slate-900 mb-1">{stats.totalItems.toLocaleString()}</h4>
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Available finished units in factory warehouse</p>
            </div>
            <div className="relative z-10 hidden lg:block p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/30">
              <Boxes size={36} />
            </div>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {navCards.map(card => (
              <Link
                key={card.id}
                to={card.path}
                className="group p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-400 transition-all duration-300 flex flex-col items-start text-left"
              >
                <div className={`p-2.5 rounded-lg mb-3 ${card.bg} ${card.color} group-hover:scale-105 transition-transform`}>
                  <card.icon size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">{card.label}</h3>
                <p className="text-xs text-slate-500 mb-3 flex-1 line-clamp-2 leading-relaxed">{card.desc}</p>
                <div className="flex items-center text-xs font-bold text-indigo-600 uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  Open <ChevronRight size={14} className="ml-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 2. LEDGER VIEW */}
      {currentView === 'ledger' && (
        <div className="animate-in slide-in-from-right duration-300">
          {renderSubPageHeader('Inventory Ledger', 'Real-time stock of physical units on hand')}
          
          <Card className="overflow-hidden">
            <div className="overflow-x-auto -mx-6">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Produced</th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sent</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Not Dispatched</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                  {inventory.map(item => (
                    <tr key={item.product_id} className="group hover:bg-slate-50/80 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                            {item.image_url ? (
                              <img src={item.image_url} className="w-full h-full object-cover" alt={item.name} />
                            ) : (
                              <ImageIcon size={18} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-slate-500 font-medium tabular-nums">{item.total_produced.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center text-xs text-slate-500 font-medium tabular-nums">{item.total_dispatched.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-black tabular-nums ${item.current_stock <= 0 ? 'text-rose-600' : 'text-indigo-600'}`}>
                            {item.current_stock.toLocaleString()}
                          </span>
                          <span className="text-[8px] text-slate-300 font-bold uppercase tracking-tighter">Units In Hand</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {inventory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-slate-400 text-xs italic">
                        No product inventory data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* 3. SUMMARY VIEW */}
      {currentView === 'summary' && (
        <div className="animate-in slide-in-from-right duration-300">
          {renderSubPageHeader('Inventory Analysis', 'Stock distribution and performance breakdown')}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title="Stock by Category">
               <div className="space-y-4">
                  {stockByCategory.map(([name, qty]) => (
                    <div key={name} className="space-y-1">
                       <div className="flex justify-between text-xs font-bold text-slate-800">
                          <span className="uppercase tracking-tighter">{name}</span>
                          <span className="tabular-nums">{qty.toLocaleString()} units</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500" 
                            style={{ width: `${Math.min(100, (qty / (stats.totalItems || 1)) * 100)}%` }}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </Card>

            <Card title="Product Status">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Below Threshold</p>
                   <p className="text-2xl font-black text-amber-600">{stats.lowStockCount}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Physical Stock</p>
                   <p className="text-2xl font-black text-indigo-600">{stats.totalItems.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 4. REPORTS VIEW */}
      {currentView === 'reports' && (
        <div className="animate-in slide-in-from-right duration-300">
          {renderSubPageHeader('Inventory Reports', 'Export stock level documentation')}
          
          <div className="max-w-2xl mx-auto">
            <Card title="Export Current Stock" className="bg-indigo-50/30 border-indigo-100">
              <p className="text-xs text-slate-600 mb-8 leading-relaxed">
                Generate a CSV file with the current real-time inventory levels for all products in your catalog. 
                Includes total produced, total dispatched, and current physical units in hand.
              </p>
              <Button onClick={handleExport} size="md" className="w-full shadow-lg shadow-indigo-100">
                <Download className="w-4 h-4 mr-2" /> Download Inventory Summary
              </Button>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
};