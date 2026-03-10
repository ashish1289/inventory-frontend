import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Package, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-surface p-6 rounded-xl border border-border flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className={`p-4 rounded-lg bg-surface-hover ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-text-muted">{title}</p>
      <h3 className="text-3xl font-bold text-text mt-1">{value}</h3>
    </div>
  </div>
);

const DeptDashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  const [pendingDispatches, setPendingDispatches] = useState([]);
  const [recentInventory, setRecentInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [invRes, txRes] = await Promise.all([
          api.get('/inventory'),
          api.get('/transactions')
        ]);

        const txs = txRes.data.transactions || [];
        const pendingTxs = txs.filter(t => t.status === 'pending');
        const accepted = txs.filter(t => t.status === 'accepted').length;
        const rejected = txs.filter(t => t.status === 'rejected').length;

        const inventoryItems = invRes.data.inventory || [];
        const totalItems = invRes.data.count || 0;

        setStats({
          totalItems,
          pending: pendingTxs.length,
          accepted,
          rejected
        });

        // Get Top 5 Pending Dispatches
        setPendingDispatches(pendingTxs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));

        // Get Top 5 Recently Updated Inventory Items
        setRecentInventory([...inventoryItems].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5));

      } catch (error) {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text">Department Dashboard</h1>
        <p className="text-text-muted">Overview of your station's inventory & transfers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Received Parts (SKUs)" value={stats.totalItems} icon={Package} colorClass="text-primary" />
        <StatCard title="Awaiting Acceptance" value={stats.pending} icon={Clock} colorClass="text-accent" />
        <StatCard title="Accepted Requests" value={stats.accepted} icon={CheckCircle2} colorClass="text-green-500" />
        <StatCard title="Rejected Requests" value={stats.rejected} icon={XCircle} colorClass="text-secondary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        {/* Pending Actions Required Panel */}
        <div className="bg-surface rounded-xl border border-border shadow-sm flex flex-col">
          <div className="p-5 border-b border-border flex justify-between items-center bg-accent/5 rounded-t-xl">
            <h3 className="font-bold text-text flex items-center gap-2">
              <AlertCircle size={18} className="text-accent" /> Actions Required
            </h3>
            <Link to="/department/received" className="text-xs font-semibold text-accent hover:text-accent/70 flex items-center gap-1 transition-colors">
              Review Inbox <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-0 overflow-y-auto max-h-[300px]">
            {pendingDispatches.length === 0 ? (
              <p className="p-6 text-center text-text-muted text-sm">No pending transfers from Central. You are all caught up!</p>
            ) : (
              <ul className="divide-y divide-border">
                {pendingDispatches.map(tx => (
                  <li key={tx._id} className="p-4 hover:bg-surface-hover/30 transition-colors flex justify-between items-center gap-4">
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-text truncate max-w-[200px]">
                        {tx.quantity}x {tx.productId?.name || 'Unknown Product'}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Dispatched: {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link to="/department/received" className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded text-xs font-bold transition-colors">
                      Action Needed
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recently Added Inventory Panel */}
        <div className="bg-surface rounded-xl border border-border shadow-sm flex flex-col">
          <div className="p-5 border-b border-border flex justify-between items-center bg-surface-hover/30 rounded-t-xl">
            <h3 className="font-bold text-text flex items-center gap-2">
              <History size={18} className="text-primary" /> Most Recently Added
            </h3>
            <Link to="/department/inventory" className="text-xs font-semibold text-primary hover:text-primary/70 flex items-center gap-1 transition-colors">
              Full Inventory <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-0 overflow-y-auto max-h-[300px]">
            {recentInventory.length === 0 ? (
              <p className="p-6 text-center text-text-muted text-sm">Your station inventory is currently empty.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentInventory.map(item => (
                  <li key={item._id} className="p-4 hover:bg-surface-hover/30 transition-colors flex justify-between items-center gap-4">
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-text truncate max-w-[200px]">
                        {item.productId?.name || 'Unknown Product'}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Updated: {new Date(item.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <div className="flex flex-col items-end min-w-max">
                      <span className="text-lg font-black text-primary">
                        {item.quantity}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                        Held
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeptDashboard;
