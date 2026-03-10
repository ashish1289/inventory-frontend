import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'department',
    departmentName: '',
    stationCode: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // leave empty when editing
        role: user.role,
        departmentName: user.departmentName || '',
        stationCode: user.stationCode || '',
      });
      setSelectedUser(user);
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'department',
        departmentName: '',
        stationCode: '',
      });
      setSelectedUser(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        // Update
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // don't send empty password

        await api.put(`/users/${selectedUser._id}`, payload);
        toast.success('User updated successfully');
      } else {
        // Create
        await api.post('/users', formData);
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${selectedUser._id}`);
      toast.success('User deleted successfully');
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name', sortable: true },
    { header: 'Email', accessor: 'email', sortable: true },
    { header: 'Role', accessor: 'role', sortable: true, render: (row) => (
      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${row.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-surface-hover text-text-muted'}`}>
        {row.role}
      </span>
    )},
    { header: 'Dept Name', accessor: 'departmentName', sortable: true },
    { header: 'Station Code', accessor: 'stationCode', sortable: true },
    { header: 'Status', accessor: 'isActive', render: (row) => (
      <span className={`w-2 h-2 rounded-full inline-block ${row.isActive ? 'bg-green-500' : 'bg-secondary'}`} title={row.isActive ? 'Active' : 'Inactive'} />
    )},
    { header: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => handleOpenModal(row)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded">
          <Edit2 size={16} />
        </button>
        {row._id !== currentUser._id && (
          <button 
            onClick={() => { setSelectedUser(row); setIsDeleteModalOpen(true); }} 
            className="p-1.5 text-secondary hover:bg-secondary/10 rounded"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    )}
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text">Users & Stations</h1>
          <p className="text-text-muted text-sm mt-1">Manage all administrative accounts and police departments</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      <Table 
        columns={columns} 
        data={users} 
        loading={loading}
        searchPlaceholder="Search by name, email, or dept..." 
      />

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedUser ? 'Edit User' : 'Create New User'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Full Name" id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <FormInput label="Email Address" id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label={selectedUser ? "New Password (Optional)" : "Password"} 
              id="password" 
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              required={!selectedUser} 
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text">Role</label>
              <select 
                className="px-3 py-2 bg-surface text-text border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="department">Department / Station</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          {formData.role === 'department' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-surface-hover/50 rounded-lg border border-border">
              <FormInput label="Department/Station Name" id="departmentName" value={formData.departmentName} onChange={e => setFormData({...formData, departmentName: e.target.value})} />
              <FormInput label="Station Code" id="stationCode" value={formData.stationCode} onChange={e => setFormData({...formData, stationCode: e.target.value})} />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-text border border-border rounded-md hover:bg-surface-hover text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium">
              {selectedUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="py-4">
          <p className="text-text">Are you sure you want to delete the user <strong>{selectedUser?.name}</strong>?</p>
          <p className="text-secondary text-sm flex items-center mt-2 bg-secondary/10 p-2 rounded border border-secondary/20">
            This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-text border border-border rounded-md hover:bg-surface-hover text-sm font-medium">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 text-sm font-medium">Delete User</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;
