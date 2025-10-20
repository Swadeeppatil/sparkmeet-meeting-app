import React from 'react';
import { Logo } from './icons/Logo';

interface WelcomeScreenProps {
  onJoin: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onJoin }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <div className="text-center max-w-3xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-12 shadow-2xl">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Logo className="w-16 h-16" />
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            SparkMeet
          </h1>
        </div>
        <p className="text-md md:text-lg text-gray-300 mb-10">
          Experience the future of meetings with real-time transcription and a smart conversational AI assistant.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
                onClick={onJoin}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 duration-300 ease-in-out shadow-lg hover:shadow-blue-500/50"
            >
                Start New Meeting
            </button>
        </div>
      </div>
      <footer className="absolute bottom-6 text-gray-600 text-sm">
        Powered by Google Gemini
      </footer>
    </div>
  );
};

export default WelcomeScreen;