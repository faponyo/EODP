import React, { useState } from 'react';
import { Calendar, MapPin, Users, CheckCircle } from 'lucide-react';
import { Event } from '../types';

interface EventSelectorProps {
  events: Event[];
  onEventSelect: (eventId: string) => void;
  onBackToLogin: () => void;
}

const EventSelector: React.FC<EventSelectorProps> = ({ events, onEventSelect, onBackToLogin }) => {
  const [selectedEventId, setSelectedEventId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEventId) {
      onEventSelect(selectedEventId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coop-600 via-coop-700 to-coop-800">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-coop-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Co-op Bank</h1>
                <p className="text-xs text-gray-600">Party Management System</p>
              </div>
            </div>
            <button
              onClick={onBackToLogin}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
              title="Back to Login"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Back to Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-coop-600 to-coop-700 px-8 py-6 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Select Event
              </h2>
              <p className="text-coop-100">
                Choose the event you want to access
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Events</h3>
                  
                  {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {events.map((event) => (
                        <label
                          key={event.id}
                          className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                            selectedEventId === event.id
                              ? 'border-coop-600 bg-coop-50'
                              : 'border-gray-200 hover:border-coop-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="event"
                            value={event.id}
                            checked={selectedEventId === event.id}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="sr-only"
                          />
                          
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-medium text-gray-900 mb-2 truncate">
                                {event.name}
                              </h4>
                              
                              <div className="space-y-2">
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
                                  <span>Max {event.maxAttendees} attendees</span>
                                </div>
                              </div>
                              
                              {event.description && (
                                <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                            </div>
                            
                            {selectedEventId === event.id && (
                              <div className="ml-4 flex-shrink-0">
                                <CheckCircle className="h-6 w-6 text-coop-600" />
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Available</h3>
                      <p className="text-gray-600">
                        No events have been assigned to your account. Please contact your administrator.
                      </p>
                    </div>
                  )}
                </div>

                {events.length > 0 && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!selectedEventId}
                      className="bg-gradient-to-r from-coop-600 to-coop-700 text-white py-3 px-8 rounded-lg font-semibold hover:from-coop-700 hover:to-coop-800 focus:ring-4 focus:ring-coop-300 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Continue to Dashboard
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSelector;