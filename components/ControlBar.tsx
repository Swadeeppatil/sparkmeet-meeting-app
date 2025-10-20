import React from 'react';
import { MicOnIcon, MicOffIcon, VideoOnIcon, VideoOffIcon, EndCallIcon } from './icons/MediaIcons';
import { ScreenshareIcon, ParticipantsIcon, InfoIcon, AvatarModeIcon, WhiteboardIcon } from './icons/FeatureIcons';
import { ActivePanel } from '../types';

interface ControlBarProps {
  isMuted: boolean;
  isCameraOn: boolean;
  isScreensharing: boolean;
  activeSidePanel: ActivePanel;
  isMeetingInfoOpen: boolean;
  isAvatarMode: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenshare: () => void;
  onToggleSidePanel: (panel: ActivePanel) => void;
  onToggleMeetingInfo: () => void;
  onToggleAvatarMode: () => void;
  onLeave: () => void;
}

const ControlButton: React.FC<{ 
  onClick: () => void; 
  children: React.ReactNode; 
  className?: string;
  tooltip: string;
  isActive?: boolean 
}> = ({ onClick, children, className = '', tooltip, isActive }) => (
  <div className="relative group flex items-center justify-center">
    <button
      onClick={onClick}
      aria-label={tooltip}
      className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900/50 focus:ring-blue-500 ${isActive ? 'bg-blue-600' : className}`}
    >
      {children}
    </button>
    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none whitespace-nowrap">
      {tooltip}
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
    </div>
  </div>
);


const ControlBar: React.FC<ControlBarProps> = ({ 
  isMuted, 
  isCameraOn, 
  isScreensharing, 
  activeSidePanel,
  isMeetingInfoOpen,
  isAvatarMode,
  onToggleMute, 
  onToggleCamera, 
  onToggleScreenshare, 
  onToggleSidePanel,
  onToggleMeetingInfo,
  onToggleAvatarMode,
  onLeave 
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-center justify-center gap-3 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 p-3 rounded-full shadow-2xl">
        <ControlButton
          onClick={onToggleMute}
          className={isMuted ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-700/80 hover:bg-slate-700'}
          tooltip={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOffIcon /> : <MicOnIcon />}
        </ControlButton>
        
        <ControlButton
          onClick={onToggleCamera}
          className={!isCameraOn ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-700/80 hover:bg-slate-700'}
          tooltip={isCameraOn ? "Turn camera off" : "Turn camera on"}
        >
          {isCameraOn ? <VideoOnIcon /> : <VideoOffIcon />}
        </ControlButton>

        <div className="w-px h-8 bg-slate-600/70 mx-2"></div>

        <ControlButton 
          onClick={onToggleScreenshare} 
          className="bg-slate-700/80 hover:bg-slate-700"
          isActive={isScreensharing}
          tooltip={isScreensharing ? "Stop sharing" : "Share screen"}
        >
          <ScreenshareIcon />
        </ControlButton>

        <ControlButton 
          onClick={onToggleAvatarMode} 
          className="bg-slate-700/80 hover:bg-slate-700"
          isActive={isAvatarMode}
          tooltip={isAvatarMode ? "Disable Avatar Mode" : "Enable Avatar Mode"}
        >
          <AvatarModeIcon />
        </ControlButton>

        <ControlButton 
          onClick={() => onToggleSidePanel('whiteboard')}
          className="bg-slate-700/80 hover:bg-slate-700"
          isActive={activeSidePanel === 'whiteboard'}
          tooltip={activeSidePanel === 'whiteboard' ? "Hide whiteboard" : "Show whiteboard"}
        >
          <WhiteboardIcon />
        </ControlButton>
        
        <ControlButton 
          onClick={() => onToggleSidePanel('participants')}
          className="bg-slate-700/80 hover:bg-slate-700"
          isActive={activeSidePanel === 'participants'}
          tooltip={activeSidePanel === 'participants' ? "Hide participants" : "Show participants"}
        >
          <ParticipantsIcon />
        </ControlButton>

        <ControlButton 
          onClick={onToggleMeetingInfo}
          className="bg-slate-700/80 hover:bg-slate-700"
          isActive={isMeetingInfoOpen}
          tooltip={isMeetingInfoOpen ? "Hide info" : "Show info"}
        >
          <InfoIcon />
        </ControlButton>

        <div className="w-px h-8 bg-slate-600/70 mx-2"></div>

        <ControlButton onClick={onLeave} className="bg-red-600 hover:bg-red-500" tooltip="End call">
          <EndCallIcon />
        </ControlButton>
      </div>
    </div>
  );
};

export default ControlBar;