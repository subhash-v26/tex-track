import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../services/DataService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Plus, 
  Trash2, 
  Box, 
  Pencil, 
  Image as ImageIcon, 
  X,
  ChevronLeft
} from 'lucide-react';

export const Products: React.FC = () => {
  const { products, deleteProduct } = useData();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    deleteProduct(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Product Catalog</h2>
            <p className="text-sm text-slate-500">Manage your textile inventory and pricing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={() => navigate('/products/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Grid configured for 2 columns on mobile (grid-cols-2) */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        {products.map((product) => (
          <Card key={product.id} className="relative group overflow-hidden flex flex-col hover:shadow-md transition-shadow p-0 border-slate-200">
            <div className="aspect-[4/3] w-full relative bg-slate-100 overflow-hidden">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                  <ImageIcon size={24} className="mb-1 md:mb-2 opacity-20" />
                  <span className="text-[10px]">No image</span>
                </div>
              )}
              <div className="absolute top-2 left-2 md:top-3 md:left-3">
                <span className="px-1.5 py-0.5 bg-white/90 backdrop-blur-sm rounded-md text-[8px] md:text-[10px] font-black uppercase tracking-wider text-indigo-600 shadow-sm border border-slate-100">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="p-3 md:p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-slate-800 text-xs md:text-base leading-tight mb-3 md:mb-4 line-clamp-2 min-h-[2rem] md:min-h-0">{product.name}</h3>
              
              <div className="mt-auto">
                <div className="bg-slate-50 p-1.5 md:p-2 rounded-lg">
                  <p className="text-[7px] md:text-[10px] uppercase font-black text-slate-400 tracking-widest mb-0.5">Wage / Pc</p>
                  <p className="font-black text-indigo-600 text-sm md:text-base">₹{product.price_per_piece.toFixed(1)}</p>
                </div>
              </div>
            </div>

            <div className="px-2 py-1.5 md:px-3 md:py-2 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-0.5 md:gap-1">
              {deletingId === product.id ? (
                <div className="flex items-center gap-1 animate-in slide-in-from-right duration-200">
                  <span className="text-[8px] font-black text-red-600 uppercase">Sure?</span>
                  <button 
                    type="button"
                    onClick={() => confirmDelete(product.id)}
                    className="p-1.5 text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all"
                  >
                    <Trash2 size={12} className="md:w-[14px] md:h-[14px]" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDeletingId(null)}
                    className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-all"
                  >
                    <X size={12} className="md:w-[14px] md:h-[14px]" />
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    type="button"
                    onClick={() => navigate(`/products/edit/${product.id}`)}
                    className="p-1.5 md:p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <Pencil size={14} className="md:w-[16px] md:h-[16px]" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDeletingId(product.id)}
                    className="p-1.5 md:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={14} className="md:w-[16px] md:h-[16px]" />
                  </button>
                </>
              )}
            </div>
          </Card>
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <Box size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">No products in catalog</p>
            <Button type="button" variant="ghost" size="sm" className="mt-2 text-indigo-600" onClick={() => navigate('/products/add')}>
              Add your first product
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};