import React from 'react';
import {Navigate, useLocation} from "react-router-dom";
import {useAuthContext} from "../common/useAuthContext.tsx";

interface PublicRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
                                                     children,
                                                     redirectTo = '/'
                                                 }) => {

    const location = useLocation();







    // if (location.pathname === '/login' || location.pathname === '/') {
    //     return;
    // }
    const {isAuthenticated, requiresPasswordReset} = useAuthContext();
    // const navigate = useNavigate();
    // useEffect(() => {
    //     setNavigate(navigate);
    // }, [navigate]);


    // If user is authenticated but needs password reset, redirect to reset page
    // if (isAuthenticated && requiresPasswordReset) {
    //     return <Navigate to="/reset-password" replace/>;
    // }

    //If user is authenticated and doesn't need password reset, redirect to main app
    if (isAuthenticated && !requiresPasswordReset) {
        return <Navigate to={redirectTo} replace/>;
    }

    // User is not authenticated, show public content
    return <>{children}</>;
};

export default PublicRoute