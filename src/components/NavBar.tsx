import React from 'react';
import {Calendar, LogOut, Menu, User, X} from 'lucide-react';
import {Event, User as UserType} from '../types';

interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: ('admin' | 'internal' | 'external')[];
}

interface NavbarProps {
    user: UserType;


    onLogout: () => void;

    selectedEvent?: Event | null;
    className?: string;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;


}

const Navbar: React.FC<NavbarProps> = ({
                                           user,


                                           onLogout,

                                           selectedEvent,
                                           className = '',
                                           sidebarOpen,
                                           setSidebarOpen

                                       }) => {

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-coop-red-100 text-coop-red-800';
            case 'CO-ORDINATOR':
                return 'bg-coop-blue-100 text-coop-blue-800';
            case 'PARTNER':
                return 'bg-coop-100 text-coop-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            {/* Header */}
            <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
                <div className="max-w-screen-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <img
                                        src="/src/static/bank-logo-512x512-1-32x32.png"
                                        alt="Bank Logo"
                                        className="h-8 w-8 mr-3"
                                    />
                                    {/*<Calendar className="h-8 w-8 text-coop-600 mr-3"/>*/}
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900">Co-op Bank</h1>
                                        <p className="text-xs text-gray-600">Event Mgmt.</p>
                                    </div>
                                </div>

                                {/* Selected Event Display for External Users */}
                                {selectedEvent && (
                                    <div
                                        className="hidden sm:flex items-center bg-coop-50 border border-coop-200 rounded-lg px-3 py-2">
                                        <div className="w-2 h-2 bg-coop-600 rounded-full mr-2"></div>
                                        <div>
                                            <p className="text-sm font-medium text-coop-900 truncate max-w-48">
                                                {selectedEvent.name}
                                            </p>
                                            <p className="text-xs text-coop-700">
                                                {`${new Date(selectedEvent.date).toLocaleDateString()} - ${selectedEvent?.endDate && new Date(selectedEvent?.endDate).toLocaleDateString() || new Date(selectedEvent?.date).toLocaleDateString()} `}
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
                                {sidebarOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                            </button>

                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User className="h-4 w-4"/>
                                <span className="hidden sm:inline">{user?.name}</span>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role?.toUpperCase()}
                </span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                                title="Logout"
                            >
                                <LogOut className="h-4 w-4"/>
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Selected Event Display */}
                    {selectedEvent && (
                        <div className="sm:hidden pb-4">
                            <div className="flex items-center bg-coop-50 border border-coop-200 rounded-lg px-3 py-2">
                                <div className="w-2 h-2 bg-coop-600 rounded-full mr-2"></div>
                                <div>
                                    <p className="text-sm font-medium text-coop-900">
                                        {selectedEvent?.name}
                                    </p>
                                    <p className="text-xs text-coop-700">
                                        {new Date(selectedEvent?.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>


        </>
    );
};

export default Navbar;