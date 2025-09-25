import React, {useEffect, useState} from 'react';
import {
    AlertCircle,
    Building2,
    CheckCircle,
    Download,
    Edit,
    Loader2,
    Plus,
    RefreshCw,
    Search,
    Upload,
    Users,
    X
} from 'lucide-react';
import {PaginationProps, Subsidiary, SubsidiaryEmployee} from '../types';
import {useSearch} from '../hooks/useSearch';
import subsidiaryService from "../services/Subsidiaries.ts";
import EPagination from "../common/EPagination.tsx";
import {showError, showSuccess} from "../common/Toaster.ts";
import {useAuthContext} from "../common/useAuthContext.tsx";
import {PERMISSIONS} from "../common/constants.ts";
import DataLoader from "./DataLoader.tsx";


const SubsidiaryManagement: React.FC = () => {

    const [showSubsidiaryForm, setShowSubsidiaryForm] = useState(false);
    const [showApproveSubsidiaryForm, setShowApproveSubsidiaryForm] = useState(false);

    const [rejected, setRejected] = useState<boolean>(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [currentView, setCurrentView] = useState<'list' | 'employees'>('list');
    const [selectedSubsidiaryForView, setSelectedSubsidiaryForView] = useState<Subsidiary | null>(null);
    const [editingSubsidiary, setEditingSubsidiary] = useState<Subsidiary | null>(null);
    const [selectedSubsidiary, setSelectedSubsidiary] = useState<Subsidiary | null>(null);
    const [uploadErrors, setUploadErrors] = useState<string[]>([]);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [csvData, setCsvData] = useState('');
    const [subsidiaryFormData, setSubsidiaryFormData] = useState({
        name: '',
        code: '',
        description: '',
        id: ''
    });
    const {hasPermission, user} = useAuthContext();


    const [paginations, setPagination] = useState<PaginationProps>({
        number: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0,

    });

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [records, setRecords] = useState<Record[]>([])
    const [empPagination, setEmpPagination] = useState<PaginationProps>({
        number: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0,

    });
    const [empSelectedFilterBy, setEmpSelectedFilterBy] = useState('');
    const [empFilterValue, setEmpFilterValue] = useState<any>(undefined)

    const [currentEmpPage, setCurrentEmpPage] = useState<number>(1);
    const [empPageSize, setEmpPageSize] = useState<number>(10);
    const [empRecords, setEmpRecords] = useState<Record[]>([])
    const [loadingEmpData, setLoadingEmpData] = useState<boolean>(false);

    const [loadingData, setLoadingData] = useState<boolean>(false);


    // Search functionality for employees
    const {searchTerm, setSearchTerm, filteredData: searchedEmployees} = useSearch(
        empRecords,
        ['pfNumber', 'name', 'email', 'department']
    );


    useEffect(() => {
        if (selectedSubsidiaryForView != null) {
            if (
                (empSelectedFilterBy !== '' && empSelectedFilterBy !== undefined && !empFilterValue) || // selectedFilterBy has value, filterValue is empty
                (empFilterValue && (empSelectedFilterBy === '' || empSelectedFilterBy === undefined))     // filterValue has value, selectedFilterBy is empty
            ) {
                return;
            }
            setEmpRecords([])

            fetchEmpData(currentEmpPage, empPageSize, selectedSubsidiaryForView?.id, empSelectedFilterBy, empFilterValue)
        }

    }, [selectedSubsidiaryForView, empPageSize, currentEmpPage, empSelectedFilterBy, empFilterValue]);


    const handleSubsidiarySubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (showApproveSubsidiaryForm) {
            const {
                id, description

            } = subsidiaryFormData
            const requestData = {id: id, remarks: description, approved: !rejected};


            // Initiate Event Creation
            subsidiaryService.approveSubsidiary(requestData).then(
                data => {
                    const {message, error} = data;

                    showSuccess(message)
                    cancelApprovalForm();
                    fetchData(1, pageSize)


                }
            ).catch(error => {
                console.log(error)
                showError(error || 'Error occured while creating event');


            })


        } else {

            if (editingSubsidiary) {
                // onUpdateSubsidiary(editingSubsidiary.id, subsidiaryFormData);
                setEditingSubsidiary(null);
            } else {
                const {
                    name,
                    code,
                    description,
                } = subsidiaryFormData
                // Initiate Event Creation
                subsidiaryService.createSubsidiary({name: name, code: code, description: description}).then(
                    data => {
                        const {message, error} = data;

                        showSuccess(message)
                        handleCancel();
                        fetchData(1, pageSize)

                    }
                ).catch(error => {
                    console.log(error)
                    showError(error || 'Error occured while creating event');


                })
            }


        }


    };


    useEffect(() => {
        fetchData(currentPage, pageSize)
    }, [currentPage, pageSize]);

    const fetchData = async (page: number, pageSize: number) => {


        setLoadingData(true)
        setCurrentPage(page)
        await subsidiaryService.getSubsidiaryPaginated(page, pageSize).then(
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


    const fetchEmpData = async (page: number, pageSize: number, subsidiaryId: number, filterBy: any, filterValue: any) => {


        setLoadingEmpData(true)
        setCurrentEmpPage(page)
        setEmpRecords([])
        await subsidiaryService.getSubsidiarySubsidiaryPaginated(page, pageSize, subsidiaryId, filterBy, filterValue).then(
            data => {
                const {content, page: {number, size, totalPages, totalElements}} = data
                setEmpRecords(content)
                setEmpPagination({
                    number: page,
                    size: size,
                    totalElements: totalElements,
                    totalPages: totalPages,

                })


                setLoadingEmpData(false)


            }
        ).catch(error => {
            console.log(error)
            setLoadingEmpData(false)


        });

    }


    const handleCancel = () => {
        setSubsidiaryFormData({name: '', code: '', description: ''});
        setShowSubsidiaryForm(false);

    };
    const cancelApprovalForm = () => {
        setShowApproveSubsidiaryForm(false);
        setEditingSubsidiary(null);
        setSubsidiaryFormData({name: '', code: '', description: '', id: ''});
        setRejected(false)

    }


    const handleApproveSubsidiary = (subsidiary: Subsidiary) => {
        // setEditingSubsidiary(subsidiary);
        setSubsidiaryFormData({
            id: subsidiary.id,
            name: subsidiary.name,
            code: subsidiary.code,
            description: '',
        });
        setShowApproveSubsidiaryForm(true);
    };


    const parseCsvData = (csvText: string) => {
        const lines = csvText.trim().split('\n');
        const errors: string[] = [];
        const employees: Omit<SubsidiaryEmployee, 'id' | 'subsidiaryId' | 'createdAt' | 'uploadedBy'>[] = [];

        if (lines.length < 2) {
            errors.push('CSV must contain at least a header row and one data row');
            return {employees, errors};
        }

        // Skip header row
        let i = 1;

        for (i; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));

            if (columns.length < 4) {
                errors.push(`Row ${i + 1}: Missing required columns (expected: PF Number, Name, Email, Department)`);
                continue;
            }

            const [pfNumber, name, email, department] = columns;

            // Validation
            if (!pfNumber) {
                errors.push(`Row ${i + 1}: PF Number is required`);
                continue;
            }
            if (!name) {
                errors.push(`Row ${i + 1}: Name is required`);
                continue;
            }
            if (!email || !email.includes('@')) {
                errors.push(`Row ${i + 1}: Valid email is required`);
                continue;
            }
            if (!department) {
                errors.push(`Row ${i + 1}: Department is required`);
                continue;
            }

            // Check for duplicate PF numbers in current upload
            if (employees.find(emp => emp.pfNumber === pfNumber)) {
                errors.push(`Row ${i + 1}: Duplicate PF Number ${pfNumber} in upload`);
                continue;
            }

            employees.push({
                pfNumber,
                name,
                email,
                department,
            });
        }

        return {employees, errors};
    };

    const handleUploadSubsidiaryEmployees = (subsidiary: Subsidiary, employees: Omit<SubsidiaryEmployee, 'id' | 'subsidiaryId' | 'createdAt' | 'uploadedBy'>[]) => {
        const newEmployees = employees.map(emp => ({
            pfNumber: emp.pfNumber,
            name: emp.name,
            email: emp.email,
            department: emp.department,


        }));
        const errorss: string[] = [];
        const messages: string[] = [];
        // Upload
        subsidiaryService.uploadEmployees(subsidiary.id, newEmployees).then(
            data => {
                const {message, error} = data;

                // if (error === true) {
                //     errorss.push(message);
                // } else {
                messages.push(message);
                //  }


            }
        ).catch(error => {
            console.log(error)
            errorss.push(error || 'Error while processing request');

        });

        return {messages, errorss};

    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSubsidiary) {
            setUploadErrors(['Please select a subsidiary']);
            return;
        }

        if (!csvData.trim()) {
            setUploadErrors(['Please provide CSV data']);
            return;
        }

        const {employees: parsedEmployees, errors} = parseCsvData(csvData);

        if (errors.length > 0) {
            setUploadErrors(errors);
            setUploadSuccess(false);
            return;
        }

        if (parsedEmployees.length === 0) {
            setUploadErrors(['No valid employee records found']);
            setUploadSuccess(false);
            return;
        }

        const {messages, errorss} = handleUploadSubsidiaryEmployees(selectedSubsidiary, parsedEmployees);

        if (errorss.length > 0) {
            setUploadErrors(errorss);
            setUploadSuccess(false);
            return;
        }

        showSuccess(messages);
        setUploadErrors([]);
        setUploadSuccess(true);
        setCsvData('');
        setShowUploadForm(false);

        if (selectedSubsidiaryForView != null) {

            setSearchTerm('');
            setEmpFilterValue('')
            setEmpSelectedFilterBy('')
            // Fetch Subsidiary Employees
            fetchEmpData(1, empPageSize, selectedSubsidiaryForView?.id, undefined, undefined)


        } else {

            // Fetch Subsidiary
            fetchData(1, pageSize)
        }
    };

    const downloadTemplate = () => {
        const template = 'PF Number,Name,Email,Department\nSUB001,John Doe,john.doe@subsidiary.com,Finance\nSUB002,Jane Smith,jane.smith@subsidiary.com,HR';
        const blob = new Blob([template], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employee_upload_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    const handleViewEmployees = (subsidiary: Subsidiary) => {
        setSelectedSubsidiaryForView(subsidiary);
        setCurrentView('employees');
        setSearchTerm(''); // Reset search when opening modal
        setEmpSelectedFilterBy('')
        setEmpFilterValue('')
        setCurrentEmpPage(1); // Reset pagination
        setEmpPagination({
            number: 1,
            size: 10,
            totalElements: 0,
            totalPages: 0,

        })
    };

    const handleBackToSubsidiaries = () => {
        setCurrentView('list');
        setSelectedSubsidiaryForView(null);
        setSearchTerm('');


    };

    const handleUploadForSubsidiary = (subsidiary: Subsidiary) => {
        setSelectedSubsidiary(subsidiary);
        setUploadErrors([]);
        setUploadSuccess(false);
        setCsvData('');
        setShowUploadForm(true);
    };


    const handleEmpFilterLookup = async () => {
        if (!searchTerm.trim()) {
            return;
        }

        setEmpFilterValue(searchTerm);
        setCurrentEmpPage(1);


    };
    // Render employee view page
    if (currentView === 'employees' && selectedSubsidiaryForView) {
        return (
            <div className="space-y-6">
                {/* Header with back navigation */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleBackToSubsidiaries}
                        className="flex items-center space-x-2 text-coop-600 hover:text-coop-700 transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                        </svg>
                        <span>Back to Subsidiaries</span>
                    </button>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{selectedSubsidiaryForView.name}</h1>
                        <p className="text-gray-600 mt-1">
                            {selectedSubsidiaryForView.code} • {selectedSubsidiaryForView?.employeeCount} employees
                        </p>
                    </div>
                </div>

                {/* Employee Upload Modal */}
                {showUploadForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Upload Employees - {selectedSubsidiaryForView?.name}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowUploadForm(false);
                                            setSelectedSubsidiary(null);
                                            setCsvData('');
                                            setUploadErrors([]);
                                            setUploadSuccess(false);
                                        }}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-6 w-6"/>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
                                <div className="bg-coop-50 border border-coop-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <Building2 className="h-5 w-5 text-coop-600 mr-2"/>
                                        <div>
                                            <p className="font-medium text-coop-900">
                                                {selectedSubsidiaryForView?.name}
                                            </p>
                                            <p className="text-sm text-coop-700">
                                                Code: {selectedSubsidiaryForView?.code}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            CSV Data *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={downloadTemplate}
                                            className="text-sm text-coop-600 hover:text-coop-700 flex items-center space-x-1"
                                        >
                                            <Download className="h-4 w-4"/>
                                            <span>Download Template</span>
                                        </button>
                                    </div>
                                    <textarea
                                        rows={10}
                                        required
                                        value={csvData}
                                        onChange={(e) => setCsvData(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 font-mono text-sm"
                                        placeholder="PF Number,Name,Email,Department&#10;SUB001,John Doe,john.doe@subsidiary.com,Finance&#10;SUB002,Jane Smith,jane.smith@subsidiary.com,HR"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Paste CSV data with columns: PF Number, Name, Email, Department
                                    </p>
                                </div>

                                {uploadErrors.length > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <AlertCircle className="h-5 w-5 text-red-600 mr-2"/>
                                            <h4 className="font-medium text-red-900">Upload Errors</h4>
                                        </div>
                                        <ul className="text-sm text-red-800 space-y-1">
                                            {uploadErrors.map((error, index) => (
                                                <li key={index}>• {error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {uploadSuccess && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <CheckCircle className="h-5 w-5 text-green-600 mr-2"/>
                                            <span
                                                className="text-green-800 font-medium">Employees uploaded successfully!</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUploadForm(false);
                                            setSelectedSubsidiary(null);
                                            setCsvData('');
                                            setUploadErrors([]);
                                            setUploadSuccess(false);
                                        }}
                                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-coop-600 text-white px-6 py-2 rounded-lg hover:bg-coop-700 transition-colors"
                                    >
                                        Upload Employees
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Search and Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">


                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by</label>
                                    <select
                                        value={empSelectedFilterBy}
                                        onChange={(e) => setEmpSelectedFilterBy(e.target.value)}
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
                                            onClick={handleEmpFilterLookup}
                                            disabled={!searchTerm.trim() || empSelectedFilterBy === '' || loadingEmpData}
                                            className="bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                                        >
                                            {loadingData ? (
                                                <Loader2 className="h-4 w-4 animate-spin"/>
                                            ) : (
                                                <RefreshCw className="h-4 w-4"/>
                                            )}
                                            <span>{loadingEmpData ? 'Retrieving...' : 'Retrieve'}</span>
                                        </button>
                                    </div>
                                </div>
                                {hasPermission(PERMISSIONS.USE) &&
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">- </label>

                                        <button
                                            onClick={() => handleUploadForSubsidiary(selectedSubsidiaryForView)}
                                            className="bg-coop-400 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors flex items-center space-x-2"
                                        >
                                            <Upload className="h-4 w-4"/>
                                            <span>Upload Employees</span>
                                        </button>
                                    </div>
                                }
                            </div>

                            {(searchTerm || empSelectedFilterBy) && (
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setEmpSelectedFilterBy('')
                                            setEmpFilterValue('')
                                            setCurrentPage(1)

                                        }}
                                        className="text-sm text-coop-600 hover:text-coop-700 font-medium"
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            )}
                        </div>


                    </div>
                </div>

                {/* Employees List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Employees</h2>
                            {!loadingEmpData && empRecords.length > 0 && empPagination.totalPages > 1 && (
                                <>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">


                                        <EPagination currentPage={currentEmpPage} setPageSize={setEmpPageSize}
                                                     pageCount={empPagination.totalPages}
                                                     handlePageChange={function (page: number): void {
                                                         if (page !== currentEmpPage) {
                                                             setCurrentEmpPage(page)
                                                         }
                                                     }} pagesize={empPageSize}/>
                                    </div>

                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Users className="h-4 w-4"/>
                                        <span>Page {currentEmpPage} of {empPagination.totalPages}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200 relative border rounded-lg bg-gray-50">
                        {loadingEmpData ? (
                            <DataLoader isLoading={loadingEmpData}/>
                        ) : (
                            <>
                                {empRecords.length > 0 ? (
                                    empRecords.map((employee) => (
                                        <div key={employee.id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h4 className="text-lg font-medium text-gray-900">{employee.name}</h4>
                                                        <span
                                                            className="px-3 py-1 bg-coop-100 text-coop-800 rounded-full text-sm font-medium">
                          {employee.pfNumber}
                        </span>
                                                    </div>

                                                    <div
                                                        className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center">
                                                                <span className="font-medium w-20">Email:</span>
                                                                <span>{employee.email}</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="font-medium w-20">Department: </span>
                                                                <span>{employee.department}</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center">
                                                                <span className="font-medium w-20">Uploaded:</span>
                                                                <span>{new Date(employee.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center">
                                        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4"/>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                                        <p className="text-gray-600">
                                            {searchTerm
                                                ? "No employees match your search criteria"
                                                : "No employees have been uploaded for this subsidiary yet"
                                            }
                                        </p>
                                        {!searchTerm && hasPermission(PERMISSIONS.USE) && (
                                            <button
                                                onClick={() => handleUploadForSubsidiary(selectedSubsidiaryForView)}
                                                className="mt-4 bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors flex items-center space-x-2 mx-auto"
                                            >
                                                <Upload className="h-4 w-4"/>
                                                <span>Upload Employees</span>
                                            </button>
                                        )}
                                    </div>
                                )}</>)}
                    </div>


                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    {/*<h1 className="text-3xl font-bold text-gray-900">Subsidiary Management</h1>*/}
                    <p className="text-gray-600 mt-1">Manage subsidiaries and their employee data</p>
                </div>
                {hasPermission(PERMISSIONS.CS) &&
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowSubsidiaryForm(true)}
                            className="bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors flex items-center space-x-2"
                        >
                            <Plus className="h-4 w-4"/>
                            <span>Add Subsidiary</span>
                        </button>
                    </div>

                }
            </div>

            {/* Subsidiary Form Modal */}
            {showSubsidiaryForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {editingSubsidiary ? 'Edit Subsidiary' : 'Add New Subsidiary'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowSubsidiaryForm(false);
                                        setEditingSubsidiary(null);
                                        setSubsidiaryFormData({name: '', code: '', description: '', id: ''});
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-6 w-6"/>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubsidiarySubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subsidiary Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={subsidiaryFormData.name}
                                    onChange={(e) => setSubsidiaryFormData({
                                        ...subsidiaryFormData,
                                        name: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                    placeholder="Co-op Insurance Ltd"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subsidiary Code *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={subsidiaryFormData.code}
                                    onChange={(e) => setSubsidiaryFormData({
                                        ...subsidiaryFormData,
                                        code: e.target.value.toUpperCase()
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                    placeholder="COINS"
                                    maxLength={10}
                                />
                                <p className="text-xs text-gray-500 mt-1">Short code for identification (e.g., COINS,
                                    TRUST)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={subsidiaryFormData.description}
                                    onChange={(e) => setSubsidiaryFormData({
                                        ...subsidiaryFormData,
                                        description: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                    placeholder="Brief description of the subsidiary..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSubsidiaryForm(false);
                                        setEditingSubsidiary(null);
                                        setSubsidiaryFormData({name: '', code: '', description: '', id: ''});
                                    }}
                                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-coop-600 text-white px-6 py-2 rounded-lg hover:bg-coop-700 transition-colors"
                                >
                                    {editingSubsidiary ? 'Update' : 'Create'} Subsidiary
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Approve Subsidiary Form Modal */}
            {showApproveSubsidiaryForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {'Approve/Reject Subsidiary'}
                                </h2>
                                <button
                                    onClick={cancelApprovalForm}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-6 w-6"/>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubsidiarySubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subsidiary Name
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={subsidiaryFormData.name}

                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                    placeholder="Co-op Insurance Ltd"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subsidiary Code
                                </label>
                                <input
                                    type="text"
                                    disabled

                                    value={subsidiaryFormData.code}

                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                    placeholder="COINS"
                                    maxLength={10}
                                />
                                <p className="text-xs text-gray-500 mt-1">Short code for identification (e.g., COINS,
                                    TRUST)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Approval/Rejection Remarks
                                </label>
                                <textarea
                                    rows={3}
                                    required={true}
                                    value={subsidiaryFormData.description}
                                    onChange={(e) => setSubsidiaryFormData({
                                        ...subsidiaryFormData,
                                        description: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                    placeholder="Brief description of the subsidiary..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={cancelApprovalForm}
                                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    onClick={() => setRejected(true)}
                                    className="bg-red-600  text-red px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    {'Reject'}
                                </button>

                                <button
                                    type="submit"
                                    onClick={() => setRejected(false)}

                                    className="bg-coop-600 text-white px-6 py-2 rounded-lg hover:bg-coop-700 transition-colors"
                                >
                                    {'Approve'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Employee Upload Modal */}
            {showUploadForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Upload Employees - {selectedSubsidiary?.name}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowUploadForm(false);
                                        setSelectedSubsidiary(null);
                                        setCsvData('');
                                        setUploadErrors([]);
                                        setUploadSuccess(false);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-6 w-6"/>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
                            <div className="bg-coop-50 border border-coop-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <Building2 className="h-5 w-5 text-coop-600 mr-2"/>
                                    <div>
                                        <p className="font-medium text-coop-900">
                                            {selectedSubsidiary?.name}
                                        </p>
                                        <p className="text-sm text-coop-700">
                                            Code: {selectedSubsidiary?.code}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        CSV Data *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={downloadTemplate}
                                        className="text-sm text-coop-600 hover:text-coop-700 flex items-center space-x-1"
                                    >
                                        <Download className="h-4 w-4"/>
                                        <span>Download Template</span>
                                    </button>
                                </div>
                                <textarea
                                    rows={10}
                                    required
                                    value={csvData}
                                    onChange={(e) => setCsvData(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 font-mono text-sm"
                                    placeholder="PF Number,Name,Email,Department&#10;SUB001,John Doe,john.doe@subsidiary.com,Finance&#10;SUB002,Jane Smith,jane.smith@subsidiary.com,HR"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Paste CSV data with columns: PF Number, Name, Email, Department
                                </p>
                            </div>

                            {uploadErrors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center mb-2">
                                        <AlertCircle className="h-5 w-5 text-red-600 mr-2"/>
                                        <h4 className="font-medium text-red-900">Upload Errors</h4>
                                    </div>
                                    <ul className="text-sm text-red-800 space-y-1">
                                        {uploadErrors.map((error, index) => (
                                            <li key={index}>• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {uploadSuccess && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <CheckCircle className="h-5 w-5 text-green-600 mr-2"/>
                                        <span
                                            className="text-green-800 font-medium">Employees uploaded successfully!</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUploadForm(false);
                                        setSelectedSubsidiary(null);
                                        setCsvData('');
                                        setUploadErrors([]);
                                        setUploadSuccess(false);
                                    }}
                                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-coop-600 text-white px-6 py-2 rounded-lg hover:bg-coop-700 transition-colors"
                                >
                                    Upload Employees
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Subsidiaries List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Subsidiaries</h2>
                        {records.length > 0 && paginations.totalPages > 1 && <>
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
                        }
                    </div>
                </div>

                <div className="divide-y divide-gray-200 relative border rounded-lg bg-gray-5">
                    {loadingData ? (
                        <DataLoader isLoading={loadingData}/>
                    ) : (
                        <>
                            {records.length > 0 && hasPermission(PERMISSIONS.VS) ? (
                                records.map((subsidiary) => (
                                    <div key={subsidiary.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-medium text-gray-900">{subsidiary?.name}</h3>
                                                    <span
                                                        className="px-2 py-1 bg-coop-100 text-coop-800 rounded-full text-sm font-medium">
                        {subsidiary?.code}
                      </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        subsidiary?.status.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                            subsidiary?.status.toUpperCase() === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                                                                'bg-red-100 text-red-800'
                                                    }`}>
                        {subsidiary?.status?.charAt(0).toUpperCase() + subsidiary?.status?.slice(1) || 'Active'}
                      </span>
                                                    <span
                                                        className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {subsidiary?.employeeCount} employees
                      </span>
                                                </div>

                                                {subsidiary.description && (
                                                    <p className="text-gray-600 mb-2">{subsidiary.description}</p>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                                                    {subsidiary.createdAt && (
                                                        <div className="flex items-center text-gray-600">
                                                            Created: {new Date(subsidiary.createdAt).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {subsidiary.updatedDate && (
                                                        <div className="flex items-center text-gray-600">
                                                            Updated: {new Date(subsidiary.updatedDate).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                                                    {subsidiary.createdBy && (
                                                        <div className="flex items-center text-gray-600">
                                                            <span
                                                                className={"truncate"}>CreatedBy: {subsidiary.createdBy?.fullName} </span>
                                                        </div>
                                                    )}
                                                    {subsidiary.updatedBy && (
                                                        <div className="flex items-center text-gray-600">
                                                            <span
                                                                className={"truncate"}>UpdatedBy: {subsidiary.updatedBy?.fullName} </span>
                                                        </div>
                                                    )}
                                                </div>
                                                {subsidiary.status === 'REJECTED' && subsidiary.approvalRemarks && (
                                                    <div
                                                        className="mt-2 p-3 bg-coop-red-50 border border-coop-red-200 rounded-lg">
                                                        <p className="text-sm text-coop-red-800">
                                                            <strong>Rejection
                                                                Reason:</strong> {subsidiary.approvalRemarks}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {!(subsidiary?.status.toUpperCase() == 'PENDING' || subsidiary?.status.toUpperCase() == 'REJECTED') && (
                                                    <>
                                                        {hasPermission(PERMISSIONS.VSE) &&

                                                            <button
                                                                onClick={() => handleViewEmployees(subsidiary)}
                                                                className="bg-coop-blue-100 text-coop-blue-700 px-3 py-2 rounded-lg hover:bg-coop-blue-200 transition-colors flex items-center space-x-1"
                                                            >
                                                                <Users className="h-4 w-4"/>
                                                                <span>View Employees</span>
                                                            </button>
                                                        }
                                                        {hasPermission(PERMISSIONS.USE) &&
                                                            <button
                                                                onClick={() => handleUploadForSubsidiary(subsidiary)}
                                                                className="bg-coop-purple-100 text-coop-purple-700 px-3 py-2 rounded-lg hover:bg-coop-purple-200 transition-colors flex items-center space-x-1"
                                                            >
                                                                <Upload className="h-4 w-4"/>
                                                                <span>Upload</span>
                                                            </button>
                                                        }
                                                    </>
                                                )}
                                                {subsidiary?.status.toUpperCase() === 'PENDING' && hasPermission(PERMISSIONS.ARS) && subsidiary?.createdBy?.id !== user?.id && (

                                                    <button
                                                        onClick={() => handleApproveSubsidiary(subsidiary)}
                                                        className="bg-coop-100 text-coop-700 px-3 py-2 rounded-lg hover:bg-coop-200 transition-colors flex items-center space-x-1"
                                                    >
                                                        <Edit className="h-4 w-4"/>
                                                        <span>Approve/Reject</span>
                                                    </button>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4"/>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No subsidiaries created
                                        yet</h3>
                                    <p className="text-gray-600">Create your first subsidiary to get started</p>
                                </div>
                            )}</>)}
                </div>
            </div>
        </div>
    );
};


export default SubsidiaryManagement;