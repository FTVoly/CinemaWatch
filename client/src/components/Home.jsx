import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonitorPlay, Users, Clock, CheckCircle } from 'lucide-react';

function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    if (!videoUrl.trim()) return;
    // Génère un ID de salle aléatoire (8 caractères)
    const roomId = Math.random().toString(36).substring(2, 10);
    // Encode l'URL de la vidéo pour qu'elle passe bien dans l'adresse
    const encodedVideoUrl = encodeURIComponent(videoUrl);
    // Redirige vers la salle
    navigate(`/room/${roomId}?video=${encodedVideoUrl}`);
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] items-center justify-center font-sans text-white overflow-hidden relative">
      {/* Arrière-plan avec des formes floues (optionnel, pour le style) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[100px] opacity-50 animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[100px] opacity-50 animate-pulse-slow delay-1000"></div>

      <div className="bg-[#141414]/80 p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-800 w-full max-w-lg text-center backdrop-blur-md relative z-10">
        
        {/* Logo et Titre */}
        <div className="flex flex-col items-center mb-6">
            <div className="bg-red-600/20 p-4 rounded-full mb-4 shadow-lg shadow-red-600/10">
                <MonitorPlay size={48} className="text-red-600" />
            </div>
            <h1 className="text-4 md:text-5xl font-extrabold tracking-tight mb-1">
              Watch<span className="text-red-600">Party</span>
            </h1>
            {/* --- AJOUT DU CRÉDIT ICI --- */}
            <span className="text-sm text-red-500 font-medium tracking-wider uppercase">By Voly</span>
        </div>
        
        <p className="text-gray-400 mb-8 text-lg font-light">Le cinéma à distance, synchronisé.</p>
        
        {/* Champ de saisie */}
        <div className="relative group mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex bg-[#0f0f0f] rounded-xl border border-gray-700 overflow-hidden">
                <input 
                    type="text" 
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createRoom()}
                    placeholder="Collez votre lien (YouTube, .mp4...)" 
                    className="flex-1 bg-transparent text-white px-4 py-4 focus:outline-none placeholder-gray-600 font-medium"
                />
                <button 
                    onClick={createRoom}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-4 transition-colors flex items-center gap-2 cursor-pointer"
                >
                    <MonitorPlay size={18}/> Créer
                </button>
            </div>
        </div>

        {/* Pied de page (Arguments) */}
        <div className="flex justify-center gap-6 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1"><Users size={14} className="text-red-600"/> Gratuit</div>
            <div className="flex items-center gap-1"><CheckCircle size={14} className="text-red-600"/> Pas d'inscription</div>
            <div className="flex items-center gap-1"><Clock size={14} className="text-red-600"/> Temps réel</div>
        </div>
      </div>
    </div>
  );
}

export default Home;