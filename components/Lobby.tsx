import React from 'react';
import { Logo } from './icons/Logo';

interface LobbyProps {
  meetingId: string | null;
  onConfirmJoin: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ meetingId, onConfirmJoin }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <div className="text-center max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-12 shadow-2xl">
        <div className="flex items-center justify-center gap-3 mb-6">
            <Logo className="w-10 h-10" />
            <h1 className="text-4xl font-bold text-white">SparkMeet</h1>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Ready to join?
        </h2>
        {meetingId && (
            <p className="text-lg text-gray-400 mb-8">
                You're joining meeting: <br/> <span className="font-mono bg-slate-800/60 p-2 rounded-lg mt-2 inline-block">{meetingId}</span>
            </p>
        )}
        <button
            onClick={onConfirmJoin}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 duration-300 ease-in-out shadow-lg hover:shadow-blue-500/50"
        >
            Join Now
        </button>
      </div>
       <footer className="absolute bottom-6 text-gray-600 text-sm">
        Powered by Google Gemini
      </footer>
    </div>
  );
};

export default Lobby;