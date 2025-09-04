import React from 'react';
import { User, LogOut, Calendar, Users, TicketIcon, BarChart3, UserCog, Menu, X, Building } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Event } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  events?: Event[];
  selectedEvent?: Event | null;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange, events = [], selectedEvent }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const baseNavigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'attendees', label: 'Attendees', icon: Users },
    { id: 'vouchers', label: 'Vouchers', icon: TicketIcon },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  // Add user management for admin users
  let navigationItems = baseNavigationItems;
  
  if (user?.role === 'admin') {
    navigationItems = [
      ...baseNavigationItems,
      { id: 'subsidiaries', label: 'Subsidiaries', icon: Building },
      { id: 'users', label: 'User Management', icon: UserCog }
    ];
  }

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
                {user?.role === 'external' && selectedEvent && (
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
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
                <span className="px-2 py-1 bg-coop-100 text-coop-800 rounded-full text-xs">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
          
          {/* Mobile Selected Event Display */}
          {user?.role === 'external' && selectedEvent && (
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
          {/* Sidebar Navigation */}
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
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          onPageChange(item.id);
                          setSidebarOpen(false); // Close sidebar on mobile after navigation
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          currentPage === item.id
                            ? 'bg-coop-50 text-coop-700 border-l-4 border-coop-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
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
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;