import React, { useRef, useEffect } from 'react';
import { TranscriptionMessage, Speaker } from '../types';
import Avatar from './Avatar';

interface TranscriptionPanelProps {
  messages: TranscriptionMessage[];
  targetLanguage: string;
  isAiThinking: boolean;
  onLanguageChange: (language: string) => void;
}

const supportedLanguages = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
];

const SpeakerLabel: React.FC<{ speaker: Speaker }> = ({ speaker }) => {
  const speakerInfo = {
    [Speaker.USER]: { name: 'You', color: 'text-blue-400', avatar: <Avatar name="You" size="sm" /> },
    [Speaker.MODEL]: { name: 'AI Assistant', color: 'text-purple-400', avatar: <Avatar name="AI" size="sm" /> },
    [Speaker.SYSTEM]: { name: 'System', color: 'text-yellow-400', avatar: null },
  };

  const { name, color, avatar } = speakerInfo[speaker];

  return (
    <div className="flex items-center space-x-2">
      {avatar}
      <p className={`font-semibold text-sm ${color}`}>{name}</p>
    </div>
  );
};

const TypingIndicator: React.FC = () => (
    <div className="flex flex-col space-y-2 p-3">
        <SpeakerLabel speaker={Speaker.MODEL} />
        <div className="flex items-center space-x-1.5 h-6 pl-10">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
        </div>
    </div>
);


const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({ messages, targetLanguage, isAiThinking, onLanguageChange }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isAiThinking]);

  return (
    <div className="w-full h-full bg-gray-900/80 backdrop-blur-lg border-l border-slate-700/50 flex flex-col">
      <div className="p-4 border-b border-slate-700/50">
        <h2 className="text-xl font-bold">Live Transcription</h2>
        <div className="mt-3">
            <label htmlFor="language-select" className="text-sm text-gray-400 mr-2">
                Translate to:
            </label>
            <select
                id="language-select"
                value={targetLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-slate-800/80 text-white rounded-md py-1 px-2 text-sm border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
                <option value="none">Off</option>
                {supportedLanguages.map(lang => (
                    <option key={lang.code} value={lang.name}>{lang.name}</option>
                ))}
            </select>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-5">
        {messages.length === 0 && !isAiThinking && (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Waiting for conversation...</p>
            </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col space-y-1 p-3 rounded-lg ${!msg.isFinal ? 'opacity-70' : ''} ${msg.speaker === Speaker.USER ? 'bg-blue-500/10' : 'bg-transparent'}`}>
            <SpeakerLabel speaker={msg.speaker} />
            <p className="text-gray-200 leading-relaxed pl-10">{msg.text}</p>
            {msg.translatedText && (
              <p className="text-green-300 leading-relaxed pl-10 mt-1 italic text-sm">
                {msg.translatedText}
              </p>
            )}
          </div>
        ))}
        {isAiThinking && <TypingIndicator />}
      </div>
    </div>
  );
};

export default TranscriptionPanel;