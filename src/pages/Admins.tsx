import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Mail, Building2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';
import { Admin, CreateAdminRequest, UpdateAdminRequest, AdminRole } from '../types';
import { Layout } from '../components/layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Loading } from '../components/ui/Loading';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';

const Admins: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const queryClient = useQueryClient();
  const { admin } = useAuthStore();

  // Only super_admin can manage other admins
  const canEdit = admin?.admin_role === 'super_admin';

  // Fetch branches
  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: () => apiService.getBranches({ status: 'active' }),
  });

  const branches = branchesData?.data || [];

  // Fetch admins
  const { data: adminsData, isLoading } = useQuery({
    queryKey: ['admins', searchTerm, roleFilter, branchFilter],
    queryFn: () =>
      apiService.getAdmins({
        search: searchTerm,
        admin_role: roleFilter || undefined,
        branch_id: branchFilter ? parseInt(branchFilter) : undefined,
      }),
  });

  const admins = adminsData?.data || [];

  // Create admin mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateAdminRequest) => apiService.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin created successfully');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create admin');
    },
  });

  // Update admin mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAdminRequest }) =>
      apiService.updateAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin updated successfully');
      setIsModalOpen(false);
      setEditingAdmin(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update admin');
    },
  });

  // Delete admin mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete admin');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const baseData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      admin_role: formData.get('admin_role') as AdminRole,
      status: (formData.get('status') as 'active' | 'inactive') || 'active',
      branch_id: formData.get('branch_id') ? parseInt(formData.get('branch_id') as string) : null,
    };

    if (editingAdmin) {
      const updateData: UpdateAdminRequest = {
        ...baseData,
        password: formData.get('password') as string || undefined,
      };
      updateMutation.mutate({ id: editingAdmin.id, data: updateData });
    } else {
      const createData: CreateAdminRequest = {
        ...baseData,
        password: formData.get('password') as string,
      };
      createMutation.mutate(createData);
    }
  };

  const handleDelete = (id: number) => {
    if (admin?.id === id) {
      toast.error('You cannot delete your own account');
      return;
    }
    if (window.confirm('Are you sure you want to delete this admin?')) {
      deleteMutation.mutate(id);
    }
  };

  const openCreateModal = () => {
    setEditingAdmin(null);
    setIsModalOpen(true);
  };

  const openEditModal = (adminToEdit: Admin) => {
    setEditingAdmin(adminToEdit);
    setIsModalOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'trainee':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return (
    <Layout>
      <Loading />
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admins</h1>
            <p className="text-gray-600 mt-1">Manage admin panel users and their roles</p>
          </div>
          {canEdit && (
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="manager">Manager</option>
                <option value="trainee">Trainee</option>
              </select>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Admins Grid */}
        {admins.length === 0 ? (
          <EmptyState
            title="No admins found"
            description="Get started by creating your first admin"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {admins.map((adminItem) => (
              <Card key={adminItem.id}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{adminItem.name}</h3>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(adminItem.admin_role)}`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {adminItem.admin_role.replace('_', ' ')}
                        </span>
                        <Badge variant={adminItem.status === 'active' ? 'success' : 'default'}>
                          {adminItem.status}
                        </Badge>
                      </div>
                    </div>
                    {canEdit && adminItem.id !== admin?.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(adminItem)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(adminItem.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{adminItem.email}</span>
                    </div>
                    {adminItem.branch && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{adminItem.branch.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Admin Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAdmin(null);
          }}
          title={editingAdmin ? 'Edit Admin' : 'Create Admin'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              label="Name"
              required
              defaultValue={editingAdmin?.name}
            />
            <Input
              name="email"
              type="email"
              label="Email"
              required
              defaultValue={editingAdmin?.email}
            />
            <Input
              name="password"
              type="password"
              label={editingAdmin ? 'Password (leave blank to keep current)' : 'Password'}
              required={!editingAdmin}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Role
              </label>
              <select
                name="admin_role"
                defaultValue={editingAdmin?.admin_role || 'trainee'}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="super_admin">Super Admin</option>
                <option value="manager">Manager</option>
                <option value="trainee">Trainee</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <select
                name="branch_id"
                defaultValue={editingAdmin?.branch_id || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="">No Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                defaultValue={editingAdmin?.status || 'active'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingAdmin ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingAdmin(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Admins;
