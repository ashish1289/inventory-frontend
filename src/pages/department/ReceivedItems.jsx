import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import toast from 'react-hot-toast';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';

const ReceivedItems = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleAccept = async (id) => {
    try {
      setActionLoading(true);
      await api.put(`/transactions/accept/${id}`);
      toast.success('Inventory accepted and recorded');
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (tx) => {
    setSelectedTx(tx);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error('Reason is required to reject');
      return;
    }
    try {
      setActionLoading(true);
      await api.put(`/transactions/reject/${selectedTx._id}`, { reason: rejectReason });
      toast.success('Inventory rejected. Central stock un-allocated.');
      setRejectModalOpen(false);
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  // Only show pending at the top, then history
  const sortedData = [...transactions].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const columns = [
    { header: 'Date dispatched', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { header: 'Product', render: (row) => <span className="font-semibold">{row.productId?.name || row.productName}</span> },
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Status', render: (row) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider
        ${row.status === 'pending' ? 'bg-accent/20 text-accent' : 
          row.status === 'accepted' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-secondary/20 text-secondary'}`}
      >
        {row.status}
      </span>
    )},
    { header: 'Actions', render: (row) => {
      if (row.status !== 'pending') return <span className="text-text-muted text-xs italic">No actions</span>;
      return (
        <div className="flex gap-2">
          <button 
            disabled={actionLoading}
            onClick={() => handleAccept(row._id)} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded shadow-sm text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Check size={16} /> Accept
          </button>
          <button 
            disabled={actionLoading}
            onClick={() => openRejectModal(row)} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-secondary text-secondary hover:bg-secondary/10 rounded shadow-sm text-sm font-medium transition-colors disabled:opacity-50"
          >
            <X size={16} /> Reject
          </button>
        </div>
      );
    }}
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text">Received Items Box</h1>
        <p className="text-text-muted text-sm mt-1">Review incoming inventory dispatches from Central. You must accept or reject pending items.</p>
      </div>

      <Table columns={columns} data={sortedData} loading={loading} searchPlaceholder="Filter dispatches..." />

      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Inventory Transfer">
        <form onSubmit={handleReject} className="flex flex-col gap-4">
          <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-lg flex gap-3 text-secondary mb-2">
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
            <p className="text-sm leading-snug">
              You are about to reject <strong>{selectedTx?.quantity}x {selectedTx?.productId?.name || selectedTx?.productName}</strong>. 
              This will return the items cleanly to Central Inventory. Make sure this is intended.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">Rejection Reason <span className="text-secondary">*</span></label>
            <textarea 
              rows="3" 
              className="w-full px-3 py-2 bg-surface border border-border rounded-md focus:ring-2 focus:ring-primary/50 text-sm"
              placeholder="E.g. Damaged during transit, Incorrect quantity dispatched..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
            <button type="button" onClick={() => setRejectModalOpen(false)} className="px-4 py-2 border rounded hover:bg-surface-hover text-sm font-medium">Cancel</button>
            <button type="submit" disabled={actionLoading || !rejectReason.trim()} className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 text-sm font-medium disabled:opacity-50">Submit Rejection</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReceivedItems;
