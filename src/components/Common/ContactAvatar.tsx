import React, { useState } from 'react';
import { getInitials } from '../../utils/formatters';

export interface ContactAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ContactAvatar: React.FC<ContactAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-16 h-16 text-xl font-bold',
  };

  const initials = getInitials(name);

  // Generate deterministic gradient based on name string
  const getGradient = (str: string) => {
    const gradients = [
      'from-blue-600 to-indigo-600',
      'from-purple-600 to-pink-600',
      'from-emerald-600 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-rose-600 to-red-600',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  if (avatarUrl && !imageError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImageError(true)}
        className={`${sizeClasses[size]} rounded-full object-cover shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr ${getGradient(
        name
      )} text-white flex items-center justify-center font-semibold shadow-sm select-none ${className}`}
    >
      {initials}
    </div>
  );
};
