import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Package, Tags, Shield, Clock, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

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

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    departments: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });
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
        
        const txs = txRes.data.transactions;
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
    </div>
  );
};

export default AdminDashboard;
