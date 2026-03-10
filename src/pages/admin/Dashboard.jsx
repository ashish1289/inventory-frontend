import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Package, Tags, Shield, Clock, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Activity } from 'lucide-react';
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

const StatusBadgeMini = ({ status }) => {
  if (status === 'pending') return <span className="bg-accent/20 text-accent px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Pending</span>;
  if (status === 'accepted') return <span className="bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Accepted</span>;
  return <span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Rejected</span>;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    departments: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });
  
  const [recentTransfers, setRecentTransfers] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, productsRes, categoriesRes, txRes] = await Promise.all([
          api.get('/users'),
          api.get('/products'),
          api.get('/categories'),
          api.get('/transactions')
        ]);

        const depts = usersRes.data.users.filter(u => u.role === 'department').length;
        
        const txs = txRes.data.transactions || [];
        const pending = txs.filter(t => t.status === 'pending').length;
        const accepted = txs.filter(t => t.status === 'accepted').length;
        const rejected = txs.filter(t => t.status === 'rejected').length;

        setStats({
          products: productsRes.data.count || 0,
          categories: categoriesRes.data.count || 0,
          departments: depts,
          pending,
          accepted,
          rejected
        });

        // Get Top 5 Recent Transfers
        const recent = [...txs].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        setRecentTransfers(recent);

        // Get Top 5 Lowest Stock Products (Threshold <= 10)
        const products = productsRes.data.products || [];
        const lowStock = products.filter(p => p.availableStock <= 15).sort((a,b) => a.availableStock - b.availableStock).slice(0, 5);
        setLowStockProducts(lowStock);

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
        <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>
        <p className="text-text-muted">Central overview of Police Commissionerate Inventory</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Departments" value={stats.departments} icon={Shield} colorClass="text-primary" />
        <StatCard title="Total Products" value={stats.products} icon={Package} colorClass="text-blue-500" />
        <StatCard title="Total Categories" value={stats.categories} icon={Tags} colorClass="text-teal-500" />
        
        <StatCard title="Pending Transfers" value={stats.pending} icon={Clock} colorClass="text-accent" />
        <StatCard title="Accepted Transfers" value={stats.accepted} icon={CheckCircle2} colorClass="text-green-500" />
        <StatCard title="Rejected Transfers" value={stats.rejected} icon={XCircle} colorClass="text-secondary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        {/* Recent Transfers Panel */}
        <div className="bg-surface rounded-xl border border-border shadow-sm flex flex-col">
          <div className="p-5 border-b border-border flex justify-between items-center bg-surface-hover/30 rounded-t-xl">
            <h3 className="font-bold text-text flex items-center gap-2">
              <Activity size={18} className="text-primary" /> Recent Transfers
            </h3>
            <Link to="/admin/transactions" className="text-xs font-semibold text-primary hover:text-primary/70 flex items-center gap-1 transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-0 overflow-y-auto max-h-[300px]">
            {recentTransfers.length === 0 ? (
              <p className="p-6 text-center text-text-muted text-sm">No recent transactions found.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentTransfers.map(tx => (
                  <li key={tx._id} className="p-4 hover:bg-surface-hover/30 transition-colors flex justify-between items-center gap-4">
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-text truncate max-w-[200px]">
                        {tx.quantity}x {tx.productId?.name || 'Unknown Product'}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                        To: {tx.toDepartment?.departmentName || tx.toDepartment?.name || 'Unknown Dept'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 min-w-max">
                      <StatusBadgeMini status={tx.status} />
                      <span className="text-[10px] text-text-muted">{new Date(tx.createdAt).toLocaleDateString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Low Stock Alerts Panel */}
        <div className="bg-surface rounded-xl border border-border shadow-sm flex flex-col">
          <div className="p-5 border-b border-border flex justify-between items-center bg-secondary/5 rounded-t-xl">
            <h3 className="font-bold text-text flex items-center gap-2">
              <AlertTriangle size={18} className="text-secondary" /> Low Stock Alerts
            </h3>
            <Link to="/admin/products" className="text-xs font-semibold text-secondary hover:text-secondary/70 flex items-center gap-1 transition-colors">
              Manage <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-0 overflow-y-auto max-h-[300px]">
            {lowStockProducts.length === 0 ? (
              <p className="p-6 text-center text-text-muted text-sm">No products are running low on stock. Great job!</p>
            ) : (
              <ul className="divide-y divide-border">
                {lowStockProducts.map(product => (
                  <li key={product._id} className="p-4 hover:bg-surface-hover/30 transition-colors flex justify-between items-center gap-4">
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-text truncate max-w-[200px]">
                        {product.name}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Category: {product.categoryId?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end min-w-max">
                      <span className="text-lg font-black text-secondary">
                        {product.availableStock}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                        Available
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

export default AdminDashboard;
