import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';
import { Branch, CreateBranchRequest } from '../types';
import { Layout } from '../components/layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Loading } from '../components/ui/Loading';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

const Branches: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const queryClient = useQueryClient();

  // Fetch branches
  const { data: branchesData, isLoading } = useQuery({
    queryKey: ['branches', searchTerm],
    queryFn: () => apiService.getBranches({ search: searchTerm }),
  });

  const branches = branchesData?.data || [];

  // Create branch mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateBranchRequest) => apiService.createBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Branch created successfully');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create branch');
    },
  });

  // Update branch mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateBranchRequest }) =>
      apiService.updateBranch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Branch updated successfully');
      setIsModalOpen(false);
      setEditingBranch(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update branch');
    },
  });

  // Delete branch mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Branch deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete branch');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: CreateBranchRequest = {
      name: formData.get('name') as string,
      location: formData.get('location') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      email: formData.get('email') as string || undefined,
      status: (formData.get('status') as 'active' | 'inactive') || 'active',
    };

    if (editingBranch) {
      updateMutation.mutate({ id: editingBranch.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      deleteMutation.mutate(id);
    }
  };

  const openCreateModal = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
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
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-600 mt-1">Manage your office branches</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus size={20} />
          Add Branch
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={20} />}
          />
        </div>
      </div>

      {/* Branches Grid */}
      {branches.length === 0 ? (
        <EmptyState
          title="No branches found"
          description="Get started by creating your first branch"
          action={<Button onClick={openCreateModal}>Add Branch</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch: Branch) => (
            <Card key={branch.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
                  <Badge variant={branch.status === 'active' ? 'success' : 'default'}>
                    {branch.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(branch)}
                    className="text-blue-600 hover:text-blue-700 p-1"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(branch.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {branch.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>{branch.location}</span>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} />
                    <span>{branch.phone}</span>
                  </div>
                )}
                {branch.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} />
                    <span>{branch.email}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-600">
                <span>{branch.users?.length || 0} Users</span>
                <span>{branch.admins?.length || 0} Admins</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBranch(null);
        }}
        title={editingBranch ? 'Edit Branch' : 'Add New Branch'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Branch Name"
            name="name"
            required
            defaultValue={editingBranch?.name}
            placeholder="Enter branch name"
          />

          <Input
            label="Location"
            name="location"
            defaultValue={editingBranch?.location || ''}
            placeholder="Enter location"
          />

          <Input
            label="Phone"
            name="phone"
            type="tel"
            defaultValue={editingBranch?.phone || ''}
            placeholder="Enter phone number"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            defaultValue={editingBranch?.email || ''}
            placeholder="Enter email address"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              defaultValue={editingBranch?.status || 'active'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingBranch(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingBranch ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
      </div>
    </Layout>
  );
};

export default Branches;
