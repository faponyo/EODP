import React, { useState, useMemo } from 'react';
import { UserPlus, Search, Mail, Phone, Building, Calendar, TicketIcon, Filter } from 'lucide-react';
import { Event, Attendee, Voucher } from '../types';
import { usePagination } from '../hooks/usePagination';
import { useSearch } from '../hooks/useSearch';
import Pagination from './Pagination';

interface AttendeeManagementProps {
  events: Event[];
  attendees: Attendee[];
  vouchers: Voucher[];
  onRegisterAttendee: (attendee: Omit<Attendee, 'id' | 'registeredAt' | 'voucherId'>) => void;
}

const AttendeeManagement: React.FC<AttendeeManagementProps> = ({
  events,
  attendees,
  vouchers,
  onRegisterAttendee,
  onApproveRegistration,
  onRejectRegistration,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [rejectingAttendee, setRejectingAttendee] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [formData, setFormData] = useState({
    eventId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
  });

  // Search functionality
  const { searchTerm, setSearchTerm, filteredData: searchedAttendees } = useSearch(
    attendees,
    ['name', 'email', 'department']
  );

  // Additional filtering
  const filteredAttendees = useMemo(() => {
    let filtered = searchedAttendees;

    if (selectedEvent) {
      filtered = filtered.filter(attendee => attendee.eventId === selectedEvent);
    }

    if (selectedDepartment) {
      filtered = filtered.filter(attendee => attendee.department === selectedDepartment);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(attendee => attendee.status === selectedStatus);
    }

    return filtered.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
  }, [searchedAttendees, selectedEvent, selectedDepartment, selectedStatus]);

  // Pagination
  const pagination = usePagination(50);
  const { paginatedData: paginatedAttendees, pagination: paginationInfo } = pagination.paginateData(filteredAttendees);

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = [...new Set(attendees.map(a => a.department).filter(Boolean))];
    return depts.sort();
  }, [attendees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if registration is allowed for the selected event
    if (!isEventRegistrationOpen(formData.eventId)) {
      alert('Registration is only allowed on the event day');
      return;
    }
    
    onRegisterAttendee(formData);
    setFormData({
      eventId: '',
      name: '',
      email: '',
      phone: '',
      department: '',
    });
    setShowForm(false);
    
    // Show success message for pending approval
    alert('Registration submitted successfully! Awaiting admin approval.');
  };

  const getEventName = (eventId: string) => {
    return events.find(e => e.id === eventId)?.name || 'Unknown Event';
  };

  const getAttendeeVoucher = (attendeeId: string) => {
    return vouchers.find(v => v.attendeeId === attendeeId);
  };

  const isEventRegistrationOpen = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return false;
    
    const eventDate = new Date(event.date);
    const today = new Date();
    
    // Set both dates to start of day for accurate comparison
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    return eventDate.getTime() === today.getTime();
  };

  const getRegistrationStatus = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return { canRegister: false, message: 'Event not found' };
    
    const eventDate = new Date(event.date);
    const today = new Date();
    
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    if (eventDate.getTime() === today.getTime()) {
      return { canRegister: true, message: 'Registration is open today!' };
    } else if (eventDate.getTime() > today.getTime()) {
      const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { 
        canRegister: false, 
        message: `Registration opens on ${eventDate.toLocaleDateString()} (${daysUntil} day${daysUntil === 1 ? '' : 's'} from now)` 
      };
    } else {
      return { canRegister: false, message: 'Registration has closed for this event' };
    }
  };

  // Reset pagination when filters change
  React.useEffect(() => {
    pagination.resetPage();
  }, [searchTerm, selectedEvent, selectedDepartment, selectedStatus]);

  const handleApprove = (attendeeId: string) => {
    onApproveRegistration(attendeeId);
  };

  const handleReject = (attendeeId: string) => {
    setRejectingAttendee(attendeeId);
  };

  const handleRejectSubmit = () => {
    if (rejectingAttendee && rejectionReason.trim()) {
      onRejectRegistration(rejectingAttendee, rejectionReason.trim());
      setRejectingAttendee(null);
      setRejectionReason('');
    }
  };

  const handleRejectCancel = () => {
    setRejectingAttendee(null);
    setRejectionReason('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingCount = attendees.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendee Management</h1>
          <p className="text-gray-600 mt-1">Register and manage event attendees</p>
          {pendingCount > 0 && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              {pendingCount} registration{pendingCount === 1 ? '' : 's'} pending approval
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Register Attendee</span>
        </button>
      </div>

      {/* Registration Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Register New Attendee</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Event *
              </label>
              <select
                required
                value={formData.eventId}
                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose an event...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} - {new Date(event.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john.doe@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Marketing"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                disabled={!formData.eventId || !isEventRegistrationOpen(formData.eventId)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Register Attendee
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    eventId: '',
                    name: '',
                    email: '',
                    phone: '',
                    department: '',
                  });
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Attendees</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by name, email, or department..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {(searchTerm || selectedEvent || selectedDepartment || selectedStatus !== 'all') && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredAttendees.length} of {attendees.length} attendees
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedEvent('');
                setSelectedDepartment('');
                setSelectedStatus('all');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Attendees List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Rejection Modal */}
        {rejectingAttendee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reject Registration
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please provide a reason for rejection..."
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This reason will be recorded for audit purposes
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleRejectSubmit}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Reject Registration
                </button>
                <button
                  onClick={handleRejectCancel}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Registered Attendees
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>Page {paginationInfo.page} of {pagination.totalPages(paginationInfo.total)}</span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {paginatedAttendees.length > 0 ? (
            paginatedAttendees.map((attendee) => {
              const voucher = getAttendeeVoucher(attendee.id);
              return (
                <div key={attendee.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{attendee.name}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {getEventName(attendee.eventId)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(attendee.status)}`}>
                          {attendee.status.charAt(0).toUpperCase() + attendee.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{attendee.email}</span>
                        </div>
                        {attendee.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>{attendee.phone}</span>
                          </div>
                        )}
                        {attendee.department && (
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>{attendee.department}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Registered: {new Date(attendee.registeredAt).toLocaleDateString()}</span>
                        {attendee.reviewedAt && (
                          <span className="ml-4">
                            • Reviewed: {new Date(attendee.reviewedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      {attendee.status === 'rejected' && attendee.rejectionReason && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong> {attendee.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      {attendee.status === 'pending' && user?.role === 'admin' && (
                        <div className="flex space-x-2 mb-4">
                          <button
                            onClick={() => handleApprove(attendee.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(attendee.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {voucher && attendee.status === 'approved' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 min-w-[200px]">
                          <div className="flex items-center justify-center mb-2">
                            <TicketIcon className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-sm font-medium text-green-800">Voucher Issued</span>
                          </div>
                          <div className="text-sm text-green-700">
                            <p className="font-mono text-center mb-2">{voucher.voucherNumber}</p>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Soft Drinks:</span>
                                <span className="font-medium">{voucher.softDrinks.claimed}/{voucher.softDrinks.total}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Hard Drinks:</span>
                                <span className="font-medium">{voucher.hardDrinks.claimed}/{voucher.hardDrinks.total}</span>
                              </div>
                            </div>
                            {voucher.isFullyClaimed && (
                              <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded text-center">
                                Fully Used
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {attendee.status === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 min-w-[200px] text-center">
                          <div className="text-sm font-medium text-yellow-800 mb-1">Awaiting Approval</div>
                          <div className="text-xs text-yellow-700">Voucher will be issued after approval</div>
                        </div>
                      )}
                      
                      {attendee.status === 'rejected' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 min-w-[200px] text-center">
                          <div className="text-sm font-medium text-red-800">Registration Rejected</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedEvent || selectedDepartment
                  ? "No attendees match your search criteria"
                  : "No attendees have been registered yet"
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredAttendees.length > 0 && (
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
};

export default AttendeeManagement;