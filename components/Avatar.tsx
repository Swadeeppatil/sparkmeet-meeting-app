import React from 'react';
import { UserIcon } from './icons/FeatureIcons';

interface AvatarProps {
  imageUrl?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: React.FC<AvatarProps> = ({ imageUrl, name, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-lg',
    lg: 'w-24 h-24 text-3xl'
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return '?';
    const names = name.trim().split(' ').filter(Boolean);
    if (names.length === 0) return '?';
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0].substring(0, 2);
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 font-bold text-slate-300 border-2 border-slate-600/50`}>
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name).toUpperCase()}</span>
      )}
    </div>
  );
};

export default Avatar;