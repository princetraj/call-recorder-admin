import React from 'react';
import type { CallType } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantClasses = {
  default: 'bg-neutral-100 text-neutral-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

// Helper component for call type badges
export const CallTypeBadge: React.FC<{ type: CallType }> = ({ type }) => {
  const variantMap: Record<CallType, 'success' | 'info' | 'warning' | 'danger'> = {
    incoming: 'success',
    outgoing: 'info',
    missed: 'danger',
    rejected: 'warning',
  };

  const labelMap: Record<CallType, string> = {
    incoming: 'Incoming',
    outgoing: 'Outgoing',
    missed: 'Missed',
    rejected: 'Rejected',
  };

  return <Badge variant={variantMap[type]}>{labelMap[type]}</Badge>;
};
