// Mock employee database for PF number lookup
const mockEmployeeDatabase = {
  // For Attendee Management (PF001-PF010)
  'PF001': { name: 'John Smith', email: 'john.smith@company.com', department: 'Marketing' },
  'PF002': { name: 'Sarah Johnson', email: 'sarah.johnson@company.com', department: 'Human Resources' },
  'PF003': { name: 'Mike Davis', email: 'mike.davis@company.com', department: 'Engineering' },
  'PF004': { name: 'Lisa Wong', email: 'lisa.wong@company.com', department: 'Finance' },
  'PF005': { name: 'David Brown', email: 'david.brown@company.com', department: 'Operations' },
  'PF006': { name: 'Emma Wilson', email: 'emma.wilson@company.com', department: 'Sales' },
  'PF007': { name: 'James Taylor', email: 'james.taylor@company.com', department: 'IT Support' },
  'PF008': { name: 'Maria Garcia', email: 'maria.garcia@company.com', department: 'Customer Service' },
  'PF009': { name: 'Robert Lee', email: 'robert.lee@company.com', department: 'Legal' },
  'PF010': { name: 'Jennifer Chen', email: 'jennifer.chen@company.com', department: 'Research' },

  // For User Management (PF011-PF020)
  'PF011': { name: 'Alice Johnson', email: 'alice.johnson@company.com', department: 'Human Resources' },
  'PF012': { name: 'Bob Smith', email: 'bob.smith@company.com', department: 'Finance' },
  'PF013': { name: 'Carol Davis', email: 'carol.davis@company.com', department: 'Marketing' },
  'PF014': { name: 'Daniel Wilson', email: 'daniel.wilson@company.com', department: 'Engineering' },
  'PF015': { name: 'Eva Brown', email: 'eva.brown@company.com', department: 'Operations' },
  'PF016': { name: 'Frank Taylor', email: 'frank.taylor@company.com', department: 'Sales' },
  'PF017': { name: 'Grace Lee', email: 'grace.lee@company.com', department: 'IT Support' },
  'PF018': { name: 'Henry Garcia', email: 'henry.garcia@company.com', department: 'Customer Service' },
  'PF019': { name: 'Iris Chen', email: 'iris.chen@company.com', department: 'Legal' },
  'PF020': { name: 'Jack Wong', email: 'jack.wong@company.com', department: 'Research' },

  // Subsidiary employees (SUB001-SUB020)
  'SUB001': { name: 'Alice Cooper', email: 'alice.cooper@subsidiary.com', department: 'Finance' },
  'SUB002': { name: 'Bob Wilson', email: 'bob.wilson@subsidiary.com', department: 'HR' },
  'SUB003': { name: 'Carol Martinez', email: 'carol.martinez@subsidiary.com', department: 'Marketing' },
  'SUB004': { name: 'David Thompson', email: 'david.thompson@subsidiary.com', department: 'Operations' },
  'SUB005': { name: 'Emma Rodriguez', email: 'emma.rodriguez@subsidiary.com', department: 'Sales' },
  'SUB006': { name: 'Frank Anderson', email: 'frank.anderson@subsidiary.com', department: 'IT' },
  'SUB007': { name: 'Grace Miller', email: 'grace.miller@subsidiary.com', department: 'Legal' },
  'SUB008': { name: 'Henry Davis', email: 'henry.davis@subsidiary.com', department: 'Research' },
  'SUB009': { name: 'Iris Johnson', email: 'iris.johnson@subsidiary.com', department: 'Customer Service' },
  'SUB010': { name: 'Jack Brown', email: 'jack.brown@subsidiary.com', department: 'Finance' },
  'SUB011': { name: 'Kate Wilson', email: 'kate.wilson@subsidiary.com', department: 'HR' },
  'SUB012': { name: 'Leo Garcia', email: 'leo.garcia@subsidiary.com', department: 'Marketing' },
  'SUB013': { name: 'Maya Lee', email: 'maya.lee@subsidiary.com', department: 'Operations' },
  'SUB014': { name: 'Noah Taylor', email: 'noah.taylor@subsidiary.com', department: 'Sales' },
  'SUB015': { name: 'Olivia Chen', email: 'olivia.chen@subsidiary.com', department: 'IT' },
  'SUB016': { name: 'Paul Wong', email: 'paul.wong@subsidiary.com', department: 'Legal' },
  'SUB017': { name: 'Quinn Smith', email: 'quinn.smith@subsidiary.com', department: 'Research' },
  'SUB018': { name: 'Ruby Martinez', email: 'ruby.martinez@subsidiary.com', department: 'Customer Service' },
  'SUB019': { name: 'Sam Thompson', email: 'sam.thompson@subsidiary.com', department: 'Finance' },
  'SUB020': { name: 'Tina Rodriguez', email: 'tina.rodriguez@subsidiary.com', department: 'HR' },
};

export interface EmployeeData {
  name: string;
  email: string;
  department: string;
}

export interface LookupResult {
  success: boolean;
  data?: EmployeeData;
  error?: string;
}

// Function for attendee management PF lookup
export const lookupUserByPF = async (pfNumber: string): Promise<LookupResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const employee = mockEmployeeDatabase[pfNumber as keyof typeof mockEmployeeDatabase];

  if (employee) {
    return {
      success: true,
      data: employee
    };
  } else {
    return {
      success: false,
      error: 'Employee not found in directory'
    };
  }
};

// Function for user management PF lookup
export const lookupUserByPFForUserManagement = async (pfNumber: string): Promise<LookupResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  const employee = mockEmployeeDatabase[pfNumber as keyof typeof mockEmployeeDatabase];

  if (employee) {
    return {
      success: true,
      data: employee
    };
  } else {
    return {
      success: false,
      error: 'Employee not found in company directory'
    };
  }
};