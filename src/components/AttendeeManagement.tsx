import React, { useState } from 'react';
import { UserPlus, Search, Mail, Phone, Building, Calendar, TicketIcon } from 'lucide-react';
import { Event, Attendee, Voucher } from '../types';

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
}) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [formData, setFormData] = useState({
    eventId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegisterAttendee(formData);
    setFormData({
      eventId: '',
      name: '',
      email: '',
      phone: '',
      department: '',
    });
    setShowForm(false);
  };

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          attendee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEvent === '' || attendee.eventId === selectedEvent;
    return matchesSearch && matchesEvent;
  });

  const getEventName = (eventId: string) => {
    return events.find(e => e.id === eventId)?.name || 'Unknown Event';
  };

  const getAttendeeVoucher = (attendeeId: string) => {
    return vouchers.find(v => v.attendeeId === attendeeId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendee Management</h1>
          <p className="text-gray-600 mt-1">Register and manage event attendees</p>
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
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Attendees</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by name or email..."
              />
            </div>
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
        </div>
      </div>

      {/* Attendees List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Registered Attendees ({filteredAttendees.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredAttendees.length > 0 ? (
            filteredAttendees.map((attendee) => {
              const voucher = getAttendeeVoucher(attendee.id);
              return (
                <div key={attendee.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{attendee.name}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {getEventName(attendee.eventId)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{attendee.email}</span>
                        </div>
                        {attendee.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{attendee.phone}</span>
                          </div>
                        )}
                        {attendee.department && (
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            <span>{attendee.department}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Registered: {new Date(attendee.registeredAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-6 text-right">
                      {voucher && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-center mb-2">
                            <TicketIcon className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-sm font-medium text-green-800">Voucher Issued</span>
                          </div>
                          <div className="text-sm text-green-700">
                            <p className="font-mono">{voucher.voucherNumber}</p>
                            <div className="mt-1 space-y-1">
                              <div className="flex justify-between">
                                <span>Soft Drinks:</span>
                                <span>{voucher.softDrinks.claimed}/{voucher.softDrinks.total}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Hard Drinks:</span>
                                <span>{voucher.hardDrinks.claimed}/{voucher.hardDrinks.total}</span>
                              </div>
                            </div>
                            {voucher.isFullyClaimed && (
                              <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Fully Used
                              </div>
                            )}
                          </div>
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
                {searchTerm || selectedEvent
                  ? "No attendees match your search criteria"
                  : "No attendees have been registered yet"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendeeManagement;