import {createContext, ReactNode, useContext, useEffect, useState,} from 'react'
import {AuthStateExtended} from "../hooks/useAuth.ts";
import authService, {TOKEN_KEY} from "../services/Auth.ts";
import apiUserService from "../services/Users.ts";
import {jwtDecode} from 'jwt-decode';
import {PERMISSIONS} from "./constants.ts";


const AuthContext = createContext<any>({})

export function useAuthContext() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider')
    }
    return context
}


export function AuthProvider({children}: { children: ReactNode }) {

    const [permissions, setPermissions] = useState<string[]>(
        []
    )

    const [currentPage, setCurrentPage] = useState(() => {
        return localStorage.getItem('xPage') || window.location.pathname;
    });

    const [assignedEvents, setAssignedEvents] = useState<{
        "description": string,
        "name": string,
        "location": string,
        "id": never,
        "maxAttendees": never,
        "endDate": never,
        "date": never
    }[]>(
        []
    )


    const [authState, setAuthState] = useState<AuthStateExtended>({
        user: null,
        isAuthenticated: false,
        requiresPasswordReset: false,
    });

    const [token, setToken] = useState(
        () => localStorage.getItem(TOKEN_KEY)
    )
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

    useEffect(() => {
        localStorage.setItem("xPage", location.pathname);

        setCurrentPage(location.pathname);
    }, [location.pathname]);


    useEffect(() => {
        if (token) {
            const decoded = jwtDecode(token);
            setPermissions(decoded?.authorities || []);

            setAuthState({
                user: decoded?.user || null,
                isAuthenticated: !!decoded.user,
                requiresPasswordReset: decoded.user?.requirePasswordReset || false
            });

            setIsAuthenticated(!!decoded.user)


            setAssignedEvents(JSON.parse(decoded?.assignedEvents) || []);


        }
    }, [token]);

    useEffect(() => {

        const interval = setInterval(() => {
            refreshToken();
        }, 8 * 60 * 1000);
        return () => clearInterval(interval);

    }, []);

    const logout = () => {
        logoutRequest()
        localStorage.removeItem(TOKEN_KEY)

        setAuthState({
            user: null,
            isAuthenticated: false,
            requiresPasswordReset: false,
        });

        setToken(null)
        setIsAuthenticated(false)
        setPermissions([])
        setAssignedEvents([])
        localStorage.removeItem('xPage')

    }

    const login = async (username: string, password: string) => {


        return authService.requestToken({username, password})


            .then((data) => {
                const {id, type, token} = data;

                localStorage.setItem(TOKEN_KEY, token);
                setToken(token)


                return {success: true};

            })
            .catch((error) => {
                console.log(error);
                return {success: false, error: error || 'An unexpected error occurred'};


            })

    };

    const refreshToken = async () => {


        return authService.requestRefreshToken()


            .then((data) => {
                const {id, type, token} = data;

                localStorage.setItem(TOKEN_KEY, token);
                setToken(token)


                return {success: true};

            })
            .catch((error) => {
                console.log(error);
                return {success: false, error: error || 'An unexpected error occurred'};


            })

    };

    const logoutRequest = async () => {


        authService.logout()


            .then((data) => {


            })
            .catch((error) => {
                console.log(error);
                // return {success: false, error: error || 'An unexpected error occurred'};


            })

    };


    const hasPermission = (requiredPermission: string | undefined | null): boolean => {
        if (requiredPermission) {
            return permissions?.includes(requiredPermission.toUpperCase()) ?? false;

        }
        return false;
    };

    const hasPermissions = (requiredPermissions: Array<keyof typeof PERMISSIONS | string>): boolean => {
        if (requiredPermissions) {
            return requiredPermissions.some(permission => permissions.includes(permission));
        }
        return false;
    };


    const resetPassword = async (currentPassword: string, newPassword: string) => {
        if (!authState.user) {
            return {success: false, error: 'No user logged in'};
        }

        return apiUserService.updatePassword(currentPassword, newPassword)


            .then((data) => {


                const {error, message} = data;


                return {success: !error, error: message};

            })
            .catch((error) => {
                console.log(error);
                return {success: false, error: error || 'An unexpected error occurred'};


            })

    };


    return (
        <AuthContext.Provider
            value={{
                ...authState,
                isAuthenticated, hasPermission,
                token, currentPage, setCurrentPage,
                login, logout, resetPassword, assignedEvents, hasPermissions
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
