import React, { useState } from 'react';
import { Calendar, MapPin, Users, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { Event, Attendee } from '../types';
import { useAuth } from '../hooks/useAuth';

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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    maxAttendees: 100,
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
    });
    setShowForm(false);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      date: event.date,
      location: event.location,
      description: event.description,
      maxAttendees: event.maxAttendees,
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
    });
  };

  const getEventAttendees = (eventId: string) => {
    return attendees.filter(a => a.eventId === eventId);
  };

  const EventDetailsModal = () => {
    if (!selectedEvent) return null;

    const eventAttendees = getEventAttendees(selectedEvent.id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{selectedEvent.name}</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="font-medium">Date</span>
                </div>
                <p className="text-gray-900">{new Date(selectedEvent.date).toLocaleDateString()}</p>
              </div>
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="font-medium">Location</span>
                </div>
                <p className="text-gray-900">{selectedEvent.location}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{selectedEvent.description}</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Attendees ({eventAttendees.length}/{selectedEvent.maxAttendees})</h3>
                <div className="text-sm text-gray-600">
                  {eventAttendees.filter(a => a.status === 'approved').length} approved, {eventAttendees.filter(a => a.status === 'pending').length} pending
                </div>
              </div>
              {eventAttendees.length > 0 ? (
                <div>
                  {(() => {
                    const eventDate = new Date(selectedEvent.date);
                    const today = new Date();
                    eventDate.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);
                    const approvedAttendees = eventAttendees.filter(a => a.status === 'approved');
                    const pendingAttendees = eventAttendees.filter(a => a.status === 'pending');
                    const isToday = eventDate.getTime() === today.getTime();
                    
                    return isToday && (
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Registration Open
                        </span>
                        {pendingAttendees.length > 0 && (
                          <p className="text-xs text-yellow-600 mt-1">
                            {pendingAttendees.length} pending approval
                          </p>
                        )}
                      </div>
                    );
                  })()}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {eventAttendees.filter(a => a.status === 'approved').length.toLocaleString()} / {selectedEvent.maxAttendees.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">Approved</p>
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (eventAttendees.filter(a => a.status === 'approved').length / selectedEvent.maxAttendees) * 100 > 90 ? 'bg-red-500' : 
                          (eventAttendees.filter(a => a.status === 'approved').length / selectedEvent.maxAttendees) * 100 > 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((eventAttendees.filter(a => a.status === 'approved').length / selectedEvent.maxAttendees) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {eventAttendees.slice(0, 10).map((attendee) => (
                      <div key={attendee.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{attendee.name}</p>
                          <p className="text-sm text-gray-600">{attendee.email}</p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            attendee.status === 'approved' ? 'bg-green-100 text-green-800' :
                            attendee.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {attendee.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {eventAttendees.length > 10 && (
                      <p className="text-center text-gray-500">And {eventAttendees.length - 10} more...</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No attendees registered yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Event</span>
          </button>
        )}
      </div>

      {/* Event Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Grand Ballroom, Hotel Plaza"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Join us for an evening of celebration..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const eventAttendees = getEventAttendees(event.id);
          const isUpcoming = new Date(event.date) > new Date();
          
          return (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{event.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isUpcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {isUpcoming ? 'Upcoming' : 'Past'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{eventAttendees.filter(a => a.status === 'approved').length} / {event.maxAttendees} approved</span>
                  </div>
                  {eventAttendees.filter(a => a.status === 'pending').length > 0 && (
                    <div className="flex items-center text-sm text-yellow-600">
                      <span>{eventAttendees.filter(a => a.status === 'pending').length} pending approval</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: \`${(eventAttendees.filter(a => a.stat\us === 'approved').length / event.maxAttendees) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  {user?.role === 'admin' && (
                    <>
                      <button
                        onClick={() => handleEdit(event)}
                        className="bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this event?')) {
                            onDeleteEvent(event.id);
                          }
                        }}
                        className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events created yet</h3>
          <p className="text-gray-600">
            {user?.role === 'admin' 
              ? "Create your first event to get started" 
              : "No events are currently available for registration"
            }
          </p>
        </div>
      )}

      <EventDetailsModal />
    </div>
  );
};

export default EventManagement;