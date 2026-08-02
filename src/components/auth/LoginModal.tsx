import React from 'react';
import { LoginPage } from './LoginPage';

interface LoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen = true,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center">
      <div className="w-full min-h-screen">
        <LoginPage onClose={onClose} isModal={true} />
      </div>
    </div>
  );
};
