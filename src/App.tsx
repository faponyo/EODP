import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { Event, Attendee, Voucher } from './types';
import { createVoucher } from './utils/voucher';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EventManagement from './components/EventManagement';
import AttendeeManagement from './components/AttendeeManagement';
import VoucherManagement from './components/VoucherManagement';
import Reports from './components/Reports';
import UserManagement from './components/UserManagement';
import NoAccessPage from './components/NoAccessPage';
import EventSelector from './components/EventSelector';

function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  
  // State management
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    const storedAttendees = localStorage.getItem('attendees');
    const storedVouchers = localStorage.getItem('vouchers');

    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
    if (storedAttendees) {
      setAttendees(JSON.parse(storedAttendees));
    }
    if (storedVouchers) {
      setVouchers(JSON.parse(storedVouchers));
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
      submittedBy: user?.id || '1',
    };

    setAttendees([...attendees, newAttendee]);

    // Create voucher immediately
    const newVoucher = createVoucher(attendeeId, attendeeData.eventId);
    newVoucher.id = voucherId;
    setVouchers([...vouchers, newVoucher]);
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

  // Check if user has any access rights
  const hasAnyAccess = () => {
    if (!user) return false;
    
    // Admin and internal users always have access
    if (user.role === 'admin' || user.role === 'internal') return true;
    
    // External users need assigned events
    if (user.role === 'external') {
      return user.assignedEventIds && user.assignedEventIds.length > 0;
    }
    
    return false;
  };

  // Check if external user needs to select an event
  const needsEventSelection = () => {
    return user?.role === 'external' && 
           user.assignedEventIds && 
           user.assignedEventIds.length > 0 && 
           !selectedEventId;
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

    // Create voucher for approved attendee if it doesn't exist
    const attendee = attendees.find(a => a.id === attendeeId);
    if (attendee && !vouchers.find(v => v.attendeeId === attendeeId)) {
      const newVoucher = createVoucher(attendeeId, attendee.eventId);
      newVoucher.id = voucherId;
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

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  // Show no access page if user has no rights
  if (!hasAnyAccess()) {
    return (
      <Layout currentPage="no-access" onPageChange={() => {}} events={[]} selectedEvent={null}>
        <NoAccessPage />
      </Layout>
    );
  }

  // Show event selection for external users
  if (needsEventSelection()) {
    return (
      <EventSelector 
        events={filteredEvents} 
        onEventSelect={setSelectedEventId}
      />
    );
  }

  return (
    <Layout 
      currentPage={currentPage} 
      onPageChange={setCurrentPage} 
      events={filteredEvents}
      selectedEvent={selectedEvent}
    >
      {currentPage === 'dashboard' && (
        <Dashboard 
          events={user?.role === 'external' && selectedEventId ? [selectedEvent!].filter(Boolean) : filteredEvents} 
          attendees={user?.role === 'external' && selectedEventId ? filteredAttendees.filter(a => a.eventId === selectedEventId) : filteredAttendees} 
          vouchers={user?.role === 'external' && selectedEventId ? filteredVouchers.filter(v => v.eventId === selectedEventId) : filteredVouchers} 
        />
      )}
      {currentPage === 'events' && (
        <EventManagement
          events={user?.role === 'external' && selectedEventId ? [selectedEvent!].filter(Boolean) : filteredEvents}
          attendees={user?.role === 'external' && selectedEventId ? filteredAttendees.filter(a => a.eventId === selectedEventId) : filteredAttendees}
          onCreateEvent={handleCreateEvent}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
          userRole={user?.role || 'internal'}
        />
      )}
      {currentPage === 'attendees' && (
        <AttendeeManagement
          events={user?.role === 'external' && selectedEventId ? [selectedEvent!].filter(Boolean) : filteredEvents}
          attendees={user?.role === 'external' && selectedEventId ? filteredAttendees.filter(a => a.eventId === selectedEventId) : filteredAttendees}
          vouchers={user?.role === 'external' && selectedEventId ? filteredVouchers.filter(v => v.eventId === selectedEventId) : filteredVouchers}
          onRegisterAttendee={handleRegisterAttendee}
          onApproveRegistration={handleApproveRegistration}
          onRejectRegistration={handleRejectRegistration}
          userRole={user?.role || 'internal'}
        />
      )}
      {currentPage === 'vouchers' && (
        <VoucherManagement
          events={user?.role === 'external' && selectedEventId ? [selectedEvent!].filter(Boolean) : filteredEvents}
          attendees={user?.role === 'external' && selectedEventId ? filteredAttendees.filter(a => a.eventId === selectedEventId) : filteredAttendees}
          vouchers={user?.role === 'external' && selectedEventId ? filteredVouchers.filter(v => v.eventId === selectedEventId) : filteredVouchers}
          onClaimDrink={handleClaimDrink}
          userRole={user?.role || 'internal'}
        />
      )}
      {currentPage === 'reports' && (
        <Reports 
          events={user?.role === 'external' && selectedEventId ? [selectedEvent!].filter(Boolean) : filteredEvents} 
          attendees={user?.role === 'external' && selectedEventId ? filteredAttendees.filter(a => a.eventId === selectedEventId) : filteredAttendees} 
          vouchers={user?.role === 'external' && selectedEventId ? filteredVouchers.filter(v => v.eventId === selectedEventId) : filteredVouchers} 
        />
      )}
      {currentPage === 'users' && user?.role === 'admin' && (
        <UserManagement
          events={events}
          onCreateUser={handleCreateUser}
          onUpdateUserStatus={handleUpdateUserStatus}
          onUpdateUser={handleUpdateUser}
        />
      )}
    </Layout>
  );
}

export default App;