import React, {useEffect, useState} from 'react';
import {
    AlertCircle,
    Building,
    Calendar,
    CheckCircle,
    ChevronsRight,
    Filter,
    Loader2,
    Mail,
    Phone,
    RefreshCw,
    Search,
    TicketIcon,
    UserPlus
} from 'lucide-react';
import {PaginationProps} from '../types';
import eventService from "../services/Events.ts";
import checkInService from "../services/CheckIn.ts";
import apiUtilityService from "../services/Utility.ts";
import EPagination from "../common/EPagination.tsx";
import {useSearch} from '../hooks/useSearch';
import {useEventContext} from "../common/useEventContext.tsx";
import {showError, showInfo, showSuccess} from "../common/Toaster.ts";
import {PERMISSIONS} from "../common/constants.ts";
import {useAuthContext} from "../common/useAuthContext.tsx";
import DataLoader from "./DataLoader.tsx";


const AttendeeManagement: React.FC
    = () => {
    const {preSelectedEvent} = useEventContext();

    const {user, hasPermission} = useAuthContext();

    const [showForm, setShowForm] = useState(false);
    const [events, setEvents] = useState<Record[]>([])
    const [assignedVouchers, setAssignedVouchers] = useState<Record[]>([])

    const [eventsWithAttendee, setEventsWithAttendees] = useState<Record[]>([])

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [attendees, setAttendees] = useState<Record[]>([])
    const [pagination, setPagination] = useState<PaginationProps>({
        number: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        items: 0

    });

    const [selectedFilterBy, setSelectedFilterBy] = useState('');
    const [filterValue, setFilterValue] = useState<any>(undefined)

    const [selectedEvent, setSelectedEvent] = useState('');
    const [attendeeEvent, setAttendeeEvent] = useState('');

    const [isRetrievingUser, setIsRetrievingUser] = useState(false);
    const [lookupError, setLookupError] = useState('');
    const [lookupSuccess, setLookupSuccess] = useState(false);
    const [formData, setFormData] = useState({
        eventId: '',
        pfNumber: '',
        name: '',
        email: '',
        phone: '',
        department: '',
    });

    // Search functionality
    // Search functionality
    const {searchTerm, setSearchTerm, filteredData: searchedAttendees} = useSearch(
        attendees,
        ['name', 'email', 'department']
    );

    const resetFormData = () => {

        setFormData({
            eventId: '',
            pfNumber: '',
            name: '',
            email: '',
            phone: '',
            department: '',
        })

    }


    const fetchEventsData = async (status: never) => {


        await eventService.getEventsByStatus(status).then(
            data => {

                setEvents(data)

                // Update selected Event
                if (data?.length > 0) {
                    setSelectedEvent(data[0].id)
                }


            }
        ).catch(error => {
            console.log(error)


        });
    }


    const fetchEventsWithAttendees = async () => {


        await eventService.getEventsWithAttendees().then(
            data => {

                setEventsWithAttendees(data)

                // Update selected Event
                if (data?.length > 0) {
                    setAttendeeEvent(data[0].id)
                }


            }
        ).catch(error => {
            console.log(error)


        });
    }

    useEffect(() => {
        if (!preSelectedEvent) {
            fetchEventsData('active');
            fetchEventsWithAttendees();
        } else {
            setEventsWithAttendees([preSelectedEvent])
            setEvents([preSelectedEvent])
            setSelectedEvent(preSelectedEvent.id)


            setAttendeeEvent(preSelectedEvent.id)
        }
    }, []);


    const fetchData = async (page: number, pageSize: number, eventId: string, selectedFilterBy, filterValue) => {
        setLoadingData(true)

        setCurrentPage(page)
        await checkInService.getAttendeesPaginated(page, pageSize, eventId, selectedFilterBy, filterValue).then(
            data => {
                const {content, page: {number, size, totalPages, totalElements}} = data
                setAttendees(content)
                setPagination({
                    number: currentPage,
                    size: pageSize,
                    totalElements: totalElements,
                    totalPages: totalPages,
                    items: size

                })


                setLoadingData(false)


            }
        ).catch(error => {
            console.log(error)
            setLoadingData(false)


        });
    }

    useEffect(() => {
        if (attendeeEvent !== '' && attendeeEvent !== undefined) {
            if (
                (selectedFilterBy !== '' && selectedFilterBy !== undefined && !filterValue) || // selectedFilterBy has value, filterValue is empty
                (filterValue && (selectedFilterBy === '' || selectedFilterBy === undefined))     // filterValue has value, selectedFilterBy is empty
            ) {
                return;
            }

            fetchData(currentPage, pageSize, attendeeEvent, selectedFilterBy, filterValue)
        } else {
            setAttendees([]);
        }

    }, [currentPage, pageSize, attendeeEvent, selectedFilterBy, filterValue]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // For external users, use the selected event automatically
        const eventId = preSelectedEvent ? preSelectedEvent.id : formData.eventId;

        // Check if registration is allowed for the selected event
        if (!isEventRegistrationOpen(eventId)) {
            showInfo('Registration is only allowed on the event day');
            return;
        }


        // Initiate Payment
        checkInService.checkIntoEvent({
            ...formData,
            eventId
        }).then(
            data => {
                const {message, error, result} = data;

                showSuccess(message)
                if (!(result?.length > 0)) {
                    resetForm()
                    // Retrieve Data
                    if (!preSelectedEvent) {
                        fetchEventsWithAttendees();

                    }
                    if (reloadData) {
                        fetchData(1, pageSize, attendeeEvent, selectedFilterBy, filterValue)

                    }
                } else {
                    setAssignedVouchers(result)
                }

            }
        ).catch(error => {
            console.log(error)
            showError(error || 'Error occured while creating event');


        })


    };

    const lookupUserByPFForUserManagement = async (pfNumber: never) => {
        return apiUtilityService.getStaffDetails(pfNumber).then(
            data => {

                return data;


            }
        ).catch(error => {
            console.log(error)
            return null;

        });

    };

    const handlePFLookup = async () => {
        if (!formData.pfNumber.trim()) {
            setLookupError('');
            setLookupSuccess(false);
            return;
        }

        setIsRetrievingUser(true);
        setLookupError('');
        setLookupSuccess(false);

        try {
            // const result = await lookupUserByPF(formData.pfNumber.trim());

            const result = await lookupUserByPFForUserManagement(formData.pfNumber.trim());

            if (result) {
                setFormData(prev => ({
                    ...prev,
                    name: result!.name,
                    department: result!.branchCode + ':' + result!.branchName || prev.department,
                    email: result!.email,

                }));
                setLookupSuccess(true);
                setLookupError('');
            } else {
                setLookupError(result.error || 'Attendee not found');
                setLookupSuccess(false);
                // Clear fields on error
                setFormData(prev => ({
                    ...prev,
                    name: '',
                    email: '',
                    department: '',
                }));
            }
        } catch (error) {
            setLookupError('Failed to lookup user details');
            setLookupSuccess(false);
        } finally {
            setIsRetrievingUser(false);
        }
    };

    const handlePFNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const pfNumber = e.target.value;
        setFormData({...formData, pfNumber});

        // Clear previous lookup state and other fields when PF number changes
        if (pfNumber !== formData.pfNumber) {
            setLookupError('');
            setLookupSuccess(false);
            setFormData(prev => ({
                ...prev,
                pfNumber,
                name: '',
                email: '',
                department: '',
            }));
        }
    };


    const isEventRegistrationOpen = (eventId: string) => {
        const event = events.find(e => e.id == eventId);

        if (!event) return false;

        const eventDate = new Date(event.date);
        const today = new Date();

        // Set both dates to start of day for accurate comparison
        eventDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // return eventDate.getTime() === today.getTime();
        return true;


    };

    const getRegistrationStatus = (eventId: number) => {
        const event = events.find(e => e.id == eventId);
        if (!event) return {canRegister: false, message: 'Event not found'};

        const eventDate = new Date(event.date);
        const today = new Date();

        eventDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // if (eventDate.getTime() === today.getTime()) {
        //     return {canRegister: true, message: 'Registration is open today!'};
        // } else if (eventDate.getTime() > today.getTime()) {
        //     const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        //     return {
        //         canRegister: false,
        //         message: `Registration opens on ${eventDate.toLocaleDateString()} (${daysUntil} day${daysUntil === 1 ? '' : 's'} from now)`
        //     };
        // } else {
        //     return {canRegister: false, message: 'Registration has closed for this event'};
        // }

        return true
    };

    // Reset pagination when filters change
    // React.useEffect(() => {
    //     pagination.resetPage();
    // }, [searchTerm, selectedEvent, selectedDepartment, selectedStatus]);


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


    const resetForm = () => {
        const reloadData = assignedVouchers.length > 0;
        setShowForm(false);
        resetFormData()
        setLookupError('');
        setLookupSuccess(false);
        setAssignedVouchers([])
        if (!preSelectedEvent) {
            fetchEventsWithAttendees();

        }


        if (reloadData) {
            fetchData(1, pageSize, attendeeEvent, selectedFilterBy, filterValue)

        }


    };
    const handleFilterLookup = async () => {
        if (!searchTerm.trim()) {
            return;
        }

        setFilterValue(searchTerm);
        setCurrentPage(1);


    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    {/*<h1 className="text-3xl font-bold text-gray-900">Event Attendees</h1>*/}
                    <p className="text-gray-600 mt-1">Check In and manage event attendees</p>

                </div>
                {hasPermission(PERMISSIONS.CIA) &&
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors flex items-center space-x-2"
                    >
                        <UserPlus className="h-4 w-4"/>
                        <span>CheckIn Attendee</span>
                    </button>
                }
            </div>

            {/* Registration Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900">CheckIn Attendee</h2>
                                <button
                                    onClick={resetForm}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">


                            {assignedVouchers.length > 0 ? (
                                <div
                                    className="bg-coop-50 border border-coop-200 rounded-lg p-3 min-w-[200px]">
                                    <div className="flex items-center justify-center mb-2">


                                        <span
                                            className="text-sm font-medium text-coop-800"> <b>{formData.name}</b></span>
                                    </div>
                                    <div className="flex items-center justify-center mb-2">
                                        <TicketIcon className="h-4 w-4 text-coop-600 mr-1"/>
                                        <span className="text-sm font-medium text-coop-800">Voucher(s) Issued</span>
                                    </div>

                                    <div className="text-sm text-coop-700 space-y-3">
                                        {assignedVouchers.map((v: {
                                            id: number;
                                            voucherNumber: string;
                                            createdAt: string;
                                            claimedNumber: number;
                                            fullyClaimed: boolean;
                                            voucherCategory: {
                                                id: number;
                                                name: string;
                                                value: number;
                                                numberOfItems: number;
                                            };
                                        }) => (
                                            <div key={v.id}
                                                 className="space-y-1 border-t border-coop-100 pt-2">
                                                {/*<p className="font-mono text-center text-coop-800">No: {v.voucherNumber}</p>*/}
                                                <div
                                                    className="flex justify-between font-mono text-coop-800">
                                                    <span>No:</span>
                                                    <span
                                                        className="font-medium">{v.voucherNumber}</span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span>{v.voucherCategory.name}:</span>
                                                    <span
                                                        className="font-medium">{v.claimedNumber}/{v.voucherCategory.numberOfItems}</span>
                                                </div>

                                                {/*<div className="flex justify-between">*/}
                                                {/*    <span>Hard Drinks:</span>*/}
                                                {/*    <span className="font-medium">{v.hardDrinks.claimed}/{v.hardDrinks.total}</span>*/}
                                                {/*</div>*/}

                                                {v.fullyClaimed && (
                                                    <div
                                                        className="mt-1 text-xs bg-coop-100 text-coop-800 px-2 py-1 rounded text-center">
                                                        Fully Used
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (

                                <>


                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Event *
                                        </label>
                                        {

                                            preSelectedEvent ? (
                                                <div
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                        <span
                                            className="text-gray-900">{preSelectedEvent.name} - {new Date(preSelectedEvent.date).toLocaleDateString()}</span>
                                                    <p className="text-sm text-gray-600 mt-1">Event automatically
                                                        selected</p>
                                                </div>
                                            ) : (
                                                <select
                                                    required
                                                    value={formData.eventId}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        eventId: e.target.value
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                                >
                                                    <option value="">Choose an event...</option>
                                                    {events.map((event) => (
                                                        <option key={event.id} value={event.id}>
                                                            {event.name} - {new Date(event.date).toLocaleDateString()}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        {(formData.eventId || (preSelectedEvent)) && (
                                            <div className="mt-2">
                                                {(() => {
                                                    const eventId = preSelectedEvent ? preSelectedEvent.id : formData.eventId;
                                                    const status = getRegistrationStatus(eventId);
                                                    return (
                                                        <p className={`text-sm ${status.canRegister ? 'text-green-600' : 'text-yellow-600'}`}>
                                                            {status.message}
                                                        </p>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>

                                    {/* PF Number Lookup */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            PF Number *
                                        </label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                required
                                                value={formData.pfNumber}
                                                onChange={handlePFNumberChange}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                                placeholder="Enter PF Number (e.g., PF001)"
                                            />
                                            <button
                                                type="button"
                                                onClick={handlePFLookup}
                                                disabled={!formData.pfNumber.trim() || isRetrievingUser}
                                                className="bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                                            >
                                                {isRetrievingUser ? (
                                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                                ) : (
                                                    <RefreshCw className="h-4 w-4"/>
                                                )}
                                                <span>{isRetrievingUser ? 'Retrieving...' : 'Retrieve'}</span>
                                            </button>
                                        </div>

                                        {lookupError && (
                                            <p className="text-red-600 text-sm mt-1 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1"/>
                                                {lookupError}
                                            </p>
                                        )}
                                        {lookupSuccess && (
                                            <p className="text-green-600 text-sm mt-1 flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-1"/>
                                                Employee details retrieved successfully
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Enter employee PF number and click Retrieve to auto-fill details
                                        </p>
                                    </div>

                                    {/* Employee Details - Only show after successful PF lookup */}
                                    {lookupSuccess && (
                                        <div className="space-y-4 border-t border-gray-200 pt-4">
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <div className="flex items-center mb-3">
                                                    <CheckCircle className="h-5 w-5 text-green-600 mr-2"/>
                                                    <h3 className="font-medium text-green-900">Employee Details
                                                        Retrieved</h3>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label
                                                            className="block text-sm font-medium text-green-800 mb-2">
                                                            Full Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.name}
                                                            readOnly
                                                            className="w-full px-3 py-2 border border-green-300 rounded-lg bg-green-50 cursor-not-allowed text-green-900"
                                                        />
                                                        <p className="text-xs text-green-600 mt-1">Retrieved from
                                                            employee
                                                            directory</p>
                                                    </div>
                                                    <div>
                                                        <label
                                                            className="block text-sm font-medium text-green-800 mb-2">
                                                            Email *
                                                        </label>
                                                        <input
                                                            type="email"
                                                            required
                                                            value={formData.email}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                email: e.target.value
                                                            })}

                                                            // readOnly={ !(!formData.email)}
                                                            className={(!formData.email) ? "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500" : "w-full px-3 py-2 border border-green-300 rounded-lg bg-green-50 cursor-not-allowed text-green-900"}
                                                        />
                                                        <p className="text-xs text-green-600 mt-1">Retrieved from
                                                            employee
                                                            directory</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    <div>
                                                        <label
                                                            className="block text-sm font-medium text-green-800 mb-2">
                                                            Department
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.department}
                                                            // readOnly={formData.department}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                department: e.target.value
                                                            })}

                                                            className={!formData.department ? "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500" : "w-full px-3 py-2 border border-green-300 rounded-lg bg-green-50 cursor-not-allowed text-green-900"}
                                                        />
                                                        <p className="text-xs text-green-600 mt-1">Retrieved from
                                                            employee
                                                            directory</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Phone Number (Optional)
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                phone: e.target.value
                                                            })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                                            placeholder="254712345678"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={preSelectedEvent ?
                                                !isEventRegistrationOpen(preSelectedEvent.id) || !lookupSuccess :
                                                !formData.eventId || !isEventRegistrationOpen(formData.eventId) || !lookupSuccess}
                                            className="bg-coop-600 text-white px-6 py-2 rounded-lg hover:bg-coop-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            CheckIn Attendee
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>


                </div>
            )}

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Events</label>
                        <select
                            value={attendeeEvent}
                            onChange={(e) => setAttendeeEvent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                        >
                            {!preSelectedEvent && (
                                <option value="">Select Event</option>
                            )}
                            {eventsWithAttendee.map((event) => (
                                <option key={event.id} value={event.id}>
                                    {event.name}
                                </option>
                            ))}
                        </select>
                    </div>

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

                {(searchTerm || selectedFilterBy) && (
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            {/*    Showing {pagination.items} of {pagination.totalElements} attendees*/}
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedFilterBy('')
                                setFilterValue('')
                                setCurrentPage(1)

                            }}
                            className="text-sm text-coop-600 hover:text-coop-700 font-medium"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            {/* Attendees List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">


                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">

                        {attendees.length > 0 && pagination.totalPages > 1 && <>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">


                                <EPagination currentPage={currentPage} setPageSize={setPageSize}
                                             pageCount={pagination.totalPages}
                                             handlePageChange={function (page: number): void {
                                                 if (page !== currentPage) {
                                                     setCurrentPage(page)
                                                 }
                                             }} pagesize={pageSize}/>
                            </div>

                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Filter className="h-4 w-4"/>
                                <span>Page {currentPage} of {pagination.totalPages}</span>
                            </div>
                        </>
                        }
                    </div>
                </div>

                <div className="divide-y divide-gray-200 relative  border rounded-lg bg-gray-50">
                    {loadingData ? (
                        <DataLoader isLoading={loadingData}/>
                    ) : (
                        <>
                            { (hasPermission(PERMISSIONS.VA) || hasPermission(PERMISSIONS.VAEA)) && attendees.length > 0 ? (
                                attendees.map((attendee) => {
                                    const voucher = attendee.voucherId;
                                    return (
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
                                                            <span>{attendee.email}</span>
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
                                                                <ChevronsRight className="h-4 w-4 mr-2 flex-shrink-0"/>
                                                                <span> PF No. {attendee.pfNumber}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div
                                                        className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center mt-2 text-sm text-gray-500">
                                                            <Calendar className="h-4 w-4 mr-2"/>
                                                            <span>CheckedIn: {`${new Date(attendee.registeredAt).toLocaleDateString()} ${new Date(attendee.registeredAt).toLocaleTimeString()}`}</span>
                                                            {attendee.reviewedAt && (
                                                                <span className="ml-4">
                            • Reviewed: {new Date(attendee.reviewedAt).toLocaleDateString()}
                          </span>
                                                            )}
                                                        </div>
                                                        {attendee.submittedBy && (
                                                            <div className="flex items-center">
                                                                <UserPlus className="h-4 w-4 mr-2 flex-shrink-0"/>
                                                                <span
                                                                    className={"truncate"}> SubmittedBy: {attendee.submittedBy?.fullName}</span>
                                                            </div>
                                                        )}
                                                    </div>


                                                </div>

                                                <div className="mt-4 lg:mt-0 lg:ml-6">


                                                    {voucher.length > 0 && (
                                                        <div
                                                            className="bg-coop-50 border border-coop-200 rounded-lg p-3 min-w-[200px]">
                                                            <div className="flex items-center justify-center mb-2">
                                                                <TicketIcon className="h-4 w-4 text-coop-600 mr-1"/>
                                                                <span className="text-sm font-medium text-coop-800">Voucher(s) Issued</span>
                                                            </div>

                                                            <div className="text-sm text-coop-700 space-y-3">
                                                                {voucher.map((v: {
                                                                    id: number;
                                                                    voucherNumber: string;
                                                                    createdAt: string;
                                                                    claimedNumber: number;
                                                                    fullyClaimed: boolean;
                                                                    voucherCategory: {
                                                                        id: number;
                                                                        name: string;
                                                                        value: number;
                                                                        numberOfItems: number;
                                                                    };
                                                                }) => (
                                                                    <div key={v.id}
                                                                         className="space-y-1 border-t border-coop-100 pt-2">
                                                                        {/*<p className="font-mono text-center text-coop-800">No: {v.voucherNumber}</p>*/}
                                                                        <div
                                                                            className="flex justify-between font-mono text-coop-800">
                                                                            <span>No:</span>
                                                                            <span
                                                                                className="font-medium">{hasPermission(PERMISSIONS.VAVD) ? v.voucherNumber : '...'}</span>
                                                                        </div>

                                                                        <div className="flex justify-between">
                                                                            <span>{v.voucherCategory.name}:</span>
                                                                            <span
                                                                                className="font-medium">{v.claimedNumber}/{v.voucherCategory.numberOfItems}</span>
                                                                        </div>


                                                                        {v.fullyClaimed && (
                                                                            <div
                                                                                className="mt-1 text-xs bg-amber-400 text-coop-800 px-2 py-1 rounded text-center">
                                                                                Fully Used
                                                                            </div>
                                                                        )}
                                                                        {
                                                                            v.claimedNumber==0 && (
                                                                                <div
                                                                                    className="mt-1 text-xs bg-coop-400 text-coop-800 px-2 py-1 rounded text-center">
                                                                                    Not Used
                                                                                </div>
                                                                            )

                                                                        }
                                                                        {
                                                                            !v.fullyClaimed && v.claimedNumber>0 && (
                                                                                <div
                                                                                    className="mt-1 text-xs bg-coop-300 text-coop-800 px-2 py-1 rounded text-center">
                                                                                    Partially Used
                                                                                </div>
                                                                            )

                                                                        }
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}


                                                    {attendee.status === 'pending' && (
                                                        <div
                                                            className="bg-coop-yellow-50 border border-coop-yellow-200 rounded-lg p-3 min-w-[200px] text-center">
                                                            <div
                                                                className="text-sm font-medium text-coop-yellow-800 mb-1">Awaiting
                                                                Approval
                                                            </div>
                                                            <div className="text-xs text-coop-yellow-700">Voucher will
                                                                be issued
                                                                after approval
                                                            </div>
                                                        </div>
                                                    )}

                                                    {attendee.status === 'rejected' && (
                                                        <div
                                                            className="bg-coop-red-50 border border-coop-red-200 rounded-lg p-3 min-w-[200px] text-center">
                                                            <div
                                                                className="text-sm font-medium text-coop-red-800">Registration
                                                                Rejected
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-12 text-center">
                                    <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4"/>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees found</h3>
                                    <p className="text-gray-600">
                                        {searchTerm || attendeeEvent
                                            ? "No attendees match your search criteria"
                                            : "No attendees have been checkedIn yet"
                                        }
                                    </p>
                                </div>
                            )} </>)}
                </div>


            </div>
        </div>
    );
};

export default AttendeeManagement;