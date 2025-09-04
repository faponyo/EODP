import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Users, TicketIcon, TrendingUp } from 'lucide-react';
import { Event, Attendee, Voucher } from '../types';

interface ReportsProps {
  events: Event[];
  attendees: Attendee[];
  vouchers: Voucher[];
}

const Reports: React.FC<ReportsProps> = ({ events, attendees, vouchers }) => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState('all');

  // Filter data based on selected event
  const filteredAttendees = selectedEvent === 'all' 
    ? attendees 
    : attendees.filter(a => a.eventId === selectedEvent);
  
  const filteredVouchers = selectedEvent === 'all' 
    ? vouchers 
    : vouchers.filter(v => v.eventId === selectedEvent);

  // Calculate statistics
  const stats = {
    totalEvents: events.length,
    totalAttendees: filteredAttendees.length,
    totalVouchers: filteredVouchers.length,
    fullyClaimedVouchers: filteredVouchers.filter(v => v.isFullyClaimed).length,
    totalSoftDrinksClaimed: filteredVouchers.reduce((sum, v) => sum + v.softDrinks.claimed, 0),
    totalHardDrinksClaimed: filteredVouchers.reduce((sum, v) => sum + v.hardDrinks.claimed, 0),
    totalDrinksClaimed: filteredVouchers.reduce((sum, v) => sum + v.softDrinks.claimed + v.hardDrinks.claimed, 0),
    maxPossibleDrinks: filteredVouchers.length * 4, // 2 soft + 2 hard per voucher
  };

  // Event breakdown
  const eventBreakdown = events.map(event => {
    const eventAttendees = attendees.filter(a => a.eventId === event.id);
    const eventVouchers = vouchers.filter(v => v.eventId === event.id);
    const claimedDrinks = eventVouchers.reduce((sum, v) => sum + v.softDrinks.claimed + v.hardDrinks.claimed, 0);
    
    return {
      event,
      attendeeCount: eventAttendees.length,
      voucherCount: eventVouchers.length,
      claimedDrinks,
      utilizationRate: eventVouchers.length > 0 ? (claimedDrinks / (eventVouchers.length * 4)) * 100 : 0,
    };
  });

  // Department breakdown
  const departmentBreakdown = filteredAttendees.reduce((acc, attendee) => {
    const dept = attendee.department || 'Not Specified';
    if (!acc[dept]) {
      acc[dept] = { count: 0, vouchers: 0, drinks: 0 };
    }
    acc[dept].count++;
    
    const attendeeVoucher = vouchers.find(v => v.attendeeId === attendee.id);
    if (attendeeVoucher) {
      acc[dept].vouchers++;
      acc[dept].drinks += attendeeVoucher.softDrinks.claimed + attendeeVoucher.hardDrinks.claimed;
    }
    
    return acc;
  }, {} as Record<string, { count: number; vouchers: number; drinks: number }>);

  const exportToCsv = (data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(data[0]).join(",") + "\n" +
      data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAttendeeList = () => {
    const data = filteredAttendees.map(attendee => {
      const event = events.find(e => e.id === attendee.eventId);
      const voucher = vouchers.find(v => v.attendeeId === attendee.id);
      return {
        Name: attendee.name,
        Email: attendee.email,
        Phone: attendee.phone || '',
        Department: attendee.department || '',
        Event: event?.name || '',
        VoucherNumber: voucher?.voucherNumber || '',
        SoftDrinksClaimed: voucher?.softDrinks.claimed || 0,
        HardDrinksClaimed: voucher?.hardDrinks.claimed || 0,
        RegisteredAt: new Date(attendee.registeredAt).toLocaleString(),
      };
    });
    
    exportToCsv(data, `attendees_report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportVoucherUsage = () => {
    const data = filteredVouchers.map(voucher => {
      const attendee = attendees.find(a => a.id === voucher.attendeeId);
      const event = events.find(e => e.id === voucher.eventId);
      return {
        VoucherNumber: voucher.voucherNumber,
        AttendeeName: attendee?.name || '',
        AttendeeEmail: attendee?.email || '',
        Event: event?.name || '',
        SoftDrinksTotal: voucher.softDrinks.total,
        SoftDrinksClaimed: voucher.softDrinks.claimed,
        HardDrinksTotal: voucher.hardDrinks.total,
        HardDrinksClaimed: voucher.hardDrinks.claimed,
        IsFullyClaimed: voucher.isFullyClaimed,
        CreatedAt: new Date(voucher.createdAt).toLocaleString(),
      };
    });
    
    exportToCsv(data, `voucher_usage_report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">View detailed reports and export data</p>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="overview">Overview Report</option>
              <option value="attendees">Attendee Report</option>
              <option value="vouchers">Voucher Usage Report</option>
              <option value="events">Event Breakdown</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      {selectedReport === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                  <p className="text-sm text-gray-600">Total Events</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-green-50 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAttendees}</p>
                  <p className="text-sm text-gray-600">Total Attendees</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <TicketIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalVouchers}</p>
                  <p className="text-sm text-gray-600">Vouchers Issued</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDrinksClaimed}</p>
                  <p className="text-sm text-gray-600">Drinks Claimed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Utilization Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voucher Utilization</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {Math.round((stats.totalSoftDrinksClaimed / (stats.totalVouchers * 2)) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Soft Drinks Used</div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.totalSoftDrinksClaimed / (stats.totalVouchers * 2)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {Math.round((stats.totalHardDrinksClaimed / (stats.totalVouchers * 2)) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Hard Drinks Used</div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.totalHardDrinksClaimed / (stats.totalVouchers * 2)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {Math.round((stats.totalDrinksClaimed / stats.maxPossibleDrinks) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Overall Utilization</div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.totalDrinksClaimed / stats.maxPossibleDrinks) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Department Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vouchers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Drinks Claimed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg per Person
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(departmentBreakdown).map(([dept, data]) => (
                    <tr key={dept} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dept}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {data.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {data.vouchers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {data.drinks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {data.count > 0 ? (data.drinks / data.count).toFixed(1) : '0.0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Event Breakdown Report */}
      {selectedReport === 'events' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Event Performance</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {eventBreakdown.map((eventData) => (
                <div key={eventData.event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{eventData.event.name}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(eventData.event.date).toLocaleDateString()} • {eventData.event.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Utilization Rate</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {eventData.utilizationRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{eventData.attendeeCount}</div>
                      <div className="text-sm text-blue-800">Attendees</div>
                      <div className="text-xs text-blue-600">
                        {eventData.attendeeCount} / {eventData.event.maxAttendees} capacity
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">{eventData.voucherCount}</div>
                      <div className="text-sm text-green-800">Vouchers Issued</div>
                      <div className="text-xs text-green-600">
                        {eventData.voucherCount * 4} total drinks available
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-600">{eventData.claimedDrinks}</div>
                      <div className="text-sm text-orange-800">Drinks Claimed</div>
                      <div className="text-xs text-orange-600">
                        {eventData.voucherCount > 0 ? (eventData.claimedDrinks / eventData.voucherCount).toFixed(1) : '0'} per person
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${eventData.utilizationRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={exportAttendeeList}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Attendee List</span>
          </button>
          
          <button
            onClick={exportVoucherUsage}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Voucher Usage</span>
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Export Information:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Attendee List includes personal details, event registration, and voucher information</li>
            <li>• Voucher Usage report shows detailed claim history for each voucher</li>
            <li>• All exports are in CSV format compatible with Excel and Google Sheets</li>
            <li>• Data is filtered based on your current event selection</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;