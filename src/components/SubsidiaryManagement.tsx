import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Upload, Search, Plus, Edit2, Trash2, Users, FileText, Download, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Subsidiary, SubsidiaryEmployee } from '../types';
import { usePagination } from '../hooks/usePagination';
import { useSearch } from '../hooks/useSearch';
import Pagination from './Pagination';

interface SubsidiaryManagementProps {
  onCreateSubsidiary: (subsidiary: Omit<Subsidiary, 'id' | 'createdAt' | 'createdBy'>) => void;
  onUpdateSubsidiary: (id: string, subsidiary: Partial<Subsidiary>) => void;
  onDeleteSubsidiary: (id: string) => void;
  onUploadEmployees: (subsidiaryId: string, employees: Omit<SubsidiaryEmployee, 'id' | 'subsidiaryId' | 'createdAt' | 'uploadedBy'>[]) => void;
}

const SubsidiaryManagement: React.FC<SubsidiaryManagementProps> = ({
  onCreateSubsidiary,
  onUpdateSubsidiary,
  onDeleteSubsidiary,
  onUploadEmployees,
}) => {
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [employees, setEmployees] = useState<SubsidiaryEmployee[]>([]);
  const [showSubsidiaryForm, setShowSubsidiaryForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showEmployeesModal, setShowEmployeesModal] = useState(false);
  const [selectedSubsidiaryForView, setSelectedSubsidiaryForView] = useState<string>('');
  const [editingSubsidiary, setEditingSubsidiary] = useState<Subsidiary | null>(null);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string>('');
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [subsidiaryFormData, setSubsidiaryFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  // Load data from localStorage
  useEffect(() => {
    const storedSubsidiaries = localStorage.getItem('subsidiaries');
    const storedEmployees = localStorage.getItem('subsidiaryEmployees');
    
    if (storedSubsidiaries) {
      setSubsidiaries(JSON.parse(storedSubsidiaries));
    }
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    }
  }, []);

  // Search functionality for employees
  const { searchTerm, setSearchTerm, filteredData: searchedEmployees } = useSearch(
    employees,
    ['pfNumber', 'name', 'email', 'department']
  );

  // Filter employees for viewing modal
  const viewModalEmployees = useMemo(() => {
    if (!selectedSubsidiaryForView) return [];
    
    let filtered = searchedEmployees.filter(emp => emp.subsidiaryId === selectedSubsidiaryForView);
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [searchedEmployees, selectedSubsidiaryForView]);

  // Pagination
  const pagination = usePagination(50);
  const { paginatedData: paginatedEmployees, pagination: paginationInfo } = pagination.paginateData(viewModalEmployees);

  const handleSubsidiarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSubsidiary) {
      onUpdateSubsidiary(editingSubsidiary.id, subsidiaryFormData);
      setEditingSubsidiary(null);
    } else {
      onCreateSubsidiary(subsidiaryFormData);
    }
    
    setSubsidiaryFormData({ name: '', code: '', description: '' });
    setShowSubsidiaryForm(false);
    
    // Refresh subsidiaries
    setTimeout(() => {
      const stored = localStorage.getItem('subsidiaries');
      if (stored) setSubsidiaries(JSON.parse(stored));
    }, 100);
  };

  const handleEditSubsidiary = (subsidiary: Subsidiary) => {
    setEditingSubsidiary(subsidiary);
    setSubsidiaryFormData({
      name: subsidiary.name,
      code: subsidiary.code,
      description: subsidiary.description || '',
    });
    setShowSubsidiaryForm(true);
  };

  const handleDeleteSubsidiary = (id: string) => {
    if (confirm('Are you sure you want to delete this subsidiary? This will also delete all associated employees.')) {
      onDeleteSubsidiary(id);
      
      // Refresh data
      setTimeout(() => {
        const storedSubs = localStorage.getItem('subsidiaries');
        const storedEmps = localStorage.getItem('subsidiaryEmployees');
        if (storedSubs) setSubsidiaries(JSON.parse(storedSubs));
        if (storedEmps) setEmployees(JSON.parse(storedEmps));
      }, 100);
    }
  };

  const parseCsvData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    const errors: string[] = [];
    const employees: Omit<SubsidiaryEmployee, 'id' | 'subsidiaryId' | 'createdAt' | 'uploadedBy'>[] = [];
    
    if (lines.length < 2) {
      errors.push('CSV must contain at least a header row and one data row');
      return { employees, errors };
    }
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
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
    
    return { employees, errors };
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
    
    const { employees: parsedEmployees, errors } = parseCsvData(csvData);
    
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
    
    onUploadEmployees(selectedSubsidiary, parsedEmployees);
    
    setUploadErrors([]);
    setUploadSuccess(true);
    setCsvData('');
    
    // Refresh employees
    setTimeout(() => {
      const stored = localStorage.getItem('subsidiaryEmployees');
      if (stored) setEmployees(JSON.parse(stored));
      setShowUploadForm(false);
      setUploadSuccess(false);
    }, 2000);
  };

  const downloadTemplate = () => {
    const template = 'PF Number,Name,Email,Department\nSUB001,John Doe,john.doe@subsidiary.com,Finance\nSUB002,Jane Smith,jane.smith@subsidiary.com,HR';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSubsidiaryName = (subsidiaryId: string) => {
    return subsidiaries.find(s => s.id === subsidiaryId)?.name || 'Unknown Subsidiary';
  };

  const getEmployeeCount = (subsidiaryId: string) => {
    return employees.filter(emp => emp.subsidiaryId === subsidiaryId).length;
  };

  const handleViewEmployees = (subsidiaryId: string) => {
    setSelectedSubsidiaryForView(subsidiaryId);
    setShowEmployeesModal(true);
    setSearchTerm(''); // Reset search when opening modal
    pagination.resetPage(); // Reset pagination
  };

  const handleUploadForSubsidiary = (subsidiaryId: string) => {
    setSelectedSubsidiary(subsidiaryId);
    setShowUploadForm(true);
  };

  // Reset pagination when filters change
  React.useEffect(() => {
    pagination.resetPage();
  }, [searchTerm, selectedSubsidiaryForView]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subsidiary Management</h1>
          <p className="text-gray-600 mt-1">Manage subsidiaries and their employee data</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSubsidiaryForm(true)}
            className="bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Subsidiary</span>
          </button>
        </div>
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
                    setSubsidiaryFormData({ name: '', code: '', description: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
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
                  onChange={(e) => setSubsidiaryFormData({ ...subsidiaryFormData, name: e.target.value })}
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
                  onChange={(e) => setSubsidiaryFormData({ ...subsidiaryFormData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                  placeholder="COINS"
                  maxLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">Short code for identification (e.g., COINS, TRUST)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={subsidiaryFormData.description}
                  onChange={(e) => setSubsidiaryFormData({ ...subsidiaryFormData, description: e.target.value })}
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
                    setSubsidiaryFormData({ name: '', code: '', description: '' });
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

      {/* View Employees Modal */}
      {showEmployeesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {subsidiaries.find(s => s.id === selectedSubsidiaryForView)?.name} - Employees
                </h2>
                <button
                  onClick={() => {
                    setShowEmployeesModal(false);
                    setSelectedSubsidiaryForView('');
                    setSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Search for employees in modal */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                    placeholder="Search employees by PF, name, email, or department..."
                  />
                </div>
                {searchTerm && (
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {viewModalEmployees.length} employees
                    </p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-sm text-coop-600 hover:text-coop-700 font-medium"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>

              {/* Employees List */}
              <div className="space-y-4">
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((employee) => (
                    <div key={employee.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{employee.name}</h4>
                            <span className="px-2 py-1 bg-coop-100 text-coop-800 rounded-full text-sm font-medium">
                              {employee.pfNumber}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>
                              <p><strong>Email:</strong> {employee.email}</p>
                              <p><strong>Department:</strong> {employee.department}</p>
                            </div>
                            <div>
                              <p><strong>Uploaded:</strong> {new Date(employee.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                    <p className="text-gray-600">
                      {searchTerm
                        ? "No employees match your search criteria"
                        : "No employees have been uploaded for this subsidiary yet"
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination for modal */}
              {viewModalEmployees.length > 0 && (
                <div className="mt-6">
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
                </div>
              )}
            </div>
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
                  Upload Employees - {subsidiaries.find(s => s.id === selectedSubsidiary)?.name}
                </h2>
                <button
                  onClick={() => {
                    setShowUploadForm(false);
                    setSelectedSubsidiary('');
                    setCsvData('');
                    setUploadErrors([]);
                    setUploadSuccess(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div className="bg-coop-50 border border-coop-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 text-coop-600 mr-2" />
                  <div>
                    <p className="font-medium text-coop-900">
                      {subsidiaries.find(s => s.id === selectedSubsidiary)?.name}
                    </p>
                    <p className="text-sm text-coop-700">
                      Code: {subsidiaries.find(s => s.id === selectedSubsidiary)?.code}
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
                    <Download className="h-4 w-4" />
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
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
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
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Employees uploaded successfully!</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setSelectedSubsidiary('');
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
          <h2 className="text-lg font-semibold text-gray-900">Subsidiaries</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {subsidiaries.length > 0 ? (
            subsidiaries.map((subsidiary) => (
              <div key={subsidiary.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{subsidiary.name}</h3>
                      <span className="px-2 py-1 bg-coop-100 text-coop-800 rounded-full text-sm font-medium">
                        {subsidiary.code}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {getEmployeeCount(subsidiary.id)} employees
                      </span>
                    </div>
                    
                    {subsidiary.description && (
                      <p className="text-gray-600 mb-2">{subsidiary.description}</p>
                    )}
                    
                    <p className="text-sm text-gray-500">
                      Created: {new Date(subsidiary.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewEmployees(subsidiary.id)}
                      className="bg-coop-blue-100 text-coop-blue-700 px-3 py-2 rounded-lg hover:bg-coop-blue-200 transition-colors flex items-center space-x-1"
                    >
                      <Users className="h-4 w-4" />
                      <span>View Employees</span>
                    </button>
                    <button
                      onClick={() => handleUploadForSubsidiary(subsidiary.id)}
                      className="bg-coop-purple-100 text-coop-purple-700 px-3 py-2 rounded-lg hover:bg-coop-purple-200 transition-colors flex items-center space-x-1"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload</span>
                    </button>
                    <button
                      onClick={() => handleEditSubsidiary(subsidiary)}
                      className="bg-coop-100 text-coop-700 px-3 py-2 rounded-lg hover:bg-coop-200 transition-colors flex items-center space-x-1"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSubsidiary(subsidiary.id)}
                      className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No subsidiaries created yet</h3>
              <p className="text-gray-600">Create your first subsidiary to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubsidiaryManagement;