import React, { useState, useEffect, useRef } from 'react';
import { Upload, Music, Plus, Trash2, Play, Pause, User, Users, Eye, Calendar, Clock } from 'lucide-react';

export default function PlaylistManager() {
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [clients, setClients] = useState([]);
  const [currentView, setCurrentView] = useState('upload');
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [playingTrack, setPlayingTrack] = useState(null);
  const [producerInfo, setProducerInfo] = useState({
    name: '',
    email: '',
    company: ''
  });
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    clientId: ''
  });
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    company: ''
  });
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const audioRef = useRef(null);

  // Load data from storage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tracksRes, playlistsRes, clientsRes, producerRes] = await Promise.all([
        window.storage.get('tracks').catch(() => null),
        window.storage.get('playlists').catch(() => null),
        window.storage.get('clients').catch(() => null),
        window.storage.get('producer').catch(() => null)
      ]);

      if (tracksRes?.value) setTracks(JSON.parse(tracksRes.value));
      if (playlistsRes?.value) setPlaylists(JSON.parse(playlistsRes.value));
      if (clientsRes?.value) setClients(JSON.parse(clientsRes.value));
      if (producerRes?.value) setProducerInfo(JSON.parse(producerRes.value));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async (key, data) => {
    try {
      await window.storage.set(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    const newTracks = audioFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      file: file,
      url: URL.createObjectURL(file),
      uploadDate: new Date().toISOString(),
      duration: '0:00'
    }));

    const updated = [...tracks, ...newTracks];
    setTracks(updated);
    saveData('tracks', updated);
  };

  const handleTrackSelect = (trackId) => {
    setSelectedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const createPlaylist = () => {
    if (!newPlaylist.name || selectedTracks.length === 0) {
      alert('Please enter a playlist name and select at least one track');
      return;
    }

    const playlist = {
      id: Date.now(),
      name: newPlaylist.name,
      description: newPlaylist.description,
      clientId: newPlaylist.clientId,
      tracks: selectedTracks.map(id => tracks.find(t => t.id === id)),
      createdDate: new Date().toISOString(),
      interactions: []
    };

    const updated = [...playlists, playlist];
    setPlaylists(updated);
    saveData('playlists', updated);
    
    setNewPlaylist({ name: '', description: '', clientId: '' });
    setSelectedTracks([]);
    setCurrentView('playlists');
  };

  const deletePlaylist = (id) => {
    const updated = playlists.filter(p => p.id !== id);
    setPlaylists(updated);
    saveData('playlists', updated);
  };

  const addClient = () => {
    if (!newClient.name || !newClient.email) {
      alert('Please enter client name and email');
      return;
    }

    const client = {
      id: Date.now(),
      ...newClient,
      addedDate: new Date().toISOString()
    };

    const updated = [...clients, client];
    setClients(updated);
    saveData('clients', updated);
    setNewClient({ name: '', email: '', company: '' });
  };

  const deleteClient = (id) => {
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    saveData('clients', updated);
  };

  const saveProducerInfo = () => {
    saveData('producer', producerInfo);
    alert('Producer information saved!');
  };

  const simulateInteraction = (playlistId, type) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          interactions: [...(p.interactions || []), {
            type,
            timestamp: new Date().toISOString()
          }]
        };
      }
      return p;
    });
    setPlaylists(updated);
    saveData('playlists', updated);
  };

  const togglePlay = (track) => {
    if (playingTrack?.id === track.id) {
      audioRef.current?.pause();
      setPlayingTrack(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.play();
      }
      setPlayingTrack(track);
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === parseInt(clientId));
    return client ? client.name : 'No client assigned';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Music Playlist Manager
          </h1>
          <p className="text-gray-400">Professional playlist management for music producers</p>
        </header>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setCurrentView('upload')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
              currentView === 'upload' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <Upload size={18} />
            Upload Tracks
          </button>
          <button
            onClick={() => setCurrentView('create')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
              currentView === 'create' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <Plus size={18} />
            Create Playlist
          </button>
          <button
            onClick={() => setCurrentView('playlists')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
              currentView === 'playlists' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <Music size={18} />
            My Playlists
          </button>
          <button
            onClick={() => setCurrentView('clients')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
              currentView === 'clients' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <Users size={18} />
            Clients
          </button>
          <button
            onClick={() => setCurrentView('producer')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
              currentView === 'producer' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <User size={18} />
            Producer Info
          </button>
        </div>

        {/* Upload Tracks View */}
        {currentView === 'upload' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Upload Music Tracks</h2>
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
              <Upload size={48} className="text-gray-400 mb-4" />
              <span className="text-gray-400 text-lg mb-2">Click to upload audio files</span>
              <span className="text-gray-500 text-sm">MP3, WAV, OGG, M4A supported</span>
              <input
                type="file"
                multiple
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            
            {tracks.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">Uploaded Tracks ({tracks.length})</h3>
                <div className="space-y-2">
                  {tracks.map(track => (
                    <div key={track.id} className="bg-gray-700 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => togglePlay(track)}
                          className="bg-purple-600 hover:bg-purple-700 p-2 rounded-full"
                        >
                          {playingTrack?.id === track.id ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <div>
                          <p className="font-medium">{track.name}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(track.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const updated = tracks.filter(t => t.id !== track.id);
                          setTracks(updated);
                          saveData('tracks', updated);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Playlist View */}
        {currentView === 'create' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Create New Playlist</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Playlist Name *</label>
                <input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({...newPlaylist, name: e.target.value})}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter playlist name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
                  placeholder="Enter playlist description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Assign to Client</label>
                <select
                  value={newPlaylist.clientId}
                  onChange={(e) => setNewPlaylist({...newPlaylist, clientId: e.target.value})}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a client (optional)</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3">Select Tracks *</h3>
            {tracks.length === 0 ? (
              <p className="text-gray-400 mb-4">No tracks uploaded yet. Upload tracks first.</p>
            ) : (
              <div className="space-y-2 mb-6">
                {tracks.map(track => (
                  <div
                    key={track.id}
                    onClick={() => handleTrackSelect(track.id)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedTracks.includes(track.id)
                        ? 'bg-purple-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Music size={20} />
                        <span className="font-medium">{track.name}</span>
                      </div>
                      {selectedTracks.includes(track.id) && (
                        <span className="text-sm">✓ Selected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={createPlaylist}
              className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold text-lg"
            >
              Create Playlist
            </button>
          </div>
        )}

        {/* Playlists View */}
        {currentView === 'playlists' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">My Playlists ({playlists.length})</h2>
            
            {playlists.length === 0 ? (
              <p className="text-gray-400">No playlists created yet.</p>
            ) : (
              <div className="space-y-4">
                {playlists.map(playlist => (
                  <div key={playlist.id} className="bg-gray-700 rounded-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{playlist.name}</h3>
                        {playlist.description && (
                          <p className="text-gray-400 text-sm mb-2">{playlist.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Music size={14} />
                            {playlist.tracks.length} tracks
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {getClientName(playlist.clientId)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(playlist.createdDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={14} />
                            {playlist.interactions?.length || 0} interactions
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deletePlaylist(playlist.id)}
                        className="text-red-400 hover:text-red-300 ml-4"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedPlaylist(selectedPlaylist === playlist.id ? null : playlist.id)}
                      className="text-purple-400 hover:text-purple-300 text-sm mb-3"
                    >
                      {selectedPlaylist === playlist.id ? '▼ Hide Details' : '▶ Show Details'}
                    </button>

                    {selectedPlaylist === playlist.id && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <h4 className="font-semibold mb-2">Tracks:</h4>
                          <div className="space-y-2">
                            {playlist.tracks.map((track, idx) => (
                              <div key={idx} className="bg-gray-600 p-3 rounded flex items-center gap-3">
                                <Music size={16} />
                                <span>{track.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Simulate Client Interactions:</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => simulateInteraction(playlist.id, 'view')}
                              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
                            >
                              + View
                            </button>
                            <button
                              onClick={() => simulateInteraction(playlist.id, 'play')}
                              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
                            >
                              + Play
                            </button>
                            <button
                              onClick={() => simulateInteraction(playlist.id, 'download')}
                              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm"
                            >
                              + Download
                            </button>
                          </div>
                        </div>

                        {playlist.interactions && playlist.interactions.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Recent Interactions:</h4>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              {playlist.interactions.slice(-10).reverse().map((interaction, idx) => (
                                <div key={idx} className="bg-gray-600 p-2 rounded text-sm flex items-center justify-between">
                                  <span className="capitalize">{interaction.type}</span>
                                  <span className="text-gray-400 flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(interaction.timestamp).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Clients View */}
        {currentView === 'clients' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Client Management</h2>
            
            <div className="bg-gray-700 rounded-lg p-5 mb-6">
              <h3 className="text-xl font-semibold mb-4">Add New Client</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  className="w-full bg-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Client Name *"
                />
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  className="w-full bg-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Client Email *"
                />
                <input
                  type="text"
                  value={newClient.company}
                  onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                  className="w-full bg-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Company (optional)"
                />
                <button
                  onClick={addClient}
                  className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold"
                >
                  Add Client
                </button>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3">Clients ({clients.length})</h3>
            {clients.length === 0 ? (
              <p className="text-gray-400">No clients added yet.</p>
            ) : (
              <div className="space-y-3">
                {clients.map(client => (
                  <div key={client.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{client.name}</h4>
                      <p className="text-gray-400 text-sm">{client.email}</p>
                      {client.company && (
                        <p className="text-gray-500 text-sm">{client.company}</p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        Added: {new Date(client.addedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteClient(client.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Producer Info View */}
        {currentView === 'producer' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Producer Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Producer Name</label>
                <input
                  type="text"
                  value={producerInfo.name}
                  onChange={(e) => setProducerInfo({...producerInfo, name: e.target.value})}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={producerInfo.email}
                  onChange={(e) => setProducerInfo({...producerInfo, email: e.target.value})}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company/Studio</label>
                <input
                  type="text"
                  value={producerInfo.company}
                  onChange={(e) => setProducerInfo({...producerInfo, company: e.target.value})}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Studio name"
                />
              </div>
              <button
                onClick={saveProducerInfo}
                className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold text-lg"
              >
                Save Producer Information
              </button>
            </div>
          </div>
        )}
      </div>

      <audio ref={audioRef} onEnded={() => setPlayingTrack(null)} />
    </div>
  );
}