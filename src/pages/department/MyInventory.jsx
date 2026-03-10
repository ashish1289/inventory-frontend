import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Table from '../../components/Table';
import toast from 'react-hot-toast';
import { Filter, X } from 'lucide-react';

const MyInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filterProduct, setFilterProduct] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get('/inventory');
        setInventory(res.data.inventory);
      } catch (error) {
        toast.error('Failed to load your inventory');
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // Extract unique values for dropdowns based on actual loaded data
  const uniqueProducts = React.useMemo(() => {
    const names = inventory.map(i => i.productId?.name).filter(Boolean);
    return [...new Set(names)].sort();
  }, [inventory]);

  const uniqueCategories = React.useMemo(() => {
    const categories = inventory.map(i => i.productId?.categoryId?.name).filter(Boolean);
    return [...new Set(categories)].sort();
  }, [inventory]);

  // Apply filters
  const filteredData = React.useMemo(() => {
    return inventory.filter(item => {
      // 1. Product Filter
      if (filterProduct && item.productId?.name !== filterProduct) return false;

      // 2. Category Filter
      if (filterCategory && item.productId?.categoryId?.name !== filterCategory) return false;

      // 3. Date Range Filter
      const txDate = new Date(item.updatedAt);
      txDate.setHours(0,0,0,0);
      
      if (filterDateFrom) {
        const fromDate = new Date(filterDateFrom);
        fromDate.setHours(0,0,0,0);
        if (txDate < fromDate) return false;
      }
      
      if (filterDateTo) {
        const toDate = new Date(filterDateTo);
        toDate.setHours(23,59,59,999);
        if (txDate > toDate) return false;
      }

      return true;
    });
  }, [inventory, filterProduct, filterCategory, filterDateFrom, filterDateTo]);

  const clearFilters = () => {
    setFilterProduct('');
    setFilterCategory('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const activeFilterCount = [filterProduct, filterCategory, filterDateFrom, filterDateTo].filter(Boolean).length;

  const columns = [
    { header: 'Product Name', render: (row) => <span className="font-semibold text-text">{row.productId?.name}</span>, sortable: true },
    { header: 'Category', render: (row) => row.productId?.categoryId?.name || 'Uncategorized' },
    { header: 'Current Quantity', accessor: 'quantity', sortable: true, render: (row) => (
      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-sm">
        {row.quantity}
      </span>
    )},
    { header: 'Last Updated', render: (row) => new Date(row.updatedAt).toLocaleDateString() },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text">Station Inventory</h1>
        <p className="text-text-muted text-sm mt-1">All items currently held by your department. These totals update automatically upon accepting transfers.</p>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-text flex items-center gap-2">
            <Filter size={18} className="text-primary" /> Stock Filters
          </h3>
          {activeFilterCount > 0 && (
            <button 
              onClick={clearFilters}
              className="text-xs font-semibold text-secondary hover:text-secondary/70 flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded"
            >
              <X size={14} /> Clear {activeFilterCount} Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Product Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">Product</label>
            <select 
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/50"
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
            >
              <option value="">All Products</option>
              {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">Category</label>
            <select 
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/50"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Date From */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">Updated From</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/50"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">Updated To</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/50"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Table 
        columns={columns} 
        data={filteredData} 
        loading={loading} 
        searchPlaceholder="Quick text search..."
      />
    </div>
  );
};

export default MyInventory;
