import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Info, Play, Users } from 'lucide-react';

function Home() {
  const [url, setUrl] = useState('');
  const [showModal, setShowModal] = useState(true);
  const navigate = useNavigate();

  const createRoom = () => {
    if (!url) return alert("Veuillez entrer un lien vidéo (YouTube, Twitch, etc.) !");
    const roomId = uuidv4().slice(0, 8); // On génère un ID unique court
    // On redirige vers la salle avec le lien de la vidéo en paramètre
    navigate(`/room/${roomId}?video=${encodeURIComponent(url)}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#141414] text-white p-4 relative overflow-hidden">
      
      {/* Arrière-plan décoratif */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-[#1a1a1a] to-[#0a0a0a] z-0"></div>

      {/* MODAL MODE D'EMPLOI (EN FRANÇAIS) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-[#1f1f1f] p-8 rounded-2xl max-w-md shadow-2xl border border-gray-800 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
              <Info className="text-primary" /> Comment ça marche ?
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-400 mb-8 text-sm leading-relaxed">
              <li>Collez un lien <span className="text-white font-semibold">YouTube</span>, <span className="text-white font-semibold">Twitch</span> ou <span className="text-white font-semibold">Vimeo</span>.</li>
              <li>Cliquez sur le bouton pour créer votre salle privée.</li>
              <li>Envoyez le lien de la page à vos amis.</li>
              <li>Lancez la vidéo : elle démarre <span className="text-primary font-bold">pour tout le monde</span> en même temps !</li>
            </ol>
            <button 
              onClick={() => setShowModal(false)}
              className="w-full bg-primary hover:bg-red-700 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg shadow-red-900/20">
              J'ai compris, c'est parti !
            </button>
          </div>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <div className="z-10 flex flex-col items-center w-full max-w-2xl text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
            Watch<span className="text-primary">Party</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-light">Le cinéma à distance, synchronisé.</p>
        </div>

        <div className="w-full bg-[#1f1f1f] p-2 rounded-2xl border border-gray-800 flex flex-col md:flex-row gap-2 shadow-2xl">
          <input
            type="text"
            placeholder="Collez votre lien ici (ex: https://youtube.com/...)"
            className="flex-1 p-4 rounded-xl bg-transparent text-white placeholder-gray-600 focus:outline-none focus:bg-gray-800 transition"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={createRoom}
            className="bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition hover:shadow-lg whitespace-nowrap">
            <Play fill="black" size={20} /> Créer
          </button>
        </div>

        <div className="flex gap-4 text-gray-500 text-sm">
           <span className="flex items-center gap-1"><Users size={14}/> Gratuit</span>
           <span>•</span>
           <span>Pas d'inscription</span>
           <span>•</span>
           <span>Temps réel</span>
        </div>
      </div>
    </div>
  );
}

export default Home;