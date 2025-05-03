import React from 'react';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{
  variant?: 'primary' | 'secondary' | 'cancel' | 'success' | 'clear';
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  variant = 'primary',
  onClick,
  children,
  disabled = false,
  className = '',
}) => {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors duration-200';
  
  const variantStylesButton = {
    primary: 'bg-primary hover:bg-primary-300 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    cancel: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    clear: 'bg-transparent hover:bg-transparent text-gray-800'
  };



  const buttonStyles = `${baseStyles} ${variantStylesButton[variant]} ${className} ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  }`;

  return (
    <button
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default CustomButton;
