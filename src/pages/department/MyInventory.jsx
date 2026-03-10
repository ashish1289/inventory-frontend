import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Table from '../../components/Table';
import toast from 'react-hot-toast';

const MyInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

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

      <Table 
        columns={columns} 
        data={inventory} 
        loading={loading} 
        searchPlaceholder="Search your inventory by product..."
      />
    </div>
  );
};

export default MyInventory;
