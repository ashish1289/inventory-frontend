import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import Table from '../../components/Table';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle2, Clock, XCircle, Filter, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StatusBadge = ({ status, reason }) => {
  switch (status) {
    case 'pending':
      return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent"><Clock size={14} /> Pending</span>;
    case 'accepted':
      return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-400"><CheckCircle2 size={14} /> Accepted</span>;
    case 'rejected':
      return (
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary w-max"><XCircle size={14} /> Rejected</span>
          {reason && <span className="text-xs text-secondary/80 flex items-center gap-1 mt-1"><AlertCircle size={12} /> {reason}</span>}
        </div>
      );
    default:
      return <span>{status}</span>;
  }
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filterProduct, setFilterProduct] = useState('');
  const [filterStation, setFilterStation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data.transactions);
    } catch (error) {
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  // Extract unique values for dropdowns based on actual loaded data
  const uniqueProducts = useMemo(() => {
    const names = transactions.map(t => t.productId?.name || t.productName).filter(Boolean);
    return [...new Set(names)].sort();
  }, [transactions]);

  const uniqueStations = useMemo(() => {
    const names = transactions.map(t => t.toDepartment?.departmentName || t.toDepartment?.name || t.toDepartmentName).filter(Boolean);
    return [...new Set(names)].sort();
  }, [transactions]);

  // Apply filters
  const filteredData = useMemo(() => {
    return transactions.filter(tx => {
      // 1. Product Filter
      const pName = tx.productId?.name || tx.productName;
      if (filterProduct && pName !== filterProduct) return false;

      // 2. Station Filter
      const sName = tx.toDepartment?.departmentName || tx.toDepartment?.name || tx.toDepartmentName;
      if (filterStation && sName !== filterStation) return false;

      // 3. Status Filter
      if (filterStatus && tx.status !== filterStatus) return false;

      // 4. Date Range Filter
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
    });
  }, [transactions, filterProduct, filterStation, filterStatus, filterDateFrom, filterDateTo]);

  const clearFilters = () => {
    setFilterProduct('');
    setFilterStation('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const activeFilterCount = [filterProduct, filterStation, filterStatus, filterDateFrom, filterDateTo].filter(Boolean).length;

  const columns = [
    { header: 'Date', accessor: 'createdAt', sortable: true, render: (row) => new Date(row.createdAt).toLocaleDateString() + ' ' + new Date(row.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) },
    { header: 'Product', render: (row) => <span className="font-semibold">{row.productId?.name || row.productName}</span> },
    { header: 'Quantity', accessor: 'quantity', sortable: true },
    { header: 'To Station/Dept', render: (row) => row.toDepartment?.departmentName || row.toDepartment?.name || row.toDepartmentName },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} reason={row.reason} /> }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text">Transfer Ledger</h1>
        <p className="text-text-muted text-sm mt-1">Complete history of all inventory dispatches and their current acknowledgement status.</p>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-text flex items-center gap-2">
            <Filter size={18} className="text-primary" /> Advanced Filters
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

          {/* Station Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">Station / Dept</label>
            <select 
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/50"
              value={filterStation}
              onChange={(e) => setFilterStation(e.target.value)}
            >
              <option value="">All Stations</option>
              {uniqueStations.map(s => <option key={s} value={s}>{s}</option>)}
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
            <label className="text-xs font-medium text-text-muted">From Date</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/50"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">To Date</label>
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
        searchPlaceholder="Quick text search across filtered results..."
      />
    </div>
  );
};

export default Transactions;
