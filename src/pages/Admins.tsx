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
  const [isAssignUsersModalOpen, setIsAssignUsersModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [assigningAdmin, setAssigningAdmin] = useState<Admin | null>(null);
  const [selectedRole, setSelectedRole] = useState<AdminRole>('trainee');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userBranchFilter, setUserBranchFilter] = useState('');
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

  // Fetch users for assignment
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.getUsers({ status: 'active' }),
    enabled: isModalOpen || isAssignUsersModalOpen,
  });

  const users = usersData?.data || [];

  // Assign users mutation
  const assignUsersMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAdminRequest }) => {
      console.log('Sending update request for admin:', id, data);
      return apiService.updateAdmin(id, data);
    },
    onSuccess: (response) => {
      console.log('Assignment successful:', response);

      // Invalidate and refetch admin queries
      queryClient.invalidateQueries({ queryKey: ['admins'] });

      // Update auth store if the current admin was updated
      if (response.data && admin?.id === response.data.id) {
        // Update the logged-in admin data
        const storedAdmin = localStorage.getItem('admin');
        if (storedAdmin) {
          localStorage.setItem('admin', JSON.stringify(response.data));
        }
      }

      toast.success('Users assigned successfully');
      setIsAssignUsersModalOpen(false);
      setAssigningAdmin(null);
      setSelectedUserIds([]);
    },
    onError: (error: any) => {
      console.error('Assignment error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to assign users';
      toast.error(errorMessage);

      // Show validation errors if any
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((errorArray: any) => {
          if (Array.isArray(errorArray)) {
            errorArray.forEach((msg: string) => toast.error(msg));
          }
        });
      }
    },
  });

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

  const handleAssignUsers = () => {
    if (!assigningAdmin) return;

    const updateData: UpdateAdminRequest = {
      name: assigningAdmin.name,
      email: assigningAdmin.email,
      admin_role: assigningAdmin.admin_role,
      status: assigningAdmin.status,
      branch_id: assigningAdmin.branch_id ?? null,
      assigned_user_ids: selectedUserIds,
    };

    console.log('Assigning users:', updateData);
    assignUsersMutation.mutate({ id: assigningAdmin.id, data: updateData });
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
    setSelectedRole('trainee');
    setIsModalOpen(true);
  };

  const openEditModal = (adminToEdit: Admin) => {
    setEditingAdmin(adminToEdit);
    setSelectedRole(adminToEdit.admin_role);
    setIsModalOpen(true);
  };

  const openAssignUsersModal = (adminToAssign: Admin) => {
    console.log('Opening assign users modal for admin:', adminToAssign);
    console.log('Current assigned_user_ids:', adminToAssign.assigned_user_ids);
    setAssigningAdmin(adminToAssign);
    setSelectedUserIds(adminToAssign.assigned_user_ids || []);
    setUserSearchTerm('');
    setUserBranchFilter('');
    setIsAssignUsersModalOpen(true);
  };

  // Filter users based on search and branch
  const getFilteredUsers = () => {
    let filtered = users;

    // Filter by search term
    if (userSearchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
    }

    // Filter by branch
    if (userBranchFilter) {
      filtered = filtered.filter(user => user.branch_id === parseInt(userBranchFilter));
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  // Handle select/deselect all for filtered users
  const handleSelectAll = () => {
    const allFilteredIds = filteredUsers.map(user => user.id);
    const allSelected = allFilteredIds.every(id => selectedUserIds.includes(id));

    if (allSelected) {
      // Deselect all filtered users
      setSelectedUserIds(selectedUserIds.filter(id => !allFilteredIds.includes(id)));
    } else {
      // Select all filtered users
      const combined = [...selectedUserIds, ...allFilteredIds];
      const uniqueIds = combined.filter((id, index) => combined.indexOf(id) === index);
      setSelectedUserIds(uniqueIds);
    }
  };

  // Handle select all by branch
  const handleSelectByBranch = (branchId: number) => {
    const branchUserIds = users.filter(user => user.branch_id === branchId).map(user => user.id);
    const allBranchSelected = branchUserIds.every(id => selectedUserIds.includes(id));

    if (allBranchSelected) {
      // Deselect all users from this branch
      setSelectedUserIds(selectedUserIds.filter(id => !branchUserIds.includes(id)));
    } else {
      // Select all users from this branch
      const combined = [...selectedUserIds, ...branchUserIds];
      const uniqueIds = combined.filter((id, index) => combined.indexOf(id) === index);
      setSelectedUserIds(uniqueIds);
    }
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
                    {adminItem.admin_role === 'trainee' && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Shield className="w-4 h-4" />
                        <span>
                          {adminItem.assigned_user_ids && adminItem.assigned_user_ids.length > 0
                            ? `${adminItem.assigned_user_ids.length} assigned user${adminItem.assigned_user_ids.length > 1 ? 's' : ''}`
                            : 'No assigned users'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Assign Users Button for Trainee */}
                  {canEdit && adminItem.admin_role === 'trainee' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openAssignUsersModal(adminItem)}
                        className="w-full"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Assign Users
                      </Button>
                    </div>
                  )}
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
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
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

        {/* Assign Users Modal */}
        <Modal
          isOpen={isAssignUsersModalOpen}
          onClose={() => {
            setIsAssignUsersModalOpen(false);
            setAssigningAdmin(null);
            setSelectedUserIds([]);
            setUserSearchTerm('');
            setUserBranchFilter('');
          }}
          title={`Assign Users to ${assigningAdmin?.name || 'Trainee'}`}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Select which app users this trainee admin can view call logs for. Only call logs from the selected users will be visible to this trainee.
              </p>

              {/* Search and Filter Controls */}
              <div className="space-y-3 mb-4">
                {/* Search Input */}
                <div>
                  <Input
                    type="text"
                    placeholder="Search by name or username..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                  />
                </div>

                {/* Branch Filter and Actions */}
                <div className="flex gap-2 items-center">
                  <select
                    value={userBranchFilter}
                    onChange={(e) => setUserBranchFilter(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    <option value="">All Branches</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {filteredUsers.every(u => selectedUserIds.includes(u.id)) ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>

                {/* Quick Select by Branch */}
                {branches.length > 0 && !userBranchFilter && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-600 self-center">Quick select:</span>
                    {branches.map((branch) => {
                      const branchUserCount = users.filter(u => u.branch_id === branch.id).length;
                      const branchSelectedCount = users.filter(u => u.branch_id === branch.id && selectedUserIds.includes(u.id)).length;

                      return (
                        <button
                          key={branch.id}
                          type="button"
                          onClick={() => handleSelectByBranch(branch.id)}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            branchSelectedCount === branchUserCount && branchUserCount > 0
                              ? 'bg-rose-100 border-rose-300 text-rose-700'
                              : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {branch.name} ({branchSelectedCount}/{branchUserCount})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Users List */}
              <div className="border border-gray-300 rounded-lg p-3 max-h-96 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">
                      {users.length === 0 ? 'No users available' : 'No users match your search'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <label key={user.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUserIds([...selectedUserIds, user.id]);
                            } else {
                              setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                            }
                          }}
                          className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            @{user.username}
                            {user.branch && <span> • {user.branch.name}</span>}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Selection Summary */}
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  <strong>{selectedUserIds.length}</strong> user{selectedUserIds.length !== 1 ? 's' : ''} selected
                  {filteredUsers.length !== users.length && (
                    <span className="text-gray-500"> • Showing {filteredUsers.length} of {users.length}</span>
                  )}
                </span>
                {selectedUserIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedUserIds([])}
                    className="text-xs text-rose-600 hover:text-rose-800"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={handleAssignUsers}
                className="flex-1"
                disabled={assignUsersMutation.isPending}
              >
                {assignUsersMutation.isPending ? 'Saving...' : 'Save Assignment'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsAssignUsersModalOpen(false);
                  setAssigningAdmin(null);
                  setSelectedUserIds([]);
                }}
                disabled={assignUsersMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Admins;
