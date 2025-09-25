import React, {useState} from 'react';
import {AlertCircle, CheckCircle, Eye, EyeOff, Lock, Shield} from 'lucide-react';
import PublicPage from "./PublicPage.tsx";

interface PasswordResetModalProps {
    onPasswordReset: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>,

    onBackToLogin: () => void,

}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
                                                                   onPasswordReset,

                                                                   onBackToLogin,


                                                               }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: '',
        color: 'red',
    });


    const validatePasswordStrength = (password: string) => {
        let score = 0;
        let feedback = '';
        let color = 'red';

        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        switch (score) {
            case 0:
            case 1:
                feedback = 'Very Weak';
                color = 'red';
                break;
            case 2:
                feedback = 'Weak';
                color = 'orange';
                break;
            case 3:
                feedback = 'Fair';
                color = 'yellow';
                break;
            case 4:
                feedback = 'Good';
                color = 'blue';
                break;
            case 5:
                feedback = 'Strong';
                color = 'green';
                break;
        }

        return {score, feedback, color};
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setFormData({...formData, newPassword});
        setPasswordStrength(validatePasswordStrength(newPassword));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);


        // Validation

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            setIsLoading(false);
            return;
        }


        if (formData.currentPassword === formData.newPassword) {
            setError('New passwords should not match existing password');
            setIsLoading(false);
            return;
        }

        if (formData.newPassword.length < 8) {
            setError('New password must be at least 8 characters long');
            setIsLoading(false);
            return;
        }

        if (passwordStrength.score < 3) {
            setError('Please choose a stronger password');
            setIsLoading(false);
            return;
        }


        const result = await onPasswordReset(formData.currentPassword, formData.newPassword);

        if (!result.success) {
            setError(result.error || 'Failed to reset password');
            setIsLoading(false);
            return;
        }


        // Get redirect path from location state or default to dashboard
        onBackToLogin();


    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords({
            ...showPasswords,
            [field]: !showPasswords[field],
        });
    };

    const getStrengthBarColor = () => {
        switch (passwordStrength.color) {
            case 'red':
                return 'bg-red-500';
            case 'orange':
                return 'bg-orange-500';
            case 'yellow':
                return 'bg-yellow-500';
            case 'blue':
                return 'bg-blue-500';
            case 'green':
                return 'bg-green-500';
            default:
                return 'bg-gray-300';
        }
    };

    const getStrengthTextColor = () => {
        switch (passwordStrength.color) {
            case 'red':
                return 'text-red-600';
            case 'orange':
                return 'text-orange-600';
            case 'yellow':
                return 'text-yellow-600';
            case 'blue':
                return 'text-blue-600';
            case 'green':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <PublicPage children={

        // <div className=" inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-screen-1xl w-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-coop-600 to-coop-700 px-8 py-6 text-center rounded-t-2xl">
                    <div
                        className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-white"/>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Password Reset Required
                    </h2>
                    <p className="text-coop-100">
                        Please change your password to continue
                    </p>
                </div>

                {/* Content */}
                <div className="px-8 py-8">
                    <div className="bg-coop-yellow-50 border border-coop-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-coop-yellow-600 mr-3 flex-shrink-0"/>
                            <div>
                                <p className="text-sm font-medium text-coop-yellow-800">First Login Detected</p>
                                <p className="text-sm text-coop-yellow-700 mt-1">
                                    For security reasons, you must change your password before accessing the system.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    id="currentPassword"
                                    required
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="Enter your current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('current')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPasswords.current ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    id="newPassword"
                                    required
                                    value={formData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="Enter your new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('new')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPasswords.new ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                </button>
                            </div>

                            {formData.newPassword && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-gray-600">Password Strength</span>
                                        <span className={`text-xs font-medium ${getStrengthTextColor()}`}>
                      {passwordStrength.feedback}
                    </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${getStrengthBarColor()}`}
                                            style={{width: `${(passwordStrength.score / 5) * 100}%`}}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    id="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="Confirm your new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPasswords.confirm ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                </button>
                            </div>

                            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                <p className="text-red-600 text-sm mt-1 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1"/>
                                    Passwords do not match
                                </p>
                            )}

                            {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                                <p className="text-green-600 text-sm mt-1 flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-1"/>
                                    Passwords match
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0"/>
                                    <p className="text-red-800 text-sm font-medium">{error}</p>
                                </div>
                            </div>
                        )}


                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onBackToLogin}
                                className="w-full bg-gradient-to-r from-gray-200 to-gray-300 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-coop-300 hover:to-coop-400 focus:ring-4 focus:ring-coop-100 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"

                            >
                                Back to Login
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || passwordStrength.score < 3 || formData.newPassword !== formData.confirmPassword}
                                className="w-full bg-gradient-to-r from-coop-600 to-coop-700 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-coop-700 hover:to-coop-800 focus:ring-4 focus:ring-coop-300 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div
                                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Updating Password...
                                    </div>
                                ) : (
                                    'Update Password'
                                )}
                            </button>


                        </div>


                    </form>

                    {/* Password Requirements */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-900 text-sm mb-2">Password Requirements:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li className="flex items-center">
                                <div
                                    className={`w-2 h-2 rounded-full mr-2 ${formData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                At least 8 characters long
                            </li>
                            <li className="flex items-center">
                                <div
                                    className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                Contains uppercase letter
                            </li>
                            <li className="flex items-center">
                                <div
                                    className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                Contains lowercase letter
                            </li>
                            <li className="flex items-center">
                                <div
                                    className={`w-2 h-2 rounded-full mr-2 ${/[0-9]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                Contains number
                            </li>
                            <li className="flex items-center">
                                <div
                                    className={`w-2 h-2 rounded-full mr-2 ${/[^A-Za-z0-9]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                Contains special character
                            </li>
                        </ul>
                    </div>

                    {/* User Info */}
                    {/*<div className="mt-4 text-center">*/}
                    {/*    <p className="text-xs text-gray-500">*/}
                    {/*        Logged in as: <span className="font-medium">{userEmail}</span>*/}
                    {/*    </p>*/}
                    {/*</div>*/}
                </div>
                {/*</div>*/}
        </div>}/>
    );
};

export default PasswordResetModal;