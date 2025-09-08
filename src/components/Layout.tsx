import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Event } from '../types';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  events?: Event[];
  selectedEvent?: Event | null;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange, events = [], selectedEvent }) => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Reusable Navbar Component */}
          <Navbar
            user={user}
            currentPage={currentPage}
            onPageChange={onPageChange}
            onLogout={logout}
            events={events}
            selectedEvent={selectedEvent}
          />

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;