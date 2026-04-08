import React from 'react';
import { BookOpen, Plus, Copy, Trash2, CheckCircle2 } from 'lucide-react';

const TEMPLATES = [
  {
    id: 1,
    name: 'Sunday Regular Mass',
    desc: 'Standard 8-song structure for Ordinary Time. Covers all liturgical moments.',
    songs: 8,
    color: 'var(--primary)',
    bg: 'var(--primary-subtle)',
    badge: 'badge-blue',
    badgeLabel: 'Ordinary Time',
  },
  {
    id: 2,
    name: 'Funeral Mass',
    desc: 'Solemn 5-song structure focusing on comfort, hope, and resurrection themes.',
    songs: 5,
    color: '#16a34a',
    bg: '#f0fdf4',
    badge: 'badge-success',
    badgeLabel: 'Solemn',
  },
  {
    id: 3,
    name: 'Christmas Midnight Mass',
    desc: 'Festive 10-song structure celebrating the birth of Christ.',
    songs: 10,
    color: '#d97706',
    bg: '#fef3c7',
    badge: 'badge-warning',
    badgeLabel: 'Christmas',
  },
  {
    id: 4,
    name: 'Easter Vigil',
    desc: 'Extended 12-song structure for the longest and most sacred liturgy of the year.',
    songs: 12,
    color: 'var(--blue-600)',
    bg: 'var(--blue-50)',
    badge: 'badge-blue',
    badgeLabel: 'Easter',
  },
];

const Templates = () => {
  return (
    <div>
      {/* Header */}
      <div className="page-header stagger-1">
        <div>
          <h1 className="page-title">Mass Templates</h1>
          <p className="page-subtitle">Save and reuse your favorite mass structures for efficient planning.</p>
        </div>
        <button className="btn btn-primary btn-lg">
          <Plus size={18} />
          Create Template
        </button>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 stagger-2">
        {TEMPLATES.map(t => (
          <div key={t.id} className="card" style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
            {/* Top color strip */}
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
                {t.songs} songs
              </span>
            </div>

            <div className="flex gap-2">
              <button className="btn btn-primary flex-1">
                Use Template
              </button>
              <button className="btn btn-icon btn-secondary" title="Duplicate">
                <Copy size={16} />
              </button>
              <button className="btn btn-icon btn-outline-danger" title="Delete">
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
    </div>
  );
};

export default Templates;
