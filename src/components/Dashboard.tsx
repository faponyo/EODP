import React from 'react';
import { Calendar, Users, TicketIcon, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Event, Attendee, Voucher } from '../types';

interface DashboardProps {
  events: Event[];
  attendees: Attendee[];
  vouchers: Voucher[];
}

const Dashboard: React.FC<DashboardProps> = ({ events, attendees, vouchers }) => {
  const totalEvents = events.length;
  const totalAttendees = attendees.length;
  const totalVouchers = vouchers.length;
  const claimedVouchers = vouchers.filter(v => v.isFullyClaimed).length;
  const totalDrinksClaimed = vouchers.reduce(
    (sum, v) => sum + v.softDrinks.claimed + v.hardDrinks.claimed, 
    0
  );

  const upcomingEvents = events
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const recentAttendees = attendees
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
    .slice(0, 5);

  const stats = [
    {
      name: 'Total Events',
      value: totalEvents,
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      name: 'Total Attendees',
      value: totalAttendees,
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      name: 'Active Vouchers',
      value: totalVouchers,
      icon: TicketIcon,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      name: 'Drinks Claimed',
      value: totalDrinksClaimed,
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your party management dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
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
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            </div>
          </div>
          <div className="p-6">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600">{event.location}</p>
                      <p className="text-sm text-blue-600">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {attendees.filter(a => a.eventId === event.id).length} / {event.maxAttendees}
                      </p>
                      <p className="text-xs text-gray-400">Attendees</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming events scheduled</p>
            )}
          </div>
        </div>

        {/* Recent Attendees */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Registrations</h2>
            </div>
          </div>
          <div className="p-6">
            {recentAttendees.length > 0 ? (
              <div className="space-y-4">
                {recentAttendees.map((attendee) => {
                  const event = events.find(e => e.id === attendee.eventId);
                  return (
                    <div key={attendee.id} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{attendee.name}</h3>
                        <p className="text-sm text-gray-600">{attendee.email}</p>
                        <p className="text-sm text-blue-600">{event?.name}</p>
                      </div>
                      <div className="text-right">
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
              <div className="text-3xl font-bold text-blue-600">{totalVouchers}</div>
              <div className="text-sm text-gray-600">Total Vouchers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{claimedVouchers}</div>
              <div className="text-sm text-gray-600">Fully Claimed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{totalVouchers - claimedVouchers}</div>
              <div className="text-sm text-gray-600">Partially Used</div>
            </div>
          </div>
          {totalVouchers > 0 && (
            <div className="mt-6">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(claimedVouchers / totalVouchers) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                {Math.round((claimedVouchers / totalVouchers) * 100)}% of vouchers fully utilized
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;