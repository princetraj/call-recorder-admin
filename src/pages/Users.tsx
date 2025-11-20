import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Hash, Phone, Building2, User as UserIcon, Grid3x3, List, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';
import { User, CreateUserRequest, UpdateUserRequest } from '../types';
import { Layout } from '../components/layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Loading } from '../components/ui/Loading';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';

const Users: React.FC = () => {
  const { admin } = useAuthStore();

  // For manager and trainee, automatically filter by their branch (memoized)
  const initialBranchFilter = useMemo(() => {
    if (admin?.admin_role === 'manager' || admin?.admin_role === 'trainee') {
      return admin.branch_id ? admin.branch_id.toString() : '';
    }
    return '';
  }, [admin?.admin_role, admin?.branch_id]);

  // Staging states for filter inputs
  const [idFilterStaging, setIdFilterStaging] = useState('');
  const [nameFilterStaging, setNameFilterStaging] = useState('');

  // Actual filter states used in API query
  const [idFilter, setIdFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState(initialBranchFilter);

  // View mode state (list or grid)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Only super_admin can create/edit/delete users
  const canEdit = admin?.admin_role === 'super_admin';

  // Only super_admin can change branch filter
  const canChangeBranchFilter = admin?.admin_role === 'super_admin';

  // Fetch branches (with caching configuration)
  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: () => apiService.getBranches({ status: 'active' }),
    staleTime: 5 * 60 * 1000, // 5 minutes - branches don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
  });

  // Memoize branches array to maintain referential equality
  const branches = useMemo(() => branchesData?.data || [], [branchesData?.data]);

  // Fetch users - enforce branch filtering for manager and trainee
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', idFilter, nameFilter, branchFilter, currentPage, perPage],
    queryFn: () => {
      // For manager and trainee, ALWAYS filter by their branch
      let effectiveBranchFilter: number | undefined;

      if (admin?.admin_role === 'manager' || admin?.admin_role === 'trainee') {
        effectiveBranchFilter = admin?.branch_id ?? undefined;
      } else {
        effectiveBranchFilter = branchFilter ? parseInt(branchFilter) : undefined;
      }

      return apiService.getUsers({
        user_id: idFilter ? parseInt(idFilter) : undefined,
        name: nameFilter || undefined,
        branch_id: effectiveBranchFilter,
        page: currentPage,
        per_page: perPage,
      });
    },
    staleTime: 30 * 1000, // 30 seconds - user data changes more frequently
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache
  });

  const users = usersData?.data || [];
  const pagination = usersData?.pagination;

  // Handle search button click (memoized)
  const handleSearch = useCallback(() => {
    setIdFilter(idFilterStaging);
    setNameFilter(nameFilterStaging);
    setCurrentPage(1); // Reset to first page on new search
  }, [idFilterStaging, nameFilterStaging]);

  // Handle clear filters (memoized)
  const handleClearFilters = useCallback(() => {
    setIdFilterStaging('');
    setNameFilterStaging('');
    setIdFilter('');
    setNameFilter('');
    setCurrentPage(1); // Reset to first page
  }, []);

  // Handle page change (memoized)
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => apiService.createUser(data),
    onSuccess: () => {
      // More specific invalidation - only invalidate current filter combination
      queryClient.invalidateQueries({
        queryKey: ['users', idFilter, nameFilter, branchFilter, currentPage, perPage]
      });
      toast.success('User created successfully');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
      apiService.updateUser(id, data),
    onSuccess: () => {
      // More specific invalidation - only invalidate queries starting with 'users'
      queryClient.invalidateQueries({
        queryKey: ['users'],
        exact: false
      });
      toast.success('User updated successfully');
      setIsModalOpen(false);
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteUser(id),
    onSuccess: () => {
      // More specific invalidation - only invalidate queries starting with 'users'
      queryClient.invalidateQueries({
        queryKey: ['users'],
        exact: false
      });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const baseData = {
      name: formData.get('name') as string,
      username: formData.get('username') as string,
      mobile: formData.get('mobile') as string || undefined,
      status: (formData.get('status') as 'active' | 'inactive') || 'active',
      branch_id: formData.get('branch_id') ? parseInt(formData.get('branch_id') as string) : null,
    };

    if (editingUser) {
      const updateData: UpdateUserRequest = {
        ...baseData,
        password: formData.get('password') as string || undefined,
      };
      updateMutation.mutate({ id: editingUser.id, data: updateData });
    } else {
      const createData: CreateUserRequest = {
        ...baseData,
        password: formData.get('password') as string,
      };
      createMutation.mutate(createData);
    }
  };

  // Delete handler (memoized)
  const handleDelete = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  // Open create modal (memoized)
  const openCreateModal = useCallback(() => {
    setEditingUser(null);
    setIsModalOpen(true);
  }, []);

  // Open edit modal (memoized)
  const openEditModal = useCallback((user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  }, []);

  // Memoize pagination page numbers calculation
  const pageNumbers = useMemo(() => {
    if (!pagination || pagination.last_page === 0) return [];

    const pageCount = Math.min(5, pagination.last_page);
    return Array.from({ length: pageCount }, (_, i) => {
      let pageNum: number;

      // Logic to show pages around current page
      if (pagination.last_page <= 5) {
        pageNum = i + 1;
      } else if (currentPage <= 3) {
        pageNum = i + 1;
      } else if (currentPage >= pagination.last_page - 2) {
        pageNum = pagination.last_page - 4 + i;
      } else {
        pageNum = currentPage - 2 + i;
      }

      return pageNum;
    });
  }, [pagination, currentPage]);

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
            <h1 className="text-2xl font-bold text-gray-900">App Users</h1>
            <p className="text-gray-600 mt-1">Manage Android app users</p>
          </div>
          <div className="flex gap-3">
            {/* View Toggle Buttons */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 flex items-center gap-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 flex items-center gap-2 transition-colors border-l border-gray-300 ${
                  viewMode === 'grid'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                title="Grid View"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
            {canEdit && (
              <Button onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Filter by User ID..."
                value={idFilterStaging}
                onChange={(e) => setIdFilterStaging(e.target.value)}
                icon={<Hash className="w-5 h-5" />}
                type="number"
              />
              <Input
                placeholder="Filter by Name..."
                value={nameFilterStaging}
                onChange={(e) => setNameFilterStaging(e.target.value)}
                icon={<UserIcon className="w-5 h-5" />}
              />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                disabled={!canChangeBranchFilter}
                className={`px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                  !canChangeBranchFilter ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleSearch} className="flex-1 md:flex-initial">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button onClick={handleClearFilters} variant="secondary" className="flex-1 md:flex-initial">
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Users Display */}
        {users.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Get started by creating your first user"
          />
        ) : viewMode === 'list' ? (
          /* List View */
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {canEdit && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">{user.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600">{user.username}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{user.mobile || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{user.branch?.name || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.status === 'active' ? 'success' : 'default'}>
                          {user.status}
                        </Badge>
                      </td>
                      {canEdit && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => openEditModal(user)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card key={user.id}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={user.status === 'active' ? 'success' : 'default'}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      <span className="font-mono">User ID: {user.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      <span className="font-mono">Username: {user.username}</span>
                    </div>
                    {user.mobile && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{user.mobile}</span>
                      </div>
                    )}
                    {user.branch && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{user.branch.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.total > 0 && (
          <Card>
            <div className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Pagination Info */}
                <div className="text-sm text-gray-600">
                  Showing {pagination.from} to {pagination.to} of {pagination.total} users
                </div>

                {/* Page Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 border rounded-lg flex items-center gap-1 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {pageNumbers.map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 border rounded-lg min-w-[40px] ${
                          currentPage === pageNum
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.last_page}
                    className={`px-3 py-2 border rounded-lg flex items-center gap-1 ${
                      currentPage === pagination.last_page
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Per Page Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Per page:</label>
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* User Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingUser(null);
          }}
          title={editingUser ? 'Edit User' : 'Create User'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              label="Name"
              required
              defaultValue={editingUser?.name}
            />
            <Input
              name="username"
              label="Username"
              required
              defaultValue={editingUser?.username}
              placeholder="Unique username for login"
            />
            <Input
              name="mobile"
              label="Mobile"
              defaultValue={editingUser?.mobile || ''}
            />
            <Input
              name="password"
              type="password"
              label={editingUser ? 'Password (leave blank to keep current)' : 'Password'}
              required={!editingUser}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <select
                name="branch_id"
                defaultValue={editingUser?.branch_id || ''}
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
                defaultValue={editingUser?.status || 'active'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingUser ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingUser(null);
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

export default Users;
