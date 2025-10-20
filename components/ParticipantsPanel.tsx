import React from 'react';
import { CloseIcon, EditIcon } from './icons/FeatureIcons';
import { UserProfile } from '../types';
import Avatar from './Avatar';

interface ParticipantsPanelProps {
  onClose: () => void;
  userProfile: UserProfile;
  onEditProfile: () => void;
}

const dummyParticipants = [
  'Alex Johnson',
  'Maria Garcia',
  'Chen Wei',
  'David Smith',
];

const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({ onClose, userProfile, onEditProfile }) => {
  const totalParticipants = dummyParticipants.length + 1;

  return (
    <div className="w-full h-full bg-gray-900/80 backdrop-blur-lg border-l border-slate-700/50 flex flex-col">
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center flex-shrink-0">
        <h2 className="text-xl font-bold">Participants ({totalParticipants})</h2>
        <button onClick={onClose} aria-label="Close participants panel" className="p-1 rounded-full hover:bg-slate-700/60">
            <CloseIcon />
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {/* Current User */}
        <div className="flex items-center justify-between bg-slate-700/30 p-2 rounded-lg">
          <div className="flex items-center space-x-3">
            <Avatar imageUrl={userProfile.avatarUrl} name={userProfile.name} />
            <p className="text-gray-200 font-semibold">{userProfile.name} (You)</p>
          </div>
          <button onClick={onEditProfile} aria-label="Edit your profile" className="p-2 rounded-full hover:bg-slate-600/50">
            <EditIcon />
          </button>
        </div>

        {/* Dummy Participants */}
        {dummyParticipants.map((name, index) => (
          <div key={index} className="flex items-center space-x-3 p-2">
            <Avatar name={name} />
            <p className="text-gray-300">{name}</p>
          </div>
        ))}
      </div>
       <div className="p-4 border-t border-slate-700/50 flex-shrink-0">
        <p className="text-xs text-gray-500 text-center">
          Note: This is a single-user demo. Multi-user functionality is not enabled.
        </p>
      </div>
    </div>
  );
};

export default ParticipantsPanel;