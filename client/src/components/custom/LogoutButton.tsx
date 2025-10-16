import React from 'react';
import { logout } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className = "", 
  variant = "outline", 
  size = "sm" 
}) => {
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout? This will clear your saved login.')) {
      logout();
    }
  };

  return (
    <Button 
      onClick={handleLogout}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      <LogOut size={16} />
      Logout
    </Button>
  );
};

export default LogoutButton;
