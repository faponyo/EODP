import React, {useEffect, useState} from 'react';
import {Filter, Loader2, RefreshCw, Search, TicketIcon} from 'lucide-react';
import {PaginationProps, Voucher} from '../types';
import {useSearch} from '../hooks/useSearch';
import eventService from "../services/Events.ts";
import checkInService from "../services/CheckIn.ts";
import EPagination from "../common/EPagination.tsx";
import {useEventContext} from "../common/useEventContext.tsx";
import {showError, showSuccess} from "../common/Toaster.ts";
import {useAuthContext} from "../common/useAuthContext.tsx";
import {PERMISSIONS} from "../common/constants.ts";
import DataLoader from "./DataLoader.tsx";


const VoucherManagement: React.FC = () => {

    const {preSelectedEvent} = useEventContext();

    const [selectedStatus, setSelectedStatus] = useState('all');
    const [vouchers, setVouchers] = useState<Record[]>([]);
    const [events, setEvents] = useState<Record[]>([]);
    const { hasPermission} = useAuthContext();

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(6);
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [selectedFilterBy, setSelectedFilterBy] = useState('');
    const [filterValue, setFilterValue] = useState<any>(undefined)
    const [paginations, setPagination] = useState<PaginationProps>({
        number: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0,

    });

    const [formData, setFormData] = useState({

        itemName: '',
        itemCount: '0',

    });
    const [selectedEvent, setSelectedEvent] = useState('');
    const [claimingVoucher, setClaimingVoucher] = useState<{
        voucherId: string;
        drinkType: string,
        claimedNumber: number,
        numberOfItems: number
    } | null>(null);


    const updateVoucherData = (content: never[], page: number, size: number, totalPages: number, totalElements: number,) => {
        setVouchers(content)
        setPagination({
            number: page,
            size: size,
            totalElements: totalElements,
            totalPages: totalPages,

        })
        setCurrentPage(page)
    }


    const fetchEventsData = async () => {


        await eventService.getEventsWithVouchers(

        ).then(
            data => {

                setEvents(data)
                // setSelectedEvent(data[0].id)


            }
        ).catch(error => {
            console.log(error)


        });
    }

    useEffect(() => {
        if (hasPermission(PERMISSIONS.VAV)) {
            fetchEventsData();
        } else {
            setEvents(preSelectedEvent ? [preSelectedEvent] : [])
            setSelectedEvent(preSelectedEvent.id)
            setSelectedFilterBy("vouchernumber")


        }
    }, []);


    const fetchData = async (page: number, pageSize: number, eventId: never, selectedFilterBy: never, filterValue: never) => {
        setLoadingData(true)


        await checkInService.getVouchersPaginated(page, pageSize, eventId, selectedFilterBy, filterValue).then(
            data => {
                const {content, page: {number, size, totalPages, totalElements}} = data
                updateVoucherData(content, page, size, totalPages, totalElements)


                setLoadingData(false)


            }
        ).catch(error => {
            console.log(error)
            setLoadingData(false)


        });
    }

    useEffect(() => {

        updateVoucherData([], currentPage, pageSize, 0, 0)


        if (selectedEvent !== '' && selectedEvent !== undefined) {
            // if (
            //     !preSelectedEvent && ((selectedFilterBy !== '' && selectedFilterBy !== undefined && !filterValue) || // selectedFilterBy has value, filterValue is empty
            //         (filterValue && (selectedFilterBy === '' || selectedFilterBy === undefined)))      // filterValue has value, selectedFilterBy is empty
            // ) {
            //     return;
            // } else if

            if (!((selectedFilterBy !== '' && selectedFilterBy !== undefined) && (filterValue !== '' && filterValue !== undefined))) {
                return;
            }

            fetchData(currentPage, pageSize, selectedEvent, selectedFilterBy, filterValue)
        }

    }, [currentPage, pageSize, selectedEvent, selectedFilterBy, filterValue]);

    // Search functionality
    const {searchTerm, setSearchTerm, filteredData: searchedVouchers} = useSearch(
        [],
        ['voucherNumber', 'attendeeName', 'attendeeEmail', 'attendeeDepartment']
    );


    const canClaimMore = (voucher: Voucher, drinkType: never) => {

        return voucher.claimedNumber < voucher.voucherCategory.numberOfItems;
    };

    const handleClaimClick = (voucher: never) => {
        setClaimingVoucher({
            voucherId: voucher.id,
            drinkType: voucher.voucherCategory.name,
            claimedNumber: voucher.claimedNumber,
            numberOfItems: voucher.voucherCategory.numberOfItems
        });
        setFormData(
            {

                itemName: '',
                itemCount: '0',

            }
        )
    };

    const handleClaimSubmit = (e: React.FormEvent) => {
        e.preventDefault();


        const requestData = {...formData, voucherId: claimingVoucher.voucherId};

        if (claimingVoucher) {
            // claimVoucher
            checkInService.claimVoucher(requestData).then(
                data => {
                    const {message, error} = data;

                    showSuccess(message)

                    //
                    handleClaimCancel();

                    // Retrieve
                    fetchData(currentPage, pageSize, selectedEvent, selectedFilterBy, filterValue)


                }
            ).catch(error => {
                console.log(error)
                showError(error || 'Error occured while claiming voucher');


            })
        }
    };


    const handleClaimCancel = () => {
        setClaimingVoucher(null);
        setFormData({

            itemName: '',
            itemCount: '0'
        });


    };


    const handleFilterLookup = async () => {
        if (!searchTerm.trim()) {
            return;
        }

        setFilterValue(searchTerm);
        setCurrentPage(1);


    };

    const currentRetrievedItemCount = () => {
        return paginations.totalElements > 0 ? ((paginations.size * (currentPage - 1)) + (paginations.totalElements > paginations.size ? paginations.size : paginations.totalElements)) : paginations.totalElements;
    }


    return (
        <div className="space-y-6">
            <div>
                {/*<h1 className="text-3xl font-bold text-gray-900">Voucher Management</h1>*/}
                <p className="text-gray-600 mt-1">Track and manage vouchers efficiently</p>
            </div>


            {/* Claim Item Modal */}
            {claimingVoucher && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">

                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <form onSubmit={handleClaimSubmit}>

                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Claim {claimingVoucher.drinkType}
                            </h3>


                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Item Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.itemName}
                                    onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={claimingVoucher.drinkType}
                                    maxLength={50}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Specify the exact item for better inventory tracking
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No. of Items
                                </label>
                                <input
                                    type="number"
                                    value={formData.itemCount}
                                    required
                                    min="1"
                                    max={claimingVoucher.numberOfItems - claimingVoucher.claimedNumber}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        // Allow only empty or valid numbers with max 2 digits and within allowed range
                                        if (
                                            value === '' ||
                                            (/^\d{1,2}$/.test(value) &&
                                                parseInt(value, 10) <=
                                                claimingVoucher.numberOfItems - claimingVoucher.claimedNumber)
                                        ) {
                                            setFormData({...formData, itemCount: value});
                                        }
                                    }}
                                    onInvalid={(e) => {
                                        const max = claimingVoucher.numberOfItems - claimingVoucher.claimedNumber;
                                        e.target.setCustomValidity(`Please enter a number between 1 and ${max}`);
                                    }}
                                    onInput={(e) => {
                                        // Clear custom validation message on any input
                                        e.target.setCustomValidity('');
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Specify the exact number of items
                                </p>
                            </div>


                            <div className="flex space-x-3">
                                <button
                                    type="submit"

                                    // onClick={handleClaimSubmit}
                                    className="flex-1 bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors"
                                >
                                    Claim {claimingVoucher.drinkType}
                                </button>
                                <button
                                    onClick={handleClaimCancel}
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            )}

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {!preSelectedEvent && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
                            <select
                                value={selectedEvent}
                                onChange={(e) => setSelectedEvent(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                            >


                                <option value="">Select Event</option>
                                {events.map((event) => (
                                    <option key={event.id} value={event.id}>
                                        {event.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by</label>
                        <select
                            value={selectedFilterBy}
                            onChange={(e) => setSelectedFilterBy(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                        >
                            {hasPermission(PERMISSIONS.VAV) && (
                                <option value="">Select filter</option>
                            )}
                            <option value="vouchernumber">Voucher Number</option>
                            {hasPermission(PERMISSIONS.VAV) && (
                                <option value="pfnumber">PF Number</option>
                            )}

                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2"> Filter Value</label>
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                placeholder="Enter filter value..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">.</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={handleFilterLookup}
                                disabled={!searchTerm.trim() || selectedFilterBy === '' || loadingData}
                                className="bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {loadingData ? (
                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                ) : (
                                    <RefreshCw className="h-4 w-4"/>
                                )}
                                <span>{loadingData ? 'Retrieving...' : 'Retrieve'}</span>
                            </button>
                        </div>
                    </div>

                </div>

                {(searchTerm || selectedStatus !== 'all' || selectedEvent) && (
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {currentRetrievedItemCount()} of {paginations.totalElements} vouchers
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedEvent(!preSelectedEvent ? '' : preSelectedEvent.id);
                                setSelectedFilterBy(!preSelectedEvent ? '' : 'vouchernumber')
                                setFilterValue('')
                                setCurrentPage(1);
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
                    {!preSelectedEvent && (
                        <div className="flex items-center justify-between">
                            {/*<h2 className="text-lg font-semibold text-gray-900">*/}
                            {/*    Vouchers*/}
                            {/*</h2>*/}
                            {vouchers.length > 0 && paginations.totalPages > 1 && <>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">


                                    <EPagination currentPage={currentPage} setPageSize={setPageSize}
                                                 pageCount={paginations.totalPages}
                                                 handlePageChange={function (page: number): void {
                                                     if (page !== currentPage) {
                                                         setCurrentPage(page)
                                                     }
                                                 }} pagesize={pageSize}/>
                                </div>

                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Filter className="h-4 w-4"/>
                                    <span>Page {currentPage} of {paginations.totalPages}</span>
                                </div>
                            </>
                            }

                        </div>)
                    }
                </div>

                <div className="divide-y divide-gray-200 relative  border rounded-lg bg-gray-5">
                    {loadingData ? (
                        <DataLoader isLoading={loadingData}/>
                    ) : (
                        <>
                            {vouchers.length > 0 ? (
                                vouchers.map((voucher) => {
                                    return (
                                        <div key={voucher.id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div
                                                className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <div
                                                            className="bg-coop-100 text-coop-800 px-3 py-1 rounded-full text-sm font-mono font-medium">
                                                            {voucher.voucherNumber}
                                                        </div>

                                                        {voucher.fullyClaimed && (
                                                            <div
                                                                className="bg-amber-400 text-coop-800 px-3 py-1 rounded-full text-sm font-mediu">
                                                                Fully Used
                                                            </div>
                                                        )}
                                                        {
                                                            voucher.claimedNumber==0 && (
                                                                <div
                                                                    className="bg-coop-400 text-coop-800 px-3 py-1 rounded-full text-sm font-mediur">
                                                                    Not Used
                                                                </div>
                                                            )

                                                        }
                                                        {
                                                            !voucher.fullyClaimed && voucher.claimedNumber>0 && (
                                                                <div
                                                                    className="bg-coop-300 text-coop-800 px-3 py-1 rounded-full text-sm font-mediu">
                                                                    Partially Used
                                                                </div>
                                                            )

                                                        }

                                                    </div>

                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
                                                        <div>
                                                            <p className="font-medium text-gray-900 truncate">{voucher.attendee?.name}</p>
                                                            <p className="text-sm text-gray-600 truncate">{voucher.attendee?.email}</p>
                                                            {voucher.attendee?.department && (
                                                                <p className="text-sm text-gray-500">{voucher.attendee?.department}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600 truncate">{voucher.attendee.eventId?.name}</p>
                                                            <p className="text-sm text-gray-500">
                                                                Created: {new Date(voucher?.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-shrink-0">
                                                    <div
                                                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-[300px]">
                                                        <div className="bg-coop-50 rounded-lg p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-medium text-coop-900 text-sm">{voucher.voucherCategory.name}</h4>
                                                                <span className="text-sm font-bold text-coop-700">
                              {voucher.claimedNumber}/{voucher.voucherCategory.numberOfItems}
                            </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <button
                                                                    onClick={() => handleClaimClick(voucher)}
                                                                    disabled={!canClaimMore(voucher, voucher.voucherCategory.nam) || !hasPermission(PERMISSIONS.CV)}
                                                                    className="bg-coop-600 text-white px-3 py-1 rounded text-sm hover:bg-coop-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
                                                                >
                                                                    Claim
                                                                </button>

                                                                <div className={`${voucher.fullyClaimed?'bg-amber-400':!voucher.fullyClaimed && voucher.claimedNumber>0?'bg-coop-300':'bg-coop-400'} rounded-full h-2 flex-1`}>
                                                                    <div
                                                                        className="bg-coop-600 h-2 rounded-full transition-all duration-300"
                                                                        style={{
                                                                            width: `${(voucher.claimedNumber / voucher.voucherCategory.numberOfItems) * 100}%`
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
                                    <TicketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4"/>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No vouchers found</h3>
                                    <p className="text-gray-600">
                                        {searchTerm || selectedStatus !== 'all' || selectedEvent
                                            ? "No vouchers match your search criteria"
                                            : "No vouchers have been issued yet"
                                        }
                                    </p>
                                </div>
                            )}</>)}
                </div>


            </div>
        </div>
    );
};


export default VoucherManagement;