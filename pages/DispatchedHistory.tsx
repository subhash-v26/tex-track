import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../services/DataService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  ChevronLeft, 
  Trash2, 
  Search, 
  Package, 
  X
} from 'lucide-react';

export const DispatchedHistory: React.FC = () => {
  const navigate = useNavigate();
  const { dispatchLogs, products, deleteDispatchLog } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    return dispatchLogs.filter(log => {
      const product = products.find(p => p.id === log.product_id);
      const matchesSearch = 
        product?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !filterDate || log.date === filterDate;
      return matchesSearch && matchesDate;
    });
  }, [dispatchLogs, products, searchTerm, filterDate]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/inventory')} 
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Dispatch History</h2>
            <p className="text-sm text-slate-500">Record of all finished goods sent to customers</p>
          </div>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Search product or customer..." 
              className="pl-10" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2 shrink-0">
            <Input 
              label="Filter Date" 
              type="date" 
              value={filterDate} 
              onChange={e => setFilterDate(e.target.value)} 
            />
            <Button variant="secondary" onClick={() => { setSearchTerm(''); setFilterDate(''); }}>
              <X size={16} />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {filteredLogs.map(log => {
                const product = products.find(p => p.id === log.product_id);
                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">{log.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                          {product?.image_url ? (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package size={14} className="text-slate-300" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{product?.name || 'Unknown Product'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-medium text-slate-600">{log.customer_name || 'Generic Sale'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-black text-indigo-600 text-xs">
                      {log.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {deletingId === log.id ? (
                        <div className="flex justify-end gap-2 animate-in slide-in-from-right duration-200">
                          <button 
                            onClick={() => { deleteDispatchLog(log.id); setDeletingId(null); }} 
                            className="text-[10px] font-black text-rose-600 uppercase"
                          >
                            Sure?
                          </button>
                          <button 
                            onClick={() => setDeletingId(null)} 
                            className="text-[10px] font-black text-slate-400 uppercase"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setDeletingId(log.id)} 
                          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 text-xs italic">
                    No dispatch records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};