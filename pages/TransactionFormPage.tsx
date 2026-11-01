import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../services/DataService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { ChevronLeft, Wallet, Save, AlertCircle } from 'lucide-react';

const INCOME_CATEGORIES = [
  'Sales', 'Scrap Sales', 'Subsidies', 'Refunds', 'Misc Income'
];

const EXPENSE_CATEGORIES = [
  'Raw Material', 'Wages', 'Utilities', 'Rent', 'Machinery', 'Packaging', 'Logistics', 'General'
];

export const TransactionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { addTransaction } = useData();
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    category: EXPENSE_CATEGORIES[0],
    amount: 0,
    date: todayStr,
    description: ''
  });

  const [error, setError] = useState<string | null>(null);

  const handleTypeChange = (type: 'INCOME' | 'EXPENSE') => {
    setFormData({
      ...formData,
      type,
      category: type === 'INCOME' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.amount <= 0 || !formData.category) return;

    if (formData.date > todayStr) {
      setError("Cannot log transactions for a future date.");
      return;
    }

    try {
      await addTransaction({
        type: formData.type,
        category: formData.category,
        amount: Number(formData.amount),
        date: formData.date,
        description: formData.description
      });
      navigate('/accounts');
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    }
  };

  const currentCategories = formData.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/accounts')}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Add Transaction</h2>
          <p className="text-sm text-slate-500">Log business income or expense record</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select 
              label="Transaction Type" 
              options={[{label: 'Income (+)', value: 'INCOME'}, {label: 'Expense (-)', value: 'EXPENSE'}]}
              value={formData.type}
              onChange={e => handleTypeChange(e.target.value as 'INCOME' | 'EXPENSE')}
            />
             <Input 
              label="Date" 
              type="date" 
              value={formData.date} 
              max={todayStr}
              onChange={e => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {currentCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({...formData, category: cat})}
                    className={`text-[10px] font-bold uppercase tracking-wider py-2 px-1 rounded-md border transition-all ${
                      formData.category === cat 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <Input 
                  placeholder="Other category..." 
                  value={currentCategories.includes(formData.category) ? '' : formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                />
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <Input 
                label="Amount (₹)" 
                type="number" 
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                required
                className="text-xl font-black text-slate-900"
              />
              <p className={`text-xs font-bold mt-2 uppercase ${formData.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formData.type === 'INCOME' ? 'Adding to balance' : 'Deducting from balance'}
              </p>
            </div>
          </div>

          <Input 
            label="Memo / Description" 
            placeholder="What was this for?" 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            required
          />

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => navigate('/accounts')}>
              Cancel
            </Button>
            <Button type="submit" size="lg" className="px-8" disabled={formData.date > todayStr}>
              <Save className="w-4 h-4 mr-2" />
              Save Record
            </Button>
          </div>
        </form>
      </Card>
      
      <div className={`p-6 rounded-2xl border-2 border-dashed flex items-center gap-4 ${formData.type === 'INCOME' ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
        <div className={`p-3 rounded-full ${formData.type === 'INCOME' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          <Wallet size={24} />
        </div>
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest ${formData.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'}`}>Summary</p>
          <p className="text-sm font-medium text-slate-700">
            {formData.type === 'INCOME' ? 'Recording earnings of ' : 'Recording a spend of '}
            <span className="font-bold">₹{formData.amount.toLocaleString()}</span>
            {formData.category ? ` for ${formData.category}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
};