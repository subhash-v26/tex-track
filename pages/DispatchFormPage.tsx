import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../services/DataService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ChevronLeft, Truck, Package, Save, Check } from 'lucide-react';
import { DispatchEntry } from '../types';

export const DispatchFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, addDispatchLog, getInventory } = useData();
  const todayStr = new Date().toISOString().split('T')[0];
  const inventory = getInventory();

  const [formData, setFormData] = useState({
    date: todayStr,
    product_id: '',
    quantity: 1,
    customer_name: '',
    notes: ''
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (products.length > 0 && !formData.product_id) {
      setFormData(prev => ({ ...prev, product_id: products[0].id }));
    }
  }, [products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const selectedInventory = inventory.find(i => i.product_id === formData.product_id);
    if (!selectedInventory) return;

    if (formData.quantity > selectedInventory.current_stock) {
      // Still set error state internally to prevent submission, 
      // but the UI won't display it anymore as per request.
      setError(`Insufficient stock.`);
      return;
    }

    if (formData.quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    try {
      await addDispatchLog(formData as Omit<DispatchEntry, 'id' | 'timestamp'>);
      navigate('/inventory');
    } catch (err: any) {
      setError(err.message || "Failed to record dispatch.");
    }
  };

  const selectedProduct = products.find(p => p.id === formData.product_id);
  const selectedStock = inventory.find(i => i.product_id === formData.product_id)?.current_stock || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/inventory')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Record Dispatch</h2>
          <p className="text-sm text-slate-500">Log stock out for sales or deliveries</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="max-w-xs">
            <Input 
              label="Dispatch Date" 
              type="date" 
              value={formData.date} 
              max={todayStr} 
              onChange={(e) => setFormData({...formData, date: e.target.value})} 
              required 
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 ml-1">Select Product to Dispatch</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {products.map((p) => (
                <button 
                  key={p.id} 
                  type="button" 
                  onClick={() => setFormData({...formData, product_id: p.id})} 
                  className={`relative p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group ${
                    formData.product_id === p.id 
                    ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                    : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
                    {p.image_url ? (
                      <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={p.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Package size={24} />
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold text-center line-clamp-1 ${formData.product_id === p.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {p.name}
                  </span>
                  {formData.product_id === p.id && (
                    <div className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full p-1 border-2 border-white shadow-sm animate-in zoom-in duration-200">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-400 overflow-hidden shrink-0 shadow-sm">
                {selectedProduct?.image_url ? (
                  <img 
                    src={selectedProduct.image_url} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={24} />
                )}
              </div>
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Available Physical Stock</p>
                <p className="text-lg font-black text-indigo-700">{selectedStock.toLocaleString()} <span className="text-xs font-normal">units</span></p>
              </div>
            </div>
            {selectedStock < 10 && selectedStock > 0 && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase">Low Stock</span>
            )}
            {selectedStock === 0 && (
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full uppercase">Out of Stock</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Quantity to Dispatch" 
              type="number" 
              value={formData.quantity} 
              onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} 
              min={1} 
              max={selectedStock}
              required 
            />
            <Input 
              label="Customer / Destination" 
              placeholder="e.g. Amazon Warehouse"
              value={formData.customer_name} 
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})} 
            />
          </div>

          <Input 
            label="Additional Notes" 
            placeholder="Invoice number, carrier details, etc."
            value={formData.notes} 
            onChange={(e) => setFormData({...formData, notes: e.target.value})} 
          />

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => navigate('/inventory')}>Cancel</Button>
            <Button type="submit" size="lg" disabled={formData.quantity > selectedStock || selectedStock === 0}>
              <Truck className="w-4 h-4 mr-2" />
              Confirm Dispatch
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};