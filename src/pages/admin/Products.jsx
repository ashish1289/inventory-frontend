import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, ArrowRightLeft } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', categoryId: '', totalStock: 0 });
  const [stockAdjustment, setStockAdjustment] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
      setProducts(prodRes.data.products);
      setCategories(catRes.data.categories);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setFormData({ 
        name: product.name, 
        description: product.description || '', 
        categoryId: product.categoryId?._id || '', 
        totalStock: product.totalStock,
        availableStock: product.availableStock,
        damagedStock: product.damagedStock || 0
      });
      setSelectedProduct(product);
    } else {
      setFormData({ name: '', description: '', categoryId: categories[0]?._id || '', totalStock: 0, availableStock: 0, damagedStock: 0 });
      setSelectedProduct(null);
    }
    setIsModalOpen(true);
  };

  const handleOpenStock = (product) => {
    setSelectedProduct(product);
    setStockAdjustment('');
    setIsStockModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedProduct) {
        await api.put(`/products/${selectedProduct._id}`, formData);
        toast.success('Product updated');
      } else {
        await api.post('/products', {
          name: formData.name,
          categoryId: formData.categoryId,
          description: formData.description,
          totalStock: formData.totalStock
        });
        toast.success('Product created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/products/${selectedProduct._id}`, { stockAdjustment: Number(stockAdjustment) });
      toast.success('Stock adjusted');
      setIsStockModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${selectedProduct._id}`);
      toast.success('Product deleted');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const columns = [
    { header: 'Product Name', accessor: 'name', sortable: true },
    { header: 'Category', render: (row) => row.categoryId?.name || 'N/A' },
    { header: 'Total Stock', accessor: 'totalStock', sortable: true },
    { header: 'Available', accessor: 'availableStock', sortable: true, render: (row) => (
      <span className={row.availableStock < 10 ? 'text-secondary font-bold' : ''}>{row.availableStock}</span>
    )},
    { header: 'Damaged / Review', accessor: 'damagedStock', sortable: true, render: (row) => (
      <span className={row.damagedStock > 0 ? 'text-orange-500 dark:text-orange-400 font-bold' : 'text-text-muted'}>
        {row.damagedStock || 0}
      </span>
    )},
    { header: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => handleOpenStock(row)} className="p-1.5 text-accent hover:bg-accent/10 rounded" title="Adjust Stock">
          <ArrowRightLeft size={16} />
        </button>
        <button onClick={() => handleOpenModal(row)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded" title="Edit Product">
          <Edit2 size={16} />
        </button>
        <button onClick={() => { setSelectedProduct(row); setIsDeleteModalOpen(true); }} className="p-1.5 text-secondary hover:bg-secondary/10 rounded" title="Delete Product">
          <Trash2 size={16} />
        </button>
      </div>
    )}
  ];

  const productExportConfig = {
    headers: ['Product Name', 'Category', 'Total Stock', 'Available Stock', 'Damaged/Review'],
    dataFormat: (row) => [
      row.name,
      row.categoryId?.name || 'N/A',
      row.totalStock,
      row.availableStock,
      row.damagedStock || 0
    ]
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text">Products Directory</h1>
          <p className="text-text-muted text-sm mt-1">Manage central inventory catalog and base stocks</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <Table 
        columns={columns} 
        data={products} 
        loading={loading} 
        exportName="Products_Report" 
        exportConfig={productExportConfig} 
      />

      {/* Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedProduct ? 'Edit Product Details' : 'Register New Product'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormInput label="Product Name" id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">Category <span className="text-secondary">*</span></label>
            <select className="px-3 py-2 bg-surface text-text border border-border rounded-md shadow-sm text-sm" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required={!selectedProduct}>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <FormInput label="Description" id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          
          {selectedProduct ? (
            <div className="grid grid-cols-3 gap-3 border-t border-border pt-4 mt-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text">Total Stock</label>
                <input 
                  type="number" 
                  min="0" 
                  className="px-3 py-2 bg-surface text-text border border-border rounded-md shadow-sm text-sm focus:ring-2 focus:ring-primary/50"
                  value={formData.totalStock} 
                  onChange={e => {
                    const newTotal = parseInt(e.target.value) || 0;
                    const diff = newTotal - formData.totalStock;
                    setFormData({
                      ...formData,
                      totalStock: newTotal,
                      availableStock: Math.max(0, formData.availableStock + diff)
                    });
                  }} 
                  required 
                />
              </div>
              <FormInput label="Available Stock" id="availableStock" type="number" min="0" value={formData.availableStock} onChange={e => setFormData({...formData, availableStock: e.target.value})} required />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-orange-500">Damaged Stock</label>
                <input type="number" min="0" className="px-3 py-2 bg-surface text-text border border-border rounded-md shadow-sm text-sm focus:ring-2 focus:ring-orange-500" value={formData.damagedStock} onChange={e => setFormData({...formData, damagedStock: e.target.value})} required />
              </div>
            </div>
          ) : (
            <FormInput label="Initial Total Stock" id="totalStock" type="number" min="0" value={formData.totalStock} onChange={e => setFormData({...formData, totalStock: e.target.value})} required />
          )}
          
          <div className="flex justify-end gap-3 mt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-surface-hover text-sm font-medium">Cancel</button><button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm font-medium">Save</button></div>
        </form>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} title="Adjust Stock Quantity">
        <form onSubmit={handleStockSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">Adjusting general available stock for: <strong className="text-text">{selectedProduct?.name}</strong></p>
          <div className="bg-surface-hover/50 p-4 rounded-md border border-border flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Current Total:</span> 
              <strong className="text-text">{selectedProduct?.totalStock}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Current Available:</span> 
              <strong className="text-primary">{selectedProduct?.availableStock}</strong>
            </div>
            {(selectedProduct?.damagedStock ?? 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-text-muted">Damaged / Under Review:</span> 
                <strong className="text-orange-500 dark:text-orange-400">{selectedProduct?.damagedStock}</strong>
              </div>
            )}
          </div>
          <FormInput label="Adjustment Amount to Available Stock (e.g. +50 or -10)" id="stock" type="number" placeholder="0" value={stockAdjustment} onChange={e => setStockAdjustment(e.target.value)} required />
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setIsStockModalOpen(false)} className="px-4 py-2 border rounded hover:bg-surface-hover text-sm font-medium">Cancel</button><button type="submit" className="px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 text-sm font-medium">Apply Adjustment</button></div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Product">
        <div className="py-4 text-text">Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?</div>
        <div className="flex justify-end gap-3"><button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button><button onClick={handleDelete} className="px-4 py-2 bg-secondary text-secondary-foreground rounded">Delete</button></div>
      </Modal>
    </div>
  );
};

export default AdminProducts;
