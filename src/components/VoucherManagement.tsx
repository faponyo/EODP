import React, { useState } from 'react';
import { TicketIcon, Search, Minus, Plus, CheckCircle, Clock } from 'lucide-react';
import { Event, Attendee, Voucher, VoucherClaim } from '../types';

interface VoucherManagementProps {
  events: Event[];
  attendees: Attendee[];
  vouchers: Voucher[];
  onClaimDrink: (voucherId: string, drinkType: 'soft' | 'hard') => void;
}

const VoucherManagement: React.FC<VoucherManagementProps> = ({
  events,
  attendees,
  vouchers,
  onClaimDrink,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredVouchers = vouchers.filter(voucher => {
    const attendee = attendees.find(a => a.id === voucher.attendeeId);
    const matchesSearch = voucher.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          attendee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          attendee?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (selectedStatus === 'active') {
      matchesStatus = !voucher.isFullyClaimed;
    } else if (selectedStatus === 'claimed') {
      matchesStatus = voucher.isFullyClaimed;
    } else if (selectedStatus === 'partial') {
      matchesStatus = !voucher.isFullyClaimed && 
                     (voucher.softDrinks.claimed > 0 || voucher.hardDrinks.claimed > 0);
    }
    
    return matchesSearch && matchesStatus;
  });

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

  const totalDrinksRemaining = (voucher: Voucher) => {
    return (voucher.softDrinks.total - voucher.softDrinks.claimed) + 
           (voucher.hardDrinks.total - voucher.hardDrinks.claimed);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Voucher Management</h1>
        <p className="text-gray-600 mt-1">Track and manage drink vouchers</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <TicketIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{vouchers.length}</p>
              <p className="text-sm text-gray-600">Total Vouchers</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {vouchers.filter(v => v.isFullyClaimed).length}
              </p>
              <p className="text-sm text-gray-600">Fully Used</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-orange-50 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {vouchers.filter(v => !v.isFullyClaimed && 
                  (v.softDrinks.claimed > 0 || v.hardDrinks.claimed > 0)).length}
              </p>
              <p className="text-sm text-gray-600">Partially Used</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-50 p-3 rounded-lg">
              <TicketIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {vouchers.reduce((sum, v) => sum + totalDrinksRemaining(v), 0)}
              </p>
              <p className="text-sm text-gray-600">Drinks Remaining</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Vouchers</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by voucher number, name, or email..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Vouchers</option>
              <option value="active">Active (Unused)</option>
              <option value="partial">Partially Used</option>
              <option value="claimed">Fully Used</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vouchers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Voucher List ({filteredVouchers.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredVouchers.length > 0 ? (
            filteredVouchers.map((voucher) => {
              const attendee = getAttendeeInfo(voucher.attendeeId);
              const event = getEventInfo(voucher.eventId);
              
              return (
                <div key={voucher.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {voucher.voucherNumber}
                        </div>
                        {voucher.isFullyClaimed && (
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Fully Used
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="font-medium text-gray-900">{attendee?.name}</p>
                          <p className="text-sm text-gray-600">{attendee?.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{event?.name}</p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(voucher.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-blue-900">Soft Drinks</h4>
                            <span className="text-sm text-blue-700">
                              {voucher.softDrinks.claimed}/{voucher.softDrinks.total}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onClaimDrink(voucher.id, 'soft')}
                              disabled={!canClaimMore(voucher, 'soft')}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              Claim
                            </button>
                            <div className="bg-blue-200 rounded-full h-2 flex-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${(voucher.softDrinks.claimed / voucher.softDrinks.total) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-orange-900">Hard Drinks</h4>
                            <span className="text-sm text-orange-700">
                              {voucher.hardDrinks.claimed}/{voucher.hardDrinks.total}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onClaimDrink(voucher.id, 'hard')}
                              disabled={!canClaimMore(voucher, 'hard')}
                              className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              Claim
                            </button>
                            <div className="bg-orange-200 rounded-full h-2 flex-1">
                              <div 
                                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
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
                {searchTerm || selectedStatus !== 'all'
                  ? "No vouchers match your search criteria"
                  : "No vouchers have been issued yet"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoucherManagement;