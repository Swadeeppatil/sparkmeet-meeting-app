import React, { useState, useCallback, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import MeetingView from './components/MeetingView';
import Lobby from './components/Lobby';

const App: React.FC = () => {
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [showLobby, setShowLobby] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('meetingId');
    if (id) {
      setMeetingId(id);
      setShowLobby(true);
    }
  }, []);

  const handleJoinMeeting = useCallback(() => {
    setIsInMeeting(true);
    // Clear any old meetingId from the URL
    window.history.pushState({}, '', window.location.pathname);
  }, []);

  const handleLeaveMeeting = useCallback(() => {
    setIsInMeeting(false);
    setMeetingId(null);
    setShowLobby(false);
    // Clear meetingId from the URL when leaving
    window.history.pushState({}, '', window.location.pathname);
  }, []);
  
  const handleConfirmJoinFromLobby = useCallback(() => {
    setShowLobby(false);
    setIsInMeeting(true);
  }, []);

  return (
    <div className="w-full h-screen bg-gray-950 text-white font-sans">
      {isInMeeting ? (
        <MeetingView onLeave={handleLeaveMeeting} initialMeetingId={meetingId} />
      ) : showLobby ? (
        <Lobby meetingId={meetingId} onConfirmJoin={handleConfirmJoinFromLobby} />
      ) : (
        <WelcomeScreen onJoin={handleJoinMeeting} />
      )}
    </div>
  );
};

export default App;