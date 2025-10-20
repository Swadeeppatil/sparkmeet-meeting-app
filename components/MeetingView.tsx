import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TranscriptionMessage, Speaker, UserProfile, ActivePanel } from '../types';
import TranscriptionPanel from './TranscriptionPanel';
import ParticipantsPanel from './ParticipantsPanel';
import ControlBar from './ControlBar';
import MeetingInfo from './MeetingInfo';
import UserProfileEditor from './UserProfile';
import { GeminiService } from '../services/geminiService';
import { ScreenshareIcon } from './icons/FeatureIcons';
import { GoogleGenAI } from '@google/genai';
import audioService from '../services/audioService';
import ConfirmationDialog from './ConfirmationDialog';
import AvatarView from './AvatarView';
import WhiteboardPanel from './WhiteboardPanel';
import Avatar from './Avatar';


interface MeetingViewProps {
  onLeave: () => void;
  initialMeetingId?: string | null;
}

const MeetingView: React.FC<MeetingViewProps> = ({ onLeave, initialMeetingId }) => {
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreensharing, setIsScreensharing] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<ActivePanel>('transcription');
  const [isMeetingInfoOpen, setIsMeetingInfoOpen] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAvatarMode, setIsAvatarMode] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [targetLanguage, setTargetLanguage] = useState('none');
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: 'Guest', avatarUrl: '' });
  const [meetingId] = useState(() => 
    initialMeetingId || [...Array(3)].map(() => Math.floor(100 + Math.random() * 900)).join('-')
  );
  
  const geminiServiceRef = useRef<GeminiService | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const aiForTranslationRef = useRef<GoogleGenAI | null>(null);
  const targetLanguageRef = useRef(targetLanguage);
  targetLanguageRef.current = targetLanguage;

  useEffect(() => {
    if (!aiForTranslationRef.current && process.env.API_KEY) {
      try {
        aiForTranslationRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
      } catch(e) {
        console.error("Failed to initialize translation client:", e)
      }
    }
  }, []);

  const translateAndUpdate = useCallback(async (messageId: string, text: string, lang: string) => {
    if (lang === 'none' || !text || !aiForTranslationRef.current) return;
    try {
      const prompt = `Translate the following English text to ${lang}. Provide only the translation, with no extra commentary: "${text}"`;
      const response = await aiForTranslationRef.current.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      const translatedText = response.text.trim();
      setTranscriptionHistory(prev => prev.map(m => m.id === messageId ? { ...m, translatedText, targetLanguage: lang } : m));
    } catch (error) {
      console.error("Translation failed:", error);
      setTranscriptionHistory(prev => prev.map(m => m.id === messageId ? { ...m, translatedText: "[Translation failed]", targetLanguage: lang } : m));
    }
  }, []);

  const addMessage = useCallback((message: Omit<TranscriptionMessage, 'id'>) => {
    setTranscriptionHistory(prev => {
      const interimId = `${message.speaker}-interim`;
      if (!message.isFinal) {
        const existingIndex = prev.findIndex(m => m.id === interimId);
        if (existingIndex > -1) {
          const newHistory = [...prev];
          newHistory[existingIndex] = { ...newHistory[existingIndex], text: message.text };
          return newHistory;
        } else {
          return [...prev, { ...message, id: interimId }];
        }
      } else {
        const newHistory = prev.filter(m => m.id !== interimId);
        const newMessage = { ...message, id: `${message.speaker}-final-${Date.now()}` };
        if (message.text && targetLanguageRef.current !== 'none') {
          translateAndUpdate(newMessage.id, newMessage.text, targetLanguageRef.current);
        }
        return [...newHistory, newMessage];
      }
    });
  }, [translateAndUpdate]);

  useEffect(() => {
    let isMounted = true;
    audioService.playJoinSound();
    const initialize = async () => {
      try {
        const service = new GeminiService(addMessage, setConnectionState, setIsAiThinking, setIsAiSpeaking);
        if (isMounted) {
            geminiServiceRef.current = service;
            await geminiServiceRef.current.startSession();
        }
      } catch (error) {
        console.error("Initialization failed:", error);
      }
    };
    initialize();
    return () => {
      isMounted = false;
      geminiServiceRef.current?.closeSession();
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [addMessage]);
  
  useEffect(() => {
    let isMounted = true;
    const startCamera = async () => {
      if (!isMounted) return;
      try {
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach(track => track.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        cameraStreamRef.current = stream;
        const videoElements = [mainVideoRef.current, pipVideoRef.current];
        videoElements.forEach(videoEl => {
          if (videoEl && videoEl.srcObject !== stream) {
            videoEl.srcObject = stream;
          }
        });
      } catch (error) {
        if (!isMounted) return;
        console.error("Camera access failed:", error);
        addMessage({ speaker: Speaker.SYSTEM, text: `Could not access camera. Please check browser permissions.`, isFinal: true });
        setIsCameraOn(false);
      }
    };
    const stopCamera = () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
        cameraStreamRef.current = null;
      }
      const videoElements = [mainVideoRef.current, pipVideoRef.current];
      videoElements.forEach(videoEl => {
        if (videoEl && videoEl.srcObject) {
          videoEl.srcObject = null;
        }
      });
    };
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => { isMounted = false; stopCamera(); };
  }, [isCameraOn, addMessage]);

  const handleToggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    geminiServiceRef.current?.setMuted(newMutedState);
    if (newMutedState) audioService.playMuteSound();
    else audioService.playUnmuteSound();
  }, [isMuted]);

  const handleToggleCamera = useCallback(() => setIsCameraOn(prev => !prev), []);

  const handleToggleScreenshare = useCallback(async () => {
    if (isScreensharing) {
        screenStreamRef.current?.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
        setIsScreensharing(false);
        audioService.playScreenShareStopSound();
    } else {
        if (isAvatarMode) setIsAvatarMode(false);
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            screenStreamRef.current = stream;
            stream.getVideoTracks()[0].onended = () => { setIsScreensharing(false); screenStreamRef.current = null; audioService.playScreenShareStopSound(); };
            setIsScreensharing(true);
            audioService.playScreenShareStartSound();
        } catch (error) {
            console.error("Screen share failed:", error);
            addMessage({ speaker: Speaker.SYSTEM, text: `Could not start screen sharing. Please check browser permissions.`, isFinal: true });
        }
    }
  }, [isScreensharing, isAvatarMode, addMessage]);

  const handleToggleAvatarMode = useCallback(() => {
    const turningAvatarOn = !isAvatarMode;
    if (turningAvatarOn) {
        if (isScreensharing) {
            screenStreamRef.current?.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
            setIsScreensharing(false);
            audioService.playScreenShareStopSound();
        }
        if (!isCameraOn) setIsCameraOn(true);
    }
    setIsAvatarMode(turningAvatarOn);
  }, [isAvatarMode, isCameraOn, isScreensharing]);

  const handleToggleSidePanel = useCallback((panel: ActivePanel) => {
    setActiveSidePanel(prev => (prev === panel ? 'none' : panel));
  }, []);

  const handleToggleMeetingInfo = useCallback(() => setIsMeetingInfoOpen(prev => !prev), []);
  const handleToggleProfileEditor = useCallback(() => setIsProfileEditorOpen(prev => !prev), []);
  const handleSaveProfile = useCallback((newProfile: UserProfile) => { setUserProfile(newProfile); setIsProfileEditorOpen(false); }, []);
  const handleLanguageChange = useCallback((lang: string) => setTargetLanguage(lang), []);
  const handleLeaveRequest = useCallback(() => setIsConfirmLeaveOpen(true), []);
  const handleConfirmLeave = useCallback(() => { setIsConfirmLeaveOpen(false); audioService.playLeaveSound(); setTimeout(onLeave, 250); }, [onLeave]);
  const handleCancelLeave = useCallback(() => setIsConfirmLeaveOpen(false), []);

  const renderSidePanel = () => {
    switch(activeSidePanel) {
      case 'participants': return <ParticipantsPanel onClose={() => handleToggleSidePanel('participants')} userProfile={userProfile} onEditProfile={handleToggleProfileEditor} />;
      case 'whiteboard': return <WhiteboardPanel onClose={() => handleToggleSidePanel('whiteboard')} />;
      case 'transcription': return <TranscriptionPanel messages={transcriptionHistory} targetLanguage={targetLanguage} isAiThinking={isAiThinking} onLanguageChange={handleLanguageChange} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <div className={`flex-1 flex flex-col relative transition-all duration-300 ease-in-out ${activeSidePanel !== 'none' ? 'pr-80 lg:pr-96' : ''}`}>
        <div className="flex-1 bg-gray-950 flex items-center justify-center p-4 relative">
          <div className="w-full h-full aspect-video bg-black rounded-2xl flex items-center justify-center overflow-hidden relative">
            {isScreensharing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
                <div className="w-16 h-16 text-blue-400"><ScreenshareIcon /></div>
                <p className="text-xl mt-4 font-semibold">You are presenting your screen</p>
              </div>
            ) : isAvatarMode ? (
               <div className="w-full h-full flex items-center justify-center relative bg-gray-900">
                  <AvatarView isSpeaking={isAiSpeaking} />
                  <div className="absolute bottom-4 right-4 w-40 h-24 md:w-48 md:h-28 rounded-xl overflow-hidden border-2 border-slate-700/50 shadow-lg z-10">
                       <video ref={pipVideoRef} autoPlay playsInline muted className={`object-cover w-full h-full transition-opacity duration-300 ${isCameraOn ? 'opacity-100' : 'opacity-0'}`} />
                       {!isCameraOn && <div className="absolute inset-0 flex items-center justify-center bg-gray-800"><p className="text-gray-400 text-xs text-center p-1">Camera off</p></div>}
                  </div>
               </div>
            ) : (
              <>
                <video ref={mainVideoRef} autoPlay playsInline muted className={`object-cover w-full h-full rounded-2xl transition-opacity duration-300 ${isCameraOn ? 'opacity-100' : 'opacity-0'}`} />
                {!isCameraOn && 
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                    <Avatar imageUrl={userProfile.avatarUrl} name={userProfile.name} size="lg" />
                    <p className="text-gray-400 mt-4 font-medium">Your camera is off</p>
                  </div>
                }
              </>
            )}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
              {isAvatarMode ? "AI Assistant" : userProfile.name}
            </div>
            {connectionState === 'connecting' && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><p className="text-lg font-medium">Connecting to Gemini...</p></div>}
            {connectionState === 'error' && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><p className="text-lg text-red-400 font-semibold">Connection Failed</p></div>}
          </div>
        </div>
        <ControlBar
          isMuted={isMuted}
          isCameraOn={isCameraOn}
          isScreensharing={isScreensharing}
          activeSidePanel={activeSidePanel}
          isMeetingInfoOpen={isMeetingInfoOpen}
          isAvatarMode={isAvatarMode}
          onToggleMute={handleToggleMute}
          onToggleCamera={handleToggleCamera}
          onToggleScreenshare={handleToggleScreenshare}
          onToggleSidePanel={handleToggleSidePanel}
          onToggleMeetingInfo={handleToggleMeetingInfo}
          onToggleAvatarMode={handleToggleAvatarMode}
          onLeave={handleLeaveRequest}
        />
      </div>
      <div className={`absolute top-0 right-0 h-full w-80 lg:w-96 shadow-2xl transition-transform duration-300 ease-in-out ${activeSidePanel !== 'none' ? 'translate-x-0' : 'translate-x-full'}`}>
        {renderSidePanel()}
      </div>
      {isMeetingInfoOpen && <MeetingInfo meetingId={meetingId} onClose={handleToggleMeetingInfo} />}
      {isProfileEditorOpen && <UserProfileEditor currentUser={userProfile} onSave={handleSaveProfile} onClose={handleToggleProfileEditor} />}
      {isConfirmLeaveOpen && <ConfirmationDialog title="Leave Meeting" message="Are you sure you want to leave the meeting?" confirmText="Leave" onConfirm={handleConfirmLeave} onCancel={handleCancelLeave} />}
    </div>
  );
};

export default MeetingView;