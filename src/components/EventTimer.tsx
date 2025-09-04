import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { useEventTimer } from '../hooks/useEventTimer';

interface EventTimerProps {
  eventDate: string;
  eventName: string;
  compact?: boolean;
}

const EventTimer: React.FC<EventTimerProps> = ({ eventDate, eventName, compact = false }) => {
  const timeRemaining = useEventTimer(eventDate);

  if (timeRemaining.isExpired) {
    return (
      <div className={`flex items-center ${compact ? 'text-sm' : ''}`}>
        <Calendar className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-gray-500 mr-2`} />
        <span className="text-gray-500 font-medium">Event Started</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center text-sm">
        <Clock className="h-4 w-4 text-coop-600 mr-2" />
        <span className="text-coop-700 font-medium">
          {timeRemaining.days > 0 && `${timeRemaining.days}d `}
          {timeRemaining.hours > 0 && `${timeRemaining.hours}h `}
          {timeRemaining.minutes > 0 && `${timeRemaining.minutes}m `}
          {timeRemaining.days === 0 && timeRemaining.hours === 0 && `${timeRemaining.seconds}s`}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-coop-50 to-coop-100 rounded-lg p-4 border border-coop-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-coop-600 mr-2" />
          <span className="font-medium text-coop-900">Time Until Event</span>
        </div>
        <span className="text-xs text-coop-700 bg-coop-200 px-2 py-1 rounded-full">
          {eventName}
        </span>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-coop-200">
            <div className="text-2xl font-bold text-coop-700">{timeRemaining.days}</div>
            <div className="text-xs text-coop-600 font-medium">Days</div>
          </div>
        </div>
        <div className="text-center">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-coop-200">
            <div className="text-2xl font-bold text-coop-700">{timeRemaining.hours}</div>
            <div className="text-xs text-coop-600 font-medium">Hours</div>
          </div>
        </div>
        <div className="text-center">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-coop-200">
            <div className="text-2xl font-bold text-coop-700">{timeRemaining.minutes}</div>
            <div className="text-xs text-coop-600 font-medium">Minutes</div>
          </div>
        </div>
        <div className="text-center">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-coop-200">
            <div className="text-2xl font-bold text-coop-700">{timeRemaining.seconds}</div>
            <div className="text-xs text-coop-600 font-medium">Seconds</div>
          </div>
        </div>
      </div>
      
      {timeRemaining.days === 0 && timeRemaining.hours === 0 && timeRemaining.minutes < 30 && (
        <div className="mt-3 p-2 bg-coop-600 text-white rounded-lg text-center">
          <span className="text-sm font-medium">Event starting soon!</span>
        </div>
      )}
    </div>
  );
};

export default EventTimer;