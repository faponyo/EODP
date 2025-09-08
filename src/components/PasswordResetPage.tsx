import React from 'react';
import { useAuth } from '../hooks/useAuth';
import PasswordResetModal from './PasswordResetModal';

const PasswordResetPage: React.FC = () => {
  const { user, resetPassword } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <PasswordResetModal
      onPasswordReset={resetPassword}
      userEmail={user.email}
    />
  );
};

export default PasswordResetPage;