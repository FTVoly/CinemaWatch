import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import YouTube from 'react-youtube';
import io from 'socket.io-client';
import Peer from 'peerjs';
import { Send, Mic, MicOff, MessageSquare, MonitorPlay, Link as LinkIcon, Settings, Volume2 } from 'lucide-react';

const socket = io.connect("https://cinemawatch-6mtr.onrender.com");

function Room() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const urlParam = searchParams.get('video');
  const videoUrl = urlParam || "https://www.youtube.com/watch?v=LXb3EKWsInQ";
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

  const [playing, setPlaying] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMsg, setCurrentMsg] = useState("");
  
  // --- ÉTATS VOCAUX & PÉRIPHÉRIQUES ---
  const [isMuted, setIsMuted] = useState(false);
  const [myStream, setMyStream] = useState(null);
  
  const [audioInputs, setAudioInputs] = useState([]);
  const [audioOutputs, setAudioOutputs] = useState([]);
  
  const [selectedInputId, setSelectedInputId] = useState("");
  const [selectedOutputId, setSelectedOutputId] = useState("");
  
  const [showSettings, setShowSettings] = useState(false);
  
  const peersRef = useRef({}); 
  const playerRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const remoteAudioElements = useRef([]);

  // --- 1. INITIALISATION ---
  useEffect(() => {
    const myPeer = new Peer(); 

    navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(stream => {
        setMyStream(stream);
        
        navigator.mediaDevices.enumerateDevices().then(devices => {
            const inputs = devices.filter(d => d.kind === 'audioinput');
            const outputs = devices.filter(d => d.kind === 'audiooutput');
            setAudioInputs(inputs);
            setAudioOutputs(outputs);

            const currentTrack = stream.getAudioTracks()[0];
            const currentDevice = inputs.find(d => d.label === currentTrack.label);
            if (currentDevice) setSelectedInputId(currentDevice.deviceId);
            if (outputs.length > 0) setSelectedOutputId(outputs[0].deviceId);
        });

        myPeer.on('call', call => {
            call.answer(stream);
            const audio = document.createElement('audio');
            call.on('stream', userAudioStream => addAudioStream(audio, userAudioStream));
        });

        socket.on('user-connected', userId => connectToNewUser(userId, stream, myPeer));
    });

    myPeer.on('open', id => socket.emit('join_room', roomId, id));
    
    socket.on('user-disconnected', userId => {
        if (peersRef.current[userId]) peersRef.current[userId].close();
    });

    socket.on("receive_message", (data) => setMessages((list) => [...list, data]));
    socket.on("receive_action", (data) => {
        isRemoteUpdate.current = true;
        handleRemoteAction(data);
        setTimeout(() => { isRemoteUpdate.current = false; }, 500);
    });

    return () => {
        socket.off();
        myPeer.destroy();
        if (myStream) myStream.getTracks().forEach(track => track.stop());
        remoteAudioElements.current.forEach(audio => audio.remove());
        const testAudio = document.getElementById("mic-test-feedback");
        if (testAudio) testAudio.remove();
    };
  }, [roomId]);

  const changeMicrophone = async (deviceId) => {
    try {
        if (myStream) myStream.getTracks().forEach(track => track.stop());
        const newStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: deviceId } }, video: false });
        setMyStream(newStream);
        setSelectedInputId(deviceId);
        const newAudioTrack = newStream.getAudioTracks()[0];
        newAudioTrack.enabled = !isMuted; 
        Object.values(peersRef.current).forEach(call => {
            const sender = call.peerConnection.getSenders().find(s => s.track.kind === 'audio');
            if (sender) sender.replaceTrack(newAudioTrack);
        });
    } catch (err) { console.error("Erreur micro:", err); }
  };

  const changeSpeaker = async (deviceId) => {
    try {
        setSelectedOutputId(deviceId);
        remoteAudioElements.current.forEach(audio => { if (audio.setSinkId) audio.setSinkId(deviceId); });
        const testAudio = document.getElementById("mic-test-feedback");
        if (testAudio && testAudio.setSinkId) testAudio.setSinkId(deviceId);
    } catch (err) { console.error("Erreur sortie audio:", err); }
  };

  const connectToNewUser = (userId, stream, peer) => {
      const call = peer.call(userId, stream);
      const audio = document.createElement('audio');
      call.on('stream', userAudioStream => addAudioStream(audio, userAudioStream));
      call.on('close', () => { audio.remove(); });
      peersRef.current[userId] = call;
  };

  const addAudioStream = (audio, stream) => {
      audio.srcObject = stream;
      audio.addEventListener('loadedmetadata', () => {
          audio.play();
          if (selectedOutputId && audio.setSinkId) audio.setSinkId(selectedOutputId);
      });
      document.body.append(audio);
      remoteAudioElements.current.push(audio); 
  };

  const toggleMute = () => {
      if (myStream) {
          const audioTrack = myStream.getAudioTracks()[0];
          audioTrack.enabled = !audioTrack.enabled;
          setIsMuted(!audioTrack.enabled);
      }
  };

  const handleRemoteAction = (data) => {
      if (playerRef.current && isYouTube) {
        if (data.type === 'play') playerRef.current.playVideo();
        if (data.type === 'pause') playerRef.current.pauseVideo();
        if (data.type === 'seek') playerRef.current.seekTo(data.time);
      } else { 
        const videoElement = document.getElementById('html5-player');
        if (videoElement) {
            if (data.type === 'play') videoElement.play();
            if (data.type === 'pause') videoElement.pause();
        }
      }
      setPlaying(data.type === 'play');
  };

  const onReady = (event) => { playerRef.current = event.target; };
  const onStateChange = (event) => {
    if (isRemoteUpdate.current) return;
    if (event.data === 1) { socket.emit("video_action", { roomId, type: 'play' }); setPlaying(true); }
    if (event.data === 2) { socket.emit("video_action", { roomId, type: 'pause' }); setPlaying(false); }
  };
  const getYouTubeID = (url) => {
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const sendMessage = () => {
    if (currentMsg.trim() !== "") {
      const msgData = { roomId, author: "Moi", message: currentMsg, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
      socket.emit("send_message", { ...msgData, author: "Ami" });
      setMessages((list) => [...list, msgData]);
      setCurrentMsg("");
    }
  };
  const copyLink = () => { navigator.clipboard.writeText(window.location.href); alert("Lien copié !"); };

  return (
    // LAYOUT RESPONSIVE : flex-col sur mobile (Haut/Bas), md:flex-row sur ordi (Gauche/Droite)
    <div className="flex h-screen flex-col md:flex-row bg-[#0a0a0a] overflow-hidden font-sans text-white">
      
      {/* ZONE VIDÉO : 35% de hauteur sur mobile, Reste sur PC */}
      <div className="w-full h-[35vh] md:h-full md:flex-1 flex flex-col relative bg-black group z-10">
        <div className="absolute top-0 left-0 w-full p-2 md:p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h1 className="text-white font-bold flex items-center gap-2 drop-shadow-md select-none text-sm md:text-lg">
                <MonitorPlay className="text-red-600" size={20}/> <span className="hidden md:inline">WatchParty</span>
            </h1>
            <button onClick={copyLink} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-xs md:text-sm flex items-center gap-2 backdrop-blur-md transition border border-white/10 shadow-lg cursor-pointer">
                <LinkIcon size={14}/> <span className="hidden md:inline">Copier le lien</span> Inviter
            </button>
        </div>
        
        <div className="flex-1 w-full h-full flex items-center justify-center">
        {isYouTube ? (
             <YouTube 
                videoId={getYouTubeID(videoUrl)} 
                opts={{
                    height: '100%', 
                    width: '100%', 
                    playerVars: { 
                        autoplay: 1, 
                        controls: 1, 
                        playsinline: 1, // IMPORTANT POUR MOBILE (Empêche le plein écran forcé)
                        origin: window.location.origin 
                    }
                }} 
                onReady={onReady} 
                onStateChange={onStateChange} 
                className="w-full h-full absolute top-0 left-0"
             />
        ) : (
          <video 
            id="html5-player" 
            src={videoUrl} 
            controls 
            playsInline // IMPORTANT POUR MOBILE
            className="w-full h-full max-h-screen object-contain" 
            onPlay={() => !isRemoteUpdate.current && socket.emit("video_action", { roomId, type: 'play' })} 
            onPause={() => !isRemoteUpdate.current && socket.emit("video_action", { roomId, type: 'pause' })}
          />
        )}
        </div>
      </div>
      
      {/* ZONE CHAT : Reste de la hauteur sur mobile, Largeur fixe sur PC */}
      <div className="flex-1 md:flex-none md:w-80 bg-[#141414] border-t md:border-t-0 md:border-l border-gray-800 flex flex-col z-20 shadow-2xl relative h-full">
        <div className="p-3 md:p-4 border-b border-gray-800 bg-[#1a1a1a] flex justify-between shadow-sm items-center">
            <h3 className="font-bold text-gray-200 flex items-center gap-2 text-sm md:text-base">Discussion</h3>
            <div className="flex gap-2">
                <button 
                    onClick={() => setShowSettings(!showSettings)} 
                    className={`p-2 rounded-full transition-all ${showSettings ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                    <Settings size={18}/>
                </button>
                <button 
                    onClick={toggleMute} 
                    className={`p-2 rounded-full transition-all duration-200 shadow-md ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                    {isMuted ? <MicOff size={18}/> : <Mic size={18}/>}
                </button>
            </div>
        </div>

        {/* MENU PARAMÈTRES AUDIO */}
        {showSettings && (
            <div className="bg-gray-800 p-4 border-b border-gray-700 animate-fade-in space-y-4 absolute top-14 left-0 w-full z-50 shadow-xl">
                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Mic size={12}/> Microphone
                    </label>
                    <select 
                        value={selectedInputId}
                        onChange={(e) => changeMicrophone(e.target.value)}
                        className="w-full bg-[#0f0f0f] text-white text-xs rounded border border-gray-600 p-2 focus:border-red-600 focus:outline-none"
                    >
                        {audioInputs.map(device => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Microphone ${device.deviceId.slice(0,5)}...`}
                            </option>
                        ))}
                    </select>
                </div>

                {audioOutputs.length > 0 && (
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Volume2 size={12}/> Sortie
                        </label>
                        <select 
                            value={selectedOutputId}
                            onChange={(e) => changeSpeaker(e.target.value)}
                            className="w-full bg-[#0f0f0f] text-white text-xs rounded border border-gray-600 p-2 focus:border-red-600 focus:outline-none"
                        >
                            {audioOutputs.map(device => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Speaker ${device.deviceId.slice(0,5)}...`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="pt-2 border-t border-gray-700 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-white text-gray-400 transition">
                        <input 
                            type="checkbox"
                            className="rounded bg-gray-700 border-gray-600 text-red-600 focus:ring-red-600"
                            onChange={(e) => {
                                if (e.target.checked && myStream) {
                                    const audio = document.createElement('audio');
                                    audio.id = "mic-test-feedback";
                                    audio.srcObject = myStream;
                                    if (selectedOutputId && audio.setSinkId) audio.setSinkId(selectedOutputId);
                                    audio.play();
                                } else {
                                    const audio = document.getElementById("mic-test-feedback");
                                    if (audio) { audio.pause(); audio.remove(); }
                                }
                            }}
                        />
                        <span className="text-xs font-bold uppercase tracking-wider">Entendre ma voix (Test)</span>
                    </label>
                </div>
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#141414]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.author === "Moi" ? "items-end" : "items-start"} animate-fade-in`}>
               <div className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] break-words ${msg.author === "Moi" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-200"}`}>{msg.message}</div>
            </div>
          ))}
        </div>
        <div className="p-3 md:p-4 bg-[#1a1a1a] border-t border-gray-800 relative safe-area-bottom">
          <input type="text" value={currentMsg} onChange={(e) => setCurrentMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Envoyer..." className="w-full bg-[#0f0f0f] text-white rounded-full pl-4 pr-10 py-3 text-sm border border-gray-800 focus:border-red-600 focus:outline-none transition-colors"/>
          <button onClick={sendMessage} className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-400 transition"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}

export default Room;