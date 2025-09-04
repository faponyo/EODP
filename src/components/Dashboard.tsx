import React, { useMemo } from 'react';
import { Calendar, Users, TicketIcon, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Event, Attendee, Voucher } from '../types';
import EventTimer from './EventTimer';

interface DashboardProps {
  events: Event[];
  attendees: Attendee[];
  vouchers: Voucher[];
}

const Dashboard: React.FC<DashboardProps> = ({ events, attendees, vouchers }) => {
  // Memoize expensive calculations for performance
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const totalAttendees = attendees.length;
    const approvedAttendees = attendees.filter(a => a.status === 'approved').length;
    const pendingAttendees = attendees.filter(a => a.status === 'pending').length;
    const totalVouchers = vouchers.length;
    const claimedVouchers = vouchers.filter(v => v.isFullyClaimed).length;
    const totalDrinksClaimed = vouchers.reduce(
      (sum, v) => sum + v.softDrinks.claimed + v.hardDrinks.claimed, 
      0
    );

    return {
      totalEvents,
      totalAttendees,
      approvedAttendees,
      pendingAttendees,
      totalVouchers,
      claimedVouchers,
      totalDrinksClaimed,
    };
  }, [events, attendees, vouchers]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => new Date(e.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5); // Limit to 5 for performance
  }, [events]);

  const recentAttendees = useMemo(() => {
    return attendees
      .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
      .slice(0, 10); // Limit to 10 for performance
  }, [attendees]);

  // Performance alerts for large datasets
  const performanceAlerts = useMemo(() => {
    const alerts = [];
    
    if (attendees.length > 1000) {
      alerts.push({
        type: 'info',
        message: `Managing ${attendees.length.toLocaleString()} attendees - pagination is active for optimal performance`,
      });
    }
    
    if (vouchers.length > 1000) {
      alerts.push({
        type: 'info',
        message: `Tracking ${vouchers.length.toLocaleString()} vouchers - using optimized display`,
      });
    }

    if (attendees.length > 5000) {
      alerts.push({
        type: 'warning',
        message: 'Large dataset detected - consider archiving old events for better performance',
      });
    }

    return alerts;
  }, [attendees.length, vouchers.length]);

  const dashboardStats = [
    {
      name: 'Total Events',
      value: stats.totalEvents.toLocaleString(),
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-coop-50',
      iconColor: 'text-coop-600',
    },
    {
      name: 'Approved Attendees',
      value: stats.approvedAttendees.toLocaleString(),
      icon: Users,
      color: 'purple',
      bgColor: 'bg-coop-blue-50',
      iconColor: 'text-coop-blue-600',
    },
    {
      name: 'Active Vouchers',
      value: stats.totalVouchers.toLocaleString(),
      icon: TicketIcon,
      color: 'green',
      bgColor: 'bg-coop-100',
      iconColor: 'text-coop-700',
    },
    {
      name: 'Drinks Claimed',
      value: stats.totalDrinksClaimed.toLocaleString(),
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'bg-coop-orange-50',
      iconColor: 'text-coop-orange-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your party management dashboard</p>
      </div>

      {/* Performance Alerts */}
      {performanceAlerts.length > 0 && (
        <div className="space-y-3">
          {performanceAlerts.map((alert, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${
                alert.type === 'warning' 
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{alert.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-coop-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              </div>
              {upcomingEvents.length > 5 && (
                <span className="text-sm text-gray-500">Showing 5 of {upcomingEvents.length}</span>
              )}
            </div>
          </div>
          <div className="p-6">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => {
                  const eventAttendees = attendees.filter(a => a.eventId === event.id);
                  const capacityPercentage = (eventAttendees.length / event.maxAttendees) * 100;
                  
                  return (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{event.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{event.location}</p>
                        <div className="mt-2">
                          <EventTimer eventDate={event.date} eventName={event.name} compact />
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {eventAttendees.length.toLocaleString()} / {event.maxAttendees.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">Attendees</p>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-coop-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming events scheduled</p>
            )}
          </div>
        </div>

        {/* Recent Attendees */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-coop-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Registrations</h2>
              </div>
              {recentAttendees.length >= 10 && (
                <span className="text-sm text-gray-500">Latest 10</span>
              )}
            </div>
          </div>
          <div className="p-6">
            {recentAttendees.length > 0 ? (
              <div className="space-y-4">
                {recentAttendees.map((attendee) => {
                  const event = events.find(e => e.id === attendee.eventId);
                  return (
                    <div key={attendee.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{attendee.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{attendee.email}</p>
                        <p className="text-sm text-coop-600 truncate">{event?.name}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-500">
                          {new Date(attendee.registeredAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">Registered</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent registrations</p>
            )}
          </div>
        </div>
      </div>

      {/* Voucher Usage Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Voucher Usage Overview</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-coop-600">{stats.totalVouchers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Vouchers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-coop-700">{stats.claimedVouchers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Fully Claimed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-coop-orange-600">
                {(stats.totalVouchers - stats.claimedVouchers).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Partially Used</div>
            </div>
          </div>
          {stats.totalVouchers > 0 && (
            <div className="mt-6">
              <div className="bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-coop-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.claimedVouchers / stats.totalVouchers) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                {Math.round((stats.claimedVouchers / stats.totalVouchers) * 100)}% of vouchers fully utilized
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;