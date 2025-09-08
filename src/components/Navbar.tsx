import React, { useState } from 'react';
import { User, LogOut, Calendar, Users, TicketIcon, BarChart3, UserCog, Menu, X, Building } from 'lucide-react';
import { User as UserType, Event } from '../types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ('admin' | 'internal' | 'external')[];
}

interface NavbarProps {
  user: UserType;
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  events?: Event[];
  selectedEvent?: Event | null;
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  user,
  currentPage,
  onPageChange,
  onLogout,
  events = [],
  selectedEvent,
  className = '',
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const baseNavigationItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'attendees', label: 'Attendees', icon: Users },
    { id: 'vouchers', label: 'Vouchers', icon: TicketIcon },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const adminOnlyItems: NavItem[] = [
    { id: 'subsidiaries', label: 'Subsidiaries', icon: Building, roles: ['admin'] },
    { id: 'users', label: 'User Management', icon: UserCog, roles: ['admin'] }
  ];

  // Filter navigation items based on user role
  const getNavigationItems = (): NavItem[] => {
    let items = [...baseNavigationItems];
    
    if (user.role === 'admin') {
      items = [...items, ...adminOnlyItems];
    }
    
    return items.filter(item => 
      !item.roles || item.roles.includes(user.role)
    );
  };

  const navigationItems = getNavigationItems();

  const handleNavigation = (pageId: string) => {
    onPageChange(pageId);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

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

  return (
    <>
      {/* Header */}
      <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
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
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                  {user.role.toUpperCase()}
                </span>
              </div>
              <button
                onClick={onLogout}
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
                    onClick={() => handleNavigation(item.id)}
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
    </>
  );
};

export default Navbar;