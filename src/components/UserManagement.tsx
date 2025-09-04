import React, { useState, useEffect, useMemo } from 'react';
import { UserPlus, Search, Mail, Shield, Calendar, Eye, EyeOff, Edit2, Save, X, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { User, Event } from '../types';
import { usePagination } from '../hooks/usePagination';
import { useSearch } from '../hooks/useSearch';
import Pagination from './Pagination';
import { lookupUserByPFForUserManagement } from '../services/userService';

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
  const [userType, setUserType] = useState<'internal' | 'external' | 'subsidiary'>('internal');
  const [isRetrievingUser, setIsRetrievingUser] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupSuccess, setLookupSuccess] = useState(false);
  const [formData, setFormData] = useState({
    pfNumber: '',
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
    
    // For Internal/Subsidiary users, ensure PF lookup was successful
    if ((userType === 'internal' || userType === 'subsidiary') && !lookupSuccess) {
      alert('Please retrieve employee details using PF Number first');
      return;
    }
    
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
      pfNumber: '',
      email: '',
      name: '',
      role: 'internal',
      status: 'active',
      assignedEventIds: [],
    });
    setUserType('internal');
    setLookupError('');
    setLookupSuccess(false);
    setShowForm(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setUserType('internal'); // Default for editing
    setLookupSuccess(true); // Show fields as already populated
    setFormData({
      pfNumber: '',
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      assignedEventIds: user.assignedEventIds || [],
    });
    setShowForm(true);
  };

  const handlePFLookup = async () => {
    if (!formData.pfNumber.trim()) {
      setLookupError('');
      setLookupSuccess(false);
      return;
    }

    setIsRetrievingUser(true);
    setLookupError('');
    setLookupSuccess(false);

    try {
      const result = await lookupUserByPFForUserManagement(formData.pfNumber.trim());
      
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          name: result.data!.name,
          department: result.data!.department || prev.department,
          email: result.data!.email,
        }));
        setLookupSuccess(true);
        setLookupError('');
      } else {
        setLookupError(result.error || 'User not found');
        setLookupSuccess(false);
        // Clear fields on error
        setFormData(prev => ({
          ...prev,
          name: '',
          email: '',
          department: '',
        }));
      }
    } catch (error) {
      setLookupError('Failed to lookup user details');
      setLookupSuccess(false);
    } finally {
      setIsRetrievingUser(false);
    }
  };

  const handlePFNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pfNumber = e.target.value;
    setFormData({ ...formData, pfNumber });
    
    // Clear previous lookup state and other fields when PF number changes
    if (pfNumber !== formData.pfNumber) {
      setLookupError('');
      setLookupSuccess(false);
      setFormData(prev => ({
        ...prev,
        pfNumber,
        name: '',
        email: '',
        department: '',
      }));
    }
  };

  const handleUserTypeChange = (type: 'internal' | 'external' | 'subsidiary') => {
    setUserType(type);
    setLookupError('');
    setLookupSuccess(false);
    
    // Reset form data and set appropriate role
    setFormData({
      pfNumber: '',
      email: '',
      name: '',
      role: type === 'external' ? 'external' : 'internal',
      status: 'active',
      assignedEventIds: type === 'external' ? [] : [],
    });
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
        return 'bg-coop-red-100 text-coop-red-800';
      case 'internal':
        return 'bg-coop-blue-100 text-coop-blue-800';
      case 'external':
        return 'bg-coop-100 text-coop-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-coop-100 text-coop-800' 
      : 'bg-coop-red-100 text-coop-red-800';
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingUser ? 'Edit User' : 'Create New User'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['internal', 'external', 'subsidiary'] as const).map((type) => (
                    <label
                      key={type}
                      className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 ${
                        userType === type
                          ? 'border-coop-600 bg-coop-50'
                          : 'border-gray-200 hover:border-coop-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={type}
                        checked={userType === type}
                        onChange={(e) => handleUserTypeChange(e.target.value as 'internal' | 'external' | 'subsidiary')}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="font-medium text-gray-900 capitalize">{type}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {type === 'internal' && 'Company Employee'}
                          {type === 'external' && 'External Partner'}
                          {type === 'subsidiary' && 'Subsidiary Employee'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* PF Number Lookup for Internal/Subsidiary */}
              {(userType === 'internal' || userType === 'subsidiary') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PF Number *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      value={formData.pfNumber}
                      onChange={handlePFNumberChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                      placeholder="Enter PF Number (e.g., PF011)"
                    />
                    <button
                      type="button"
                      onClick={handlePFLookup}
                      disabled={!formData.pfNumber.trim() || isRetrievingUser}
                      className="bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isRetrievingUser ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      <span>{isRetrievingUser ? 'Retrieving...' : 'Retrieve'}</span>
                    </button>
                  </div>
                  
                  {lookupError && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {lookupError}
                    </p>
                  )}
                  {lookupSuccess && (
                    <p className="text-green-600 text-sm mt-1 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Employee details retrieved successfully
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Enter employee PF number and click Retrieve to auto-fill details
                  </p>
                </div>
              )}

              {/* User Details - Show for External or after successful PF lookup */}
              {(userType === 'external' || lookupSuccess || editingUser) && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  {lookupSuccess && !editingUser && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <h3 className="font-medium text-green-900">Employee Details Retrieved</h3>
                      </div>
                    </div>
                  )}

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
                    readOnly={(userType === 'internal' || userType === 'subsidiary') && lookupSuccess && !editingUser}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 ${
                      (userType === 'internal' || userType === 'subsidiary') && lookupSuccess && !editingUser
                        ? 'border-green-300 bg-green-50 cursor-not-allowed text-green-900'
                        : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {(userType === 'internal' || userType === 'subsidiary') && lookupSuccess && !editingUser && (
                    <p className="text-xs text-green-600 mt-1">Retrieved from employee directory</p>
                  )}
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
                    readOnly={(userType === 'internal' || userType === 'subsidiary') && lookupSuccess && !editingUser}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 ${
                      (userType === 'internal' || userType === 'subsidiary') && lookupSuccess && !editingUser
                        ? 'border-green-300 bg-green-50 cursor-not-allowed text-green-900'
                        : 'border-gray-300'
                    }`}
                    placeholder="john.doe@company.com"
                  />
                  {(userType === 'internal' || userType === 'subsidiary') && lookupSuccess && !editingUser && (
                    <p className="text-xs text-green-600 mt-1">Retrieved from employee directory</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  readOnly={(userType === 'internal' || userType === 'subsidiary') && lookupSuccess && !editingUser}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 ${
                    (userType === 'internal' || userType === 'subsidiary') && lookupSuccess && !editingUser
                      ? 'border-green-300 bg-green-50 cursor-not-allowed text-green-900'
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., Human Resources, Finance"
                />
                {(userType === 'internal' || userType === 'subsidiary') && lookupSuccess && !editingUser && (
                  <p className="text-xs text-green-600 mt-1">Retrieved from employee directory</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  {userType === 'external' ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <span className="text-gray-900">External User</span>
                      <p className="text-sm text-gray-600 mt-1">Role automatically set for external users</p>
                    </div>
                  ) : (
                    <select
                    required
                    value={formData.role}
                    onChange={(e) => {
                      const role = e.target.value as 'admin' | 'internal' | 'external';
                      setFormData({ 
                        ...formData, 
                        role,
                        assignedEventIds: []
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                  >
                    <option value="internal">Internal User</option>
                    <option value="admin">Administrator</option>
                  </select>
                  )}
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

              {userType === 'external' && (
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
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                    setUserType('internal');
                    setLookupSuccess(false);
                    resetForm();
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    (userType === 'internal' || userType === 'subsidiary') && !lookupSuccess && !editingUser
                  }
                  className="bg-coop-600 text-white px-6 py-2 rounded-lg hover:bg-coop-700 transition-colors"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
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
                          ? 'bg-coop-red-100 text-coop-red-700 hover:bg-coop-red-200'
                          : 'bg-coop-100 text-coop-700 hover:bg-coop-200'
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
