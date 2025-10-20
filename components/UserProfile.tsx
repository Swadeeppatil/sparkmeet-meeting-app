import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { CloseIcon } from './icons/FeatureIcons';
import Avatar from './Avatar';

interface UserProfileEditorProps {
  currentUser: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

const UserProfileEditor: React.FC<UserProfileEditorProps> = ({ currentUser, onSave, onClose }) => {
  const [name, setName] = useState(currentUser.name);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => onSave({ name: name.trim() || 'You', avatarUrl });
  
  return (
    <div 
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-slate-900/70 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl p-6 w-full max-w-sm m-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <button onClick={onClose} aria-label="Close profile editor" className="p-1 rounded-full hover:bg-slate-700/60">
            <CloseIcon />
          </button>
        </div>
        
        <div className="flex flex-col items-center space-y-6">
          <button onClick={handleAvatarClick} className="relative group" aria-label="Change profile picture">
            <Avatar imageUrl={avatarUrl} name={name} size="lg" />
            <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-sm font-semibold">Change</span>
            </div>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/png, image/jpeg" 
            className="hidden" 
          />

          <div className="w-full">
            <label htmlFor="displayName" className="text-sm font-semibold text-gray-400">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/60 p-3 mt-1 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button onClick={onClose} className="px-5 py-2 rounded-lg font-semibold text-sm bg-slate-700 hover:bg-slate-600 transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 rounded-lg font-semibold text-sm bg-blue-600 hover:bg-blue-700 transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileEditor;