import {useState} from 'react';
import {AuthState, User} from '../types';
import authService from "../services/Auth.ts";
import apiUserService from "../services/Users.ts";

export interface AuthStateExtended extends AuthState {
    requiresPasswordReset: boolean;
}

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthStateExtended>({
        user: null,
        isAuthenticated: false,
        requiresPasswordReset: false,
    });
    const [loading, setLoading] = useState<boolean>(false)


    const login = async (username: string, password: string) => {


        return authService.requestToken({username, password})


            .then((data) => {


                const {id,type, token, name, group, expires, requirePasswordReset,assignedEvents} = data;

                const LoginInUser: User = {
                    id: id,
                    token: token,
                    name: name,
                    role: group,
                    status: 'active',
                    assignedEvents: assignedEvents,
                    isFirstLogin: requirePasswordReset || false,
                    createdAt: new Date().toISOString(),
                    email: '',
                    resetPassword: 0
                };


                // localStorage.setItem('currentUser', JSON.stringify(LoginInUser));
                setAuthState({
                    user: LoginInUser,
                    isAuthenticated: true,
                    requiresPasswordReset: requirePasswordReset || false
                });


                return {success: true, isFirstLogin: requirePasswordReset || false};

            })
            .catch((error) => {
                console.log(error);
                return {success: false, error: error || 'An unexpected error occurred'};


            })

    };

    const register = async (email: string, password: string, name: string) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        if (users.find((u: User) => u.email === email)) {
            return {success: false, error: 'User already exists'};
        }

        const newUser: User = {
            id: Date.now().toString(),
            email,
            name,
            role: 'internal',
            status: 'active',
            isFirstLogin: true,
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        setAuthState({
            user: newUser,
            isAuthenticated: true,
            requiresPasswordReset: true,
        });

        return {success: true};
    };

    const logout = () => {
        localStorage.removeItem('currentUser');
        setAuthState({
            user: null,
            isAuthenticated: false,
            requiresPasswordReset: false,
        });
    };

    const resetPassword = async (currentPassword: string, newPassword: string) => {
        if (!authState.user) {
            return {success: false, error: 'No user logged in'};
        }

        return apiUserService.updatePassword(currentPassword, newPassword)


            .then((data) => {


                const {error, message} = data;



                return { success: !error, error: message};

            })
            .catch((error) => {
                console.log(error);
                return { success: false, error: error || 'An unexpected error occurred'};




            })

    };

    return {
        ...authState,
        login,
        register,
        logout,
        resetPassword,
    };
};