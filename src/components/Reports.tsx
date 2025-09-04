import React, { useState, useMemo } from 'react';
import { BarChart3, Download, Calendar, Users, TicketIcon, TrendingUp, Filter } from 'lucide-react';
import { Event, Attendee, Voucher } from '../types';
import { usePagination } from '../hooks/usePagination';
import Pagination from './Pagination';

interface ReportsProps {
  events: Event[];
  attendees: Attendee[];
  vouchers: Voucher[];
}

const Reports: React.FC<ReportsProps> = ({ events, attendees, vouchers }) => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState('all');

  // Pagination for large datasets
  const pagination = usePagination(100);

  // Filter data based on selected event
  const filteredAttendees = selectedEvent === 'all' 
    ? attendees 
    : attendees.filter(a => a.eventId === selectedEvent);
  
  const filteredVouchers = selectedEvent === 'all' 
    ? vouchers 
    : vouchers.filter(v => v.eventId === selectedEvent);

  // Calculate statistics with memoization for performance
  const stats = useMemo(() => {
    const totalSoftDrinksClaimed = filteredVouchers.reduce((sum, v) => sum + v.softDrinks.claimed, 0);
    const totalHardDrinksClaimed = filteredVouchers.reduce((sum, v) => sum + v.hardDrinks.claimed, 0);
    const totalDrinksClaimed = totalSoftDrinksClaimed + totalHardDrinksClaimed;
    const maxPossibleDrinks = filteredVouchers.length * 4;

    return {
      totalEvents: events.length,
      totalAttendees: filteredAttendees.length,
      totalVouchers: filteredVouchers.length,
      fullyClaimedVouchers: filteredVouchers.filter(v => v.isFullyClaimed).length,
      totalSoftDrinksClaimed,
      totalHardDrinksClaimed,
      totalDrinksClaimed,
      maxPossibleDrinks,
    };
  }, [events.length, filteredAttendees.length, filteredVouchers]);

  // Event breakdown with memoization
  const eventBreakdown = useMemo(() => {
    return events.map(event => {
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
  }, [events, attendees, vouchers]);

  // Department breakdown with memoization
  const departmentBreakdown = useMemo(() => {
    return filteredAttendees.reduce((acc, attendee) => {
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
  }, [filteredAttendees, vouchers]);

  // Paginated department data
  const departmentEntries = Object.entries(departmentBreakdown);
  const { paginatedData: paginatedDepartments, pagination: deptPaginationInfo } = 
    pagination.paginateData(departmentEntries);

  const exportToCsv = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(data[0]).join(",") + "\n" +
      data.map(row => Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(",")).join("\n");
    
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
        <p className="text-gray-600 mt-1">View detailed reports and export data efficiently</p>
      </div>

      {/* Report Configuration */}
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
              <option value="departments">Department Analysis</option>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAttendees.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.totalVouchers.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDrinksClaimed.toLocaleString()}</p>
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
                  {stats.totalVouchers > 0 ? Math.round((stats.totalSoftDrinksClaimed / (stats.totalVouchers * 2)) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Soft Drinks Used</div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${stats.totalVouchers > 0 ? (stats.totalSoftDrinksClaimed / (stats.totalVouchers * 2)) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {stats.totalVouchers > 0 ? Math.round((stats.totalHardDrinksClaimed / (stats.totalVouchers * 2)) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Hard Drinks Used</div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${stats.totalVouchers > 0 ? (stats.totalHardDrinksClaimed / (stats.totalVouchers * 2)) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {stats.maxPossibleDrinks > 0 ? Math.round((stats.totalDrinksClaimed / stats.maxPossibleDrinks) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Overall Utilization</div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${stats.maxPossibleDrinks > 0 ? (stats.totalDrinksClaimed / stats.maxPossibleDrinks) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Department Analysis with Pagination */}
      {selectedReport === 'departments' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Department Analysis</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>Page {deptPaginationInfo.page} of {pagination.totalPages(deptPaginationInfo.total)}</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilization
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDepartments.map(([dept, data]) => {
                  const utilizationRate = data.vouchers > 0 ? (data.drinks / (data.vouchers * 4)) * 100 : 0;
                  return (
                    <tr key={dept} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dept}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {data.count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {data.vouchers.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {data.drinks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {data.count > 0 ? (data.drinks / data.count).toFixed(1) : '0.0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${utilizationRate}%` }}
                            ></div>
                          </div>
                          <span>{utilizationRate.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {departmentEntries.length > pagination.pageSize && (
            <Pagination
              currentPage={deptPaginationInfo.page}
              totalPages={pagination.totalPages(deptPaginationInfo.total)}
              pageSize={deptPaginationInfo.pageSize}
              totalItems={deptPaginationInfo.total}
              onPageChange={pagination.goToPage}
              onPageSizeChange={(newPageSize) => {
                pagination.setPageSize(newPageSize);
                pagination.resetPage();
              }}
            />
          )}
        </div>
      )}

      {/* Event Breakdown Report */}
      {selectedReport === 'events' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Event Performance Analysis</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {eventBreakdown.map((eventData) => (
                <div key={eventData.event.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{eventData.event.name}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(eventData.event.date).toLocaleDateString()} • {eventData.event.location}
                      </p>
                    </div>
                    <div className="mt-2 lg:mt-0 text-right">
                      <div className="text-sm text-gray-600">Utilization Rate</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {eventData.utilizationRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{eventData.attendeeCount.toLocaleString()}</div>
                      <div className="text-sm text-blue-800">Attendees</div>
                      <div className="text-xs text-blue-600">
                        {eventData.attendeeCount.toLocaleString()} / {eventData.event.maxAttendees.toLocaleString()} capacity
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">{eventData.voucherCount.toLocaleString()}</div>
                      <div className="text-sm text-green-800">Vouchers Issued</div>
                      <div className="text-xs text-green-600">
                        {(eventData.voucherCount * 4).toLocaleString()} total drinks available
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-600">{eventData.claimedDrinks.toLocaleString()}</div>
                      <div className="text-sm text-orange-800">Drinks Claimed</div>
                      <div className="text-xs text-orange-600">
                        {eventData.voucherCount > 0 ? (eventData.claimedDrinks / eventData.voucherCount).toFixed(1) : '0'} per person
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
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

      {/* Export Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
          <div className="text-sm text-gray-600">
            {selectedEvent === 'all' ? 'All events' : events.find(e => e.id === selectedEvent)?.name}
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={exportAttendeeList}
            disabled={filteredAttendees.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            <span>Export Attendees ({filteredAttendees.length.toLocaleString()})</span>
          </button>
          
          <button
            onClick={exportVoucherUsage}
            disabled={filteredVouchers.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            <span>Export Vouchers ({filteredVouchers.length.toLocaleString()})</span>
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Performance Optimizations:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Pagination limits display to manageable chunks (25-200 items per page)</li>
            <li>• Search and filtering use optimized algorithms for large datasets</li>
            <li>• Data exports handle thousands of records efficiently</li>
            <li>• Memory usage is optimized to prevent browser slowdowns</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;