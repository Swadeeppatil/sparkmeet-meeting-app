import React, { useState, useCallback } from 'react';
import { CloseIcon, CopyIcon } from './icons/FeatureIcons';

interface MeetingInfoProps {
  meetingId: string;
  onClose: () => void;
}

const MeetingInfo: React.FC<MeetingInfoProps> = ({ meetingId, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);
  const inviteLink = `${window.location.origin}/?meetingId=${meetingId}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  }, [inviteLink]);

  return (
    <div 
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-slate-900/70 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl p-6 w-full max-w-md m-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Meeting Details</h2>
          <button onClick={onClose} aria-label="Close meeting details" className="p-1 rounded-full hover:bg-slate-700/60">
            <CloseIcon />
          </button>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-400">Meeting ID</label>
            <p className="text-lg bg-slate-800/60 p-3 rounded-lg mt-1 font-mono">{meetingId}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-400">Invite Link</label>
            <div className="flex items-center space-x-2 mt-1">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="w-full bg-slate-800/60 p-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
                aria-label="Invite link"
              />
              <button 
                onClick={handleCopy}
                className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 ${
                  isCopied 
                    ? 'bg-green-600' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                aria-live="polite"
              >
                <CopyIcon />
                <span>{isCopied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MeetingInfo;