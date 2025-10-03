import React, {useEffect, useState} from 'react';
import {
    Building,
    Calendar,
    CheckCircle,
    ChevronsRight,
    Eye,
    FileText,
    Loader2,
    Mail,
    MapPin,
    PenLine,
    Phone,
    Plus,
    RefreshCcw,
    RefreshCw,
    Search,
    TicketIcon,
    Users,
    X
} from 'lucide-react';
import {Event, PaginationProps} from '../types';
import {useSearch} from '../hooks/useSearch';
import eventService from "../services/Events.ts";
import EPagination from "../common/EPagination.tsx";
import checkInService from "../services/CheckIn.ts";
import {useEventContext} from "../common/useEventContext.tsx";
import {showError, showSuccess} from "../common/Toaster.ts";
import {useAuthContext} from "../common/useAuthContext.tsx";
import {formatDateTime, PERMISSIONS} from "../common/constants.ts";
import DataLoader from './DataLoader.tsx';


const EventManagement: React.FC = () => {
    const {preSelectedEvent} = useEventContext();

    const [paginations, setPagination] = useState<PaginationProps>({
        number: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0,

    });

    const [attendeePagination, setAttendeePagination] = useState<PaginationProps>({
        number: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0,

    });
    const [currentAttendeePage, setCurrentAttendeePage] = useState<number>(1);
    const [attendeePageSize, setAttendeePageSize] = useState<number>(10);
    const [filterValue, setFilterValue] = useState<any>(undefined)


    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [records, setRecords] = useState<Record[]>([])
    const [attendees, setAttendees] = useState<Record[]>([])


    const {user, hasPermission} = useAuthContext();
    const [showForm, setShowForm] = useState(false);
    const [approvalEvent, setApprovalEvent] = useState<Event | null>(null);
    const [rejected, setRejected] = useState<boolean>(false);
    const [currentView, setCurrentView] = useState<'list' | 'attendees'>('list');
    const [eventId, setEventId] = useState<string>('');
    const [approvalRemarks, setApprovalRemarks] = useState<string>('');
    const [selectedFilterBy, setSelectedFilterBy] = useState('');


    const [selectedEventForView, setSelectedEventForView] = useState<Event | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        endDate: '',
        location: '',
        description: '',
        maxAttendees: 100,
        status: 'active' as 'active' | 'closed' | 'cancelled',
        hasVouchers: false,
        voucherCategories: [] as Array<{
            id: string;
            name: string;
            numberOfItems: number;
            value: number;
        }>,
    });

    const resetForm = () => {
        setFormData({
            name: '',
            date: '',
            endDate: '',
            location: '',
            description: '',
            maxAttendees: 0,
            status: 'active' as 'active' | 'closed' | 'cancelled',
            hasVouchers: false,
            voucherCategories: [] as Array<{
                id: string;
                name: string;
                numberOfItems: number;
                value: number;
            }>,
        });
    }


    const fetchAttendeeData = async (page: number, pageSize: number, eventId: string, selectedFilteredBy: string, selectedFilterVlaue) => {
        setLoadingData(true)

        await checkInService.getAttendeesPaginated(page, pageSize, eventId, selectedFilteredBy, selectedFilterVlaue).then(
            data => {
                const {content, page: {number, size, totalPages, totalElements}} = data
                setAttendees(content)
                setAttendeePagination({
                    number: number,
                    size: size,
                    totalElements: totalElements,
                    totalPages: totalPages,

                })
                setCurrentAttendeePage(page)


                setLoadingData(false)


            }
        ).catch(error => {
            console.log(error)
            setLoadingData(false)
            setAttendees([])
            setAttendeePagination({
                number: 1,
                size: 10,
                totalElements: 0,
                totalPages: 0,

            })
            setCurrentAttendeePage(1)


        });
    }

    useEffect(() => {
        if (eventId !== '' && eventId !== undefined) {
            if (
                (selectedFilterBy !== '' && selectedFilterBy !== undefined && !filterValue) || // selectedFilterBy has value, filterValue is empty
                (filterValue && (selectedFilterBy === '' || selectedFilterBy === undefined))     // filterValue has value, selectedFilterBy is empty
            ) {
                return;
            }

            fetchAttendeeData(currentAttendeePage, attendeePageSize, eventId, selectedFilterBy, filterValue);
        } else {
            setAttendees([])
            setAttendeePagination({
                number: 1,
                size: 10,
                totalElements: 0,
                totalPages: 0,

            })
            setCurrentAttendeePage(1)
        }


    }, [eventId, attendeePageSize, currentAttendeePage, selectedFilterBy, filterValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (approvalEvent) {
            const requestData = {id: approvalEvent.id, remarks: approvalRemarks, approved: !rejected};


            // Initiate Event Creation
            eventService.approveEvent(requestData).then(
                data => {
                    const {message, error} = data;

                    showSuccess(message)
                    handleCancel();


                    // Fetch New Events
                    fetchData(1, pageSize, preSelectedEvent?.id)
                    // setCurrentPage(1);


                }
            ).catch(error => {
                console.log(error)
                showError(error || 'Error occured while creating event');


            })

        } else {

            // Initiate Event Creation
            eventService.createEvents(formData).then(
                data => {
                    const {message, error} = data;

                    showSuccess(message)
                    handleCancel();

                    // Fetch New Events
                    fetchData(1, pageSize)
                    // setCurrentPage(1);


                }
            ).catch(error => {
                console.log(error)
                showError(error || 'Error occured while creating event');


            })

        }


    };

    const fetchData = async (page: number, pageSize: number, eventId: never) => {


        setLoadingData(true)
        setCurrentPage(page)
        await eventService.getEventsPaginated(page, pageSize, eventId).then(
            data => {
                const {content, page: {number, size, totalPages, totalElements}} = data
                setRecords(content)
                setPagination({
                    number: currentPage,
                    size: size,
                    totalElements: totalElements,
                    totalPages: totalPages,

                })
                // setCurrentPage(page)

                setLoadingData(false)


            }
        ).catch(error => {
            console.log(error)
            setLoadingData(false)


        });

    }


    useEffect(() => {

        fetchData(currentPage, pageSize, preSelectedEvent?.id)

    }, [currentPage, pageSize]);


    // Search functionality for attendees
    const {searchTerm, setSearchTerm, filteredData: searchedAttendees} = useSearch(
        attendees,
        ['name', 'email', 'department']
    );


    const handleApproval = (event: Event) => {
        setApprovalEvent(event);
        setApprovalRemarks('')
        setRejected(false)
        setFormData({
            name: event.name,
            date: event.date,
            endDate: event.endDate,
            location: event.location,
            description: event.description,
            maxAttendees: event.maxAttendees,
            status: event.status || 'active',
            hasVouchers: event.hasVouchers || false,
            voucherCategories: event.voucherCategories || [],
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);

        setApprovalRemarks('')
        setRejected(false)
        resetForm();
        setApprovalEvent(null);
    };

    const addVoucherCategory = () => {
        const newCategory = {
            id: Date.now().toString(),
            name: '',
            numberOfItems: 1,
            value: 0,
        };
        setFormData({
            ...formData,
            voucherCategories: [...formData.voucherCategories, newCategory],
        });
    };

    const removeVoucherCategory = (categoryId: string) => {
        setFormData({
            ...formData,
            voucherCategories: formData.voucherCategories.filter(cat => cat.id !== categoryId),
        });
    };

    const updateVoucherCategory = (categoryId: string, field: string, value: string | number) => {
        setFormData({
            ...formData,
            voucherCategories: formData.voucherCategories.map(cat =>
                cat.id === categoryId ? {...cat, [field]: value} : cat
            ),
        });
    };


    const handleViewAttendees = (event: Event) => {
        setSelectedEventForView(event);
        resetAttendeePage();

        setCurrentView('attendees');
        setEventId(event.id);


    };

    const handleBackToEvents = () => {
        setCurrentView('list');
        setSelectedEventForView(null);

        resetAttendeePage()

    };

    const handleAttendeeFilterLookup = async () => {
        if (!searchTerm.trim()) {
            return;
        }

        setFilterValue(searchTerm);
        setCurrentAttendeePage(1);


    };

    const resetAttendeePage = () => {

        setSearchTerm('');
        setFilterValue('');

        setSelectedFilterBy('');
        setCurrentAttendeePage(1)


    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-coop-yellow-100 text-coop-yellow-800';
            case 'approved':
                return 'bg-coop-100 text-coop-800';
            case 'rejected':
                return 'bg-coop-red-100 text-coop-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Render attendee view page
    if (currentView === 'attendees' && selectedEventForView) {


        return (
            <div className="space-y-6">
                {/* Header with back navigation */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleBackToEvents}
                        className="flex items-center space-x-2 text-coop-600 hover:text-coop-700 transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                        </svg>
                        <span>Back to Events</span>
                    </button>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{selectedEventForView.name}</h1>
                        <p className="text-gray-600 mt-1">
                            {new Date(selectedEventForView.date).toLocaleDateString()} • {selectedEventForView.location} • {attendeePagination.totalElements} attendees
                        </p>
                    </div>
                </div>


                {/*</div>*/}

                {/* Search and Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        {/*<div className="flex-1 max-w-md">*/}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by</label>
                                <select
                                    value={selectedFilterBy}
                                    onChange={(e) => setSelectedFilterBy(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                >
                                    <option value="">Select filter</option>
                                    <option value="pfNumber">PF Number</option>
                                    {/*<option value="email">Email</option>*/}

                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2"> Filter
                                    Value</label>
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
                                        onClick={handleAttendeeFilterLookup}
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

                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Capacity: {attendeePagination.totalElements} / {selectedEventForView.maxAttendees}
                            </p>
                            {(searchTerm || selectedFilterBy) && (
                                <button
                                    onClick={resetAttendeePage}
                                    className="text-sm text-coop-600 hover:text-coop-700 font-medium"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>

                        {/*</div>*/}

                    </div>
                </div>

                {/* Attendees List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Attendees</h2>
                            {attendees.length > 0 && attendeePagination.totalPages > 1 && <>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">


                                    <EPagination currentPage={currentAttendeePage} setPageSize={setAttendeePageSize}
                                                 pageCount={attendeePagination.totalPages}
                                                 handlePageChange={function (page: number): void {
                                                     if (page !== currentPage) {
                                                         setCurrentAttendeePage(page)
                                                     }
                                                 }} pagesize={attendeePageSize}/>
                                </div>

                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4"/>
                                    <span>Page {currentAttendeePage} of {attendeePagination.size}</span>
                                </div>
                            </>
                            }
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200 relative border rounded-lg bg-gray-50">
                        {loadingData ? (
                            <DataLoader isLoading={loadingData}/>
                        ) : (
                            <>
                                {
                                    attendees.length > 0 ? (
                                        attendees.map((attendee) => (
                                            <div key={attendee.id} className="p-6 hover:bg-gray-50 transition-colors">
                                                <div
                                                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="text-lg font-medium text-gray-900">{attendee.name}</h3>
                                                            <span
                                                                className="px-2 py-1 bg-coop-100 text-coop-800 rounded-full text-xs font-medium">
                          {attendee.eventId.name}
                        </span>
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge('approved')}`}>
                          {'approved'.charAt(0).toUpperCase() + 'approved'.slice(1)}
                        </span>
                                                        </div>

                                                        <div
                                                            className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                            <div className="flex items-center">
                                                                <Mail className="h-4 w-4 mr-2 flex-shrink-0"/>
                                                                <span className="truncate">{attendee.email}</span>
                                                            </div>
                                                            {attendee.phone && (
                                                                <div className="flex items-center">
                                                                    <Phone className="h-4 w-4 mr-2 flex-shrink-0"/>
                                                                    <span>{attendee.phone}</span>
                                                                </div>
                                                            )}
                                                            {attendee.department && (
                                                                <div className="flex items-center">
                                                                    <Building className="h-4 w-4 mr-2 flex-shrink-0"/>
                                                                    <span>{attendee.department}</span>
                                                                </div>
                                                            )}
                                                            {attendee.pfNumber && (
                                                                <div className="flex items-center">
                                                                    <ChevronsRight
                                                                        className="h-4 w-4 mr-2 flex-shrink-0"/>
                                                                    <span> Identifier (PF) : {attendee.pfNumber}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center mt-2 text-sm text-gray-500">
                                                            <Calendar className="h-4 w-4 mr-2"/>
                                                            <span>CheckedIn: {new Date(attendee.registeredAt).toLocaleDateString()}</span>
                                                            {attendee.reviewedAt && (
                                                                <span className="ml-4">
                            • Reviewed: {new Date(attendee.reviewedAt).toLocaleDateString()}
                          </span>
                                                            )}
                                                        </div>


                                                    </div>


                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center">
                                            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4"/>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees
                                                found</h3>
                                            <p className="text-gray-600">
                                                {searchTerm
                                                    ? "No attendees match your search criteria"
                                                    : "No attendees have been registered for this event yet"
                                                }
                                            </p>
                                        </div>
                                    )
                                } </>)
                        }
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    {/*<h1 className="text-3xl font-bold text-gray-900">Event(s)</h1>*/}
                    <p className="text-gray-600 mt-1">{hasPermission(PERMISSIONS.VAEA) ? 'Events' : 'Create and manage company events'}</p>
                </div>
                {hasPermission(PERMISSIONS.CME) && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors flex items-center space-x-2"
                    >
                        <Plus className="h-4 w-4"/>
                        <span>New Event</span>
                    </button>
                )}
            </div>


            {/* Event Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {approvalEvent ? 'Approve/Reject Event' : 'Create New Event'}
                                </h2>
                                <button
                                    onClick={handleCancel}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Event Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        readOnly={approvalEvent}
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                        placeholder="End of Year Party 2024"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        required

                                        readOnly={approvalEvent}
                                        value={formData.date}
                                        // onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        onChange={(e) => {
                                            const newStartDate = e.target.value;
                                            let newEndDate = formData.endDate;

                                            // If end date is before new start date, reset it
                                            if (newEndDate && newEndDate < newStartDate) {
                                                newEndDate = '';
                                            }


                                            setFormData({...formData, date: newStartDate, endDate: newEndDate})
                                        }}
                                        min={new Date().toISOString().split('T')[0]} // disables past dates

                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date *
                                    </label>

                                    <input
                                        type="date"
                                        required
                                        readOnly={approvalEvent}
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                        min={formData.date || new Date().toISOString().split('T')[0]}
                                        disabled={!formData.date}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 ${
                                            !formData.date ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                                        }`}
                                    />

                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        readOnly={approvalEvent}

                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                        placeholder="Grand Ballroom, Hotel Plaza"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Expected No of Attendees *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        readOnly={approvalEvent}

                                        min="1"
                                        value={formData.maxAttendees}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            maxAttendees: parseInt(e.target.value)
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    readOnly={approvalEvent}

                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                    placeholder="Join us for an evening of celebration..."
                                />
                            </div>


                            {/* Voucher Configuration */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center space-x-3 mb-4">
                                    <input
                                        type="checkbox"
                                        id="hasVouchers"
                                        readOnly={approvalEvent}
                                        checked={formData.hasVouchers}
                                        onChange={(e) => {
                                            const hasVouchers = e.target.checked;
                                            setFormData({
                                                ...formData,
                                                hasVouchers,
                                                voucherCategories: hasVouchers ? formData.voucherCategories : [],
                                            });
                                        }}
                                        className="rounded border-gray-300 text-coop-600 focus:ring-coop-500"
                                    />
                                    <label htmlFor="hasVouchers"
                                           className="flex items-center text-sm font-medium text-gray-700">
                                        <TicketIcon className="h-4 w-4 mr-2"/>
                                        Enable Vouchers for this Event
                                    </label>
                                </div>

                                {formData.hasVouchers && (
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-gray-900">Voucher Categories</h4>
                                            <button
                                                type="button"
                                                disabled={approvalEvent}
                                                onClick={addVoucherCategory}
                                                className="bg-coop-600 text-white px-3 py-1 rounded text-sm hover:bg-coop-700 transition-colors flex items-center space-x-1"
                                            >
                                                <Plus className="h-3 w-3"/>
                                                <span>Add Category</span>
                                            </button>
                                        </div>

                                        {formData.voucherCategories.length === 0 && (
                                            <div className="text-center py-4 text-gray-500 text-sm">
                                                No voucher categories added yet. Click "Add Category" to create one.
                                            </div>
                                        )}

                                        {formData.voucherCategories.map((category, index) => (
                                            <div key={category.id}
                                                 className="bg-white rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h5 className="font-medium text-gray-800">Category {index + 1}</h5>
                                                    <button
                                                        type="button"
                                                        disabled={approvalEvent}
                                                        onClick={() => removeVoucherCategory(category.id)}
                                                        className="text-red-600 hover:text-red-800 transition-colors"
                                                    >
                                                        <X className="h-4 w-4"/>
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div>
                                                        <label
                                                            className="block text-xs font-medium text-gray-600 mb-1">
                                                            Category Name *
                                                        </label>
                                                        <input
                                                            readOnly={approvalEvent}

                                                            type="text"
                                                            required={formData.hasVouchers}
                                                            value={category.name}
                                                            onChange={(e) => updateVoucherCategory(category.id, 'name', e.target.value)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-coop-500 focus:border-coop-500"
                                                            placeholder="e.g., Soft Drinks, Meals"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            className="block text-xs font-medium text-gray-600 mb-1">
                                                            Number of Items *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            required={formData.hasVouchers}
                                                            // min="1"
                                                            readOnly={approvalEvent}

                                                            value={category.numberOfItems}
                                                            onChange={(e) => updateVoucherCategory(category.id, 'numberOfItems', parseInt(e.target.value) || 1)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-coop-500 focus:border-coop-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            className="block text-xs font-medium text-gray-600 mb-1">
                                                            Value (KES) *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            required={formData.hasVouchers}
                                                            min="0"
                                                            step="0.01"
                                                            value={category.value}
                                                            readOnly={approvalEvent}
                                                            onChange={(e) => updateVoucherCategory(category.id, 'value', parseFloat(e.target.value) || 0)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-coop-500 focus:border-coop-500"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {formData.hasVouchers && formData.voucherCategories.length === 0 && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                <p className="text-yellow-800 text-sm">
                                                    <strong>Note:</strong> At least one voucher category is required
                                                    when vouchers are enabled.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {approvalEvent && <div>
                                <label className="block text-sm font-medium text-red-700 mb-2">
                                    Approval /Rejection Remarks
                                </label>
                                <textarea
                                    rows={3}

                                    required
                                    value={approvalRemarks}
                                    onChange={(e) => setApprovalRemarks(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                    placeholder="Provide approval or rejection remarks..."
                                />
                            </div>
                            }

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                {approvalEvent &&
                                    <button
                                        type="submit"
                                        onClick={() => setRejected(true)}
                                        disabled={formData.hasVouchers && formData.voucherCategories.length === 0}
                                        className="bg-red-600  text-red px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        {'Reject'}
                                    </button>
                                }
                                <button
                                    type="submit"
                                    onClick={() => setRejected(false)}

                                    disabled={formData.hasVouchers && formData.voucherCategories.length === 0}
                                    className="bg-coop-600 text-white px-6 py-2 rounded-lg hover:bg-coop-700 transition-colors"
                                >
                                    {approvalEvent ? 'Approve Event' : 'Create Event'}
                                </button>


                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Events List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">

                <div className="p-6 border-b border-gray-200">
                    {records.length > 0 && paginations?.totalPages > 1 &&

                        <div className="flex items-center justify-between">
                            {/*<h2 className="text-lg font-semibold text-gray-900">System Users</h2>*/}
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


                                <span>Page {currentPage} of {paginations.totalPages}</span>
                            </div>
                        </div>
                    }


                    <div className="justify-items-end">
                        <button
                            type="button"
                            onClick={() => {
                                fetchData(currentPage, pageSize, preSelectedEvent?.id)


                            }}
                            disabled={loadingData}
                            className="bg-coop-orange-400 text-white px-4 py-2 rounded-lg hover:bg-info-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                        >

                            <span>{'Reload'}</span>
                        </button>
                    </div>


                </div>

                <div className="divide-y divide-gray-200 relative ">
                    {loadingData ? (
                        <DataLoader isLoading={loadingData}/>
                    ) : (
                        <>
                            {(hasPermission(PERMISSIONS.VAE) || hasPermission(PERMISSIONS.VAEO)) && records.length > 0 ? (
                                records.map((event) => {

                                    const approvedCount = event.noOfAttendees;
                                    const isUpcoming = true;


                                    return (
                                        <div key={event.id}
                                             className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            event.status.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                                event.status.toUpperCase() === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                                                                    'bg-red-100 text-red-800'
                                                        }`}>
                        {event.status?.charAt(0).toUpperCase() + event.status?.slice(1) || 'Active'}
                      </span>
                                                        {event.hasVouchers && (
                                                            <span
                                                                className="px-2 py-1 rounded-full text-xs font-medium bg-coop-100 text-coop-800 flex items-center space-x-1">
                          <TicketIcon className="h-3 w-3"/>
                          <span>Vouchers</span>
                        </span>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                        <div className="flex items-center text-gray-600">
                                                            <Calendar className="h-4 w-4 mr-2"/>
                                                            <span>{`${new Date(event.date).toLocaleDateString()} - ${event.endDate && new Date(event.endDate).toLocaleDateString() || new Date(event.date).toLocaleDateString()} `}</span>
                                                            {/*{isUpcoming && (*/}
                                                            {/*        <EventTimer eventDate={event.date} eventName={event.name}*/}
                                                            {/*                    compact/>*/}

                                                            {/*)}*/}
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <MapPin className="h-4 w-4 mr-2"/>
                                                            <span>{event.location}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <Users className="h-4 w-4 mr-2"/>
                                                            <span>{event.noOfAttendees} / {event.maxAttendees} attendees</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                        {event.description && (
                                                            <div className="flex items-center text-gray-600">
                                                                <FileText className="h-4 w-4 mr-2"/>
                                                                <span>{event.description}</span>

                                                            </div>
                                                        )}

                                                        {hasPermission(PERMISSIONS.VAE) && (<>
                                                            {event.createdBy && (
                                                                <div className="flex items-center text-gray-600">
                                                                    <PenLine className="h-4 w-4 mr-2"/>
                                                                    <span>CreatedBy: {event.createdBy.fullName} </span>
                                                                </div>
                                                            )}

                                                            {event.updatedBy && (
                                                                <div className="flex items-center text-gray-600">
                                                                    <RefreshCcw className="h-4 w-4 mr-2"/>
                                                                    <span>UpdatedBy: {event.updatedBy.fullName} </span>
                                                                </div>
                                                            )}
                                                        </>)
                                                        }


                                                    </div>


                                                    {hasPermission(PERMISSIONS.VAE) && (<>


                                                            <div
                                                                className="flex items-center mt-2 text-sm text-gray-500">
                                                                <Calendar className="h-4 w-4 mr-2"/>
                                                                <span>CreatedAt: {formatDateTime(event.dateCreated)}</span>
                                                                {event.approvalDate && (
                                                                    <span className="ml-4">
                            • ApprovedOn: {formatDateTime(event.approvalDate)}
                          </span>
                                                                )}

                                                            </div>
                                                            {event.status === 'REJECTED' && event.approvalRemarks && (
                                                                <div
                                                                    className="mt-2 p-3 bg-coop-red-50 border border-coop-red-200 rounded-lg">
                                                                    <p className="text-sm text-coop-red-800">
                                                                        <strong>Rejection
                                                                            Reason:</strong> {event.approvalRemarks}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </>
                                                    )
                                                    }

                                                    {event.hasVouchers && event.voucherCategories && event.voucherCategories.length > 0 && (
                                                        <div className="mb-4 mt-4">
                                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Voucher
                                                                Categories:</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {event.voucherCategories.map((category) => (
                                                                    <span key={category.id}
                                                                          className="px-2 py-1 bg-coop-50 text-coop-700 rounded text-xs">
                              {category.name} ( Items {category.numberOfItems} - value: Ksh {category.value})
                            </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-coop-600 h-2 rounded-full transition-all duration-300"
                                                                style={{
                                                                    width: `${Math.min((approvedCount / event.maxAttendees) * 100, 100)}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm text-gray-600">
                        {Math.round((approvedCount / event.maxAttendees) * 100)}% full
                      </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2 ml-6">
                                                    {hasPermission(PERMISSIONS.VSEA) && event.noOfAttendees > 0 &&
                                                        <button
                                                            onClick={() => handleViewAttendees(event)}
                                                            className="p-2 text-gray-600 hover:text-coop-600 hover:bg-coop-50 rounded-lg transition-colors"
                                                            title="View Attendees"
                                                        >
                                                            <Eye className="h-4 w-4"/>
                                                        </button>
                                                    }
                                                    {hasPermission(PERMISSIONS.APE) && event?.createdBy?.id !== user?.id && event.status.toUpperCase() === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproval(event)}
                                                                className="p-2 text-gray-600 hover:text-coop-600 hover:bg-coop-50 rounded-lg transition-colors"
                                                                title="Approve/Reject"
                                                            >
                                                                <CheckCircle
                                                                    className="w-6 h-6 text-green-500 cursor-pointer"/>

                                                            </button>

                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12">
                                    {loadingData ? (
                                        <DataLoader isLoading={loadingData}/>


                                    ) : (
                                        <>
                                            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4"/>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                                            <p className="text-gray-600 mb-6">Create your first event to get started</p>
                                            {hasPermission(PERMISSIONS.CME) && (
                                                <button
                                                    onClick={() => setShowForm(true)}
                                                    className="bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors"
                                                >
                                                    Create Event
                                                </button>

                                            )}
                                        </>)}
                                </div>
                            )} </>)
                    }
                </div>
            </div>
        </div>
    );
};

export default EventManagement;