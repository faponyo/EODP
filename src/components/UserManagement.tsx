import React, { useState, useEffect, useMemo } from 'react';
import { UserPlus, Search, Mail, Shield, Calendar, Eye, EyeOff, Edit2, Save, X } from 'lucide-react';
import { User, Event } from '../types';
import { usePagination } from '../hooks/usePagination';
import { useSearch } from '../hooks/useSearch';
import Pagination from './Pagination';

interface UserManagementProps {
  events: Event[];
  onCreateUser: (user: Omit<User, 'id' | 'createdAt' | 'createdBy'>) => void;
  onUpdateUserStatus: (userId: string, status: 'active' | 'disabled') => void;
  onUpdateUser: (userId: string, userData: Partial<User>) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  events,
  onCreateUser,
  onUpdateUserStatus,
  onUpdateUser,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'internal' as 'admin' | 'internal' | 'external',
    status: 'active' as 'active' | 'disabled',
    assignedEventIds: [] as string[],
  });

  // Load users from localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);

  // Refresh users when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Search functionality
  const { searchTerm, setSearchTerm, filteredData: searchedUsers } = useSearch(
    users,
    ['name', 'email']
  );

  // Additional filtering
  const filteredUsers = useMemo(() => {
    let filtered = searchedUsers;

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [searchedUsers, selectedRole, selectedStatus]);

  // Pagination
  const pagination = usePagination(25);
  const { paginatedData: paginatedUsers, pagination: paginationInfo } = pagination.paginateData(filteredUsers);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      onUpdateUser(editingUser.id, formData);
      setEditingUser(null);
    } else {
      onCreateUser(formData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      role: 'internal',
      status: 'active',
      assignedEventIds: [],
    });
    setShowForm(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      assignedEventIds: user.assignedEventIds || [],
    });
    setShowForm(true);
  };

  const handleToggleStatus = (userId: string, currentStatus: 'active' | 'disabled') => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    onUpdateUserStatus(userId, newStatus);
    
    // Refresh users list
    setTimeout(() => {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
    }, 100);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'internal':
        return 'bg-blue-100 text-blue-800';
      case 'external':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Reset pagination when filters change
  React.useEffect(() => {
    pagination.resetPage();
  }, [searchTerm, selectedRole, selectedStatus]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Create and manage system users with role-based access</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Create User</span>
        </button>
      </div>

      {/* User Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingUser ? 'Edit User' : 'Create New User'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                  placeholder="john.doe@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => {
                    const role = e.target.value as 'admin' | 'internal' | 'external';
                    setFormData({ 
                      ...formData, 
                      role,
                      assignedEventIds: role === 'external' ? formData.assignedEventIds : []
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                >
                  <option value="internal">Internal User</option>
                  <option value="external">External User</option>
                  <option value="admin">Administrator</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.role === 'admin' && 'Full system access'}
                  {formData.role === 'internal' && 'Access to all events and data'}
                  {formData.role === 'external' && 'Limited to assigned events only'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'disabled' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>

            {formData.role === 'external' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Events *
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {events.map((event) => (
                    <label key={event.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.assignedEventIds.includes(event.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              assignedEventIds: [...formData.assignedEventIds, event.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              assignedEventIds: formData.assignedEventIds.filter(id => id !== event.id)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-coop-600 focus:ring-coop-500"
                      />
                      <span className="text-sm text-gray-700">
                        {event.name} - {new Date(event.date).toLocaleDateString()}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  External users can only access data for their assigned events
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-coop-600 text-white px-6 py-2 rounded-lg hover:bg-coop-700 transition-colors"
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                placeholder="Search by name or email..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="internal">Internal Users</option>
              <option value="external">External Users</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
        
        {(searchTerm || selectedRole !== 'all' || selectedStatus !== 'all') && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('all');
                setSelectedStatus('all');
              }}
              className="text-sm text-coop-600 hover:text-coop-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">System Users</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Page {paginationInfo.page} of {pagination.totalPages(paginationInfo.total)}</span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{user.email}</span>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </div>

                    {user.role === 'external' && user.assignedEventIds && user.assignedEventIds.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Assigned Events:</p>
                        <div className="flex flex-wrap gap-2">
                          {user.assignedEventIds.map(eventId => {
                            const event = events.find(e => e.id === eventId);
                            return event ? (
                              <span key={eventId} className="inline-flex items-center px-2 py-1 bg-coop-50 text-coop-700 rounded-full text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                {event.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 lg:mt-0 lg:ml-6 flex space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="bg-coop-100 text-coop-700 px-3 py-2 rounded-lg hover:bg-coop-200 transition-colors flex items-center space-x-1 text-sm"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 text-sm ${
                        user.status === 'active'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {user.status === 'active' ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          <span>Disable</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          <span>Enable</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all'
                  ? "No users match your search criteria"
                  : "No users have been created yet"
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <Pagination
            currentPage={paginationInfo.page}
            totalPages={pagination.totalPages(paginationInfo.total)}
            pageSize={paginationInfo.pageSize}
            totalItems={paginationInfo.total}
            onPageChange={pagination.goToPage}
            onPageSizeChange={(newPageSize) => {
              pagination.setPageSize(newPageSize);
              pagination.resetPage();
            }}
          />
        )}
      </div>

      {/* Role Descriptions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role Descriptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Administrator</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Full system access</li>
              <li>• Create and manage events</li>
              <li>• Manage all users</li>
              <li>• Access all reports</li>
              <li>• Claim vouchers</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Internal User</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• View all events</li>
              <li>• Register attendees</li>
              <li>• View all vouchers</li>
              <li>• Access reports</li>
              <li>• Claim vouchers</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">External User</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• View assigned events only</li>
              <li>• Register attendees for assigned events</li>
              <li>• View vouchers for assigned events</li>
              <li>• Claim vouchers for assigned events</li>
              <li>• Limited reporting access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;