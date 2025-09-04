import React from 'react';
import { Shield, AlertTriangle, Mail, Phone } from 'lucide-react';

const NoAccessPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Icon */}
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-gray-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Access Restricted
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your account currently has limited access to the Party Management System. 
            Please contact your administrator to request appropriate permissions.
          </p>

          {/* Status Alert */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">
                Account Pending Configuration
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4 text-left">
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

          {/* Additional Information */}
          <div className="mt-6 text-xs text-gray-500">
            <p>
              Once your permissions are configured, you'll be able to access 
              events, manage attendees, and use voucher features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoAccessPage;