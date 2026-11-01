import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useData } from '../services/DataService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { 
  Plus, 
  Trash2, 
  X, 
  ChevronRight, 
  List, 
  BarChart3, 
  FileSpreadsheet, 
  ArrowLeft,
  Download,
  Pencil,
  Activity,
  ChevronLeft
} from 'lucide-react';

type ViewType = 'hub' | 'view' | 'summary' | 'reports';

export const Production: React.FC = () => {
  const { productionLogs, products, employees, deleteProductionLog } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Determine current view based on path
  const currentView = useMemo((): ViewType => {
    const path = location.pathname;
    if (path === '/production/view') return 'view';
    if (path === '/production/summary') return 'summary';
    if (path === '/production/reports') return 'reports';
    return 'hub';
  }, [location.pathname]);

  // --- Filtering State (for History View) ---
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // --- Computations ---
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const today = productionLogs.filter(l => l.date === todayStr).reduce((s, l) => s + l.quantity, 0);
    const prev = productionLogs.filter(l => l.date === yesterdayStr).reduce((s, l) => s + l.quantity, 0);
    const total = productionLogs.reduce((s, l) => s + l.quantity, 0);

    return { today, prev, total };
  }, [productionLogs]);

  const filteredLogs = useMemo(() => productionLogs.filter(log => {
    if (filterEmployee !== 'all' && log.employee_id !== filterEmployee) return false;
    if (filterDate && log.date !== filterDate) return false;
    return true;
  }), [productionLogs, filterEmployee, filterDate]);

  const productivityByProduct = useMemo(() => {
    const map: Record<string, number> = {};
    productionLogs.forEach(l => {
      const p = products.find(prod => prod.id === l.product_id);
      const name = p?.name || 'Unknown';
      map[name] = (map[name] || 0) + l.quantity;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [productionLogs, products]);

  const productivityByEmployee = useMemo(() => {
    const map: Record<string, number> = {};
    productionLogs.forEach(l => {
      const e = employees.find(emp => emp.id === l.employee_id);
      const name = e?.name || 'Unknown';
      map[name] = (map[name] || 0) + l.quantity;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [productionLogs, employees]);

  // --- Handlers ---
  const handleExport = () => {
    const headers = ['Date', 'Product', 'Employee', 'Quantity', 'Notes'];
    const csvRows = productionLogs.map(l => {
      const p = products.find(prod => prod.id === l.product_id);
      const e = employees.find(emp => emp.id === l.employee_id);
      return [l.date, `"${p?.name}"`, `"${e?.name}"`, l.quantity, `"${l.notes || ''}"`].join(',');
    });
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `production_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const navCards = [
    { id: 'add', path: '/production/add', label: 'Log Output', desc: 'Record daily factory manufacturing output', icon: Plus, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'view', path: '/production/view', label: 'Production Ledger', desc: 'Browse and edit historical logs', icon: List, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'summary', path: '/production/summary', label: 'Output Analysis', desc: 'Breakdown by product and employee', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'reports', path: '/production/reports', label: 'Data Reports', desc: 'Export manufacturing documentation to CSV', icon: FileSpreadsheet, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const renderSubPageHeader = (title: string, subtitle: string) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => navigate('/production')} className="rounded-xl w-10 h-10 p-0 shadow-sm border border-slate-200">
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{title}</h2>
          <p className="text-xs font-medium text-slate-500">{subtitle}</p>
        </div>
      </div>

      {/* Subpage Quick-Switch Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
        <button
          onClick={() => navigate('/production/view')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentView === 'view' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ledger
        </button>
        <button
          onClick={() => navigate('/production/summary')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentView === 'summary' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Analysis
        </button>
        <button
          onClick={() => navigate('/production/reports')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentView === 'reports' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => navigate('/production/add')}
          className="ml-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1"
        >
          <Plus size={14} /> Add Log
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
              <h2 className="text-2xl font-bold text-slate-900">Production Hub</h2>
              <p className="text-xs font-medium text-slate-500">Central command for factory manufacturing and output</p>
            </div>
          </div>

          {/* Quick Stats Header */}
          <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              <div className="p-4 md:p-6 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">Previous Day</p>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">{stats.prev.toLocaleString()}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-600 bg-slate-100">Units</span>
              </div>
              <div className="p-4 md:p-6 text-center bg-indigo-50/40">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 truncate">Today Output</p>
                <h3 className="text-2xl md:text-3xl font-black text-indigo-600">{stats.today.toLocaleString()}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold text-indigo-700 bg-indigo-100/80">Live Pieces</span>
              </div>
              <div className="p-4 md:p-6 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">Cumulative</p>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">{stats.total.toLocaleString()}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-600 bg-slate-100">Total Units</span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Worker Output" className="h-fit">
              <div className="space-y-3">
                {productivityByEmployee.length > 0 ? (
                  productivityByEmployee.map(([name, total]) => (
                    <div key={name} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">{name}</p>
                        <p className="text-xs text-slate-500 font-medium">Cumulative Output</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-indigo-600">
                          {total.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">units</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-slate-500 italic">No worker output recorded yet.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 2. HISTORY VIEW */}
      {currentView === 'view' && (
        <div className="animate-in slide-in-from-right duration-300">
          {renderSubPageHeader('Production Ledger', 'Historical manufacturing output')}
          
          <Card>
            <div className="flex flex-col md:flex-row gap-4 mb-8 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex-1">
                <Select label="Filter Employee" options={[{label: 'All Workers', value: 'all'}, ...employees.map(e => ({label: e.name, value: e.id}))]} value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <Input label="Filter Date" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="text-xs" />
                <Button variant="secondary" onClick={() => { setFilterDate(''); setFilterEmployee('all'); }}>
                  <X size={14} />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto -mx-6 border-t border-slate-100">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredLogs.map(l => {
                    const p = products.find(prod => prod.id === l.product_id);
                    const e = employees.find(emp => emp.id === l.employee_id);
                    return (
                      <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-[11px] text-slate-600 font-medium">{l.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-xs text-slate-800">{p?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className="text-[10px] font-bold text-slate-500 uppercase">{e?.name || 'Unknown'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-black text-xs text-indigo-600">
                          {l.quantity}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {deletingId === l.id ? (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => { deleteProductionLog(l.id); setDeletingId(null); }} className="text-[10px] font-bold text-red-600 underline">Confirm</button>
                                <button onClick={() => setDeletingId(null)} className="text-[10px] font-bold text-slate-400">Cancel</button>
                              </div>
                            ) : (
                              <>
                                <button 
                                  onClick={() => navigate(`/production/edit/${l.id}`)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                                  title="Edit Entry"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button 
                                  onClick={() => setDeletingId(l.id)} 
                                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                  title="Delete Entry"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredLogs.length === 0 && <div className="p-20 text-center text-slate-400 text-xs italic">No production logs found.</div>}
            </div>
          </Card>
        </div>
      )}

      {/* 3. SUMMARY VIEW */}
      {currentView === 'summary' && (
        <div className="animate-in slide-in-from-right duration-300">
          {renderSubPageHeader('Production Analysis', 'Performance breakdown by product and worker')}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card title="Output by Product">
               <div className="space-y-4">
                  {productivityByProduct.map(([name, qty]) => (
                    <div key={name} className="space-y-1">
                       <div className="flex justify-between text-xs font-bold text-slate-800">
                          <span>{name}</span>
                          <span>{qty.toLocaleString()}</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500" 
                            style={{ width: `${Math.min(100, (qty / stats.total) * 100)}%` }}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </Card>

            <Card title="Output by Employee">
               <div className="space-y-4">
                  {productivityByEmployee.map(([name, qty]) => (
                    <div key={name} className="space-y-1">
                       <div className="flex justify-between text-xs font-bold text-slate-800">
                          <span>{name}</span>
                          <span>{qty.toLocaleString()}</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${Math.min(100, (qty / stats.total) * 100)}%` }}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
          </div>
        </div>
      )}

      {/* 4. REPORTS VIEW */}
      {currentView === 'reports' && (
        <div className="animate-in slide-in-from-right duration-300">
          {renderSubPageHeader('Data Reports', 'Export manufacturing documentation')}
          
          <div className="max-w-2xl mx-auto">
            <Card title="Export Production Logs" className="bg-indigo-50/30 border-indigo-100">
              <p className="text-xs text-slate-600 mb-8 leading-relaxed">
                Generate a comprehensive CSV file containing every production entry, including quantity, 
                timestamps, product details, and employee output.
              </p>
              <Button onClick={handleExport} size="md" className="w-full shadow-lg shadow-indigo-100">
                <Download className="w-4 h-4 mr-2" /> Download Master Log
              </Button>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
};