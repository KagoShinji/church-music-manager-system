import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Copy, Trash2, CheckCircle2, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTemplates, saveTemplate, deleteTemplate } from '../utils/templateStorage';
import { fetchAllSongs } from '../utils/aiLogic';
import SongSelectorModal from '../components/SongSelectorModal';

const ALL_CATEGORIES = [
  'Entrance', 'Penitential Act', 'Kyrie', 'Gloria', 'Responsorial Psalm',
  'Gospel Acclamation', 'Alleluia', 'Offertory', 'Sanctus', 'Agnus Dei', 'Communion', 'Recessional', 'Light of Christ', 'Exsultet'
];

const BADGE_OPTIONS = [
  { label: 'Ordinary Time', type: 'badge-blue' },
  { label: 'Solemn', type: 'badge-success' },
  { label: 'Christmas', type: 'badge-warning' },
  { label: 'Easter', type: 'badge-blue' },
  { label: 'Custom', type: 'badge-gray' },
];

const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allSongs, setAllSongs] = useState([]);

  // Wizard state
  const [step, setStep] = useState(1);
  const [activeSwapCategory, setActiveSwapCategory] = useState(null);

  // New Template State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategories, setNewCategories] = useState([]);
  const [newBadgeLabel, setNewBadgeLabel] = useState('Custom');
  const [newBadgeType, setNewBadgeType] = useState('badge-gray');
  const [newDefaultSongs, setNewDefaultSongs] = useState({});

  useEffect(() => {
    setTemplates(getTemplates());
    fetchAllSongs().then(data => setAllSongs(data)).catch(console.error);
  }, []);

  const handleToggleCategory = (cat) => {
    setNewCategories(prev => {
      if (prev.includes(cat)) {
        const next = prev.filter(c => c !== cat);
        // remove default song if category is removed
        const newSongs = { ...newDefaultSongs };
        delete newSongs[cat];
        setNewDefaultSongs(newSongs);
        return next;
      } else {
        return [...prev, cat];
      }
    });
  };

  const handleNextStep = () => {
    if (!newName.trim() || newCategories.length === 0) return;
    setStep(2);
  };

  const handleSelectSong = (song) => {
    if (!activeSwapCategory) return;
    setNewDefaultSongs(prev => ({
      ...prev,
      [activeSwapCategory]: song
    }));
    setActiveSwapCategory(null);
  };

  const resetForm = () => {
    setNewName('');
    setNewDesc('');
    setNewCategories([]);
    setNewBadgeLabel('Custom');
    setNewBadgeType('badge-gray');
    setNewDefaultSongs({});
    setStep(1);
  };

  const handleCreateTemplate = () => {
    const newTemplate = {
      name: newName,
      desc: newDesc,
      songs: newCategories.length,
      categories: newCategories,
      defaultSongs: newDefaultSongs,
      color: 'var(--primary)',
      bg: 'var(--primary-subtle)',
      badge: newBadgeType,
      badgeLabel: newBadgeLabel,
    };

    saveTemplate(newTemplate);
    setTemplates(getTemplates());
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteTemplate(id);
      setTemplates(getTemplates());
    }
  };

  const handleDuplicate = (t) => {
    const copy = { ...t, name: t.name + ' (Copy)' };
    saveTemplate(copy);
    setTemplates(getTemplates());
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header stagger-1">
        <div>
          <h1 className="page-title">Mass Templates</h1>
          <p className="page-subtitle">Save and reuse your favorite mass structures for efficient planning.</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} />
          Create Template
        </button>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 stagger-2">
        {templates.map(t => (
          <div key={t.id} className="card" style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: t.color }} />

            <div className="flex items-center justify-between mb-3">
              <div
                style={{
                  width: 42, height: 42,
                  background: t.bg,
                  color: t.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BookOpen size={20} />
              </div>
              <span className={`badge ${t.badge}`}>{t.badgeLabel}</span>
            </div>

            <h3 style={{ marginBottom: '0.4rem', fontSize: '1.05rem' }}>{t.name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>{t.desc}</p>

            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={14} color={t.color} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {t.songs} categories • {t.categories?.slice(0, 3).join(', ')}{t.categories?.length > 3 ? '...' : ''}
              </span>
            </div>

            <div className="flex gap-2">
              <button 
                className="btn btn-primary flex-1"
                onClick={() => navigate(`/planner?template=${t.id}`)}
              >
                Open in Planner
              </button>
              <button className="btn btn-icon btn-secondary" title="Duplicate" onClick={() => handleDuplicate(t)}>
                <Copy size={16} />
              </button>
              <button className="btn btn-icon btn-outline-danger" title="Delete" onClick={() => handleDelete(t.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create new CTA */}
      <div className="stagger-3" style={{ marginTop: '1.5rem' }}>
        <div style={{
          border: '2px dashed var(--border-strong)',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition)',
          background: 'var(--gray-50)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.background = 'var(--primary-subtle)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-strong)';
            e.currentTarget.style.background = 'var(--gray-50)';
          }}
          onClick={() => { resetForm(); setIsModalOpen(true); }}
        >
          <div style={{ width: 44, height: 44, background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Plus size={22} />
          </div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>Create a New Template</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 320 }}>
            Build a custom song structure from scratch and save it for future masses.
          </p>
        </div>
      </div>

      {/* Create Template Wizard Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal-content" style={{ animation: 'fadeUp 0.25s ease forwards', maxWidth: 650 }}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div style={{ width: 32, height: 32, background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <BookOpen size={16} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Create New Template</h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Step {step} of 2 - {step === 1 ? 'Details & Structure' : 'Default Songs (Optional)'}
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Progress Bar */}
            <div style={{ height: '4px', background: 'var(--border)', width: '100%', position: 'relative' }}>
              <div style={{ 
                position: 'absolute', top: 0, left: 0, height: '100%', 
                background: 'var(--primary)', 
                width: step === 1 ? '50%' : '100%',
                transition: 'width 0.3s ease'
              }} />
            </div>

            <div className="modal-body">
              {step === 1 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Template Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. Youth Mass"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Brief description of this structure"
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group mt-4">
                    <label className="form-label">Badge Type</label>
                    <div className="flex gap-2 flex-wrap">
                      {BADGE_OPTIONS.map(opt => (
                        <button
                          key={opt.label}
                          className={`badge ${opt.type}`}
                          onClick={() => {
                            setNewBadgeLabel(opt.label);
                            setNewBadgeType(opt.type);
                          }}
                          style={{ 
                            cursor: 'pointer', 
                            border: newBadgeLabel === opt.label ? '2px solid var(--primary)' : '2px solid transparent',
                            opacity: newBadgeLabel === opt.label ? 1 : 0.6
                          }}
                          type="button"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group mt-4">
                    <label className="form-label">Liturgical Moments ({newCategories.length} selected)</label>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Select the parts of the mass you want to include in this template. Order matters.</p>
                    <div className="grid grid-cols-2 gap-2" style={{ maxHeight: '200px', overflowY: 'auto', padding: '0.75rem', background: 'var(--gray-50)', border: '1px solid var(--border)' }}>
                      {ALL_CATEGORIES.map(cat => (
                        <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={newCategories.includes(cat)}
                            onChange={() => handleToggleCategory(cat)}
                          />
                          {cat}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                    Assign default songs for this template. This is completely optional. Any unassigned categories can be filled later in the Mass Planner.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                    {newCategories.map(cat => {
                      const selectedSong = newDefaultSongs[cat];
                      return (
                        <div key={cat} className="lineup-row" style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ flex: 1 }}>
                            <div className="lineup-category">{cat}</div>
                            <div className="lineup-song-name" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                              {selectedSong ? selectedSong.title : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>No default song</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {selectedSong ? (
                              <>
                                <button className="btn btn-icon btn-ghost" title="Swap song" onClick={() => setActiveSwapCategory(cat)}>
                                  <Plus size={15} />
                                </button>
                                <button className="btn btn-icon btn-outline-danger" title="Clear song" onClick={() => {
                                  const updated = {...newDefaultSongs};
                                  delete updated[cat];
                                  setNewDefaultSongs(updated);
                                }}>
                                  <Trash2 size={15} />
                                </button>
                              </>
                            ) : (
                              <button className="btn btn-sm btn-ghost" onClick={() => setActiveSwapCategory(cat)}>
                                Choose Song
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              {step === 1 ? (
                <>
                  <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleNextStep}
                    disabled={!newName.trim() || newCategories.length === 0}
                  >
                    Next Step <ChevronRight size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-secondary" onClick={() => setStep(1)}><ChevronLeft size={16} /> Back</button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleCreateTemplate}
                  >
                    <CheckCircle2 size={16} /> Finish & Save Template
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub-modal: Song Selector Layer */}
      {activeSwapCategory && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1010 }}>
          <SongSelectorModal
            category={activeSwapCategory}
            allSongs={allSongs}
            onSelect={handleSelectSong}
            onClose={() => setActiveSwapCategory(null)}
          />
        </div>
      )}

    </div>
  );
};

export default Templates;
