import React, {useState} from 'react';
import {Calendar, CheckCircle, MapPin, Users} from 'lucide-react';
import {Event} from '../types';
import PublicPage from "./PublicPage.tsx";

interface EventSelectorProps {
    events: Event[];
    onEventSelect: (eventId: string) => void;
    onBackToLogin: () => void;
}

const EventSelector: React.FC<EventSelectorProps> = ({events, onEventSelect, onBackToLogin}) => {
    const [selectedEventId, setSelectedEventId] = useState<number>(null);

    const safeEvents = events;


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedEventId) {


            const event = safeEvents.find(e => e.id == selectedEventId);

            onEventSelect(event);
        }
    };

    return (


        <PublicPage children={
            <>


                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-coop-600 to-coop-700 px-8 py-6 text-center">
                        <div
                            className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="h-8 w-8 text-white"/>
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

                                {safeEvents.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {safeEvents?.map((event) => (
                                            <label
                                                key={event.id}
                                                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                                                    selectedEventId == event.id
                                                        ? 'border-coop-600 bg-coop-50'
                                                        : 'border-gray-200 hover:border-coop-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="event"
                                                    value={event.id}
                                                    checked={selectedEventId == event.id}
                                                    onChange={(e) => setSelectedEventId(e.target.value)}
                                                    className="sr-only"
                                                />

                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-lg font-medium text-gray-900 mb-2 truncate">
                                                            {event.name}
                                                        </h4>

                                                        <div className="space-y-2">
                                                            <div
                                                                className="flex items-center text-sm text-gray-600">
                                                                <Calendar className="h-4 w-4 mr-2 flex-shrink-0"/>
                                                                <span>{`${new Date(event.date).toLocaleDateString()} - ${event.endDate && new Date(event.endDate).toLocaleDateString() || new Date(event.date).toLocaleDateString()} `}</span>
                                                            </div>
                                                            <div
                                                                className="flex items-center text-sm text-gray-600">
                                                                <MapPin className="h-4 w-4 mr-2 flex-shrink-0"/>
                                                                <span className="truncate">{event.location}</span>
                                                            </div>
                                                            <div
                                                                className="flex items-center text-sm text-gray-600">
                                                                <Users className="h-4 w-4 mr-2 flex-shrink-0"/>
                                                                <span>Max {event.maxAttendees} attendees</span>
                                                            </div>
                                                        </div>

                                                        {event.description && (
                                                            <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                                                                {event.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {selectedEventId == event.id && (
                                                        <div className="ml-4 flex-shrink-0">
                                                            <CheckCircle className="h-6 w-6 text-coop-600"/>
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4"/>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Events
                                            Available</h3>
                                        <p className="text-gray-600">
                                            No events have been assigned to your account. Please contact your
                                            administrator.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onBackToLogin}
                                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Back to Login
                                </button>
                                {events.length > 0 && (
                                    <>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={!selectedEventId}
                                                className="bg-gradient-to-r from-coop-600 to-coop-700 text-white py-3 px-8 rounded-lg font-semibold hover:from-coop-700 hover:to-coop-800 focus:ring-4 focus:ring-coop-300 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                            >
                                                Continue to Dashboard
                                            </button>
                                        </div>
                                    </>
                                )}


                            </div>


                        </form>
                    </div>
                </div>
            </>}/>


    );
};

export default EventSelector;