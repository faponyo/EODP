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

export const lookupUserByPFForUserManagement = async (pfNumber: string): Promise<PFLookupResponse> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock PF number database for user management
    const pfDatabase = [
      {
        pfNumber: 'PF011',
        name: 'Alice Johnson',
        department: 'Human Resources',
        email: 'alice.johnson@company.com'
      },
      {
        pfNumber: 'PF012',
        name: 'Bob Smith',
        department: 'Finance',
        email: 'bob.smith@company.com'
      },
      {
        pfNumber: 'PF013',
        name: 'Carol Davis',
        department: 'Marketing',
        email: 'carol.davis@company.com'
      },
      {
        pfNumber: 'PF014',
        name: 'Daniel Wilson',
        department: 'IT Support',
        email: 'daniel.wilson@company.com'
      },
      {
        pfNumber: 'PF015',
        name: 'Eva Brown',
        department: 'Operations',
        email: 'eva.brown@company.com'
      },
      {
        pfNumber: 'PF016',
        name: 'Frank Miller',
        department: 'Legal',
        email: 'frank.miller@company.com'
      },
      {
        pfNumber: 'PF017',
        name: 'Grace Lee',
        department: 'Engineering',
        email: 'grace.lee@company.com'
      },
      {
        pfNumber: 'PF018',
        name: 'Henry Taylor',
        department: 'Sales',
        email: 'henry.taylor@company.com'
      },
      {
        pfNumber: 'PF019',
        name: 'Iris Chen',
        department: 'Customer Service',
        email: 'iris.chen@company.com'
      },
      {
        pfNumber: 'PF020',
        name: 'Jack Anderson',
        department: 'Compliance',
        email: 'jack.anderson@company.com'
      }
    ];

    const user = pfDatabase.find(u => u.pfNumber.toLowerCase() === pfNumber.toLowerCase());
    
    if (user) {
      return {
        success: true,
        data: {
          name: user.name,
          department: user.department,
          email: user.email
        }
      };
    } else {
      return {
        success: false,
        error: 'PF Number not found in employee directory'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to connect to employee directory service'
    };
  }
};
export interface PFLookupResponse {
  success: boolean;
  data?: {
    name: string;
    department: string;
    email: string;
  };
  error?: string;
}

export const lookupUserByPF = async (pfNumber: string): Promise<PFLookupResponse> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock PF number database
    const pfDatabase = [
      {
        pfNumber: 'PF001',
        name: 'John Smith',
        department: 'Marketing',
        email: 'john.smith@company.com'
      },
      {
        pfNumber: 'PF002',
        name: 'Sarah Johnson',
        department: 'Human Resources',
        email: 'sarah.johnson@company.com'
      },
      {
        pfNumber: 'PF003',
        name: 'Mike Davis',
        department: 'Engineering',
        email: 'mike.davis@company.com'
      },
      {
        pfNumber: 'PF004',
        name: 'Lisa Wong',
        department: 'Finance',
        email: 'lisa.wong@company.com'
      },
      {
        pfNumber: 'PF005',
        name: 'David Brown',
        department: 'Operations',
        email: 'david.brown@company.com'
      },
      {
        pfNumber: 'PF006',
        name: 'Emily Chen',
        department: 'IT Support',
        email: 'emily.chen@company.com'
      },
      {
        pfNumber: 'PF007',
        name: 'Robert Wilson',
        department: 'Sales',
        email: 'robert.wilson@company.com'
      },
      {
        pfNumber: 'PF008',
        name: 'Maria Garcia',
        department: 'Customer Service',
        email: 'maria.garcia@company.com'
      },
      {
        pfNumber: 'PF009',
        name: 'James Taylor',
        department: 'Legal',
        email: 'james.taylor@company.com'
      },
      {
        pfNumber: 'PF010',
        name: 'Anna Thompson',
        department: 'Compliance',
        email: 'anna.thompson@company.com'
      }
    ];

    const user = pfDatabase.find(u => u.pfNumber.toLowerCase() === pfNumber.toLowerCase());
    
    if (user) {
      return {
        success: true,
        data: {
          name: user.name,
          department: user.department,
          email: user.email
        }
      };
    } else {
      return {
        success: false,
        error: 'PF Number not found in employee directory'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to connect to employee directory service'
    };
  }
};