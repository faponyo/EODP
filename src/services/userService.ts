export interface UserLookupResponse {
  success: boolean;
  data?: {
    name: string;
    department?: string;
    employeeId?: string;
  };
  error?: string;
}

export const lookupInternalUser = async (email: string): Promise<UserLookupResponse> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock internal user database
    const internalUsers = [
      {
        email: 'john.smith@company.com',
        name: 'John Smith',
        department: 'Marketing',
        employeeId: 'EMP001'
      },
      {
        email: 'sarah.johnson@company.com',
        name: 'Sarah Johnson',
        department: 'HR',
        employeeId: 'EMP002'
      },
      {
        email: 'mike.davis@company.com',
        name: 'Mike Davis',
        department: 'Engineering',
        employeeId: 'EMP003'
      },
      {
        email: 'lisa.wong@company.com',
        name: 'Lisa Wong',
        department: 'Finance',
        employeeId: 'EMP004'
      },
      {
        email: 'david.brown@company.com',
        name: 'David Brown',
        department: 'Operations',
        employeeId: 'EMP005'
      }
    ];

    const user = internalUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      return {
        success: true,
        data: {
          name: user.name,
          department: user.department,
          employeeId: user.employeeId
        }
      };
    } else {
      return {
        success: false,
        error: 'User not found in internal directory'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to connect to user directory service'
    };
  }
};