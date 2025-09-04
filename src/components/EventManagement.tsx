import React, { useState } from 'react';
import { Calendar, MapPin, Users, Plus, Edit2, Trash2, Eye, TicketIcon, X } from 'lucide-react';
import { Event, Attendee } from '../types';
import { useAuth } from '../hooks/useAuth';
import { usePagination } from '../hooks/usePagination';
import { useSearch } from '../hooks/useSearch';
import Pagination from './Pagination';
import EventTimer from './EventTimer';

interface EventManagementProps {
  events: Event[];
  attendees: Attendee[];
  onCreateEvent: (event: Omit<Event, 'id' | 'createdAt' | 'createdBy'>) => void;
  onUpdateEvent: (id: string, event: Partial<Event>) => void;
  onDeleteEvent: (id: string) => void;
}

const EventManagement: React.FC<EventManagementProps> = ({
  events,
  attendees,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
}) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'attendees'>('list');
  const [selectedEventForView, setSelectedEventForView] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    maxAttendees: 100,
    hasVouchers: false,
    voucherCategories: [] as Array<{
      id: string;
      name: string;
      numberOfItems: number;
      value: number;
    }>,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEvent) {
      onUpdateEvent(editingEvent.id, formData);
      setEditingEvent(null);
    } else {
      onCreateEvent(formData);
    }
    
    setFormData({
      name: '',
      date: '',
      location: '',
      description: '',
      maxAttendees: 100,
      hasVouchers: false,
      voucherCategories: [],
    });
    setShowForm(false);
  };

  // Search functionality for attendees
  const { searchTerm, setSearchTerm, filteredData: searchedAttendees } = useSearch(
    attendees,
    ['name', 'email', 'department']
  );

  // Filter attendees for viewing modal
  const viewModalAttendees = React.useMemo(() => {
    if (!selectedEventForView?.id) return [];
    
    let filtered = searchedAttendees.filter(att => att.eventId === selectedEventForView.id);
    return filtered.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
  }, [searchedAttendees, selectedEventForView?.id]);

  // Pagination
  const pagination = usePagination(50);
  const { paginatedData: paginatedAttendees, pagination: paginationInfo } = pagination.paginateData(viewModalAttendees);

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      date: event.date,
      location: event.location,
      description: event.description,
      maxAttendees: event.maxAttendees,
      hasVouchers: event.hasVouchers || false,
      voucherCategories: event.voucherCategories || [],
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormData({
      name: '',
      date: '',
      location: '',
      description: '',
      maxAttendees: 100,
      hasVouchers: false,
      voucherCategories: [],
    });
  };

  const addVoucherCategory = () => {
    const newCategory = {
      id: Date.now().toString(),
      name: '',
      numberOfItems: 1,
      value: 0,
    };
    setFormData({
      ...formData,
      voucherCategories: [...formData.voucherCategories, newCategory],
    });
  };

  const removeVoucherCategory = (categoryId: string) => {
    setFormData({
      ...formData,
      voucherCategories: formData.voucherCategories.filter(cat => cat.id !== categoryId),
    });
  };

  const updateVoucherCategory = (categoryId: string, field: string, value: string | number) => {
    setFormData({
      ...formData,
      voucherCategories: formData.voucherCategories.map(cat =>
        cat.id === categoryId ? { ...cat, [field]: value } : cat
      ),
    });
  };

  const getEventAttendees = (eventId: string) => {
    return attendees.filter(a => a.eventId === eventId);
  };

  const handleViewAttendees = (event: Event) => {
    setSelectedEventForView(event);
    setCurrentView('attendees');
    setSearchTerm(''); // Reset search when opening view
    pagination.resetPage(); // Reset pagination
  };

  const handleBackToEvents = () => {
    setCurrentView('list');
    setSelectedEventForView(null);
    setSearchTerm('');
    pagination.resetPage();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-coop-yellow-100 text-coop-yellow-800';
      case 'approved':
        return 'bg-coop-100 text-coop-800';
      case 'rejected':
        return 'bg-coop-red-100 text-coop-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render attendee view page
  if (currentView === 'attendees' && selectedEventForView) {
    const eventAttendees = getEventAttendees(selectedEventForView.id);
    const approvedCount = eventAttendees.filter(a => a.status === 'approved').length;
    const pendingCount = eventAttendees.filter(a => a.status === 'pending').length;
    const rejectedCount = eventAttendees.filter(a => a.status === 'rejected').length;

    return (
      <div className="space-y-6">
        {/* Header with back navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToEvents}
            className="flex items-center space-x-2 text-coop-600 hover:text-coop-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Events</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedEventForView.name}</h1>
            <p className="text-gray-600 mt-1">
              {new Date(selectedEventForView.date).toLocaleDateString()} • {selectedEventForView.location} • {viewModalAttendees.length} attendees
            </p>
          </div>
        </div>

        {/* Event Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-coop-50 p-3 rounded-lg">
                <Users className="h-6 w-6 text-coop-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{eventAttendees.length}</p>
                <p className="text-sm text-gray-600">Total Registered</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-coop-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-coop-700" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-coop-yellow-50 p-3 rounded-lg">
                <Users className="h-6 w-6 text-coop-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-coop-red-50 p-3 rounded-lg">
                <Users className="h-6 w-6 text-coop-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search attendees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Capacity: {approvedCount} / {selectedEventForView.maxAttendees}
            </div>
          </div>
        </div>

        {/* Attendees List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Event Attendees</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>Page {paginationInfo.page} of {pagination.totalPages(paginationInfo.total)}</span>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {paginatedAttendees.length > 0 ? (
              paginatedAttendees.map((attendee) => (
                <div key={attendee.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{attendee.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(attendee.status)}`}>
                          {attendee.status.charAt(0).toUpperCase() + attendee.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <span className="font-medium w-20">Email:</span>
                            <span>{attendee.email}</span>
                          </div>
                          {attendee.phone && (
                            <div className="flex items-center">
                              <span className="font-medium w-20">Phone:</span>
                              <span>{attendee.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          {attendee.department && (
                            <div className="flex items-center">
                              <span className="font-medium w-20">Department:</span>
                              <span>{attendee.department}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <span className="font-medium w-20">Registered:</span>
                            <span>{new Date(attendee.registeredAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      {attendee.status === 'rejected' && attendee.rejectionReason && (
                        <div className="mt-3 p-3 bg-coop-red-50 border border-coop-red-200 rounded-lg">
                          <p className="text-sm text-coop-red-800">
                            <strong>Rejection Reason:</strong> {attendee.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees found</h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "No attendees match your search criteria"
                    : "No attendees have been registered for this event yet"
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {viewModalAttendees.length > 0 && (
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600 mt-1">Create and manage company events</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Event</span>
          </button>
        )}
      </div>

      {/* Event Form */}
      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                    placeholder="End of Year Party 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                    placeholder="Conference Hall A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attendees *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                  placeholder="Event description..."
                />
              </div>

              {/* Voucher Section */}
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="hasVouchers"
                    checked={formData.hasVouchers}
                    onChange={(e) => setFormData({ ...formData, hasVouchers: e.target.checked })}
                    className="rounded border-gray-300 text-coop-600 focus:ring-coop-500"
                  />
                  <label htmlFor="hasVouchers" className="text-sm font-medium text-gray-700">
                    This event includes vouchers
                  </label>
                </div>

                {formData.hasVouchers && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Voucher Categories</h4>
                      <button
                        type="button"
                        onClick={addVoucherCategory}
                        className="text-coop-600 hover:text-coop-700 text-sm flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Category</span>
                      </button>
                    </div>

                    {formData.voucherCategories.map((category) => (
                      <div key={category.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-gray-700">Category {formData.voucherCategories.indexOf(category) + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeVoucherCategory(category.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Category Name
                            </label>
                            <input
                              type="text"
                              value={category.name}
                              onChange={(e) => updateVoucherCategory(category.id, 'name', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-coop-500 focus:border-coop-500"
                              placeholder="e.g., Food Voucher"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Number of Items
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={category.numberOfItems}
                              onChange={(e) => updateVoucherCategory(category.id, 'numberOfItems', parseInt(e.target.value))}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-coop-500 focus:border-coop-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Value (R)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={category.value}
                              onChange={(e) => updateVoucherCategory(category.id, 'value', parseFloat(e.target.value))}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-coop-500 focus:border-coop-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-coop-600 text-white rounded-lg hover:bg-coop-700 transition-colors"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="grid gap-6">
        {events.length > 0 ? (
          events.map((event) => {
            const eventAttendees = getEventAttendees(event.id);
            const approvedCount = eventAttendees.filter(a => a.status === 'approved').length;
            const isUpcoming = new Date(event.date) > new Date();
            
            return (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                      {(() => {
                        const eventDate = new Date(event.date);
                        const today = new Date();
                        const isToday = eventDate.toDateString() === today.toDateString();
                        const isPast = eventDate < today && !isToday;
                        const isUpcoming = eventDate > today;
                        
                        if (isToday) {
                          return (
                            <span className="px-2 py-1 bg-coop-600 text-white text-xs font-medium rounded-full animate-pulse">
                              Today
                            </span>
                          );
                        } else if (isUpcoming) {
                          return (
                            <span className="px-2 py-1 bg-coop-100 text-coop-800 text-xs font-medium rounded-full">
                              Upcoming
                            </span>
                          );
                        } else if (isPast) {
                          return (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                              Past
                            </span>
                          );
                        }
                        return null;
                      })()}
                      {event.hasVouchers && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full flex items-center space-x-1">
                          <TicketIcon className="h-3 w-3" />
                          <span>Vouchers</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{approvedCount} / {event.maxAttendees} attendees</span>
                      </div>
                    </div>
                   
                   {/* Attendee Status Breakdown */}
                   {eventAttendees.length > 0 && (
                     <div className="mb-4">
                       <div className="flex items-center space-x-4 text-sm">
                         <div className="flex items-center space-x-1">
                           <div className="w-2 h-2 bg-coop-600 rounded-full"></div>
                           <span className="text-gray-600">Approved: {approvedCount}</span>
                         </div>
                         {eventAttendees.filter(a => a.status === 'pending').length > 0 && (
                           <div className="flex items-center space-x-1">
                             <div className="w-2 h-2 bg-coop-yellow-500 rounded-full"></div>
                             <span className="text-gray-600">Pending: {eventAttendees.filter(a => a.status === 'pending').length}</span>
                           </div>
                         )}
                         {eventAttendees.filter(a => a.status === 'rejected').length > 0 && (
                           <div className="flex items-center space-x-1">
                             <div className="w-2 h-2 bg-coop-red-500 rounded-full"></div>
                             <span className="text-gray-600">Rejected: {eventAttendees.filter(a => a.status === 'rejected').length}</span>
                           </div>
                         )}
                       </div>
                     </div>
                   )}
                    
                    {event.description && (
                      <p className="text-gray-600 mb-4">{event.description}</p>
                    )}

                    {/* Event Timer for upcoming events */}
                    {(() => {
                      const eventDate = new Date(event.date);
                      const today = new Date();
                      const isToday = eventDate.toDateString() === today.toDateString();
                      const isUpcoming = eventDate > today;
                      
                      return (isUpcoming || isToday);
                    })() && (
                      <div className="mb-4">
                        <EventTimer eventDate={event.date} eventName={event.name} />
                      </div>
                    )}

                    {/* Voucher Categories Display */}
                    {event.hasVouchers && event.voucherCategories && event.voucherCategories.length > 0 && (
                      <div className="mb-4">
                       <div className="flex items-center space-x-2 mb-3">
                         <TicketIcon className="h-4 w-4 text-purple-600" />
                         <h4 className="text-sm font-medium text-gray-700">Voucher Categories</h4>
                       </div>
                        <div className="flex flex-wrap gap-2">
                          {event.voucherCategories.map((category) => (
                           <div key={category.id} className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-sm">
                              <span className="font-medium text-purple-800">{category.name}</span>
                             <div className="text-purple-600 text-xs mt-1">
                               <span>{category.numberOfItems} item{category.numberOfItems !== 1 ? 's' : ''}</span>
                               <span className="mx-1">•</span>
                               <span>R{category.value.toFixed(2)} each</span>
                               <span className="mx-1">•</span>
                               <span className="font-medium">Total: R{(category.numberOfItems * category.value).toFixed(2)}</span>
                             </div>
                            </div>
                          ))}
                        </div>
                       <div className="mt-2 text-xs text-gray-500">
                         Total voucher value per attendee: R{event.voucherCategories.reduce((sum, cat) => sum + (cat.numberOfItems * cat.value), 0).toFixed(2)}
                       </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewAttendees(event)}
                      className="p-2 text-gray-600 hover:text-coop-600 hover:bg-coop-50 rounded-lg transition-colors"
                      title="View Attendees"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {user?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-2 text-gray-600 hover:text-coop-600 hover:bg-coop-50 rounded-lg transition-colors"
                          title="Edit Event"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteEvent(event.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-6">Create your first event to get started</p>
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Event</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;