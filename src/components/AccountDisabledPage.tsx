import React from 'react';
import { Shield, AlertTriangle, Mail, Phone, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AccountDisabledPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-coop-red-600 via-coop-red-700 to-coop-red-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-coop-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-coop-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Account Disabled
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your account has been disabled by an administrator. You no longer have access to the Party Management System.
          </p>

          {/* Status Alert */}
          <div className="bg-coop-red-50 border border-coop-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-coop-red-600 mr-2" />
              <span className="text-sm font-medium text-coop-red-800">
                Access Revoked
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-center">Need Help?</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-3 text-gray-400" />
                <span>Email: admin@company.com</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-3 text-gray-400" />
                <span>Phone: +1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full bg-coop-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-coop-red-700 focus:ring-4 focus:ring-coop-red-300 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <LogOut className="h-5 w-5" />
            <span>Return to Login</span>
          </button>

          {/* Additional Information */}
          <div className="mt-6 text-xs text-gray-500">
            <p>
              If you believe this is an error, please contact your system administrator for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDisabledPage;