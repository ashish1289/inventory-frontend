import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data.categories);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      setFormData({ name: category.name, description: category.description || '' });
      setSelectedCategory(category);
    } else {
      setFormData({ name: '', description: '' });
      setSelectedCategory(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCategory) {
        await api.put(`/categories/${selectedCategory._id}`, formData);
        toast.success('Category updated');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/categories/${selectedCategory._id}`);
      toast.success('Category deleted');
      setIsDeleteModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete (might be in use)');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name', sortable: true },
    { header: 'Description', accessor: 'description', sortable: true },
    { header: 'Created', accessor: 'createdAt', sortable: true, render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { header: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => handleOpenModal(row)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded">
          <Edit2 size={16} />
        </button>
        <button onClick={() => { setSelectedCategory(row); setIsDeleteModalOpen(true); }} className="p-1.5 text-secondary hover:bg-secondary/10 rounded">
          <Trash2 size={16} />
        </button>
      </div>
    )}
  ];

  const categoryExportConfig = {
    headers: ['Category Name', 'Description', 'Created At'],
    dataFormat: (row) => [
      row.name,
      row.description || '',
      new Date(row.createdAt).toLocaleDateString()
    ]
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text">Categories</h1>
          <p className="text-text-muted text-sm mt-1">Manage overall inventory classifications</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <Table 
        columns={columns} 
        data={categories} 
        loading={loading}
        exportName="Categories_Report"
        exportConfig={categoryExportConfig}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedCategory ? 'Edit Category' : 'Create Category'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormInput label="Category Name" id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <FormInput label="Description" id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-text border border-border rounded-md hover:bg-surface-hover text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium">Save</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation is identical conceptually */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Category">
        <div className="py-4 text-text">Are you sure you want to delete <strong>{selectedCategory?.name}</strong>?</div>
        <div className="flex justify-end gap-3"><button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 border rounded hover:bg-surface-hover text-sm font-medium">Cancel</button><button onClick={handleDelete} className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 text-sm font-medium">Delete</button></div>
      </Modal>
    </div>
  );
};

export default AdminCategories;
