
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../services/DataService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { ChevronLeft, Save, Package, Upload, X } from 'lucide-react';
import { Product } from '../types';

export const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fix: Use snake_case for formData keys to match Product interface
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', 
    category: 'Bedding', 
    price_per_piece: 0, 
    image_url: ''
  });

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && id) {
      const product = products.find(p => p.id === id);
      if (product) {
        setFormData({
          name: product.name,
          category: product.category,
          // Fix: Correctly map from product snake_case properties
          price_per_piece: product.price_per_piece,
          image_url: product.image_url || ''
        });
      } else {
        navigate('/products');
      }
    }
  }, [id, isEditMode, products, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size too large. Please select an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Fix: Map formData to correct Product interface properties
    if (formData.name && formData.price_per_piece !== undefined) {
      const productData = {
        name: formData.name,
        category: formData.category || 'General',
        price_per_piece: Number(formData.price_per_piece),
        image_url: formData.image_url
      };

      if (isEditMode && id) {
        updateProduct({ ...productData, id } as Product);
      } else {
        addProduct(productData as Omit<Product, 'id'>);
      }
      navigate('/products');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/products')}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-sm text-slate-500">
            {isEditMode ? 'Modify product specifications and pricing' : 'Introduce a new textile product to the catalog'}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-3 space-y-6">
              <Input 
                label="Product Name" 
                placeholder="e.g. Cotton Bed Sheet (King)" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                className="text-lg py-4"
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Select 
                    label="Category"
                    options={[
                        {label: 'Bedding', value: 'Bedding'}, 
                        {label: 'Curtains', value: 'Curtains'}, 
                        {label: 'Kitchen', value: 'Kitchen'}, 
                        {label: 'Accessories', value: 'Accessories'},
                        {label: 'General', value: 'General'}
                    ]}
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                />
                <Input 
                    label="Employee Wage (₹ per piece)" 
                    type="number" 
                    step="0.01" 
                    // Fix: Use price_per_piece instead of pricePerPiece
                    value={formData.price_per_piece} 
                    onChange={e => setFormData({...formData, price_per_piece: parseFloat(e.target.value)})} 
                    required 
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Product Image</label>
              <div className="aspect-[4/3] border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden relative group">
                  {/* Fix: Use image_url instead of imageUrl */}
                  {formData.image_url ? (
                      <>
                          <img 
                              src={formData.image_url} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                          />
                          <button 
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                              className="absolute top-3 right-3 p-1.5 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md transition-all z-10"
                          >
                              <X size={18} />
                          </button>
                          <div 
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <span className="text-white text-sm font-bold flex items-center">
                              <Upload size={18} className="mr-2" /> Change Image
                            </span>
                          </div>
                      </>
                  ) : (
                      <div 
                          className="w-full h-full flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                      >
                          <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                            <Upload size={32} className="text-slate-300" />
                          </div>
                          <span className="text-sm font-medium">Click to upload image</span>
                          <span className="text-[10px] opacity-60 mt-1">Maximum size 2MB</span>
                      </div>
                  )}
                  <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                  />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => navigate('/products')}>
              Cancel
            </Button>
            <Button type="submit" size="lg">
              {isEditMode ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Catalog
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Add to Catalog
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
