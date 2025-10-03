import React, {useEffect, useState} from 'react';
import {
    AlertCircle,
    CheckCircle,
    Edit,
    Edit2,
    Eye,
    EyeOff,
    HopOff,
    Loader2,
    Mail,
    RefreshCw,
    Search,
    UserPlus
} from 'lucide-react';
import {formatDateTime, PERMISSIONS} from "../common/constants.ts";

import {PaginationProps, User, UserGroup} from '../types';
import {useSearch} from '../hooks/useSearch';

import apiUserService from '../services/Users.ts';
import apiUtilityService from '../services/Utility.ts';
import EPagination from "../common/EPagination.tsx";
import eventService from "../services/Events.ts";
import {showError, showInfo, showSuccess} from "../common/Toaster.ts";
import {useAuthContext} from "../common/useAuthContext.tsx";
import DataLoader from "./DataLoader.tsx";


interface Record {
    [key: string]: any
}


const UserManagement: React.FC = () => {
        const [users, setUsers] = useState<User[]>([]);
        const {hasPermission, user} = useAuthContext();

        const [paginations, setPagination] = useState<PaginationProps>({
            number: 1,
            size: 10,
            totalElements: 0,
            totalPages: 0,

        });
        const [currentPage, setCurrentPage] = useState<number>(1);
        const [pageSize, setPageSize] = useState<number>(10);
        const [loadingData, setLoadingData] = useState<boolean>(false);
        const [records, setRecords] = useState<Record[]>([])
        const [events, setEvents] = useState<Record[]>([]);
        const [showActivateForm, setShowActivateForm] = useState<boolean>(false);
        const [rejected, setRejected] = useState<boolean>(false);


        const [approvalRemarks, setApprovalRemarks] = useState<string>('');

        const [showForm, setShowForm] = useState(false);
        const [editingUser, setEditingUser] = useState<User | null>(null);
        const [selectedRole, setSelectedRole] = useState('all');
        const [selectedFilterBy, setSelectedFilterBy] = useState('');

        const [selectedStatus, setSelectedStatus] = useState('all');
        const [userType, setUserType] = useState<'ADMIN' | 'PARTNER' | 'HELPDESK' | 'COORDINATOR'>('ADMIN');
        const [isRetrievingUser, setIsRetrievingUser] = useState(false);
        const [lookupError, setLookupError] = useState('');
        const [lookupSuccess, setLookupSuccess] = useState(false);
        const [partnerSuccess, setPartnerSuccess] = useState(false);
        const [filterValue, setFilterValue] = useState<any>(undefined)
        const [approval, setApproval] = useState<boolean>(false)
        const [isLoading, setIsLoading] = useState(false);


        const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
        const [formData, setFormData] = useState({
            groupName: '',
            pfNumber: '',
            email: '',
            name: '',
            username: '',
            role: '',
            status: '',
            branchName: '',
            branchCode: '',
            assignedEventIds: [] as string[],
        });

        const [formEventData, setFormEventData] = useState({
            id: '',
            name: '',

            assignedEventIds: [] as string[],
        });
        const [showEventForm, setShowEventForm] = useState(false);


        const [activateData, setAcivateData] = useState({
            id: '',
            name: '',
            enable: false,

        });


        const assignEvents = (user: Record) => {

            setFormEventData({
                id: user?.id,

                name: user?.fullName,

                assignedEventIds: user?.assignedEvents.map((event: { id: any; }) => event.id) || []
            });
            setShowEventForm(true);
        };


        const fetchEventsData = async (status: never) => {


            await eventService.getEventsByStatus(status).then(
                data => {

                    setEvents(data)


                }
            ).catch(error => {
                console.log(error)


            });
        }

        // Load users from localStorage
        useEffect(() => {
            // const storedUsers = localStorage.getItem('users');
            // if (storedUsers) {
            //     setUsers(JSON.parse(storedUsers));
            // }

            getUserGroups();
            fetchEventsData('ACTIVE')
        }, []);
        useEffect(() => {

            if (
                (selectedFilterBy !== '' && selectedFilterBy !== undefined && !filterValue) || // selectedFilterBy has value, filterValue is empty
                (filterValue && (selectedFilterBy === '' || selectedFilterBy === undefined))     // filterValue has value, selectedFilterBy is empty
            ) {
                return;
            }


            fetchUserData(currentPage, pageSize, selectedFilterBy, filterValue);


        }, [currentPage, pageSize, selectedFilterBy, filterValue]);

        const getUserGroups = async () => {
            await apiUserService.getUserGroups().then(
                data => {

                    setUserGroups(data);
                    setUserType(data[0]?.groupName);


                }
            ).catch(error => {
                console.log(error)

            });

        };

        const fetchUserData = async (page: number, pageSize: number, filterKey: any, filterValue: any,) => {
            setLoadingData(true)
            setCurrentPage(page)
            setRecords([])
            setPagination({
                number: currentPage,
                size: pageSize,
                totalElements: 0,
                totalPages: 0,

            })
            await apiUserService.getUsersPaginated(page, pageSize, filterKey, filterValue).then(
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

        const onCreateUser = (
            newUser: {
                groupId: string,
                username: string,
                email: string,
                fullName: string,
                branchCode?: string,
                branchName?: string,
                pfNumber?: string,
                type: string,
                remarks?: string,
                assignedEventIds: string[],

            }) => {

            setIsLoading(true)
            // Initiate Payment
            apiUserService.createUser(newUser).then(
                data => {
                    const {message, error} = data;
                    setIsLoading(false)

                    showSuccess(message)
                    resetForm();

                    // fetchData
                    fetchUserData(1, pageSize, undefined, undefined)


                }
            ).catch(error => {
                console.log(error)
                showError(error || 'Error occured while creating user');
                setIsLoading(false)


            })

        };


        // Search functionality
        const {searchTerm, setSearchTerm, filteredData: searchedUsers} = useSearch(
            users,
            ['name', 'email']
        );


        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();

            // For Internal/Subsidiary users, ensure PF lookup was successful
            if (requireLookUp() && !lookupSuccess) {
                showInfo('Please retrieve user details using PF Number first');
                return;
            }

            if (approval || editingUser) {
                // onUpdateUser(editingUser?.id, formData);
                if (approval && editingUser) {
                    const requestData = {id: editingUser.id, remarks: approvalRemarks, approved: !rejected};
                    setIsLoading(true)

                    // Initiate Payment
                    apiUserService.approveUser(requestData).then(
                        data => {
                            const {message, error} = data;

                            setIsLoading(false)
                            showSuccess(message)
                            resetForm();

                            // fetchData
                            fetchUserData(1, pageSize, undefined, undefined)


                        }
                    ).catch(error => {
                        console.log(error)
                        showError(error || 'Error occured while Approving user');
                        setIsLoading(false)


                    })


                }

            } else {
                const filteredGroup = userGroups.find(u => u?.groupName === userType);


                const groupId = filteredGroup!.id;


                onCreateUser(
                    {

                        groupId: groupId,
                        username: formData.username,
                        email: formData.email,
                        fullName: formData.name,
                        branchCode: formData.branchCode,
                        branchName: formData.branchName,
                        pfNumber: formData.pfNumber,
                        type: userType,
                        remarks: ' ',
                        assignedEventIds: formData.assignedEventIds
                    });
            }


        };


        const manageAccountSubmit = (e: React.FormEvent) => {
            e.preventDefault();

            const requestData = {
                id: activateData.id,
                remarks: approvalRemarks,
                status: activateData.enable ? 'ACTIVE' : 'DISABLED'
            };

            setIsLoading(true)

            // Initiate Payment
            apiUserService.manageUser(requestData).then(
                data => {
                    const {message, error} = data;

                    setIsLoading(false)
                    showSuccess(message)
                    resetActivateForm();

                    // fetchData
                    fetchUserData(currentPage, pageSize, selectedFilterBy, filterValue)


                }
            ).catch(error => {
                console.log(error)
                showError(error || 'Error occured');
                setIsLoading(false)


            })


        }

        const processAssignEvents = (e: React.FormEvent) => {
            e.preventDefault();

            const requestData = {
                id: formEventData.id,
                assignedEventIds: formEventData.assignedEventIds,
            };

            setIsLoading(true)

            // Initiate Payment
            apiUserService.assignUserEvents(requestData).then(
                data => {
                    const {message, error} = data;

                    showSuccess(message)
                    setIsLoading(false)

                    resetEventForm();

                    // fetchData
                    fetchUserData(currentPage, pageSize, selectedFilterBy, filterValue)


                }
            ).catch(error => {
                console.log(error)
                showError(error || 'Error occured');
                setIsLoading(false)


            })


        }


        const resetForm = () => {
            setFormData({
                groupName: '',
                pfNumber: '',
                email: '',
                name: '',
                username: '',
                role: '',
                status: '',
                branchName: '',
                branchCode: '',
                assignedEventIds: [] as string[],
            });

            setShowForm(false);
            setEditingUser(null);
            setApproval(false)
            setUserType('ADMIN');
            setLookupSuccess(false);
            setPartnerSuccess(false)
            setApprovalRemarks('')

        };

        const resetActivateForm = () => {
            setAcivateData({
                id: '',

                name: '',
                enable: false,

            });

            setShowActivateForm(false);

            setApprovalRemarks('')

        };
        const resetEventForm = () => {
            setFormEventData({
                id: '',

                name: '',

                assignedEventIds: []
            });
            setShowEventForm(false);

        };


        const handleEdit = (user: Record, editing: boolean) => {
            setEditingUser(user);
            setApproval(!editing)
            setUserType(user?.type); // Default for editing
            if (user?.type !== 'PARTNER') {
                setLookupSuccess(true); // Show fields as already populated
            } else {
                setPartnerSuccess(true);
            }
            setFormData({
                groupName: user?.pfNumber, username: user?.username,
                pfNumber: user?.pfNumber,
                email: user?.email,
                branchCode: user?.branchCode,
                branchName: user?.branchName,
                name: user?.fullName,
                role: user?.group?.groupName,
                status: user?.status,
                assignedEventIds: user?.assignedEvents.map((event: { id: any; }) => event.id) || []
            });
            setShowForm(true);
        };

        const handleApprove = (user: Record) => {
            setEditingUser(user);
            setUserType(user?.type); // Default for editing
            if (user?.type !== 'PARTNER') {
                setLookupSuccess(true); // Show fields as already populated
            } else {
                setPartnerSuccess(true);
            }

            setShowForm(true);
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
                const result = await lookupUserByPFForUserManagement(formData.pfNumber.trim());

                if (result) {
                    setFormData(prev => ({
                        ...prev,
                        name: result!.name,
                        branchCode: result!.branchCode || prev.branchCode,
                        branchName: result!.branchName || prev.branchName,
                        email: result!.email,
                        username: result!.shortName
                    }));
                    setLookupSuccess(true);
                    setLookupError('');
                } else {
                    setLookupError(result.error || 'User not found');
                    setLookupSuccess(false);
                    // Clear fields on error
                    setFormData(prev => ({
                        ...prev,
                        name: '',
                        email: '',
                        branchCode: '',
                        branchName: ''
                    }));
                }
            } catch (error) {
                setLookupError('Failed to lookup user details');
                setLookupSuccess(false);
            } finally {
                setIsRetrievingUser(false);
            }
        };

        const handleFilterLookup = async () => {
            if (!searchTerm.trim()) {
                return;
            }

            setFilterValue(searchTerm);
            setCurrentPage(1);


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
                    branchCode: '',
                    branchName: ''
                }));
            }
        };

        const handleUserTypeChange = (type: any) => {
            setUserType(type);
            setLookupError('');
            setLookupSuccess(false);
            setPartnerSuccess(type === 'PARTNER')
            setFormData({
                groupName: '',
                pfNumber: '',
                email: '',
                name: '',
                username: '',
                role: '',
                status: '',
                branchName: '',
                branchCode: '',
                assignedEventIds: [] as string[],
            });


        };

        const handleToggleStatus = (user: User, enable: boolean) => {
            setAcivateData({
                id: user?.id,
                name: user?.fullName,
                enable: enable
            })
            setShowActivateForm(true)
        };

        const getRoleBadgeColor = (role: string) => {
            switch (role) {
                case 'ADMIN':
                    return 'bg-coop-red-100 text-coop-red-800';
                case 'COORDINATOR':
                    return 'bg-coop-blue-100 text-coop-blue-800';
                case 'PARTNER':
                    return 'bg-coop-100 text-coop-800';
                default:
                    return 'bg-gray-100 text-gray-800';
            }
        };

        const getStatusBadgeColor = (status: string) => {
            return status === 'active'
                ? 'bg-coop-100 text-coop-800'
                : 'bg-coop-red-100 text-coop-red-800';
        };

        const requireLookUp = () => {
            return (userType === 'ADMIN' || userType === 'HELPDESK' || userType === 'COORDINATOR' || userType === 'CLERK');
        }

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        {/*<h1 className="text-3xl font-bold text-gray-900">User Management</h1>*/}
                        <p className="text-gray-600 mt-1">Create and manage system users with role-based access</p>
                    </div>
                    {hasPermission(PERMISSIONS.CSU) &&
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors flex items-center space-x-2"
                        >
                            <UserPlus className="h-4 w-4"/>
                            <span>Create User</span>
                        </button>
                    }
                </div>

                {/* User Form */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {editingUser ? approval ? 'Approve/Reject User' : 'Edit User' : 'Create New User'}
                                    </h2>
                                    <button
                                        disabled={isLoading}
                                        onClick={

                                            resetForm}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <span className="text-2xl">×</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* User Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        User Group *
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {approval ? (

                                            <label

                                                className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 
                                                 border-coop-600 bg-coop-50
                                            `}
                                            >
                                                <div className="text-center">
                                                    <div
                                                        className="font-medium text-gray-900 capitalize">{userType}</div>

                                                </div>
                                            </label>
                                        ) : (
                                            <>
                                                {(userGroups as const).map((type) => (
                                                    <label
                                                        key={type?.id}
                                                        className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 ${
                                                            userType === type?.groupName
                                                                ? 'border-coop-600 bg-coop-50'
                                                                : 'border-gray-200 hover:border-coop-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            readOnly={approval}
                                                            name="groupName"
                                                            value={type?.groupName}
                                                            checked={userType === type?.groupName}
                                                            onChange={(e) => handleUserTypeChange(e.target.value)}
                                                            className="sr-only"
                                                        />
                                                        <div className="text-center">
                                                            <div
                                                                className="font-medium text-gray-900 capitalize">{type?.groupName}</div>
                                                            <div className="text-xs text-gray-600 mt-1">
                                                                {type?.description}

                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </>
                                        )}

                                    </div>
                                </div>

                                {/* PF Number Lookup for Internal/Subsidiary */}
                                {requireLookUp() && !partnerSuccess && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            PF Number *
                                        </label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                required
                                                readOnly={approval}

                                                value={formData.pfNumber}
                                                onChange={handlePFNumberChange}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                                placeholder="Enter PF Number (e.g., PF011)"
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
                                                User details retrieved successfully
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Enter User PF number and click Retrieve to auto-fill details
                                        </p>
                                    </div>
                                )}

                                {/* User Details - Show for External or after successful PF lookup */}
                                {(partnerSuccess || lookupSuccess || editingUser) && (
                                    <div className="space-y-4 border-t border-gray-200 pt-4">
                                        {lookupSuccess && !editingUser && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                                <div className="flex items-center mb-3">
                                                    <CheckCircle className="h-5 w-5 text-green-600 mr-2"/>
                                                    <h3 className="font-medium text-green-900">User Details
                                                        Retrieved</h3>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required

                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                    readOnly={approval || requireLookUp() && lookupSuccess && !editingUser}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 ${
                                                        (userType === 'ADMIN' || userType === 'HELPDESK' || userType === 'COORDINATOR') && lookupSuccess && !editingUser
                                                            ? 'border-green-300 bg-green-50 cursor-not-allowed text-green-900'
                                                            : 'border-gray-300'
                                                    }`}
                                                    placeholder="John Doe"
                                                />
                                                {requireLookUp() && lookupSuccess && !editingUser && (
                                                    <p className="text-xs text-green-600 mt-1">Retrieved from employee
                                                        directory</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    readOnly={approval}
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        email: e.target.value,
                                                        username: partnerSuccess ? e.target.value : formData.username
                                                    })}

                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 ${
                                                        requireLookUp() && lookupSuccess && !editingUser
                                                            ? 'border-green-300 bg-green-50 cursor-not-allowed text-green-900'
                                                            : 'border-gray-300'
                                                    }`}
                                                    placeholder="john.doe@company.com"
                                                />
                                                {requireLookUp() && lookupSuccess && !editingUser && (
                                                    <p className="text-xs text-green-600 mt-1">Retrieved from employee
                                                        directory</p>
                                                )}
                                            </div>

                                        </div>
                                        <div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Username *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    readOnly={approval || userType === 'PARTNER'}
                                                    value={userType === 'PARTNER' ? formData.email : formData.username}

                                                    onChange={(e) => setFormData({...formData, username: e.target.value})}

                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 ${
                                                        requireLookUp() && lookupSuccess && !editingUser
                                                            ? 'border-green-300 bg-green-50 cursor-not-allowed text-green-900'
                                                            : 'border-gray-300'
                                                    }`}
                                                    placeholder="jdoe"
                                                />
                                                {requireLookUp() && lookupSuccess && !editingUser && (
                                                    <p className="text-xs text-green-600 mt-1">Retrieved from employee
                                                        directory</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Department/Organisation Code
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.branchCode || ''}
                                                    onChange={(e) => setFormData({...formData, branchCode: e.target.value})}
                                                    readOnly={approval || requireLookUp() && lookupSuccess && !editingUser}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 ${
                                                        requireLookUp() && lookupSuccess && !editingUser
                                                            ? 'border-green-300 bg-green-50 cursor-not-allowed text-green-900'
                                                            : 'border-gray-300'
                                                    }`}
                                                    placeholder="e.g., 1003, 2004,COO2"
                                                />
                                                {requireLookUp() && lookupSuccess && !editingUser && (
                                                    <p className="text-xs text-green-600 mt-1">Retrieved from employee
                                                        directory</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Department/Organisation Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.branchName || ''}
                                                    onChange={(e) => setFormData({...formData, branchName: e.target.value})}
                                                    readOnly={approval || requireLookUp() && lookupSuccess && !editingUser}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 ${
                                                        (userType === 'ADMIN' || userType === 'HELPDESK' || userType === 'COORDINATOR') && lookupSuccess && !editingUser
                                                            ? 'border-green-300 bg-green-50 cursor-not-allowed text-green-900'
                                                            : 'border-gray-300'
                                                    }`}
                                                    placeholder="e.g., Human Resources, Finance"
                                                />
                                                {requireLookUp() && lookupSuccess && !editingUser && (
                                                    <p className="text-xs text-green-600 mt-1">Retrieved from employee
                                                        directory</p>
                                                )}
                                            </div>
                                        </div>


                                        {userType?.toUpperCase() === 'PARTNER' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Assign Events *
                                                </label>
                                                <div
                                                    className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                                                    <>
                                                        {approval ? (
                                                            <>
                                                                {events.filter(event => formData.assignedEventIds.includes(event.id))
                                                                    .map((event) => (
                                                                        <label key={event.id}
                                                                               className="flex items-center space-x-2">

                                                                    <span className="text-sm text-gray-700">
                                                                       {event.name} - {new Date(event.date).toLocaleDateString()}

                                                                        </span>
                                                                        </label>
                                                                    ))}
                                                            </>
                                                        ) : (<>

                                                                {events.map((event) => (
                                                                    <label key={event.id}
                                                                           className="flex items-center space-x-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            readOnly={approval}
                                                                            checked={formData.assignedEventIds.includes(event.id)}
                                                                            onChange={(e) => {
                                                                                if (e.target.checked) {
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        assignedEventIds: [...formData.assignedEventIds, event.id]
                                                                                    });
                                                                                } else {
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        assignedEventIds: formData.assignedEventIds.filter(id => id !== event.id)
                                                                                    });
                                                                                }
                                                                            }}
                                                                            className="rounded border-gray-300 text-coop-600 focus:ring-coop-500"
                                                                        />
                                                                        <span className="text-sm text-gray-700">
                                                               {event.name} - {new Date(event.date).toLocaleDateString()}
                                                               </span>
                                                                    </label>
                                                                ))}
                                                            </>
                                                        )}
                                                    </>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Partners can only access data for their assigned events
                                                </p>
                                            </div>
                                        )}


                                        {approval && <div>
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
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        disabled={isLoading}
                                        onClick={() => {

                                            resetForm();
                                        }}
                                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    {approval &&
                                        <button
                                            type="submit"
                                            onClick={() => setRejected(true)}
                                            disabled={
                                                requireLookUp() && !lookupSuccess && !editingUser || isLoading
                                            }
                                            className="bg-coop-orange-400 text-white px-6 py-2 rounded-lg hover:bg-coop-700 transition-colors"
                                        >

                                            {isLoading ? (
                                                <div className="flex items-center justify-center">
                                                    <div
                                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    {'Rejecting User ...'}
                                                </div>
                                            ) : (<>
                                                    {'Reject User'}
                                                </>
                                            )}

                                        </button>
                                    }

                                    <button
                                        type="submit"
                                        onClick={() => setRejected(false)}

                                        disabled={
                                            requireLookUp() && !lookupSuccess && !editingUser || isLoading
                                        }
                                        className="bg-coop-600 text-white px-6 py-2 rounded-lg hover:bg-coop-700 transition-colors"
                                    >

                                        {isLoading ? (
                                            <div className="flex items-center justify-center">
                                                <div
                                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                {editingUser ? approval ? 'Approving User' : 'Updating User' : 'Creating User'} ...
                                            </div>
                                        ) : (<>
                                                {editingUser ? approval ? 'Approve User' : 'Update User' : 'Create User'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}


                {/* Activate Form */}
                {showActivateForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {activateData.enable ? 'Enable User' : 'Disable User'}
                                    </h2>
                                    <button
                                        disabled={isLoading}
                                        onClick={

                                            resetActivateForm}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <span className="text-2xl">×</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={manageAccountSubmit} className="p-6 space-y-4">
                                <div className="space-y-4 border-t border-gray-200 pt-4">


                                    {/*<div className="grid grid-cols-1 md:grid-cols-2 gap-4">*/}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"

                                            disabled={true}
                                            value={activateData.name}


                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 border-gray-300
                                            }`}
                                            placeholder="John Doe"
                                        />

                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-red-700 mb-2">
                                            {`${activateData.enable ? 'Enable' : 'Disable'} Remarks`}
                                        </label>
                                        <textarea
                                            rows={3}

                                            required
                                            value={approvalRemarks}
                                            onChange={(e) => setApprovalRemarks(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                            placeholder="Provide  remarks..."
                                        />
                                    </div>

                                    {/*</div>*/}


                                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                        <button
                                            type="button"
                                            disabled={isLoading}
                                            onClick={
                                                resetActivateForm
                                            }
                                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                        >


                                            Cancel
                                        </button>


                                        <button
                                            type="submit"
                                            disabled={isLoading}

                                            className="bg-coop-600 text-white px-6 py-2 rounded-lg hover:bg-coop-700 transition-colors"

                                        >

                                            {isLoading ? (
                                                <div className="flex items-center justify-center">
                                                    <div
                                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    {`${activateData.enable ? 'Enabling' : 'Disabling'} User`} ...
                                                </div>
                                            ) : (<>
                                                    {`${activateData.enable ? 'Enable' : 'Disable'} User`}
                                                </>
                                            )}

                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Assign Events */}
                {showEventForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {'Assign/Remove Events'}
                                    </h2>
                                    <button
                                        disabled={isLoading}
                                        onClick={

                                            resetEventForm}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <span className="text-2xl">×</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={processAssignEvents} className="p-6 space-y-4">
                                <div className="space-y-4 border-t border-gray-200 pt-4">


                                    {/*<div className="grid grid-cols-1 md:grid-cols-2 gap-4">*/}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"

                                            disabled={true}
                                            value={formEventData.name}


                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 border-gray-300
                                            }`}
                                            placeholder="John Doe"
                                        />

                                    </div>


                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Assign/Remove Events *
                                        </label>
                                        <div
                                            className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">


                                            {events.map((event) => (
                                                <label key={event.id}
                                                       className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"

                                                        checked={formEventData.assignedEventIds.includes(event.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormEventData({
                                                                    ...formEventData,
                                                                    assignedEventIds: [...formEventData.assignedEventIds, event.id]
                                                                });
                                                            } else {
                                                                setFormEventData({
                                                                    ...formEventData,
                                                                    assignedEventIds: formEventData.assignedEventIds.filter(id => id !== event.id)
                                                                });
                                                            }
                                                        }}
                                                        className="rounded border-gray-300 text-coop-600 focus:ring-coop-500"
                                                    />
                                                    <span className="text-sm text-gray-700">
                                                               {event.name} - {new Date(event.date).toLocaleDateString()}
                                                               </span>
                                                </label>
                                            ))}


                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Partners can only access data for their assigned events
                                        </p>
                                    </div>


                                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                        <button
                                            disabled={isLoading}
                                            type="button"
                                            onClick={resetEventForm}
                                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                        >
                                            Cancel
                                        </button>


                                        <button
                                            type="submit"

                                            className="bg-coop-600 text-white px-6 py-2 rounded-lg hover:bg-coop-700 transition-colors"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center justify-center">
                                                    <div
                                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    {`Assigning/Removing Events`} ...
                                                </div>
                                            ) : (<>
                                                    {`Assign/Remove Events`}                                                </>
                                            )}

                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by</label>
                            <select
                                value={selectedFilterBy}
                                onChange={(e) => setSelectedFilterBy(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                            >
                                <option value="">Select filter </option>
                                <option value="username">Username</option>
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">.</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                       fetchUserData(currentPage,pageSize,selectedFilterBy,filterValue)


                                    }}
                                    disabled={loadingData}
                                    className="bg-coop-orange-400 text-white px-4 py-2 rounded-lg hover:bg-info-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                                >

                                    <span>{'Reload'}</span>
                                </button>
                            </div>

                        </div>
                    </div>

                    {(searchTerm || selectedFilterBy !== '') && (
                        <div className="mt-4 flex items-center justify-between">
                            {/*<p className="text-sm text-gray-600">*/}
                            {/*    Showing {filteredUsers.length} of {users.length} users*/}
                            {/*</p>*/}
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedFilterBy('');
                                    setFilterValue('');
                                    setCurrentPage(1);


                                }}
                                className="text-sm text-coop-600 hover:text-coop-700 font-medium"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Users List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">

                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Users</h2>
                            {!loadingData && records.length > 0 && paginations.totalPages > 1 && (
                                <>
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
                                </>
                            )}
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200 relative">

                        {!loadingData && records.length > 0 && hasPermission(PERMISSIONS.VSSU) ? (
                            records.map((userr) => (
                                <>
                                    <div key={userr?.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-medium text-gray-900">{userr?.fullName}</h3>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(userr?.group?.groupName)}`}>
                                                    {userr?.group?.groupName}
                                                  </span>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(userr?.status)}`}>
                                                    {userr?.status}
                                                  </span>
                                                </div>

                                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                                    <Mail className="h-4 w-4 mr-2"/>
                                                    <span>{userr?.email} . {userr?.branchName} </span>
                                                </div>

                                                {userr.description && userr.description.length>1 && (
                                                    <div
                                                        className=" bg-coop-red-50 ounded-lg">
                                                        <p className="text-sm text-coop-green-800">
                                                            <strong>
                                                                Remarks:</strong> {userr.description}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                                                    {userr.dateCreated && (
                                                        <div className="flex items-center text-gray-600">
                                                            Created: {formatDateTime(userr.dateCreated)}
                                                        </div>
                                                    )}
                                                    {userr.dateApproved && (
                                                        <div className="flex items-center text-gray-600">
                                                            Updated: {formatDateTime(userr.dateApproved)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                                                    {userr.createdBy && (
                                                        <div className="flex items-center text-gray-600">
                                                            <span
                                                                className={"truncate"}>CreatedBy: {userr.createdBy?.fullName} </span>
                                                        </div>
                                                    )}
                                                    {userr.updatedBy && (
                                                        <div className="flex items-center text-gray-600">
                                                            <span
                                                                className={"truncate"}>UpdatedBy: {userr.updatedBy?.fullName} </span>
                                                        </div>
                                                    )}
                                                </div>
                                                {(userr.status === 'REJECTED' || userr.status === 'DISABLED') && userr.approvalRemarks && (
                                                    <div
                                                        className="mt-2 p-3 bg-coop-red-50 border border-coop-red-200 rounded-lg">
                                                        <p className="text-sm text-coop-red-800">
                                                            <strong>
                                                                Reason:</strong> {userr.approvalRemarks}
                                                        </p>
                                                    </div>
                                                )}


                                                {userr.assignedEvents.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-sm font-medium text-gray-700 mb-2">Assigned
                                                            Events:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {userr.assignedEvents.map(eventId => {
                                                                return (
                                                                    <span key={eventId.id}
                                                                          className="inline-flex items-center px-2 py-1 bg-coop-50 text-coop-700 rounded-full text-xs">
                                                                <HopOff className="h-3 w-3 mr-1"/>
                                                                        {eventId.name}
                                                                 </span>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}


                                            </div>

                                            <div className="mt-4 lg:mt-0 lg:ml-6 flex space-x-2">
                                                {userr?.status === 'PENDING' && hasPermission(PERMISSIONS.ARSU) && userr?.createdBy?.id !== user?.id && (
                                                    <button
                                                        onClick={() => handleEdit(userr, false)}
                                                        className="bg-coop-100 text-coop-700 px-3 py-2 rounded-lg hover:bg-coop-200 transition-colors flex items-center space-x-1 text-sm"
                                                    >
                                                        <Edit2 className="h-4 w-4"/>
                                                        <span>Approve/Reject</span>
                                                    </button>
                                                )}
                                                {((userr?.group?.groupName?.toUpperCase() === 'PARTNER' || userr?.group?.groupName?.toUpperCase() === 'CLERK') &&
                                                    (userr?.status?.toUpperCase() === 'ACTIVE' || userr?.status?.toUpperCase() === 'APPROVED') && hasPermission(PERMISSIONS.AESU)) && (
                                                        <button
                                                            onClick={() => assignEvents(userr)}
                                                            className="bg-coop-100 text-coop-500 px-3 py-2 rounded-lg hover:bg-coop-200 transition-colors flex items-center space-x-1 text-sm"
                                                        >
                                                            <Edit className="h-4 w-4"/>
                                                            <span>Assign Events</span>
                                                        </button>)}


                                                {!(userr?.status === 'PENDING' || userr?.status === 'REJECTED') && hasPermission(PERMISSIONS.ADSU) && (

                                                    <button
                                                        onClick={() => handleToggleStatus(userr, !(userr?.status === 'ACTIVE' || userr?.status === 'APPROVED'))}
                                                        className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 text-sm ${
                                                            (userr?.status === 'ACTIVE' || userr?.status === 'APPROVED')
                                                                ? 'bg-coop-red-100 text-coop-red-700 hover:bg-coop-red-200'
                                                                : 'bg-coop-100 text-coop-700 hover:bg-coop-200'
                                                        }`}
                                                    >
                                                        {(userr?.status === 'ACTIVE' || userr?.status === 'APPROVED') ? (
                                                            <>
                                                                <EyeOff className="h-4 w-4"/>
                                                                <span>Disable</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="h-4 w-4"/>
                                                                <span>Enable</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                    </div>

                                </>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                {loadingData ? (
                                    <DataLoader isLoading={loadingData}/>




                                ) : (
                                    <>
                                        <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4"/>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                                        <p className="text-gray-600">
                                            {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all'
                                                ? "No users match your search criteria"
                                                : "No users have been created yet"
                                            }
                                        </p>
                                    </>)}
                            </div>
                        )}
                    </div>


                </div>

                {/* Role Descriptions */
                }
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">UserGroup Descriptions & Privileges</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {userGroups.map((gp) => (
                            <>

                                <div key={gp?.id} className="p-4 bg-red-50 rounded-lg">
                                    <h4 className="font-medium text-red-900 mb-2">
                                        <div>
                                            <div
                                                className="font-medium text-gray-900 capitalize">{gp?.groupName}</div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                {gp?.description}

                                            </div>
                                        </div>

                                        {/*{gp.groupName}*/}

                                    </h4>
                                    <ul className="text-sm text-red-800 space-y-1">
                                        {gp?.privileges.map((priv) => (
                                            <li key={priv?.id}>• {priv.description}</li>
                                        ))}
                                    </ul>
                                </div>
                            </>))}


                    </div>
                </div>
            </div>
        )
            ;
    }
;

export default UserManagement;
