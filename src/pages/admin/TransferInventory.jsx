import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import FormInput from '../../components/FormInput';
import toast from 'react-hot-toast';
import { Send, MapPin, Package as PackageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TransferInventory = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    toDepartment: '',
    quantity: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, userRes] = await Promise.all([
          api.get('/products'),
          api.get('/users')
        ]);
        // Only show products with positive available stock
        setProducts(prodRes.data.products.filter(p => p.availableStock > 0));
        setDepartments(userRes.data.users.filter(u => u.role === 'department'));
      } catch (error) {
        toast.error('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await api.post('/inventory/transfer', {
        productId: formData.productId,
        toDepartment: formData.toDepartment,
        quantity: Number(formData.quantity)
      });
      
      toast.success('Inventory transfer initiated successfully');
      setFormData({ productId: '', toDepartment: '', quantity: '' });
      setTimeout(() => navigate('/admin/transactions'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transfer failed');
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find(p => p._id === formData.productId);

  if (loading) {
    return <div className="animate-pulse flex gap-4"><div className="w-full h-64 bg-surface rounded-xl"></div></div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text">Transfer Inventory</h1>
        <p className="text-text-muted text-sm mt-1">Dispatch items from Central Inventory to specific Police Stations/Departments.</p>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-6 md:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Target Department */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text flex items-center gap-2">
              <MapPin size={16} className="text-primary" /> Destination Department <span className="text-secondary">*</span>
            </label>
            <select 
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50"
              value={formData.toDepartment}
              onChange={e => setFormData({...formData, toDepartment: e.target.value})}
              required
            >
              <option value="" disabled>Select receiving station/department...</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.departmentName || d.name} {d.stationCode ? `(${d.stationCode})` : ''}</option>
              ))}
            </select>
          </div>

          <hr className="border-border my-2" />

          {/* Product Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text flex items-center gap-2">
              <PackageIcon size={16} className="text-primary" /> Select Product <span className="text-secondary">*</span>
            </label>
            <select 
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50"
              value={formData.productId}
              onChange={e => setFormData({...formData, productId: e.target.value})}
              required
            >
              <option value="" disabled>Select item to transfer...</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.name} — ({p.availableStock} available)</option>
              ))}
            </select>
            {selectedProduct && (
              <p className="text-xs text-text-muted mt-1 ml-1">
                Category: <strong>{selectedProduct.categoryId?.name}</strong> | Available in Central: <strong>{selectedProduct.availableStock}</strong>
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-2">
            <FormInput 
              label="Quantity to Transfer" 
              id="quantity" 
              type="number" 
              min="1"
              max={selectedProduct ? selectedProduct.availableStock : ""}
              placeholder="e.g. 10" 
              value={formData.quantity} 
              onChange={e => setFormData({...formData, quantity: e.target.value})} 
              required
              disabled={!selectedProduct}
            />
          </div>

          <div className="pt-4 mt-2">
            <button 
              type="submit" 
              disabled={submitting || !formData.productId || !formData.toDepartment || !formData.quantity}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
              ) : (
                <><Send size={18} /> Initiate Transfer</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferInventory;
