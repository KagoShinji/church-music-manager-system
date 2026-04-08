import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, Save, Download, Play, Plus, ChevronRight, MonitorPlay, FileText, X, ChevronLeft, Search, Music } from 'lucide-react';
import { generateMassSongs, fetchAllSongs } from '../utils/aiLogic';
import { format } from 'date-fns';

const CATEGORY_ORDER = [
  'Entrance', 'Penitential Act', 'Gloria', 'Responsorial Psalm',
  'Alleluia', 'Offertory', 'Sanctus', 'Agnus Dei', 'Communion', 'Recessional'
];

const MassPlanner = () => {
  const [searchParams] = useSearchParams();
  const [date, setDate] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? 7 : 7 - day;
    d.setDate(d.getDate() + diff);
    return d;
  });
  const [lineup, setLineup] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Presentation State
  const [isPresenting, setIsPresenting] = useState(false);
  const [presentationSongs, setPresentationSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  // Manual Swap State
  const [allSongs, setAllSongs] = useState([]);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [activeSwapCategory, setActiveSwapCategory] = useState(null);

  useEffect(() => {
    // Pre-fetch all songs so the swap modal is instantly ready
    fetchAllSongs().then(data => setAllSongs(data)).catch(console.error);
  }, []);

  const openSwapModal = (category) => {
    setActiveSwapCategory(category);
    setIsSwapModalOpen(true);
  };

  const handleSwapSong = (song) => {
    if (!activeSwapCategory || !lineup) return;
    setLineup(prev => ({
      ...prev,
      lineup: {
        ...prev.lineup,
        [activeSwapCategory]: song
      }
    }));
    setIsSwapModalOpen(false);
    setActiveSwapCategory(null);
  };

  const startPresentation = (startIndex = 0) => {
    if (!lineup) return;
    const songsWithLyrics = Object.values(lineup.lineup).filter(s => s != null && s.lyrics != null);
    if (songsWithLyrics.length === 0) {
      alert("None of the scheduled songs have lyrics attached yet.");
      return;
    }
    setPresentationSongs(songsWithLyrics);
    
    // If they clicked a specific song, find its index in the filtered array
    let actualStartIndex = 0;
    if (startIndex > 0) {
       const targetSong = Object.values(lineup.lineup)[startIndex];
       const foundIndex = songsWithLyrics.findIndex(s => s.id === targetSong?.id);
       if(foundIndex !== -1) actualStartIndex = foundIndex;
    }
    
    setCurrentSongIndex(actualStartIndex);
    setIsPresenting(true);
  };

  useEffect(() => {
    if (searchParams.get('auto') === 'true') handleGenerate();
  }, [searchParams]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateMassSongs(date, true);
      setLineup(generated);
    } catch (error) {
      console.error("Error generating lineup:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header stagger-1">
        <div>
          <h1 className="page-title">Mass Planner</h1>
          <p className="page-subtitle">Create and organize your complete song lineup for any mass.</p>
        </div>
        <div className="flex gap-2">
          {lineup && (
            <>
              <button className="btn btn-secondary"><Save size={16} /> Save</button>
              <button className="btn btn-secondary"><Download size={16} /> Export</button>
              <button className="btn btn-primary btn-lg" onClick={() => startPresentation(0)}>
                <MonitorPlay size={18} /> Present Mass
              </button>
            </>
          )}
          {!lineup && (
            <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={isGenerating}>
              <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
              Auto-Generate Lineup
            </button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="stagger-2" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Left Panel — Mass Details */}
        <div className="flex-col gap-0" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>Mass Details</h3>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="input-field"
                value={date.toISOString().split('T')[0]}
                onChange={e => setDate(new Date(e.target.value))}
              />
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <div className="form-label" style={{ marginBottom: '0.5rem' }}>Liturgical Season</div>
              <div style={{
                padding: '0.875rem 1rem',
                background: 'var(--primary-subtle)',
                borderLeft: '3px solid var(--primary)',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--primary-dark)',
              }}>
                {lineup ? lineup.season : 'Select a date above'}
              </div>
            </div>
          </div>

          {lineup && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Songs planned</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {Object.values(lineup.lineup).filter(Boolean).length}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Missing songs</span>
                  <span style={{ fontWeight: 700, color: 'var(--error)' }}>
                    {Object.values(lineup.lineup).filter(s => !s).length}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mass date</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{format(date, 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel — Song Lineup */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header" style={{ padding: '1.25rem 1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>Song Lineup</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {lineup ? `${format(date, 'EEEE, MMMM do, yyyy')}` : 'Generate a lineup to get started'}
              </p>
            </div>
          </div>

          {!lineup ? (
            <div className="empty-state">
              <div className="empty-icon" style={{ width: 64, height: 64, background: 'var(--primary-subtle)' }}>
                <RefreshCw size={28} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.05rem' }}>No lineup generated</h3>
              <p>Click the button above to auto-generate an intelligent song lineup for this mass based on the liturgical season.</p>
              <button className="btn btn-primary btn-lg mt-4" onClick={handleGenerate} disabled={isGenerating}>
                <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
                Generate Now
              </button>
            </div>
          ) : (
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(lineup.lineup).map(([category, song], idx) => (
                <div key={category} className="lineup-row">
                  <div style={{ flex: 1 }}>
                    <div className="lineup-category">{category}</div>
                    <div className="lineup-song-name">
                      {song ? song.title : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>No suitable song found</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {song && song.lyrics && (
                      <button className="btn btn-icon btn-secondary" title="View Lyrics" onClick={() => startPresentation(idx)}>
                        <FileText size={15} />
                      </button>
                    )}
                    {song && (
                      <button className="btn btn-icon btn-secondary" title="Preview">
                        <Play size={15} />
                      </button>
                    )}
                    {song ? (
                      <button className="btn btn-icon btn-ghost" title="Swap song" onClick={() => openSwapModal(category)}>
                        <Plus size={15} />
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-ghost" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }} onClick={() => openSwapModal(category)}>
                        Choose Song
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isSwapModalOpen && (
        <SongSelectorModal
          category={activeSwapCategory}
          allSongs={allSongs}
          onSelect={handleSwapSong}
          onClose={() => setIsSwapModalOpen(false)}
        />
      )}

      {isPresenting && (
        <PresentationViewer 
          songs={presentationSongs} 
          initialSongIndex={currentSongIndex} 
          onClose={() => setIsPresenting(false)} 
        />
      )}
    </div>
  );
};

const PresentationViewer = ({ songs, initialSongIndex, onClose }) => {
  const [songIndex, setSongIndex] = useState(initialSongIndex);
  const [slideIndex, setSlideIndex] = useState(0);

  const currentSong = songs[songIndex];
  
  // Split lyrics by double newline to create slides
  const slides = currentSong?.lyrics ? currentSong.lyrics.split('\n\n').filter(s => s.trim().length > 0) : ['(No lyrics available)'];

  // Handle Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [songIndex, slideIndex]);

  const nextSlide = () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else if (songIndex < songs.length - 1) {
      setSongIndex(songIndex + 1);
      setSlideIndex(0);
    }
  };

  const prevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
    } else if (songIndex > 0) {
      setSongIndex(songIndex - 1);
      // Auto move to the last slide of the previous song
      const prevSong = songs[songIndex - 1];
      const prevSlidesLength = prevSong?.lyrics ? prevSong.lyrics.split('\n\n').filter(s => s.trim().length > 0).length : 1;
      setSlideIndex(prevSlidesLength - 1);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#000', color: '#fff',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Top control bar (fades out or stays subtle) */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 2rem', opacity: 0.6,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'
      }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--blue-400)' }}>
          {currentSong?.title} <span style={{ color: '#888', fontSize: '1rem', marginLeft: '0.5rem' }}>({currentSong?.category})</span>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
          padding: '0.5rem', cursor: 'pointer', display: 'flex'
        }}>
          <X size={24} />
        </button>
      </div>

      {/* Main Slide Content */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 10%', textAlign: 'center',
        fontSize: '4.5rem', fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.02em',
        whiteSpace: 'pre-line', textShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        {slides[slideIndex]}
      </div>

      {/* Navigation Controls Context */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 2rem', opacity: 0.5
      }}>
        <div onClick={prevSlide} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ChevronLeft /> Previous
        </div>
        <div>
          Slide {slideIndex + 1} of {slides.length}  |  Song {songIndex + 1} of {songs.length}
        </div>
        <div onClick={nextSlide} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Next <ChevronRight />
        </div>
      </div>
    </div>
  );
};

export default MassPlanner;

const SongSelectorModal = ({ category, allSongs, onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter logic: search term matching + group matching category first
  const filteredSongs = allSongs.filter(song => {
    const term = searchTerm.toLowerCase();
    return (
      (song.title && song.title.toLowerCase().includes(term)) ||
      (song.tags && song.tags.some(t => t.toLowerCase().includes(term)))
    );
  });

  // Sort so that songs matching the active category appear at the very top
  const sortedSongs = [...filteredSongs].sort((a, b) => {
    const aMatch = a.category === category ? -1 : 1;
    const bMatch = b.category === category ? -1 : 1;
    if (aMatch !== bMatch) return aMatch - bMatch;
    // Fallback alphabet sort
    return (a.title || '').localeCompare(b.title || '');
  });

  return (
    <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ animation: 'fadeUp 0.25s ease forwards', maxWidth: 600 }}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div style={{ width: 32, height: 32, background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Search size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Select a Song</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>For Category: <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{category}</span></div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Input */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--gray-50)' }}>
          <div className="input-with-icon w-full">
            <Search size={16} className="input-icon" />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search library..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="modal-body" style={{ padding: 0, maxHeight: '50vh' }}>
          {sortedSongs.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <Music size={24} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }}/>
              <p>No songs found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sortedSongs.map(song => {
                const isRecommended = song.category === category;
                return (
                  <div 
                    key={song.id} 
                    className="song-row" 
                    style={{ cursor: 'pointer', padding: '0.875rem 1.5rem' }}
                    onClick={() => onSelect(song)}
                  >
                    <div>
                      <div className="song-title">{song.title}</div>
                      <div className="song-meta flex items-center gap-2" style={{ marginTop: '0.2rem' }}>
                        {isRecommended && (
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', background: 'var(--success-bg)', color: 'var(--success)', padding: '0.1rem 0.4rem', letterSpacing: '0.05em' }}>Recommended</span>
                        )}
                        <span>{song.category || 'Unknown'}</span>
                        {song.tags && song.tags.length > 0 && <span style={{ color: 'var(--border-strong)' }}>•</span>}
                        {song.tags && <span>{song.tags.join(', ')}</span>}
                      </div>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-ghost">Select</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
