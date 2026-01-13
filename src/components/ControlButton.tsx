import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ControlButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'success';
  children: ReactNode;
  disabled?: boolean;
}

const ControlButton = ({ onClick, variant = 'primary', children, disabled = false }: ControlButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-6 py-3 rounded-lg font-semibold text-base transition-all duration-300 ease-out",
        "transform hover:scale-105 active:scale-95",
        "btn-shine disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        "flex items-center gap-2",
        variant === 'primary' && "gradient-gold text-primary-foreground hover:shadow-lg",
        variant === 'success' && "gradient-success text-accent-foreground hover:shadow-lg"
      )}
    >
      {children}
    </button>
  );
};

export default ControlButton;
