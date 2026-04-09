import React, { useState } from 'react';
import { Search, X, Music } from 'lucide-react';

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

export default SongSelectorModal;
