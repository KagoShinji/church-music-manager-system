import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Filter, Plus, Play, MoreVertical, Music2,
  Loader2, Trash2, Pencil, X, Database, ChevronDown,
  Tag, Globe, Timer, Music
} from 'lucide-react';
import { fetchAllSongs, seedDatabase } from '../utils/aiLogic';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';

const CATEGORIES = [
  'All', 'Entrance', 'Penitential Act', 'Gloria', 'Responsorial Psalm',
  'Gospel Acclamation', 'Offertory', 'Sanctus', 'Agnus Dei', 'Communion', 'Recessional'
];
const SONG_CATEGORIES = CATEGORIES.filter(c => c !== 'All');

const TEMPO_LABELS = { slow: 'Slow', medium: 'Medium', fast: 'Fast' };
const TEMPO_COLORS = {
  slow:   { bg: '#eff6ff', color: '#1d4ed8' },
  medium: { bg: '#fef3c7', color: '#b45309' },
  fast:   { bg: '#f0fdf4', color: '#15803d' },
};

const EMPTY_FORM = { title: '', category: 'Entrance', tempo: 'medium', language: 'English', tags: '', lyrics: '' };

// ─── Small reusable components ───────────────────────────────────────────────

const TempoBadge = ({ tempo }) => {
  const t = tempo?.toLowerCase() || 'medium';
  const { bg, color } = TEMPO_COLORS[t] || TEMPO_COLORS.medium;
  return (
    <span style={{
      display: 'inline-block', padding: '0.15rem 0.55rem',
      background: bg, color, fontSize: '0.68rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      {TEMPO_LABELS[t] ?? tempo}
    </span>
  );
};

const CategoryBadge = ({ category }) => (
  <span className="badge badge-blue" style={{ fontSize: '0.65rem', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' }}>
    {category || 'Unknown'}
  </span>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SongLibrary = () => {
  const [songs, setSongs]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [isSeeding, setIsSeeding]       = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError]       = useState('');
  const titleRef = useRef(null);

  // Popover
  const [activeOptionsId, setActiveOptionsId] = useState(null);

  // ── Data loading ──────────────────────────────────────────────────────────

  useEffect(() => { loadSongs(); }, []);

  const loadSongs = async () => {
    setLoading(true);
    try {
      const data = await fetchAllSongs();
      setSongs(data);
    } catch (err) {
      console.error('Error fetching songs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
      await loadSongs();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────

  const openAddModal = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
    setIsModalOpen(true);
    setActiveOptionsId(null);
    setTimeout(() => titleRef.current?.focus(), 80);
  };

  const openEditModal = (song) => {
    setFormData({
      title:    song.title    || '',
      category: song.category || 'Entrance',
      tempo:    song.tempo    || 'medium',
      language: song.language || 'English',
      tags:     Array.isArray(song.tags) ? song.tags.join(', ') : '',
      lyrics:   song.lyrics || '',
    });
    setEditingId(song.id);
    setFormError('');
    setIsModalOpen(true);
    setActiveOptionsId(null);
    setTimeout(() => titleRef.current?.focus(), 80);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormError(''); };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { setFormError('Title is required.'); return; }
    setIsSubmitting(true);
    setFormError('');
    try {
      const payload = {
        title:    formData.title.trim(),
        category: formData.category,
        tempo:    formData.tempo,
        language: formData.language.trim() || 'English',
        tags:     formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        lyrics:   formData.lyrics.trim(),
      };
      if (editingId) {
        await updateDoc(doc(db, 'songs', editingId), payload);
      } else {
        await addDoc(collection(db, 'songs'), payload);
      }
      closeModal();
      await loadSongs();
    } catch (err) {
      console.error('Error saving song:', err);
      setFormError('Failed to save. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this song from the library?')) return;
    try {
      await deleteDoc(doc(db, 'songs', id));
      setSongs(prev => prev.filter(s => s.id !== id));
      setActiveOptionsId(null);
    } catch (err) {
      console.error('Error deleting song:', err);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────

  const filteredSongs = songs.filter(song => {
    const q = searchTerm.toLowerCase();
    const matchSearch = song.title?.toLowerCase().includes(q) ||
      song.category?.toLowerCase().includes(q) ||
      song.tags?.some(t => t.toLowerCase().includes(q));
    const matchCat = activeCategory === 'All' || song.category === activeCategory;
    return matchSearch && matchCat;
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="page-header stagger-1">
        <div>
          <h1 className="page-title">Song Library</h1>
          <p className="page-subtitle">Browse, manage, and organize your entire music collection.</p>
        </div>
        <div className="flex gap-2">
          {songs.length === 0 && !loading && (
            <button className="btn btn-secondary" onClick={handleSeed} disabled={isSeeding}>
              {isSeeding
                ? <><Loader2 size={16} className="animate-spin" /> Seeding…</>
                : <><Database size={16} /> Seed Demo Data</>
              }
            </button>
          )}
          <button className="btn btn-primary btn-lg" onClick={openAddModal}>
            <Plus size={18} /> Add Song
          </button>
        </div>
      </div>

      {/* ── Search & Filter Bar ──────────────────────────────────────── */}
      <div className="card stagger-2" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="flex gap-3 items-center">
          <div className="input-with-icon flex-1">
            <Search size={15} className="input-icon" />
            <input
              type="text"
              className="input-field"
              placeholder="Search by title, category, or tag…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && (
            <button
              className="btn btn-icon btn-secondary"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category filter pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.9rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '0.3rem 0.75rem',
                fontSize: '0.78rem', fontWeight: 600,
                border: activeCategory === cat ? 'none' : '1px solid var(--border-strong)',
                background: activeCategory === cat ? 'var(--primary)' : 'transparent',
                color:      activeCategory === cat ? 'white'          : 'var(--text-sub)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'var(--font)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Song Count ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2 stagger-2">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {loading ? 'Loading…'
            : `${filteredSongs.length} song${filteredSongs.length !== 1 ? 's' : ''} found`}
        </span>
      </div>

      {/* ── Song Table ──────────────────────────────────────────────── */}
      <div className="card stagger-3" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Table header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '36px 1fr 160px 80px 90px 40px',
          gap: '0',
          padding: '0.55rem 1rem',
          background: 'var(--gray-50)',
          borderBottom: '1px solid var(--border)',
          alignItems: 'center',
        }}>
          {['', 'Title', 'Category', 'Tempo', 'Language', ''].map((col, i) => (
            <span key={i} style={{
              fontSize: '0.68rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.09em',
              color: 'var(--text-muted)',
              padding: '0 0.5rem',
            }}>{col}</span>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="empty-state">
            <Loader2 size={30} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Fetching your library…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredSongs.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
              <Music2 size={22} />
            </div>
            <h3>No songs found</h3>
            <p>
              {searchTerm || activeCategory !== 'All'
                ? 'Try clearing your search or selecting a different category.'
                : 'Get started by adding your first song to the library.'}
            </p>
            {!searchTerm && activeCategory === 'All' && (
              <button className="btn btn-primary mt-4" onClick={openAddModal}>
                <Plus size={16} /> Add First Song
              </button>
            )}
          </div>
        )}

        {/* Song rows */}
        {!loading && filteredSongs.map((song, idx) => (
          <SongRow
            key={song.id}
            song={song}
            isLast={idx === filteredSongs.length - 1}
            activeOptionsId={activeOptionsId}
            setActiveOptionsId={setActiveOptionsId}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────── */}
      {isModalOpen && (
        <SongModal
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          formError={formError}
          isSubmitting={isSubmitting}
          titleRef={titleRef}
          SONG_CATEGORIES={SONG_CATEGORIES}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

// ─── Song Row ─────────────────────────────────────────────────────────────────

const SongRow = ({ song, isLast, activeOptionsId, setActiveOptionsId, onEdit, onDelete }) => {
  const isOpen = activeOptionsId === song.id;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr 160px 80px 90px 40px',
        gap: '0',
        padding: '0.8rem 1rem',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        alignItems: 'center',
        transition: 'background 0.15s',
        background: 'transparent',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Play */}
      <div style={{ padding: '0 0.5rem' }}>
        <button className="song-play-btn" style={{ width: 30, height: 30 }}>
          <Play size={12} />
        </button>
      </div>

      {/* Title + tags */}
      <div style={{ padding: '0 0.5rem', minWidth: 0 }}>
        <div className="song-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {song.title}
        </div>
        {song.tags?.length > 0 && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {song.tags.join(' · ')}
          </div>
        )}
      </div>

      {/* Category */}
      <div style={{ padding: '0 0.5rem' }}>
        <CategoryBadge category={song.category} />
      </div>

      {/* Tempo */}
      <div style={{ padding: '0 0.5rem' }}>
        <TempoBadge tempo={song.tempo} />
      </div>

      {/* Language */}
      <div style={{ padding: '0 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {song.language || 'English'}
      </div>

      {/* Options */}
      <div style={{ padding: '0 0.25rem', position: 'relative' }}>
        <button
          onClick={() => setActiveOptionsId(isOpen ? null : song.id)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '0.25rem', display: 'flex',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <MoreVertical size={16} />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 10 }}
              onClick={() => setActiveOptionsId(null)}
            />
            {/* Popover */}
            <div style={{
              position: 'absolute', right: '100%', top: 0,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 20, minWidth: '150px',
              display: 'flex', flexDirection: 'column',
            }}>
              <PopoverBtn
                icon={<Pencil size={13} />}
                label="Edit Song"
                onClick={() => onEdit(song)}
              />
              <PopoverBtn
                icon={<Trash2 size={13} />}
                label="Delete"
                danger
                onClick={() => onDelete(song.id)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const PopoverBtn = ({ icon, label, danger, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.7rem 1rem',
      background: 'transparent', border: 'none',
      borderTop: danger ? '1px solid var(--border)' : 'none',
      cursor: 'pointer', fontSize: '0.83rem',
      color: danger ? 'var(--error)' : 'var(--text-sub)',
      textAlign: 'left', width: '100%',
      fontFamily: 'var(--font)',
      transition: 'background 0.12s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? 'var(--error-bg)' : 'var(--gray-50)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
  >
    {icon} {label}
  </button>
);

// ─── Song Modal ───────────────────────────────────────────────────────────────

const SongModal = ({ editingId, formData, setFormData, formError, isSubmitting, titleRef, SONG_CATEGORIES, onSubmit, onClose }) => {
  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ animation: 'fadeIn 0.2s ease forwards' }}
    >
      <div
        className="modal-content"
        style={{ animation: 'fadeUp 0.25s ease forwards', maxWidth: 520 }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div style={{
              width: 32, height: 32, background: 'var(--primary-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
            }}>
              <Music size={16} />
            </div>
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>
              {editingId ? 'Edit Song' : 'Add New Song'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.25rem' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {/* Error */}
            {formError && (
              <div style={{
                padding: '0.75rem 1rem', background: 'var(--error-bg)',
                borderLeft: '3px solid var(--error)',
                fontSize: '0.85rem', color: 'var(--error)',
              }}>
                {formError}
              </div>
            )}

            {/* Title */}
            <ModalField label="Song Title" required>
              <input
                ref={titleRef}
                type="text"
                className="input-field"
                placeholder="e.g. Here I Am, Lord"
                value={formData.title}
                onChange={set('title')}
                required
              />
            </ModalField>

            {/* Category + Language */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <ModalField label="Category">
                <select className="input-field" value={formData.category} onChange={set('category')}>
                  {SONG_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </ModalField>
              <ModalField label="Language">
                <input
                  type="text"
                  className="input-field"
                  placeholder="English"
                  value={formData.language}
                  onChange={set('language')}
                />
              </ModalField>
            </div>

            {/* Tempo + Tags */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <ModalField label="Tempo">
                <select className="input-field" value={formData.tempo} onChange={set('tempo')}>
                  <option value="slow">Slow</option>
                  <option value="medium">Medium</option>
                  <option value="fast">Fast</option>
                </select>
              </ModalField>
              <ModalField label="Tags" hint="Comma-separated">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Advent, Joyful…"
                  value={formData.tags}
                  onChange={set('tags')}
                />
              </ModalField>
            </div>

            {/* Lyrics */}
            <ModalField label="Lyrics" hint="Leave a blank line to create a new slide">
              <textarea
                className="input-field"
                placeholder="Verse 1...&#10;&#10;Chorus..."
                value={formData.lyrics}
                onChange={set('lyrics')}
                style={{ minHeight: '120px', resize: 'vertical' }}
              />
            </ModalField>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ minWidth: 120 }}>
              {isSubmitting
                ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                : editingId ? 'Save Changes' : 'Add Song'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ModalField = ({ label, required, hint, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
    <label style={{
      fontSize: '0.72rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.07em',
      color: 'var(--text-muted)',
      display: 'flex', gap: '0.4rem', alignItems: 'center',
    }}>
      {label}
      {required && <span style={{ color: 'var(--error)' }}>*</span>}
      {hint && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({hint})</span>}
    </label>
    {children}
  </div>
);

export default SongLibrary;
