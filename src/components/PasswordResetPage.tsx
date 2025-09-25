import React from 'react';
import PasswordResetModal from './PasswordResetModal';
import {useNavigate} from "react-router-dom";
import {useAuthContext} from "../common/useAuthContext.tsx";


const PasswordResetPage: React.FC = () => {
    const {user, resetPassword} = useAuthContext();
    const navigate = useNavigate();

    if (!user) {
        navigate('/login', {replace: true});
        return;
    }


    const onPasswordReset = async (
        currentPassword: string,
        newPassword: string
    ): Promise<{ success: boolean; error?: string }> => {


        // Simulate update logic
        if (newPassword.length < 8) {
            return {success: false, error: "Password must be at least 8 characters."};
        }

        // Simulate successful update
        return resetPassword(currentPassword, newPassword);

    };

    const onBackToLogin = () => {
        navigate('/login', {replace: true});

    }


    return (
        <PasswordResetModal
            onPasswordReset={onPasswordReset}
            onBackToLogin={onBackToLogin}
        />
    );
};

export default PasswordResetPage;