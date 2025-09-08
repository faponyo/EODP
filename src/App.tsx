import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Event, Attendee, Voucher, Subsidiary, SubsidiaryEmployee, User } from './types';
import { createVoucher } from './utils/voucher';

// Components
import AuthForm from './components/AuthForm';
import PasswordResetPage from './components/PasswordResetPage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EventManagement from './components/EventManagement';
import AttendeeManagement from './components/AttendeeManagement';
import VoucherManagement from './components/VoucherManagement';
import Reports from './components/Reports';
import UserManagement from './components/UserManagement';
import SubsidiaryManagement from './components/SubsidiaryManagement';
import NoAccessPage from './components/NoAccessPage';
import AccountDisabledPage from './components/AccountDisabledPage';
import EventSelector from './components/EventSelector';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  
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

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <AuthForm />
            </PublicRoute>
          } 
        />

        {/* Password Reset Route */}
        <Route 
          path="/reset-password" 
          element={
            <ProtectedRoute>
              <PasswordResetPage />
            </ProtectedRoute>
          } 
        />

        {/* Account Disabled Route */}
        <Route 
          path="/account-disabled" 
          element={<AccountDisabledPage />} 
        />

        {/* No Access Route */}
        <Route 
          path="/no-access" 
          element={
            <ProtectedRoute>
              <Layout currentPage="no-access" onPageChange={() => {}} events={[]} selectedEvent={null}>
                <NoAccessPage />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Event Selection for External Users */}
        <Route 
          path="/select-event" 
          element={
            <ProtectedRoute requiredRole="external">
              {needsEventSelection() ? (
                <EventSelector 
                  events={filteredEvents} 
                  onEventSelect={setSelectedEventId}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )}
            </ProtectedRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout currentPage="dashboard" onPageChange={() => {}} events={filteredEvents} selectedEvent={selectedEvent}>
                <Dashboard events={displayEvents} attendees={displayAttendees} vouchers={displayVouchers} />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/events" 
          element={
            <ProtectedRoute>
              <Layout currentPage="events" onPageChange={() => {}} events={filteredEvents} selectedEvent={selectedEvent}>
                <EventManagement
                  events={displayEvents}
                  attendees={displayAttendees}
                  onCreateEvent={handleCreateEvent}
                  onUpdateEvent={handleUpdateEvent}
                  onDeleteEvent={handleDeleteEvent}
                />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/attendees" 
          element={
            <ProtectedRoute>
              <Layout currentPage="attendees" onPageChange={() => {}} events={filteredEvents} selectedEvent={selectedEvent}>
                <AttendeeManagement
                  events={displayEvents}
                  attendees={displayAttendees}
                  vouchers={displayVouchers}
                  onRegisterAttendee={handleRegisterAttendee}
                  onApproveRegistration={handleApproveRegistration}
                  onRejectRegistration={handleRejectRegistration}
                  userRole={user?.role || 'internal'}
                />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/vouchers" 
          element={
            <ProtectedRoute>
              <Layout currentPage="vouchers" onPageChange={() => {}} events={filteredEvents} selectedEvent={selectedEvent}>
                <VoucherManagement
                  events={displayEvents}
                  attendees={displayAttendees}
                  vouchers={displayVouchers}
                  onClaimDrink={handleClaimDrink}
                  userRole={user?.role || 'internal'}
                />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Layout currentPage="reports" onPageChange={() => {}} events={filteredEvents} selectedEvent={selectedEvent}>
                <Reports events={displayEvents} attendees={displayAttendees} vouchers={displayVouchers} />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Admin Only Routes */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout currentPage="users" onPageChange={() => {}} events={filteredEvents} selectedEvent={selectedEvent}>
                <UserManagement
                  events={events}
                  onCreateUser={handleCreateUser}
                  onUpdateUserStatus={handleUpdateUserStatus}
                  onUpdateUser={handleUpdateUser}
                />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/subsidiaries" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout currentPage="subsidiaries" onPageChange={() => {}} events={filteredEvents} selectedEvent={selectedEvent}>
                <SubsidiaryManagement
                  onCreateSubsidiary={handleCreateSubsidiary}
                  onUpdateSubsidiary={handleUpdateSubsidiary}
                  onDeleteSubsidiary={handleDeleteSubsidiary}
                  onUploadEmployees={handleUploadEmployees}
                />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Default Redirects */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              needsEventSelection() ? (
                <Navigate to="/select-event" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Catch all route */}
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;