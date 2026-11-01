import React, { useState, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useData } from '../services/DataService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { 
  Plus, 
  X, 
  Calendar, 
  Download, 
  Trash2, 
  Wallet, 
  List, 
  BarChart3, 
  FileSpreadsheet,
  ArrowLeft,
  ChevronRight,
  Filter,
  ChevronLeft
} from 'lucide-react';
import { Transaction } from '../types';

const INCOME_CATEGORIES = [
  'Sales', 'Scrap Sales', 'Subsidies', 'Refunds', 'Misc Income'
];

const EXPENSE_CATEGORIES = [
  'Raw Material', 'Wages', 'Utilities', 'Rent', 'Machinery', 'Packaging', 'Logistics', 'General'
];

type ViewType = 'hub' | 'add' | 'view' | 'summary' | 'reports';

export const Accounts: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const todayStr = new Date().toISOString().split('T')[0];

  // Determine current view based on path
  const currentView = useMemo((): ViewType => {
    const path = location.pathname;
    if (path === '/accounts/add') return 'add';
    if (path === '/accounts/view') return 'view';
    if (path === '/accounts/summary') return 'summary';
    if (path === '/accounts/reports') return 'reports';
    return 'hub';
  }, [location.pathname]);

  // --- Form State ---
  const [form, setForm] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    category: EXPENSE_CATEGORIES[0],
    amount: 0,
    date: todayStr,
    description: ''
  });

  // --- Filtering State (Shared by Ledger and Reports) ---
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- Computations ---
  const allCategories = useMemo(() => Array.from(new Set(transactions.map(t => t.category))), [transactions]);

  const filteredTransactions = useMemo(() => transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    return true;
  }), [transactions, filterType, filterCategory, startDate, endDate]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expense: number; net: number }> = {};
    transactions.forEach(t => {
      const monthKey = t.date.substring(0, 7);
      if (!months[monthKey]) months[monthKey] = { income: 0, expense: 0, net: 0 };
      if (t.type === 'INCOME') months[monthKey].income += t.amount;
      else months[monthKey].expense += t.amount;
      months[monthKey].net = months[monthKey].income - months[monthKey].expense;
    });
    return Object.entries(months).sort((a, b) => b[0].localeCompare(a[0]));
  }, [transactions]);

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const generateCsvContent = (data: Transaction[]) => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const csvRows = data.map(t => [
      t.date, 
      t.type, 
      t.category, 
      `"${t.description.replace(/"/g, '""')}"`, 
      t.amount
    ].join(','));
    
    const filterInfo = `Report Period: ${startDate || 'All Time'} to ${endDate || 'Present'}, Filter: ${filterType}/${filterCategory}`;
    return [filterInfo, headers.join(','), ...csvRows].join('\n');
  };

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      alert("No data found for current filters.");
      return;
    }
    const csvContent = generateCsvContent(filteredTransactions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `texflow_accounts_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const navCards = [
    { id: 'add', path: '/accounts/add', label: 'Add Entry', desc: 'Log new income or factory expense', icon: Plus, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'view', path: '/accounts/view', label: 'View Ledger', desc: 'Browse and filter all transactions', icon: List, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'summary', path: '/accounts/summary', label: 'P&L Summary', desc: 'Monthly profit and loss analysis', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'reports', path: '/accounts/reports', label: 'Reports', desc: 'Export financial documentation to CSV', icon: FileSpreadsheet, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const renderSubPageHeader = (title: string, subtitle: string) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => navigate('/accounts')} className="rounded-xl w-10 h-10 p-0 shadow-sm border border-slate-200">
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
          onClick={() => navigate('/accounts/view')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentView === 'view' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ledger
        </button>
        <button
          onClick={() => navigate('/accounts/summary')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentView === 'summary' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          P&L Summary
        </button>
        <button
          onClick={() => navigate('/accounts/reports')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentView === 'reports' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => navigate('/accounts/add')}
          className="ml-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1"
        >
          <Plus size={14} /> Add Entry
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      
      {currentView === 'hub' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Accounts & Finance</h2>
              <p className="text-xs font-medium text-slate-500">Overview of factory financial health, cash flow and margins</p>
            </div>
          </div>

          <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              <div className="p-4 md:p-6 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">Total Revenue</p>
                <h3 className="text-2xl md:text-3xl font-black text-emerald-600">₹{stats.income.toLocaleString()}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-700 bg-emerald-50">Sales & Inflow</span>
              </div>
              <div className="p-4 md:p-6 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">Total Expenses</p>
                <h3 className="text-2xl md:text-3xl font-black text-rose-600">₹{stats.expense.toLocaleString()}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold text-rose-700 bg-rose-50">Raw Materials & Wages</span>
              </div>
              <div className="p-4 md:p-6 text-center bg-indigo-50/40">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1 truncate">Net Balance</p>
                <h3 className="text-2xl md:text-3xl font-black text-indigo-700">₹{stats.balance.toLocaleString()}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold text-indigo-800 bg-indigo-100">Factory Cash Position</span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

          <Card title="Recent Activity" className="max-w-2xl">
             <div className="space-y-3">
                {transactions.slice(0, 3).map(t => (
                  <div key={t.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{t.category}</p>
                      <p className="text-[10px] text-slate-400">{t.date}</p>
                    </div>
                    <p className={`text-xs font-black ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
                <Link to="/accounts/view" className="block text-center text-[10px] font-bold text-indigo-500 hover:text-indigo-700 pt-1">
                  VIEW FULL HISTORY
                </Link>
             </div>
          </Card>
        </div>
      )}

      {currentView === 'add' && (
        <div className="animate-in slide-in-from-right duration-300">
          {renderSubPageHeader('New Transaction', 'Add record to ledger')}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (form.amount <= 0) return;
                  await addTransaction(form);
                  navigate('/accounts');
                }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select 
                      label="Transaction Type" 
                      options={[{label: 'Income (+)', value: 'INCOME'}, {label: 'Expense (-)', value: 'EXPENSE'}]}
                      value={form.type}
                      onChange={e => setForm({...form, type: e.target.value as any})}
                    />
                    <Input label="Date" type="date" value={form.date} max={todayStr} onChange={e => setForm({...form, date: e.target.value})} required />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(form.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                        <button
                          key={cat} type="button"
                          onClick={() => setForm({...form, category: cat})}
                          className={`text-[10px] font-bold uppercase tracking-wider py-2 px-1 rounded-md border transition-all ${
                            form.category === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Amount (₹)" type="number" value={form.amount} onChange={e => setForm({...form, amount: parseFloat(e.target.value) || 0})} required />
                    <Input label="Description" placeholder="Notes" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={() => navigate('/accounts')}>Cancel</Button>
                    <Button type="submit">Save Transaction</Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      )}

      {currentView === 'view' && (
        <div className="animate-in slide-in-from-right duration-300">
          {renderSubPageHeader('Transaction Ledger', 'Full financial audit trail')}
          
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Select label="Type" options={[{label: 'All Types', value: 'all'}, {label: 'Income', value: 'INCOME'}, {label: 'Expense', value: 'EXPENSE'}]} value={filterType} onChange={e => setFilterType(e.target.value)} />
              <Select label="Category" options={[{label: 'All Categories', value: 'all'}, ...allCategories.map(c => ({label: c, value: c}))]} value={filterCategory} onChange={e => setFilterCategory(e.target.value)} />
              <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              <div className="md:col-span-4 flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => { setStartDate(''); setEndDate(''); setFilterType('all'); setFilterCategory('all'); }}>Reset Filters</Button>
              </div>
            </div>

            <div className="overflow-x-auto -mx-6">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredTransactions.map(t => (
                    <tr key={t.id}>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">{t.date}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-800">{t.category}</td>
                      <td className={`px-6 py-4 text-right font-black text-xs ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}₹{t.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deleteTransaction(t.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTransactions.length === 0 && <div className="p-20 text-center text-slate-400 text-xs italic">No matching records.</div>}
            </div>
          </Card>
        </div>
      )}

      {currentView === 'reports' && (
        <div className="animate-in slide-in-from-right duration-300">
          {renderSubPageHeader('Data Reports', 'Export documentation')}
          
          <div className="max-w-4xl mx-auto space-y-6">
            <Card title="Report Generator">
              <p className="text-xs text-slate-600 mb-6">Choose filters to define the scope of your financial report.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> Time Period
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Filter size={12} /> Categories
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Type" options={[{label: 'Income & Expense', value: 'all'}, {label: 'Income Only', value: 'INCOME'}, {label: 'Expense Only', value: 'EXPENSE'}]} value={filterType} onChange={e => setFilterType(e.target.value)} />
                    <Select label="Category" options={[{label: 'All Categories', value: 'all'}, ...allCategories.map(c => ({label: c, value: c}))]} value={filterCategory} onChange={e => setFilterCategory(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Ready to export {filteredTransactions.length} transactions.</p>
                  <p className="text-[10px] text-slate-500">Selected period: {startDate || 'Start'} to {endDate || 'Today'}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleExport} className="shadow-sm w-full md:w-auto">
                    <Download className="w-4 h-4 mr-2" /> Download CSV Report
                  </Button>
                </div>
              </div>
            </Card>

            <Card title="Quick Summaries">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate('/accounts/summary')}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">P&L Overview</p>
                  <h4 className="text-sm font-bold text-slate-800">Monthly Profit/Loss Summary</h4>
                </div>
                <div className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate('/accounts/view')}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Ledger</p>
                  <h4 className="text-sm font-bold text-slate-800">All Historical Transactions</h4>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {currentView === 'summary' && (
        <div className="animate-in slide-in-from-right duration-300">
          {renderSubPageHeader('Monthly Performance', 'Historical net growth analysis')}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {monthlyData.map(([month, data]) => (
              <Card key={month}>
                <div className="flex justify-between items-center mb-6 pb-2 border-b">
                  <h4 className="font-bold text-sm uppercase tracking-tight">{month}</h4>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${data.net >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {data.net >= 0 ? 'PROFIT' : 'LOSS'}
                  </span>
                </div>
                <div className="space-y-4 text-xs font-medium">
                  <div className="flex justify-between"><span>Income</span><span>₹{data.income.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Expense</span><span>₹{data.expense.toLocaleString()}</span></div>
                  <div className="pt-3 border-t flex justify-between font-black text-lg">
                    <span className="text-[10px] text-slate-400">NET</span>
                    <span className={data.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}>₹{data.net.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};