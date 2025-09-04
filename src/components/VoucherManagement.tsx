import React, { useState, useMemo } from 'react';
import { TicketIcon, Search, CheckCircle, Clock, Filter, Zap } from 'lucide-react';
import { Event, Attendee, Voucher } from '../types';
import { usePagination } from '../hooks/usePagination';
import { useSearch } from '../hooks/useSearch';
import Pagination from './Pagination';

interface VoucherManagementProps {
  events: Event[];
  attendees: Attendee[];
  vouchers: Voucher[];
  onClaimDrink: (voucherId: string, drinkType: 'soft' | 'hard', itemName?: string) => void;
  userRole: 'admin' | 'internal' | 'external';
}

const VoucherManagement: React.FC<VoucherManagementProps> = ({
  events,
  attendees,
  vouchers,
  onClaimDrink,
  userRole,
}) => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [claimingVoucher, setClaimingVoucher] = useState<{ voucherId: string; drinkType: 'soft' | 'hard' } | null>(null);
  const [itemName, setItemName] = useState('');

  // Create searchable voucher data with attendee info
  const vouchersWithAttendeeInfo = useMemo(() => {
    return vouchers.map(voucher => {
      const attendee = attendees.find(a => a.id === voucher.attendeeId);
      return {
        ...voucher,
        attendeeName: attendee?.name || '',
        attendeeEmail: attendee?.email || '',
        attendeeDepartment: attendee?.department || '',
      };
    });
  }, [vouchers, attendees]);

  // Search functionality
  const { searchTerm, setSearchTerm, filteredData: searchedVouchers } = useSearch(
    vouchersWithAttendeeInfo,
    ['voucherNumber', 'attendeeName', 'attendeeEmail', 'attendeeDepartment']
  );

  // Additional filtering
  const filteredVouchers = useMemo(() => {
    let filtered = searchedVouchers;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(voucher => {
        switch (selectedStatus) {
          case 'active':
            return !voucher.isFullyClaimed && 
                   voucher.softDrinks.claimed === 0 && 
                   voucher.hardDrinks.claimed === 0;
          case 'partial':
            return !voucher.isFullyClaimed && 
                   (voucher.softDrinks.claimed > 0 || voucher.hardDrinks.claimed > 0);
          case 'claimed':
            return voucher.isFullyClaimed;
          default:
            return true;
        }
      });
    }

    if (selectedEvent) {
      filtered = filtered.filter(voucher => voucher.eventId === selectedEvent);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [searchedVouchers, selectedStatus, selectedEvent]);

  // Pagination
  const pagination = usePagination(25);
  const { paginatedData: paginatedVouchers, pagination: paginationInfo } = pagination.paginateData(filteredVouchers);

  // Statistics
  const stats = useMemo(() => {
    const total = vouchers.length;
    const fullyClaimed = vouchers.filter(v => v.isFullyClaimed).length;
    const partiallyUsed = vouchers.filter(v => 
      !v.isFullyClaimed && (v.softDrinks.claimed > 0 || v.hardDrinks.claimed > 0)
    ).length;
    const unused = total - fullyClaimed - partiallyUsed;
    const totalDrinksRemaining = vouchers.reduce((sum, v) => 
      sum + (v.softDrinks.total - v.softDrinks.claimed) + (v.hardDrinks.total - v.hardDrinks.claimed), 0
    );

    return { total, fullyClaimed, partiallyUsed, unused, totalDrinksRemaining };
  }, [vouchers]);

  const getAttendeeInfo = (attendeeId: string) => {
    return attendees.find(a => a.id === attendeeId);
  };

  const getEventInfo = (eventId: string) => {
    return events.find(e => e.id === eventId);
  };

  const canClaimMore = (voucher: Voucher, drinkType: 'soft' | 'hard') => {
    if (drinkType === 'soft') {
      return voucher.softDrinks.claimed < voucher.softDrinks.total;
    }
    return voucher.hardDrinks.claimed < voucher.hardDrinks.total;
  };

  const handleClaimClick = (voucherId: string, drinkType: 'soft' | 'hard') => {
    setClaimingVoucher({ voucherId, drinkType });
    setItemName('');
  };

  const handleClaimSubmit = () => {
    if (claimingVoucher) {
      onClaimDrink(claimingVoucher.voucherId, claimingVoucher.drinkType, itemName.trim() || undefined);
      setClaimingVoucher(null);
      setItemName('');
    }
  };

  const handleClaimCancel = () => {
    setClaimingVoucher(null);
    setItemName('');
  };

  // Reset pagination when filters change
  React.useEffect(() => {
    pagination.resetPage();
  }, [searchTerm, selectedStatus, selectedEvent]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Voucher Management</h1>
        <p className="text-gray-600 mt-1">Track and manage drink vouchers efficiently</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-coop-50 p-3 rounded-lg">
              <TicketIcon className="h-6 w-6 text-coop-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Vouchers</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-coop-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-coop-700" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.fullyClaimed}</p>
              <p className="text-sm text-gray-600">Fully Used</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-coop-orange-50 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-coop-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.partiallyUsed}</p>
              <p className="text-sm text-gray-600">Partially Used</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-coop-blue-50 p-3 rounded-lg">
              <Zap className="h-6 w-6 text-coop-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalDrinksRemaining}</p>
              <p className="text-sm text-gray-600">Drinks Remaining</p>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Item Modal */}
      {claimingVoucher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Claim {claimingVoucher.drinkType === 'soft' ? 'Soft' : 'Hard'} Drink
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name (Optional)
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={claimingVoucher.drinkType === 'soft' ? 'e.g., Coca Cola, Orange Juice' : 'e.g., Beer, Wine, Whiskey'}
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                Specify the exact item for better inventory tracking
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleClaimSubmit}
                className="flex-1 bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors"
              >
                Claim Drink
              </button>
              <button
                onClick={handleClaimCancel}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Vouchers</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                placeholder="Search vouchers, names, emails..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
            >
              <option value="all">All Vouchers</option>
              <option value="active">Unused</option>
              <option value="partial">Partially Used</option>
              <option value="claimed">Fully Used</option>
            </select>
          </div>
          {userRole !== 'external' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Event</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
              >
                <option value="">All Events</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {(searchTerm || selectedStatus !== 'all' || selectedEvent) && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredVouchers.length} of {vouchers.length} vouchers
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedEvent('');
              }}
              className="text-sm text-coop-600 hover:text-coop-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Vouchers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Voucher List
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>Page {paginationInfo.page} of {pagination.totalPages(paginationInfo.total)}</span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {paginatedVouchers.length > 0 ? (
            paginatedVouchers.map((voucher) => {
              const attendee = getAttendeeInfo(voucher.attendeeId);
              const event = getEventInfo(voucher.eventId);
              
              return (
                <div key={voucher.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-coop-100 text-coop-800 px-3 py-1 rounded-full text-sm font-mono font-medium">
                          {voucher.voucherNumber}
                        </div>
                        {voucher.isFullyClaimed && (
                          <div className="bg-coop-100 text-coop-800 px-3 py-1 rounded-full text-sm font-medium">
                            Fully Used
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="font-medium text-gray-900 truncate">{attendee?.name}</p>
                          <p className="text-sm text-gray-600 truncate">{attendee?.email}</p>
                          {attendee?.department && (
                            <p className="text-sm text-gray-500">{attendee.department}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 truncate">{event?.name}</p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(voucher.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-[300px]">
                        <div className="bg-coop-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-coop-900 text-sm">Soft Drinks</h4>
                            <span className="text-sm font-bold text-coop-700">
                              {voucher.softDrinks.claimed}/{voucher.softDrinks.total}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleClaimClick(voucher.id, 'soft')}
                              disabled={!canClaimMore(voucher, 'soft')}
                              className="bg-coop-600 text-white px-3 py-1 rounded text-sm hover:bg-coop-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
                            >
                              Claim
                            </button>
                            <div className="bg-coop-200 rounded-full h-2 flex-1">
                              <div 
                                className="bg-coop-600 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${(voucher.softDrinks.claimed / voucher.softDrinks.total) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-coop-orange-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-coop-orange-900 text-sm">Hard Drinks</h4>
                            <span className="text-sm font-bold text-coop-orange-700">
                              {voucher.hardDrinks.claimed}/{voucher.hardDrinks.total}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleClaimClick(voucher.id, 'hard')}
                              disabled={!canClaimMore(voucher, 'hard')}
                              className="bg-coop-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-coop-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
                            >
                              Claim
                            </button>
                            <div className="bg-coop-orange-200 rounded-full h-2 flex-1">
                              <div 
                                className="bg-coop-orange-600 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${(voucher.hardDrinks.claimed / voucher.hardDrinks.total) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <TicketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vouchers found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedStatus !== 'all' || selectedEvent
                  ? "No vouchers match your search criteria"
                  : "No vouchers have been issued yet"
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredVouchers.length > 0 && (
          <Pagination
            currentPage={paginationInfo.page}
            totalPages={pagination.totalPages(paginationInfo.total)}
            pageSize={paginationInfo.pageSize}
            totalItems={paginationInfo.total}
            onPageChange={pagination.goToPage}
            onPageSizeChange={(newPageSize) => {
              pagination.setPageSize(newPageSize);
              pagination.resetPage();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Helper function moved outside component to avoid recreation
const canClaimMore = (voucher: Voucher, drinkType: 'soft' | 'hard') => {
  if (drinkType === 'soft') {
    return voucher.softDrinks.claimed < voucher.softDrinks.total;
  }
  return voucher.hardDrinks.claimed < voucher.hardDrinks.total;
};

export default VoucherManagement;