import React, { useState, useMemo } from 'react';
import { useData } from '../services/DataService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  Calculator, 
  Users, 
  TrendingUp, 
  ChevronRight, 
  ArrowLeft,
  BarChart3, 
  PieChart,
  Trophy,
  Wallet,
  ChevronLeft
} from 'lucide-react';
import { PayrollRecord } from '../types';

type PayrollView = 'hub' | 'calculator' | 'summary';

export const Payroll: React.FC = () => {
  const { calculatePayroll, employees, productionLogs, products } = useData();
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(todayStr);
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
  const [calculated, setCalculated] = useState(false);
  const [currentView, setCurrentView] = useState<PayrollView>('hub');

  const handleCalculate = () => {
    const actualEnd = endDate > todayStr ? todayStr : endDate;
    const data = calculatePayroll(startDate, actualEnd);
    setPayrollData(data);
    setCalculated(true);
  };

  const totalPayout = useMemo(() => payrollData.reduce((sum, item) => sum + item.totalAmount, 0), [payrollData]);
  const totalItems = useMemo(() => payrollData.reduce((sum, item) => sum + item.totalPieces, 0), [payrollData]);

  // Calculate Lifetime Cumulative Earnings
  const lifetimeEarnings = useMemo(() => {
    return employees.map(employee => {
      // Fix: changed l.employeeId to l.employee_id
      const logs = productionLogs.filter(l => l.employee_id === employee.id);
      let totalAmount = 0;
      let totalPieces = 0;
      logs.forEach(log => {
        // Fix: changed log.productId to log.product_id
        const product = products.find(p => p.id === log.product_id);
        if (product) {
          // Fix: changed product.pricePerPiece to product.price_per_piece
          totalAmount += log.quantity * product.price_per_piece;
          totalPieces += log.quantity;
        }
      });
      return {
        id: employee.id,
        name: employee.name,
        totalAmount,
        totalPieces
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [employees, productionLogs, products]);

  const globalTotalEarnings = useMemo(() => lifetimeEarnings.reduce((s, e) => s + e.totalAmount, 0), [lifetimeEarnings]);

  const handleExportCsv = () => {
    if (payrollData.length === 0) return;

    const headers = ['Employee Name', 'Role', 'Total Pieces', 'Total Payable (INR)'];
    
    const csvRows = payrollData.map(record => {
      const employee = employees.find(e => e.id === record.employeeId);
      return [
        `"${record.employeeName}"`,
        `"${employee?.role || 'N/A'}"`,
        record.totalPieces,
        record.totalAmount
      ].join(',');
    });

    const csvContent = [
      `Payroll Report: ${startDate} to ${endDate}`,
      headers.join(','),
      ...csvRows,
      '',
      `"TOTAL",,"${totalItems}","${totalPayout}"`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderHeader = (title: string, subtitle: string) => (
    <div className="flex items-center gap-4 mb-8">
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={() => setCurrentView('hub')} 
        className="rounded-full w-9 h-9 p-0 shadow-sm"
      >
        <ArrowLeft size={16} />
      </Button>
      <div>
        <h2 className="text-xl font-bold text-slate-800 leading-tight">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. PAYROLL HUB VIEW */}
      {currentView === 'hub' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Payroll Hub</h2>
              <p className="text-xs text-slate-500">Earnings management and performance analysis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentView('calculator')}
              className="group p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-400 transition-all duration-300 flex flex-col items-start text-left"
            >
              <div className="p-3 rounded-lg mb-3 bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
                <Calculator size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Wage Calculator</h3>
              <p className="text-[11px] text-slate-500 mb-3 flex-1">Generate payout lists for any specific range.</p>
              <div className="flex items-center text-[9px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Open <ChevronRight size={12} className="ml-0.5" />
              </div>
            </button>

            <button
              onClick={() => setCurrentView('summary')}
              className="group p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-400 transition-all duration-300 flex flex-col items-start text-left"
            >
              <div className="p-3 rounded-lg mb-3 bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
                <Users size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Earnings Summary</h3>
              <p className="text-[11px] text-slate-500 mb-3 flex-1">Visualize performance and cumulative output.</p>
              <div className="flex items-center text-[9px] font-black text-emerald-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                View <ChevronRight size={12} className="ml-0.5" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 2. WAGE CALCULATOR VIEW */}
      {currentView === 'calculator' && (
        <div className="animate-in slide-in-from-right duration-300">
          {renderHeader('Wage Calculator', 'Define period and generate detailed payout records')}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card title="Set Pay Period" className="lg:col-span-1 h-fit">
              <div className="space-y-4">
                <Input 
                  label="Start Date" 
                  type="date" 
                  value={startDate} 
                  max={todayStr}
                  onChange={(e) => setStartDate(e.target.value)} 
                />
                <Input 
                  label="End Date" 
                  type="date" 
                  value={endDate} 
                  max={todayStr}
                  onChange={(e) => setEndDate(e.target.value)} 
                />
                <Button onClick={handleCalculate} size="lg" className="w-full mt-2">
                  <Calculator className="w-4 h-4 mr-2" />
                  Run Calculation
                </Button>
              </div>
            </Card>

            <div className="lg:col-span-3">
              {calculated ? (
                <Card title={`Earnings Ledger (${startDate} to ${endDate})`}>
                  <div className="overflow-x-auto -mx-6">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Volume</th>
                          <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {payrollData.map((record) => (
                          <tr key={record.employeeId} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                              {record.employeeName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="text-xs font-medium text-slate-500">{record.totalPieces} pcs</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-indigo-600">
                              ₹{record.totalAmount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50/50">
                        <tr className="font-black">
                          <td className="px-6 py-4 text-xs text-slate-400 uppercase tracking-widest">Total Period</td>
                          <td className="px-6 py-4 text-center text-sm">{totalItems}</td>
                          <td className="px-6 py-4 text-right text-lg text-indigo-600">₹{totalPayout.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button variant="secondary" onClick={handleExportCsv}>
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-32 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                  <Calculator size={48} className="opacity-10 mb-3" />
                  <p className="text-sm font-medium text-slate-400">Set dates and run calculation to see data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. EARNINGS SUMMARY VIEW (LIFETIME) */}
      {currentView === 'summary' && (
        <div className="animate-in slide-in-from-right duration-300">
          {renderHeader('Earnings Summary', 'Workforce cumulative performance analysis and leaderboard')}

          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Global Stats Banner - Shrinked padding and text size */}
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100 flex items-center justify-between overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Lifetime Workforce Payout</p>
                <h4 className="text-3xl md:text-4xl font-black">₹{globalTotalEarnings.toLocaleString()}</h4>
              </div>
              <div className="relative z-10 p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                <Wallet size={32} className="text-white" />
              </div>
              {/* Decorative background element */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-20" />
            </div>

            {/* Leaderboard Section */}
            <Card title="Lifetime Top Earners Leaderboard">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {lifetimeEarnings.map((record, idx) => (
                  <div key={record.id} className="flex items-center justify-between group py-3 border-b border-slate-50 last:border-0 md:last:border-b md:[&:nth-last-child(-n+2)]:border-0">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-200 text-slate-600' : 'bg-slate-50 text-slate-400'}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{record.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{record.totalPieces} Cumulative Pieces</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600">₹{record.totalAmount.toLocaleString()}</p>
                      <div className="w-24 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400" 
                          style={{ width: `${(record.totalAmount / (lifetimeEarnings[0]?.totalAmount || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {lifetimeEarnings.length === 0 && (
                  <div className="col-span-2 py-20 text-center text-slate-400 text-xs italic">
                    No workforce earnings data available yet.
                  </div>
                )}
              </div>
            </Card>

            <div className="text-center pt-4">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                Analytics derived from all historical production logs
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};