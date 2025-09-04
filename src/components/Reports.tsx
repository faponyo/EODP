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
      const claimHistory = voucher.claimHistory || [];
      const softDrinkItems = claimHistory.filter(c => c.drinkType === 'soft').map(c => c.itemName || 'Soft Drink').join(', ');
      const hardDrinkItems = claimHistory.filter(c => c.drinkType === 'hard').map(c => c.itemName || 'Hard Drink').join(', ');
      
      return {
        VoucherNumber: voucher.voucherNumber,
        AttendeeName: attendee?.name || '',
        AttendeeEmail: attendee?.email || '',
        Event: event?.name || '',
        SoftDrinksTotal: voucher.softDrinks.total,
        SoftDrinksClaimed: voucher.softDrinks.claimed,
        SoftDrinkItems: softDrinkItems,
        HardDrinksTotal: voucher.hardDrinks.total,
        HardDrinksClaimed: voucher.hardDrinks.claimed,
        HardDrinkItems: hardDrinkItems,
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
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
                <div className="bg-coop-50 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-coop-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                  <p className="text-sm text-gray-600">Total Events</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-coop-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-coop-700" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAttendees.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Attendees</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-coop-blue-50 p-3 rounded-lg">
                  <TicketIcon className="h-6 w-6 text-coop-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalVouchers.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Vouchers Issued</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-coop-orange-50 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-coop-orange-600" />
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
                <div className="text-4xl font-bold text-coop-blue-600 mb-2">
                  {stats.totalVouchers > 0 ? Math.round((stats.totalSoftDrinksClaimed / (stats.totalVouchers * 2)) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Soft Drinks Used</div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-coop-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${stats.totalVouchers > 0 ? (stats.totalSoftDrinksClaimed / (stats.totalVouchers * 2)) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-coop-orange-600 mb-2">
                  {stats.totalVouchers > 0 ? Math.round((stats.totalHardDrinksClaimed / (stats.totalVouchers * 2)) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Hard Drinks Used</div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-coop-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${stats.totalVouchers > 0 ? (stats.totalHardDrinksClaimed / (stats.totalVouchers * 2)) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-coop-600 mb-2">
                  {stats.maxPossibleDrinks > 0 ? Math.round((stats.totalDrinksClaimed / stats.maxPossibleDrinks) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Overall Utilization</div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-coop-600 h-2 rounded-full transition-all duration-300"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Department Analysis</h3>
            <button
              onClick={() => exportToCsv(
                Object.entries(departmentBreakdown).map(([dept, data]) => ({
                  Department: dept,
                  Attendees: data.count,
                  Vouchers: data.vouchers,
                  DrinksClaimed: data.drinks,
                  UtilizationRate: data.vouchers > 0 ? Math.round((data.drinks / (data.vouchers * 4)) * 100) : 0
                })),
                `department_analysis_${new Date().toISOString().split('T')[0]}.csv`
              )}
              className="flex items-center space-x-2 bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
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
                    Utilization
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDepartments.map(([department, data]) => {
                  const utilizationRate = data.vouchers > 0 ? (data.drinks / (data.vouchers * 4)) * 100 : 0;
                  return (
                    <tr key={department} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {data.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {data.vouchers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {data.drinks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                utilizationRate >= 75 ? 'bg-coop-600' :
                                utilizationRate >= 50 ? 'bg-coop-orange-500' :
                                'bg-coop-blue-500'
                              }`}
                              style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {Math.round(utilizationRate)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {departmentEntries.length > 100 && (
            <div className="mt-6">
              <Pagination
                currentPage={deptPaginationInfo.currentPage}
                totalPages={deptPaginationInfo.totalPages}
                onPageChange={pagination.setCurrentPage}
                totalItems={deptPaginationInfo.totalItems}
                itemsPerPage={deptPaginationInfo.itemsPerPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Event Breakdown Report */}
      {selectedReport === 'events' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Event Performance</h3>
            <button
              onClick={() => exportToCsv(
                eventBreakdown.map(item => ({
                  EventName: item.event.name,
                  Date: new Date(item.event.date).toLocaleDateString(),
                  Capacity: item.event.capacity,
                  Attendees: item.attendeeCount,
                  Vouchers: item.voucherCount,
                  DrinksClaimed: item.claimedDrinks,
                  UtilizationRate: Math.round(item.utilizationRate)
                })),
                `event_breakdown_${new Date().toISOString().split('T')[0]}.csv`
              )}
              className="flex items-center space-x-2 bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>

          <div className="grid gap-4">
            {eventBreakdown.map((item) => (
              <div key={item.event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.event.name}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(item.event.date).toLocaleDateString()} • {item.event.location}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.utilizationRate >= 75 ? 'bg-coop-100 text-coop-800' :
                    item.utilizationRate >= 50 ? 'bg-coop-orange-100 text-coop-orange-800' :
                    'bg-coop-blue-100 text-coop-blue-800'
                  }`}>
                    {Math.round(item.utilizationRate)}% utilized
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Attendees</p>
                    <p className="font-semibold">{item.attendeeCount} / {item.event.capacity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Vouchers</p>
                    <p className="font-semibold">{item.voucherCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Drinks Claimed</p>
                    <p className="font-semibold">{item.claimedDrinks}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Capacity</p>
                    <div className="flex items-center mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            (item.attendeeCount / item.event.capacity) >= 0.9 ? 'bg-coop-red-500' :
                            (item.attendeeCount / item.event.capacity) >= 0.7 ? 'bg-coop-orange-500' :
                            'bg-coop-600'
                          }`}
                          style={{ width: `${Math.min((item.attendeeCount / item.event.capacity) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">
                        {Math.round((item.attendeeCount / item.event.capacity) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendee Report */}
      {selectedReport === 'attendees' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Attendee Details</h3>
            <button
              onClick={exportAttendeeList}
              className="flex items-center space-x-2 bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Attendee report ready for export</p>
            <p className="text-sm">Click Export CSV to download detailed attendee information</p>
          </div>
        </div>
      )}

      {/* Voucher Usage Report */}
      {selectedReport === 'vouchers' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Voucher Usage Details</h3>
            <button
              onClick={exportVoucherUsage}
              className="flex items-center space-x-2 bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <TicketIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Voucher usage report ready for export</p>
            <p className="text-sm">Click Export CSV to download detailed voucher usage information</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;