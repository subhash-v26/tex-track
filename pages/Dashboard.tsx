import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../services/DataService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Loader2, 
  Scissors, 
  Boxes, 
  CreditCard, 
  Wallet, 
  ChevronRight, 
  TrendingUp, 
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Plus,
  Info
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    productionLogs, 
    employees, 
    products, 
    isLoading, 
    getInventory, 
    transactions,
    isDemoMode,
    loadDemoData
  } = useData();

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
        <p className="font-semibold text-slate-600">Syncing with Supabase...</p>
      </div>
    );
  }

  // Calculate Metrics for Navigation Cards
  const metrics = useMemo(() => {
    const totalProduction = productionLogs.reduce((sum, log) => sum + log.quantity, 0);
    const inventory = getInventory();
    const availableStock = inventory.reduce((sum, item) => sum + item.current_stock, 0);
    
    // Total income and expenses
    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

    return {
      totalProduction,
      availableStock,
      workerCount: employees.length,
      netBalance: totalIncome - totalExpense
    };
  }, [productionLogs, getInventory, employees, transactions]);

  // Chart Data (Last 7 Days)
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayQty = productionLogs.filter(l => l.date === dateStr).reduce((s, l) => s + l.quantity, 0);
      data.push({ 
        name: d.toLocaleDateString('en-US', { weekday: 'short' }), 
        production: dayQty 
      });
    }
    return data;
  }, [productionLogs]);

  const navCards = [
    {
      to: '/production',
      label: 'Production Hub',
      metric: metrics.totalProduction.toLocaleString(),
      subLabel: 'Total Units Produced',
      icon: Scissors,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      accent: 'border-indigo-100 hover:border-indigo-300'
    },
    {
      to: '/inventory',
      label: 'Inventory',
      metric: metrics.availableStock.toLocaleString(),
      subLabel: 'Available In Warehouse',
      icon: Boxes,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      accent: 'border-emerald-100 hover:border-emerald-300'
    },
    {
      to: '/payroll',
      label: 'Workforce & Wages',
      metric: `${metrics.workerCount} Active`,
      subLabel: 'Piece-Rate Wages',
      icon: CreditCard,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      accent: 'border-amber-100 hover:border-amber-300'
    },
    {
      to: '/accounts',
      label: 'Factory Accounts',
      metric: `₹${metrics.netBalance >= 0 ? '+' : ''}${metrics.netBalance.toLocaleString()}`,
      subLabel: 'Net Cash Flow',
      icon: Wallet,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      accent: 'border-rose-100 hover:border-rose-300'
    }
  ];

  const isEmpty = productionLogs.length === 0 && products.length === 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Factory Master Control</h2>
          <p className="text-xs font-medium text-slate-500">Real-time oversight across manufacturing, inventory and payroll</p>
        </div>

        <div className="flex items-center gap-2">
          {isEmpty && (
            <Button 
              onClick={loadDemoData} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200"
            >
              <Sparkles className="w-4 h-4 mr-1.5" /> Load Demo Factory Data
            </Button>
          )}
          <Link to="/production/add">
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm">
              <Plus className="w-4 h-4 mr-1" /> Log Output
            </Button>
          </Link>
        </div>
      </div>

      {/* Demo Mode / Empty State Banner */}
      {isEmpty ? (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-indigo-100 border border-white/20">
              <Sparkles size={14} /> Quick Start
            </div>
            <h3 className="text-xl font-extrabold text-white">Experience TexFlow with Real Textile Factory Data</h3>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Populate your system with realistic textile products (Bedsheets, Denim, Curtains), factory workers (Rajesh, Sunita, Vikram), and 14 days of production and dispatch logs to test all charts, wage calculations, and CSV reports instantly.
            </p>
          </div>
          <Button 
            onClick={loadDemoData} 
            className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs px-5 py-3 rounded-xl shadow-lg shrink-0 border-none"
          >
            <Sparkles className="w-4 h-4 mr-2" /> Load Demo Factory Data
          </Button>
        </div>
      ) : isDemoMode ? (
        <div className="px-4 py-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-amber-800">
            <Info size={16} className="text-amber-600 shrink-0" />
            <span className="font-semibold">
              Demo Factory Mode is Active. Previewing sample products, workforce, and manufacturing runs.
            </span>
          </div>
          <button 
            onClick={loadDemoData} 
            className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 shrink-0 underline"
          >
            <RefreshCw size={12} /> Reload Demo Data
          </button>
        </div>
      ) : null}

      {/* Navigation & Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {navCards.map((card) => (
          <Link 
            key={card.label} 
            to={card.to}
            className={`group relative bg-white border rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${card.accent}`}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2.5 rounded-xl ${card.bg} ${card.color} transition-transform group-hover:scale-110 duration-300`}>
                    <card.icon size={20} />
                  </div>
                  <ArrowUpRight size={18} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{card.label}</p>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-1">
                  {card.metric}
                </h3>
                <p className="text-xs font-semibold text-slate-500">{card.subLabel}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                Open View <ChevronRight size={14} className="ml-1" />
              </div>
            </div>
            <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full opacity-5 group-hover:opacity-10 transition-opacity bg-current ${card.color}`} />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Chart */}
        <Card title="Production Velocity (Last 7 Days)" className="lg:col-span-2">
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 12, fontWeight: 600}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 12, fontWeight: 600}} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="production" 
                  stroke="#4f46e5" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorProd)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Operations Log */}
        <Card title="Recent Operations Log">
          <div className="space-y-3.5">
            {productionLogs.slice(0, 6).map(log => {
              const product = products.find(p => p.id === log.product_id);
              const employee = employees.find(e => e.id === log.employee_id);
              return (
                <div key={log.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform shrink-0">
                    <Scissors size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate leading-none mb-1">
                      {employee?.name || 'Worker'}
                    </p>
                    <p className="text-xs text-slate-600 font-medium truncate">
                      {product?.name || 'Item'} • <strong className="text-indigo-600">{log.quantity} pcs</strong>
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase whitespace-nowrap">
                    {log.date}
                  </div>
                </div>
              );
            })}
            {productionLogs.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-xs font-medium text-slate-500 mb-3">No production records found.</p>
                <Button size="sm" onClick={loadDemoData} className="text-xs font-bold">
                  Load Demo Data
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};