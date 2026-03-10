import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import toast from 'react-hot-toast';
import { Check, X, Clock, AlertTriangle, Filter } from 'lucide-react';

const ReceivedItems = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  
  // Resolve Form States
  const [acceptedQty, setAcceptedQty] = useState(0);
  const [rejectedQty, setRejectedQty] = useState(0);
  const [rejectReason, setRejectReason] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);

  // Filter States
  const [filterProduct, setFilterProduct] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');
      // Department sees all their own transactions, we mostly care about 'pending'
      setTransactions(res.data.transactions);
    } catch (error) {
      toast.error('Failed to load received items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const openResolveModal = (tx) => {
    setSelectedTx(tx);
    setAcceptedQty(tx.quantity); // Default to full accept
    setRejectedQty(0);
    setRejectReason('');
    setResolveModalOpen(true);
  };

  const handleQtyChange = (field, value) => {
    if (!selectedTx) return;
    
    // Ensure value is a valid number, default to 0
    let num = parseInt(value, 10);
    if (isNaN(num) || num < 0) num = 0;
    
    // Prevent going over total
    if (num > selectedTx.quantity) num = selectedTx.quantity;

    if (field === 'accept') {
      setAcceptedQty(num);
      setRejectedQty(selectedTx.quantity - num); // Auto-calculate remainder
    } else {
      setRejectedQty(num);
      setAcceptedQty(selectedTx.quantity - num); // Auto-calculate remainder
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    
    if (acceptedQty + rejectedQty !== selectedTx?.quantity) {
      toast.error('Quantities must sum up strictly to the dispatch total');
      return;
    }

    if (rejectedQty > 0 && !rejectReason.trim()) {
      toast.error('Reason is strictly required for rejected items');
      return;
    }

    try {
      setActionLoading(true);
      await api.put(`/transactions/resolve/${selectedTx._id}`, { 
        acceptedQty, 
        rejectedQty, 
        reason: rejectedQty > 0 ? rejectReason : '' 
      });
      
      const msg = rejectedQty > 0 
        ? `Resolved: ${acceptedQty} added to stock, ${rejectedQty} returned.` 
        : 'Fully accepted into stock.';
      
      toast.success(msg);
      setResolveModalOpen(false);
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resolve transaction');
    } finally {
      setActionLoading(false);
    }
  };

  // Extract unique values for dropdowns based on actual loaded data
  const uniqueProducts = React.useMemo(() => {
    const names = transactions.map(t => t.productId?.name || t.productName).filter(Boolean);
    return [...new Set(names)].sort();
  }, [transactions]);

  // Apply filters
  const filteredData = React.useMemo(() => {
    return transactions.filter(tx => {
      // 1. Product Filter
      const pName = tx.productId?.name || tx.productName;
      if (filterProduct && pName !== filterProduct) return false;

      // 2. Status Filter
      if (filterStatus && tx.status !== filterStatus) return false;

      // 3. Date Range Filter
      const txDate = new Date(tx.createdAt);
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
    }).sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [transactions, filterProduct, filterStatus, filterDateFrom, filterDateTo]);

  const clearFilters = () => {
    setFilterProduct('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const activeFilterCount = [filterProduct, filterStatus, filterDateFrom, filterDateTo].filter(Boolean).length;

  const columns = [
    { header: 'Date dispatched', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { header: 'Product', render: (row) => <span className="font-semibold">{row.productId?.name || row.productName}</span> },
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Status', render: (row) => {
      let badgeClass = 'bg-secondary/20 text-secondary';
      let title = row.status;

      if (row.status === 'pending') {
        badgeClass = 'bg-accent/20 text-accent';
      } else if (row.status === 'accepted') {
        badgeClass = 'bg-green-500/20 text-green-600 dark:text-green-400';
      } else if (row.status === 'partially_accepted') {
        badgeClass = 'bg-primary/20 text-primary';
        title = 'Partial';
      }

      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${badgeClass}`}>
          {title}
        </span>
      );
    }},
    { header: 'Actions', render: (row) => {
      if (row.status !== 'pending') {
        return (
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-green-600 dark:text-green-400" title="Accepted Quantity">{row.acceptedQuantity || 0} Acc</span>
            <span className="text-border">|</span>
            <span className="text-secondary" title="Rejected Quantity">{row.rejectedQuantity || 0} Rej</span>
          </div>
        );
      }
      // Only action is "Resolve Transfer"
      return (
        <button 
          disabled={actionLoading}
          onClick={() => openResolveModal(row)} 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded shadow-sm text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Check size={16} /> Resolve Transfer
        </button>
      );
    }}
  ];

  const receivedExportConfig = {
    headers: ['Date Dispatched', 'Product', 'Dispatched Qty', 'Status', 'Accepted Qty', 'Rejected Qty', 'Rejection Reason'],
    dataFormat: (row) => {
      let statusText = row.status;
      if (row.status === 'partially_accepted') statusText = 'Partially Accepted';
      
      return [
        new Date(row.createdAt).toLocaleDateString(),
        row.productId?.name || row.productName || 'Unknown',
        row.quantity,
        statusText.charAt(0).toUpperCase() + statusText.slice(1),
        row.acceptedQuantity || (row.status === 'accepted' ? row.quantity : 0),
        row.rejectedQuantity || (row.status === 'rejected' ? row.quantity : 0),
        row.reason || ''
      ];
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text">Received Items Box</h1>
        <p className="text-text-muted text-sm mt-1">Review incoming inventory dispatches from Central. You must accept or reject pending items.</p>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-text flex items-center gap-2">
            <Filter size={18} className="text-primary" /> Inbox Filters
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

          {/* Status Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">Status</label>
            <select 
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/50"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Date From */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">Dispatched From</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/50"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">Dispatched To</label>
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
        exportName="Received_Items_Inbox"
        exportConfig={receivedExportConfig}
      />

      <Modal isOpen={resolveModalOpen} onClose={() => setResolveModalOpen(false)} title="Resolve Inventory Transfer">
        <form onSubmit={handleResolve} className="flex flex-col gap-5">
          {/* Header Info Banner */}
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex flex-col gap-2">
            <h4 className="font-semibold text-text">Transfer Summary</h4>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Product:</span>
              <span className="font-medium text-text">{selectedTx?.productId?.name || selectedTx?.productName}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Total Dispatched:</span>
              <span className="font-bold text-primary text-base">{selectedTx?.quantity} Units</span>
            </div>
          </div>

          <p className="text-sm text-text-muted px-1">
            Specify how many items you are accepting into your stock versus how many you are rejecting (returning to central).
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-green-600 dark:text-green-500">Accepted Quantity</label>
              <input 
                type="number"
                min="0"
                max={selectedTx?.quantity || 0}
                className="w-full px-3 py-2 bg-surface border border-border rounded-md focus:ring-2 focus:ring-green-500 font-bold text-lg"
                value={acceptedQty}
                onChange={(e) => handleQtyChange('accept', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-secondary">Rejected Quantity</label>
              <input 
                type="number"
                min="0"
                max={selectedTx?.quantity || 0}
                className="w-full px-3 py-2 bg-surface border border-border rounded-md focus:ring-2 focus:ring-secondary font-bold text-lg"
                value={rejectedQty}
                onChange={(e) => handleQtyChange('reject', e.target.value)}
              />
            </div>
          </div>

          <div className={`flex flex-col gap-1.5 transition-all duration-300 ${rejectedQty > 0 ? 'opacity-100 h-auto' : 'opacity-50 pointer-events-none'}`}>
            <label className="text-sm font-medium text-text">
              Rejection Reason {rejectedQty > 0 && <span className="text-secondary">*</span>}
            </label>
            <textarea 
              rows="2" 
              className="w-full px-3 py-2 bg-surface border border-border rounded-md focus:ring-2 focus:ring-primary/50 text-sm"
              placeholder={rejectedQty > 0 ? "Required: Why are " + rejectedQty + " items being returned?" : "Reason not required for full acceptance"}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required={rejectedQty > 0}
              disabled={rejectedQty === 0}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border mt-1">
            <button type="button" onClick={() => setResolveModalOpen(false)} className="px-5 py-2 border rounded hover:bg-surface-hover text-sm font-medium">Cancel</button>
            <button 
              type="submit" 
              disabled={actionLoading || (acceptedQty + rejectedQty !== selectedTx?.quantity) || (rejectedQty > 0 && !rejectReason.trim())} 
              className="px-5 py-2 bg-primary text-white rounded hover:bg-primary-hover text-sm font-semibold disabled:opacity-50"
            >
              Submit Resolution
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReceivedItems;
