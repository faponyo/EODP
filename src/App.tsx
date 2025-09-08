import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, TicketIcon, BarChart3, UserCog, Building, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { Event, Attendee, Voucher, Subsidiary, SubsidiaryEmployee, User } from './types';
import { createVoucher } from './utils/voucher';

// Components
import AuthForm from './components/AuthForm';
import PasswordResetModal from './components/PasswordResetModal';
import Dashboard from './components/Dashboard';
import EventManagement from './components/EventManagement';
import AttendeeManagement from './components/AttendeeManagement';
import VoucherManagement from './components/VoucherManagement';
import Reports from './components/Reports';
import UserManagement from './components/UserManagement';
import SubsidiaryManagement from './components/SubsidiaryManagement';
import EventSelector from './components/EventSelector';

function App() {
  const { isAuthenticated, user, logout, requiresPasswordReset, resetPassword } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State management
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [subsidiaryEmployees, setSubsidiaryEmployees] = useState<SubsidiaryEmployee[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    const storedAttendees = localStorage.getItem('attendees');
    const storedVouchers = localStorage.getItem('vouchers');
    const storedSubsidiaries = localStorage.getItem('subsidiaries');
    const storedSubsidiaryEmployees = localStorage.getItem('subsidiaryEmployees');

    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
    if (storedAttendees) {
      setAttendees(JSON.parse(storedAttendees));
    }
    if (storedVouchers) {
      setVouchers(JSON.parse(storedVouchers));
    }
    if (storedSubsidiaries) {
      setSubsidiaries(JSON.parse(storedSubsidiaries));
    }
    if (storedSubsidiaryEmployees) {
      setSubsidiaryEmployees(JSON.parse(storedSubsidiaryEmployees));
    }

    // Initialize demo data if none exists
    initializeDemoData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('attendees', JSON.stringify(attendees));
  }, [attendees]);

  useEffect(() => {
    localStorage.setItem('vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  useEffect(() => {
    localStorage.setItem('subsidiaries', JSON.stringify(subsidiaries));
  }, [subsidiaries]);

  useEffect(() => {
    localStorage.setItem('subsidiaryEmployees', JSON.stringify(subsidiaryEmployees));
  }, [subsidiaryEmployees]);

  const initializeDemoData = () => {
    // Initialize demo users if they don't exist
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) {
      const demoUsers = [
        {
          id: '1',
          email: 'admin@company.com',
          name: 'Admin User',
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'internal@company.com',
          name: 'Internal User',
          role: 'internal',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          email: 'external@company.com',
          name: 'External User',
          role: 'external',
          status: 'active',
          assignedEventIds: ['1'],
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem('users', JSON.stringify(demoUsers));
    }

    // Initialize demo events if none exist
    const storedEvents = localStorage.getItem('events');
    if (!storedEvents || JSON.parse(storedEvents).length === 0) {
      const demoEvents: Event[] = [
        {
          id: '1',
          name: 'Annual Christmas Party 2024',
          date: '2024-12-20',
          location: 'Grand Ballroom, Plaza Hotel',
          description: 'Join us for our annual Christmas celebration with dinner, drinks, and entertainment.',
          maxAttendees: 150,
          status: 'active',
          hasVouchers: false,
          createdAt: new Date().toISOString(),
          createdBy: '1',
        },
        {
          id: '2',
          name: 'New Year Celebration',
          date: '2024-12-31',
          location: 'Rooftop Terrace, Company HQ',
          description: 'Ring in the new year with colleagues and friends at our rooftop party.',
          maxAttendees: 100,
          status: 'active',
          hasVouchers: false,
          createdAt: new Date().toISOString(),
          createdBy: '1',
        },
      ];

      const demoAttendees: Attendee[] = [
        {
          id: '1',
          eventId: '1',
          name: 'John Smith',
          email: 'john.smith@company.com',
          phone: '+1 (555) 123-4567',
          department: 'Marketing',
          registeredAt: new Date(Date.now() - 86400000).toISOString(),
          voucherId: 'voucher-1',
          status: 'approved',
          submittedBy: '2',
          reviewedBy: '1',
          reviewedAt: new Date(Date.now() - 86000000).toISOString(),
        },
        {
          id: '2',
          eventId: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          phone: '+1 (555) 234-5678',
          department: 'HR',
          registeredAt: new Date(Date.now() - 172800000).toISOString(),
          voucherId: 'voucher-2',
          status: 'approved',
          submittedBy: '2',
          reviewedBy: '1',
          reviewedAt: new Date(Date.now() - 172400000).toISOString(),
        },
        {
          id: '3',
          eventId: '2',
          name: 'Mike Davis',
          email: 'mike.davis@company.com',
          phone: '+1 (555) 345-6789',
          department: 'Engineering',
          registeredAt: new Date(Date.now() - 259200000).toISOString(),
          voucherId: 'voucher-3',
          status: 'approved',
          submittedBy: '2',
          reviewedBy: '1',
          reviewedAt: new Date(Date.now() - 258800000).toISOString(),
        },
      ];

      const demoVouchers: Voucher[] = [
        {
          id: 'voucher-1',
          voucherNumber: 'VP202400001',
          attendeeId: '1',
          eventId: '1',
          softDrinks: { total: 2, claimed: 1 },
          hardDrinks: { total: 2, claimed: 0 },
          isFullyClaimed: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'voucher-2',
          voucherNumber: 'VP202400002',
          attendeeId: '2',
          eventId: '1',
          softDrinks: { total: 2, claimed: 2 },
          hardDrinks: { total: 2, claimed: 2 },
          isFullyClaimed: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'voucher-3',
          voucherNumber: 'VP202400003',
          attendeeId: '3',
          eventId: '2',
          softDrinks: { total: 2, claimed: 0 },
          hardDrinks: { total: 2, claimed: 1 },
          isFullyClaimed: false,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ];

      setEvents(demoEvents);
      setAttendees(demoAttendees);
      setVouchers(demoVouchers);
    }

    // Initialize demo subsidiaries if none exist
    const storedSubsidiaries = localStorage.getItem('subsidiaries');
    if (!storedSubsidiaries || JSON.parse(storedSubsidiaries).length === 0) {
      const demoSubsidiaries: Subsidiary[] = [
        {
          id: '1',
          name: 'Co-op Insurance Company Ltd',
          code: 'COINS',
          description: 'Leading insurance provider offering comprehensive coverage solutions',
          createdAt: new Date(Date.now() - 2592000000).toISOString(),
          createdBy: '1',
        },
        {
          id: '2',
          name: 'Co-op Trust Investment Services',
          code: 'TRUST',
          description: 'Investment and wealth management services for corporate and individual clients',
          createdAt: new Date(Date.now() - 1728000000).toISOString(),
          createdBy: '1',
        },
        {
          id: '3',
          name: 'Co-op Development Finance',
          code: 'DEVFIN',
          description: 'Development finance and project funding solutions',
          createdAt: new Date(Date.now() - 864000000).toISOString(),
          createdBy: '1',
        },
      ];

      const demoSubsidiaryEmployees: SubsidiaryEmployee[] = [
        // Co-op Insurance Company Ltd employees
        {
          id: 'emp-1',
          subsidiaryId: '1',
          pfNumber: 'COINS001',
          name: 'Alice Cooper',
          email: 'alice.cooper@coopinsurance.com',
          department: 'Underwriting',
          createdAt: new Date(Date.now() - 2592000000).toISOString(),
          uploadedBy: '1',
        },
        {
          id: 'emp-2',
          subsidiaryId: '1',
          pfNumber: 'COINS002',
          name: 'Bob Wilson',
          email: 'bob.wilson@coopinsurance.com',
          department: 'Claims',
          createdAt: new Date(Date.now() - 2592000000).toISOString(),
          uploadedBy: '1',
        },
        {
          id: 'emp-3',
          subsidiaryId: '1',
          pfNumber: 'COINS003',
          name: 'Carol Martinez',
          email: 'carol.martinez@coopinsurance.com',
          department: 'Sales',
          createdAt: new Date(Date.now() - 2592000000).toISOString(),
          uploadedBy: '1',
        },
        {
          id: 'emp-4',
          subsidiaryId: '1',
          pfNumber: 'COINS004',
          name: 'David Thompson',
          email: 'david.thompson@coopinsurance.com',
          department: 'Risk Management',
          createdAt: new Date(Date.now() - 2592000000).toISOString(),
          uploadedBy: '1',
        },
        {
          id: 'emp-5',
          subsidiaryId: '1',
          pfNumber: 'COINS005',
          name: 'Emma Rodriguez',
          email: 'emma.rodriguez@coopinsurance.com',
          department: 'Customer Service',
          createdAt: new Date(Date.now() - 2592000000).toISOString(),
          uploadedBy: '1',
        },

        // Co-op Trust Investment Services employees
        {
          id: 'emp-6',
          subsidiaryId: '2',
          pfNumber: 'TRUST001',
          name: 'Frank Anderson',
          email: 'frank.anderson@cooptrust.com',
          department: 'Portfolio Management',
          createdAt: new Date(Date.now() - 1728000000).toISOString(),
          uploadedBy: '1',
        },
        {
          id: 'emp-7',
          subsidiaryId: '2',
          pfNumber: 'TRUST002',
          name: 'Grace Miller',
          email: 'grace.miller@cooptrust.com',
          department: 'Investment Advisory',
          createdAt: new Date(Date.now() - 1728000000).toISOString(),
          uploadedBy: '1',
        },
        {
          id: 'emp-8',
          subsidiaryId: '2',
          pfNumber: 'TRUST003',
          name: 'Henry Davis',
          email: 'henry.davis@cooptrust.com',
          department: 'Research',
          createdAt: new Date(Date.now() - 1728000000).toISOString(),
          uploadedBy: '1',
        },
        {
          id: 'emp-9',
          subsidiaryId: '2',
          pfNumber: 'TRUST004',
          name: 'Iris Johnson',
          email: 'iris.johnson@cooptrust.com',
          department: 'Client Relations',
          createdAt: new Date(Date.now() - 1728000000).toISOString(),
          uploadedBy: '1',
        },
        {
          id: 'emp-10',
          subsidiaryId: '2',
          pfNumber: 'TRUST005',
          name: 'Jack Brown',
          email: 'jack.brown@cooptrust.com',
          department: 'Compliance',
          createdAt: new Date(Date.now() - 1728000000).toISOString(),
          uploadedBy: '1',
        },

        // Co-op Development Finance employees
        {
          id: 'emp-11',
          subsidiaryId: '3',
          pfNumber: 'DEVFIN001',
          name: 'Kate Wilson',
          email: 'kate.wilson@coopdevfin.com',
          department: 'Project Finance',
          createdAt: new Date(Date.now() - 864000000).toISOString(),
          uploadedBy: '1',
        },
        {
          id: 'emp-12',
          subsidiaryId: '3',
          pfNumber: 'DEVFIN002',
          name: 'Leo Garcia',
          email: 'leo.garcia@coopdevfin.com',
          department: 'Credit Analysis',
          createdAt: new Date(Date.now() - 864000000).toISOString(),
          uploadedBy: '1',
        },
        {
          id: 'emp-13',
          subsidiaryId: '3',
          pfNumber: 'DEVFIN003',
          name: 'Maya Lee',
          email: 'maya.lee@coopdevfin.com',
          department: 'Business Development',
          createdAt: new Date(Date.now() - 864000000).toISOString(),
          uploadedBy: '1',
        },
        {
          id: 'emp-14',
          subsidiaryId: '3',
          pfNumber: 'DEVFIN004',
          name: 'Noah Taylor',
          email: 'noah.taylor@coopdevfin.com',
          department: 'Risk Assessment',
          createdAt: new Date(Date.now() - 864000000).toISOString(),
          uploadedBy: '1',
        },
        {
          id: 'emp-15',
          subsidiaryId: '3',
          pfNumber: 'DEVFIN005',
          name: 'Olivia Chen',
          email: 'olivia.chen@coopdevfin.com',
          department: 'Operations',
          createdAt: new Date(Date.now() - 864000000).toISOString(),
          uploadedBy: '1',
        },
      ];

      setSubsidiaries(demoSubsidiaries);
      setSubsidiaryEmployees(demoSubsidiaryEmployees);
    }
  };

  // Event handlers
  const handleCreateEvent = (eventData: Omit<Event, 'id' | 'createdAt' | 'createdBy'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: user?.id || '1',
    };
    setEvents([...events, newEvent]);
  };

  const handleUpdateEvent = (id: string, eventData: Partial<Event>) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, ...eventData } : event
    ));
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    // Also remove related attendees and vouchers
    const relatedAttendees = attendees.filter(attendee => attendee.eventId === id);
    const attendeeIds = relatedAttendees.map(a => a.id);
    
    setAttendees(attendees.filter(attendee => attendee.eventId !== id));
    setVouchers(vouchers.filter(voucher => !attendeeIds.includes(voucher.attendeeId)));
  };

  const handleRegisterAttendee = (attendeeData: Omit<Attendee, 'id' | 'registeredAt' | 'voucherId'>) => {
    const attendeeId = Date.now().toString();
    const voucherId = `voucher-${attendeeId}`;
    
    const newAttendee: Attendee = {
      ...attendeeData,
      id: attendeeId,
      registeredAt: new Date().toISOString(),
      voucherId,
      status: 'pending',
      submittedBy: user?.id || '1',
    };

    setAttendees([...attendees, newAttendee]);
  };

  const handleApproveRegistration = (attendeeId: string) => {
    setAttendees(attendees.map(attendee => {
      if (attendee.id === attendeeId) {
        return {
          ...attendee,
          status: 'approved' as const,
          reviewedBy: user?.id || '1',
          reviewedAt: new Date().toISOString(),
        };
      }
      return attendee;
    }));

    // Create voucher for approved attendee
    const attendee = attendees.find(a => a.id === attendeeId);
    if (attendee && !vouchers.find(v => v.attendeeId === attendeeId)) {
      const newVoucher = createVoucher(attendeeId, attendee.eventId);
      newVoucher.id = attendee.voucherId;
      setVouchers([...vouchers, newVoucher]);
    }
  };

  const handleRejectRegistration = (attendeeId: string, reason: string) => {
    setAttendees(attendees.map(attendee => {
      if (attendee.id === attendeeId) {
        return {
          ...attendee,
          status: 'rejected' as const,
          reviewedBy: user?.id || '1',
          reviewedAt: new Date().toISOString(),
          rejectionReason: reason,
        };
      }
      return attendee;
    }));
  };

  const handleCreateUser = (userData: Omit<User, 'id' | 'createdAt' | 'createdBy'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: user?.id || '1',
    };
    
    // Update users in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
  };

  const handleUpdateUserStatus = useCallback((userId: string, status: 'active' | 'disabled') => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: User) => 
      u.id === userId ? { ...u, status } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // If current user is being disabled, log them out
    if (userId === user?.id && status === 'disabled') {
      logout();
    }
  }, [user?.id, logout]);

  const handleUpdateUser = (userId: string, userData: Partial<User>) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: User) => 
      u.id === userId ? { ...u, ...userData } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleCreateSubsidiary = (subsidiaryData: Omit<Subsidiary, 'id' | 'createdAt' | 'createdBy'>) => {
    const newSubsidiary: Subsidiary = {
      ...subsidiaryData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: user?.id || '1',
    };
    setSubsidiaries([...subsidiaries, newSubsidiary]);
  };

  const handleUpdateSubsidiary = (id: string, subsidiaryData: Partial<Subsidiary>) => {
    setSubsidiaries(subsidiaries.map(sub => 
      sub.id === id ? { ...sub, ...subsidiaryData } : sub
    ));
  };

  const handleDeleteSubsidiary = (id: string) => {
    setSubsidiaries(subsidiaries.filter(sub => sub.id !== id));
    // Also remove related employees
    setSubsidiaryEmployees(subsidiaryEmployees.filter(emp => emp.subsidiaryId !== id));
  };

  const handleUploadEmployees = (subsidiaryId: string, employees: Omit<SubsidiaryEmployee, 'id' | 'subsidiaryId' | 'createdAt' | 'uploadedBy'>[]) => {
    const newEmployees = employees.map(emp => ({
      ...emp,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subsidiaryId,
      createdAt: new Date().toISOString(),
      uploadedBy: user?.id || '1',
    }));
    setSubsidiaryEmployees([...subsidiaryEmployees, ...newEmployees]);
  };

  const handleClaimDrink = (voucherId: string, drinkType: 'soft' | 'hard', itemName?: string) => {
    setVouchers(vouchers.map(voucher => {
      if (voucher.id !== voucherId) return voucher;

      const updatedVoucher = { ...voucher };
      
      if (drinkType === 'soft' && voucher.softDrinks.claimed < voucher.softDrinks.total) {
        updatedVoucher.softDrinks.claimed += 1;
      } else if (drinkType === 'hard' && voucher.hardDrinks.claimed < voucher.hardDrinks.total) {
        updatedVoucher.hardDrinks.claimed += 1;
      }

      // Add claim to history
      const newClaim = {
        id: Date.now().toString(),
        voucherId,
        drinkType,
        itemName,
        claimedAt: new Date().toISOString(),
        claimedBy: user?.id || '1',
      };

      if (!updatedVoucher.claimHistory) {
        updatedVoucher.claimHistory = [];
      }
      updatedVoucher.claimHistory.push(newClaim);

      // Check if fully claimed
      updatedVoucher.isFullyClaimed = 
        updatedVoucher.softDrinks.claimed >= updatedVoucher.softDrinks.total &&
        updatedVoucher.hardDrinks.claimed >= updatedVoucher.hardDrinks.total;

      return updatedVoucher;
    }));
  };

  // Filter data based on user role and permissions
  const getFilteredEvents = () => {
    if (user?.role === 'external' && user.assignedEventIds) {
      return events.filter(event => user.assignedEventIds!.includes(event.id));
    }
    return events;
  };

  const getFilteredAttendees = () => {
    if (user?.role === 'external' && user.assignedEventIds) {
      return attendees.filter(attendee => user.assignedEventIds!.includes(attendee.eventId));
    }
    return attendees;
  };

  const getFilteredVouchers = () => {
    if (user?.role === 'external' && user.assignedEventIds) {
      const allowedAttendeeIds = getFilteredAttendees().map(a => a.id);
      return vouchers.filter(voucher => allowedAttendeeIds.includes(voucher.attendeeId));
    }
    return vouchers;
  };

  const filteredEvents = getFilteredEvents();
  const filteredAttendees = getFilteredAttendees();
  const filteredVouchers = getFilteredVouchers();
  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) || null : null;

  // Check if external user needs to select an event
  const needsEventSelection = () => {
    return user?.role === 'external' && 
           user.assignedEventIds && 
           user.assignedEventIds.length > 1 && 
           !selectedEventId;
  };

  // Filter data for external users with selected event
  const getEventFilteredData = () => {
    if (user?.role === 'external' && selectedEventId) {
      return {
        events: [selectedEvent!].filter(Boolean),
        attendees: filteredAttendees.filter(a => a.eventId === selectedEventId),
        vouchers: filteredVouchers.filter(v => v.eventId === selectedEventId)
      };
    }
    return {
      events: filteredEvents,
      attendees: filteredAttendees,
      vouchers: filteredVouchers
    };
  };

  const { events: displayEvents, attendees: displayAttendees, vouchers: displayVouchers } = getEventFilteredData();

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'events', label: 'Events', icon: Calendar },
      { id: 'attendees', label: 'Attendees', icon: Users },
      { id: 'vouchers', label: 'Vouchers', icon: TicketIcon },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
    ];

    if (user?.role === 'admin') {
      baseItems.push(
        { id: 'subsidiaries', label: 'Subsidiaries', icon: Building },
        { id: 'users', label: 'User Management', icon: UserCog }
      );
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-coop-red-100 text-coop-red-800';
      case 'internal':
        return 'bg-coop-blue-100 text-coop-blue-800';
      case 'external':
        return 'bg-coop-100 text-coop-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show login form if not authenticated
  if (!isAuthenticated || !user) {
    return <AuthForm />;
  }

  // Show password reset modal if required
  if (requiresPasswordReset) {
    return (
      <PasswordResetModal
        onPasswordReset={resetPassword}
        userEmail={user.email}
        onBackToLogin={logout}
      />
    );
  }

  // Show no access page for users without proper permissions
  if (user.role === 'external' && (!user.assignedEventIds || user.assignedEventIds.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Access</h1>
          <p className="text-gray-600 mb-6">You don't have access to any events.</p>
          <button
            onClick={logout}
            className="bg-coop-600 text-white px-4 py-2 rounded-lg hover:bg-coop-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Show event selector for external users with multiple events
  if (user.role === 'external' && user.assignedEventIds && user.assignedEventIds.length > 1 && !selectedEventId) {
    return (
      <EventSelector 
        events={filteredEvents} 
        onEventSelect={setSelectedEventId}
        onBackToLogin={logout}
      />
    );
  }

  // Render main application
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard events={displayEvents} attendees={displayAttendees} vouchers={displayVouchers} />;
      case 'events':
        return (
          <EventManagement
            events={displayEvents}
            attendees={displayAttendees}
            onCreateEvent={handleCreateEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        );
      case 'attendees':
        return (
          <AttendeeManagement
            events={displayEvents}
            attendees={displayAttendees}
            vouchers={displayVouchers}
            onRegisterAttendee={handleRegisterAttendee}
            onApproveRegistration={handleApproveRegistration}
            onRejectRegistration={handleRejectRegistration}
            userRole={user?.role || 'internal'}
          />
        );
      case 'vouchers':
        return (
          <VoucherManagement
            events={displayEvents}
            attendees={displayAttendees}
            vouchers={displayVouchers}
            onClaimDrink={handleClaimDrink}
            userRole={user?.role || 'internal'}
          />
        );
      case 'reports':
        return <Reports events={displayEvents} attendees={displayAttendees} vouchers={displayVouchers} />;
      case 'users':
        if (user.role !== 'admin') {
          return (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </div>
          );
        }
        return (
          <UserManagement
            events={events}
            onCreateUser={handleCreateUser}
            onUpdateUserStatus={handleUpdateUserStatus}
            onUpdateUser={handleUpdateUser}
          />
        );
      case 'subsidiaries':
        if (user.role !== 'admin') {
          return (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </div>
          );
        }
        return (
          <SubsidiaryManagement
            onCreateSubsidiary={handleCreateSubsidiary}
            onUpdateSubsidiary={handleUpdateSubsidiary}
            onDeleteSubsidiary={handleDeleteSubsidiary}
            onUploadEmployees={handleUploadEmployees}
          />
        );
      default:
        return <Dashboard events={displayEvents} attendees={displayAttendees} vouchers={displayVouchers} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-coop-600 mr-3" />
                  <h1 className="text-xl font-bold text-gray-900">Party Manager</h1>
                </div>
                
                {/* Selected Event Display for External Users */}
                {user.role === 'external' && selectedEvent && (
                  <div className="hidden sm:flex items-center bg-coop-50 border border-coop-200 rounded-lg px-3 py-2">
                    <div className="w-2 h-2 bg-coop-600 rounded-full mr-2"></div>
                    <div>
                      <p className="text-sm font-medium text-coop-900 truncate max-w-48">
                        {selectedEvent.name}
                      </p>
                      <p className="text-xs text-coop-700">
                        {new Date(selectedEvent.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="hidden sm:inline">{user.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                  {user.role.toUpperCase()}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
          
          {/* Mobile Selected Event Display */}
          {user.role === 'external' && selectedEvent && (
            <div className="sm:hidden pb-4">
              <div className="flex items-center bg-coop-50 border border-coop-200 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-coop-600 rounded-full mr-2"></div>
                <div>
                  <p className="text-sm font-medium text-coop-900">
                    {selectedEvent.name}
                  </p>
                  <p className="text-xs text-coop-700">
                    {new Date(selectedEvent.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Sidebar */}
          <nav className={`lg:w-64 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            {/* Mobile overlay */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
              sidebarOpen ? 'fixed top-20 left-4 right-4 z-50 lg:relative lg:top-auto lg:left-auto lg:right-auto lg:z-auto' : ''
            }`}>
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setCurrentPage(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          isActive
                            ? 'bg-coop-50 text-coop-700 border-l-4 border-coop-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {renderCurrentPage()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;