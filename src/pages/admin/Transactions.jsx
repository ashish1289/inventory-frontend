import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Table from '../../components/Table';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
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

  const columns = [
    { header: 'Date', accessor: 'createdAt', sortable: true, render: (row) => new Date(row.createdAt).toLocaleDateString() + ' ' + new Date(row.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) },
    { header: 'Product', render: (row) => <span className="font-semibold">{row.productId?.name || row.productName}</span> },
    { header: 'Quantity', accessor: 'quantity', sortable: true },
    { header: 'From', accessor: 'fromDepartment' },
    { header: 'To Station/Dept', render: (row) => row.toDepartment?.departmentName || row.toDepartment?.name || row.toDepartmentName },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} reason={row.reason} /> }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text">Transfer Ledger</h1>
        <p className="text-text-muted text-sm mt-1">Complete history of all inventory dispatches and their current acknowledgement status.</p>
      </div>

      <Table 
        columns={columns} 
        data={transactions} 
        loading={loading} 
        searchPlaceholder="Search by product, station, or status..."
      />
    </div>
  );
};

export default Transactions;
