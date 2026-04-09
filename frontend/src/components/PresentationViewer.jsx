import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default PresentationViewer;
