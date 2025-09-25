import React from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {useAuthContext} from "../common/useAuthContext.tsx";

interface ProtectedRouteProps {
    children: React.ReactNode;


}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                           children,
                                                       }) => {
    const LOGIN_PATH = '/login';
    const RESET_PATH = '/reset-password';
    const DISABLED_PATH = '/account-disabled';
    const NO_ACCESS_PATH = '/no-access';


    const {isAuthenticated, user, requiresPasswordReset, assignedEvents, logout} = useAuthContext();

    const location = useLocation();
    // const role = user?.role?.toUpperCase();
    // const isExternalUser = role === 'PARTNER' || role === 'CLERK';
    //
    // if (!user || !user.role || !user.status || !isAuthenticated ) {
    //     return <Navigate to={LOGIN_PATH} state={{ from: location }} />;
    // }


    // if (location.pathname === '/login' || location.pathname === '/') {
    //     return;
    // }

    // Not authenticated - redirect to login
    if ( (!isAuthenticated || !user) && !(location.pathname === '/login' || location.pathname === '/')) {

        return <Navigate to="/login" state={{from: location}}/>;
    }


    // User needs password reset - redirect to password reset
    if (requiresPasswordReset && location.pathname !== '/reset-password') {
        return <Navigate to="/reset-password" replace/>;
    }


    // Check if user account is disabled
    if (user?.status?.toLowerCase() === 'disabled' && location.pathname !== '/account-disabled') {
        return <Navigate to="/account-disabled" replace/>;
    }


    // Check if external user has assigned events
    if (location.pathname !== '/no-access' && (user?.role?.toUpperCase() === 'PARTNER' || user?.role?.toUpperCase() === 'CLERK') && (!assignedEvents || assignedEvents.length === 0)) {
        return <Navigate to="/no-access" replace/>;
    }


    return <>{children}</>;
};

export default ProtectedRoute;