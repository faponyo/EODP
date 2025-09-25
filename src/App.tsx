import React, {useEffect, useState} from 'react';
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';

// Components
import AuthForm from './components/AuthForm';
import PasswordResetPage from './components/PasswordResetPage';
import Dashboard from './components/Dashboard';
import EventManagement from './components/EventManagement';
import AttendeeManagement from './components/AttendeeManagement';
import VoucherManagement from './components/VoucherManagement';
import Reports from './components/Reports';
import UserManagement from './components/UserManagement';
import SubsidiaryManagement from './components/SubsidiaryManagement';
import EventSelector from './components/EventSelector';
import NoAccessPage from './components/NoAccessPage';
import AccountDisabledPage from './components/AccountDisabledPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from "./components/Layout.tsx";
import {useAuthContext} from "./common/useAuthContext.tsx";
import {useEventContext} from "./common/useEventContext.tsx";
import PublicRoute from "./components/PublicRoute.tsx";

function AppContent() {
    const location = useLocation();

    const {user, logout, assignedEvents} = useAuthContext();
    const [currentPage, setCurrentPage] = useState(
        'dashboard');

    const {preSelectedEvent, setPreSelectedEvent} = useEventContext();

    const [sidebarOpen, setSidebarOpen] = useState(false);


    // const navigate = useNavigate();
    // useEffect(() => {
    //     setNavigate(navigate);
    // }, [navigate]);

    // useEffect(() => {
    //     localStorage.setItem('currentPage', currentPage);
    // }, [currentPage]);

    // useEffect(() => {
    //     setCurrentPage(location.pathname);
    // }, [location.pathname]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    // Show event selector for external users with multiple events
    if ((user?.role?.toUpperCase() === 'PARTNER' || user?.role?.toUpperCase() === 'CLERK') && !preSelectedEvent) {
        return (
            <EventSelector
                events={assignedEvents || []}
                onEventSelect={setPreSelectedEvent}
                onBackToLogin={logout}
            />
        );
    }

    // Render main application layout with navigation
    return (


        <Layout
            user={user}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onLogout={logout}
            selectedEvent={preSelectedEvent}

            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}

            children={<Routes>
                <Route path="/dashboard" element={
                    <ProtectedRoute
                    >

                        <Dashboard/>
                    </ProtectedRoute>
                }/>

                <Route path="/events" element={
                    <ProtectedRoute
                    >

                        <EventManagement/>
                    </ProtectedRoute>
                }/>
                <Route path="/attendees" element={
                    <ProtectedRoute
                    >
                        <AttendeeManagement

                        />
                    </ProtectedRoute>
                }/>
                <Route path="/vouchers" element={
                    <ProtectedRoute
                    >
                        <VoucherManagement
                        />
                    </ProtectedRoute>
                }/>
                <Route path="/reports" element={
                    <ProtectedRoute
                    >
                        <Reports/>
                    </ProtectedRoute>
                }/>
                <Route path="/users" element={
                    <ProtectedRoute>
                        <UserManagement

                        />
                    </ProtectedRoute>
                }/>
                <Route path="/subsidiaries" element={
                    <ProtectedRoute>
                        <SubsidiaryManagement
                        />
                    </ProtectedRoute>
                }/>
                <Route path="*" element={<Navigate to={`${location.state?.from?.pathname || '/dashboard'}`} replace/>}/>
            </Routes>}
        />


    );
}

function App() {
    const location = useLocation();

    return (
        <Routes>
            <Route path="/" element={
                <PublicRoute redirectTo={`${location.state?.from?.pathname || '/dashboard'}`}>
                    <AuthForm/>
                </PublicRoute>
            }/>
            <Route path="/login" element={
                <PublicRoute redirectTo={`${location.state?.from?.pathname || '/dashboard'}`}>
                    <AuthForm/>
                </PublicRoute>
            }/>
            <Route path="/reset-password" element={
                <ProtectedRoute>
                    <PasswordResetPage/>
                </ProtectedRoute>
            }/>
            <Route path="/no-access" element={
                <ProtectedRoute>
                    <NoAccessPage/>
                </ProtectedRoute>
            }/>
            <Route path="/account-disabled" element={<AccountDisabledPage/>}/>
            <Route path="/*" element={
                <ProtectedRoute>
                    <AppContent/>
                </ProtectedRoute>
            }/>

        </Routes>
    );
}

export default App;