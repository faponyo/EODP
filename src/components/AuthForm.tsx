import React, {useEffect, useState} from 'react';
import {AlertCircle, Eye, EyeOff, Lock, Shield, User} from 'lucide-react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuthContext} from "../common/useAuthContext.tsx";
import {useEventContext} from "../common/useEventContext.tsx";
import PublicPage from "./PublicPage.tsx"; // adjust path as needed

const AuthForm: React.FC = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const {login, logout, setCurrentPage} = useAuthContext();
    const {setPreSelectedEvent} = useEventContext();
    const location = useLocation();

    useEffect(() => {

        logout();

    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await login(formData.username, formData.password);

            if (!result.success) {
                setError(result.error || 'Authentication failed');


            } else {
                // setAuthToken(result.token);
                setPreSelectedEvent(null);
                // Get redirect path from location state or default to dashboard
                // const redirectTo = '/dashboard';
                const redirectTo = location.state?.from?.pathname || '/dashboard';
                setCurrentPage(redirectTo);
                navigate(redirectTo, {replace: true});


            }


        } catch (err) {
            console.log(err);
            setError('An unexpected error occurred');
            return;
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <PublicPage children={
            <>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-coop-600 to-coop-700 px-8 py-6 text-center">
                        <div
                            className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="h-8 w-8 text-white"/>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-coop-100">
                            Sign in to access your account
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="px-8 py-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="username"
                                       className="block text-sm font-semibold text-gray-700 mb-2">
                                    Enter Username
                                </label>
                                <div className="relative">
                                    <User
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                    <input
                                        type="text"
                                        name="username"
                                        id="username"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Enter your username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password"
                                       className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        id="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0"/>
                                        <p className="text-red-800 text-sm font-medium">{error}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || !formData.password || !formData.username}
                                className="w-full bg-gradient-to-r from-coop-600 to-coop-700 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-coop-700 hover:to-coop-800 focus:ring-4 focus:ring-coop-300 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div
                                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Signing in ...
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-start">
                                <Shield className="h-5 w-5 text-coop-600 mr-3 mt-0.5 flex-shrink-0"/>
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Secure Access</h4>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        Never share your login details with anyone.
                                    </p>
                                </div>
                            </div>
                        </div>


                    </div>

                </div>


                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-white text-sm opacity-90">
                        © {new Date().getFullYear()} Co-op Bank. All rights reserved.
                    </p>
                    <p className="text-white text-xs opacity-75 mt-1">
                        Secure • Reliable • Trusted
                    </p>
                </div>
            </>}/>


    )
        ;
};

export default AuthForm;