import React from 'react';
import {AlertTriangle, Mail, Phone, Shield} from 'lucide-react';
import {useNavigate} from "react-router-dom";
import {useAuthContext} from "../common/useAuthContext.tsx";

const NoAccessPage: React.FC = () => {
    const navigate = useNavigate();
    const {logout} = useAuthContext();

    const goToLogin = () => {
        logout();
        navigate('/login', {replace: true})
    }

    return (
        // <div className="min-h-screen bg-gradient-to-br from-coop-1000 via-coop-700 to-coop-800">
        //     {/* Header */}
        //     <div className="bg-white shadow-sm">
        //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        //             <div className="flex items-center justify-between h-16">
        //                 <div className="flex items-center space-x-3">
        //                     <div className="w-10 h-10 bg-coop-1000 rounded-lg flex items-center justify-center">
        //                         <Shield className="h-6 w-6 text-white"/>
        //                     </div>
        //                     <div>
        //                         <h1 className="text-xl font-bold text-gray-900">Co-op Bank</h1>
        //                         <p className="text-xs text-gray-600">Event Management</p>
        //                     </div>
        //                 </div>
        //                 <div className="flex items-center space-x-4 text-sm text-gray-600">
        //                     <span>Secure Login</span>
        //                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        //
        //     {/* Main Content */}
        //     <div className="flex items-center justify-center px-4 py-12">
        //         <div className="max-w-md w-full text-center">

        <PublicPage children={
            <>


            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        {/* Icon */}
                        <div
                            className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield className="h-10 w-10 text-gray-400"/>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            Access Restricted
                        </h1>

                        {/* Description */}
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Your account currently has limited access to the System.
                            Please contact your administrator to request appropriate permissions.
                        </p>

                        {/* Status Alert */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2"/>
                                <span className="text-sm font-medium text-yellow-800">
                Account Pending Configuration
              </span>
                            </div>
                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={goToLogin}
                                    className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-gray-50 rounded-lg p-4 text-left">
                            <h3 className="font-semibold text-gray-900 mb-3 text-center">Need Help?</h3>
                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Mail className="h-4 w-4 mr-3 text-gray-400"/>
                                    <span>Email: admin@company.com</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="h-4 w-4 mr-3 text-gray-400"/>
                                    <span>Phone: +1 (555) 123-4567</span>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="mt-6 text-xs text-gray-500">
                            <p>
                                Once your permissions are configured, you'll be able to access
                                events, manage attendees, and use voucher features.
                            </p>
                        </div>
                    </div>
            </>}/>



        //
        //         </div>
        //     </div>
        // </div>
    );
};

export default NoAccessPage;