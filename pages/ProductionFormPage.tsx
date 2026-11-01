
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useData } from '../services/DataService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { ChevronLeft, Scissors, Check, Package, Save, AlertCircle, ArrowRight } from 'lucide-react';
import { ProductionEntry } from '../types';

export const ProductionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, employees, addProductionLog, updateProductionLog, productionLogs } = useData();
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    date: todayStr,
    product_id: '',
    employee_id: '',
    quantity: 1,
    notes: ''
  });

  const [error, setError] = useState<string | null>(null);
  const isEditMode = Boolean(id);

  const existingEntry = useMemo(() => {
    if (isEditMode) return null;
    return productionLogs.find(l => l.employee_id === formData.employee_id && l.date === formData.date);
  }, [formData.employee_id, formData.date, productionLogs, isEditMode]);

  useEffect(() => {
    if (isEditMode && id) {
      const log = productionLogs.find(l => l.id === id);
      if (log) {
        setFormData({
          date: log.date,
          product_id: log.product_id,
          employee_id: log.employee_id,
          quantity: log.quantity,
          notes: log.notes || ''
        });
      }
    } else {
      if (products.length > 0 && !formData.product_id) setFormData(prev => ({ ...prev, product_id: products[0].id }));
      if (employees.length > 0 && !formData.employee_id) setFormData(prev => ({ ...prev, employee_id: employees[0].id }));
    }
  }, [id, isEditMode, productionLogs, products, employees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || !formData.employee_id || formData.quantity <= 0) return;
    if (formData.date > todayStr) {
      setError("Cannot log production for a future date.");
      return;
    }
    try {
      if (isEditMode && id) {
        await updateProductionLog({ id, ...formData, timestamp: Date.now() } as ProductionEntry);
      } else {
        await addProductionLog(formData as Omit<ProductionEntry, 'id' | 'timestamp'>);
      }
      navigate('/production/view');
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    }
  };

  const selectedProduct = products.find(p => p.id === formData.product_id);
  const selectedEmployee = employees.find(e => e.id === formData.employee_id);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/production')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{isEditMode ? 'Edit Entry' : 'Log Production'}</h2>
          <p className="text-sm text-slate-500">Record finished goods and worker output</p>
        </div>
      </div>

      {existingEntry && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-amber-600" />
              <p className="text-sm font-bold text-amber-900">{selectedEmployee?.name} already has a log for {formData.date}.</p>
           </div>
           <Link to={`/production/edit/${existingEntry.id}`} className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center">
             Edit Existing <ArrowRight size={14} className="ml-1" />
           </Link>
        </div>
      )}

      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Production Date" type="date" value={formData.date} max={todayStr} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
            <Select label="Workforce Member" value={formData.employee_id} onChange={(e) => setFormData({...formData, employee_id: e.target.value})} options={employees.map(e => ({ label: e.name, value: e.id }))} />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Select Product</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {products.map((p) => (
                <button key={p.id} type="button" onClick={() => setFormData({...formData, product_id: p.id})} className={`relative p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.product_id === p.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-white'}`}>
                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
                    {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" alt={p.name} /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={24} /></div>}
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 text-center line-clamp-1">{p.name}</span>
                  {formData.product_id === p.id && <div className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full p-1 border-2 border-white"><Check size={12} strokeWidth={3} /></div>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Quantity" type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} min={1} required />
            <Input label="Notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => navigate('/production')}>Cancel</Button>
            <Button type="submit" size="lg" disabled={(!!existingEntry && !isEditMode)}>Save Record</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
