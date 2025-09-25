import React from 'react';
import {Event, User as UserType} from '../types';
import {Sidebar} from "./SideBar.tsx";
import Navbar from "./NavBar.tsx";
import {ToastContainer} from 'react-toastify'

interface LayoutProps {
    user: UserType;
    currentPage: string;
    onPageChange: (page: string) => void;
    onLogout: () => void;
    selectedEvent?: Event | null;
    className?: string;
    children: React.ReactNode;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const Layout: React.FC<LayoutProps> = ({
                                           user,
                                           currentPage,
                                           onPageChange,
                                           onLogout,

                                           selectedEvent,
                                           className = '',
                                           children, sidebarOpen, setSidebarOpen
                                       }) => {


    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 overflow-hidden">
            <ToastContainer/>
            {/* Header */}
            <Navbar user={user} onLogout={onLogout} selectedEvent={selectedEvent} className={className}
                    sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
            <div className="max-w-screen-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Navigation Sidebar */}

                    <Sidebar currentPage={currentPage} user={user} setSidebarOpen={setSidebarOpen}
                             sidebarOpen={sidebarOpen} onPageChange={onPageChange}/>
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