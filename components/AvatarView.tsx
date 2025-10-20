import React from 'react';

interface AvatarViewProps {
  isSpeaking: boolean;
}

const AvatarView: React.FC<AvatarViewProps> = ({ isSpeaking }) => {
  const speakingPulseClass = isSpeaking ? 'animate-pulse-strong' : 'animate-[breathing_4s_ease-in-out_infinite]';

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80">
      <style>{`
        @keyframes pulse-strong {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(192, 132, 252, 0.4));
            transform: scale(1.02);
          }
          50% {
            filter: drop-shadow(0 0 25px rgba(192, 132, 252, 0.8));
            transform: scale(1.04);
          }
        }
      `}</style>
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full transition-all duration-300 ease-in-out ${speakingPulseClass}`}
        style={{ filter: 'drop-shadow(0 0 8px rgba(192, 132, 252, 0.4))' }}
      >
        <defs>
          <radialGradient id="avatarGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style={{ stopColor: '#4a5568' }} />
            <stop offset="100%" style={{ stopColor: '#2d3748' }} />
          </radialGradient>
        </defs>
        
        <circle cx="50" cy="50" r="48" fill="url(#avatarGradient)" />
        
        <g stroke="#c084fc" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="35" cy="42" r="6" />
          <circle cx="65" cy="42" r="6" />
          <path d="M40 65 Q50 72, 60 65" />
        </g>
        
        {isSpeaking && (
          <path 
            d="M40 65 Q50 68, 60 65" 
            stroke="#f0abfc" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <animate
              attributeName="d"
              values="M40 65 Q50 68, 60 65; M40 65 Q50 75, 60 65; M40 65 Q50 68, 60 65"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </path>
        )}
      </svg>
    </div>
  );
};

export default AvatarView;