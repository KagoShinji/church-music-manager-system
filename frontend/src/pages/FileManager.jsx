import React, { useState, useRef } from 'react';
import { Upload, Mic, Play, FileText, Music2, Square, Trash2, Download } from 'lucide-react';

const RECENT_FILES = [
  {
    id: 1,
    name: 'Here I Am Lord - Sheet Music.pdf',
    size: '1.2 MB',
    added: 'Today, 2:30 PM',
    type: 'pdf',
    icon: FileText,
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  {
    id: 2,
    name: 'Soprano Practice - Gloria',
    size: '3.4 MB',
    added: 'Yesterday, 10:15 AM',
    type: 'audio',
    icon: Mic,
    color: 'var(--primary)',
    bg: 'var(--blue-50)',
  },
  {
    id: 3,
    name: 'On Eagles Wings - Accompaniment.mp3',
    size: '4.8 MB',
    added: 'Apr 5, 2026',
    type: 'audio',
    icon: Music2,
    color: '#d97706',
    bg: '#fef3c7',
  },
  {
    id: 4,
    name: 'Alleluia - Sheet Music.pdf',
    size: '0.8 MB',
    added: 'Apr 3, 2026',
    type: 'pdf',
    icon: FileText,
    color: '#16a34a',
    bg: '#f0fdf4',
  },
];

const FileManager = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div>
      {/* Header */}
      <div className="page-header stagger-1">
        <div>
          <h1 className="page-title">File Manager</h1>
          <p className="page-subtitle">Upload, organize, and record audio files and sheet music.</p>
        </div>
      </div>

      {/* Upload + Record Row */}
      <div className="grid grid-cols-2 stagger-2" style={{ marginBottom: '1.5rem' }}>
        {/* Upload Zone */}
        <div
          className="upload-zone"
          style={{
            borderColor: isDragOver ? 'var(--primary)' : 'var(--border-strong)',
            background: isDragOver ? 'var(--primary-subtle)' : 'var(--gray-50)',
          }}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={e => { e.preventDefault(); setIsDragOver(false); }}
        >
          <div style={{
            width: 56, height: 56,
            background: isDragOver ? 'var(--primary)' : 'var(--primary-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isDragOver ? 'white' : 'var(--primary)',
            transition: 'all 0.2s',
          }}>
            <Upload size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Drop files here
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Supports MP3, WAV, PDF, FLAC — up to 50 MB
            </p>
          </div>
          <button className="btn btn-secondary">
            Browse Files
          </button>
        </div>

        {/* Record Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
          {/* Mic Icon with pulse when recording */}
          <div
            style={{
              position: 'relative',
              width: 64, height: 64,
              background: isRecording ? 'var(--error)' : 'var(--gray-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isRecording ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording && (
              <div style={{
                position: 'absolute', inset: -6,
                border: '2px solid var(--error)',
                animation: 'pulse-ring 1.2s ease-out infinite',
              }} />
            )}
            <Mic size={28} />
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>
              {isRecording ? 'Recording…' : 'Record Audio'}
            </h3>
            {isRecording ? (
              <div style={{
                fontSize: '1.5rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                color: 'var(--error)', letterSpacing: '-0.04em',
              }}>
                {formatTime(recordingTime)}
              </div>
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Sing or play and save directly into the system
              </p>
            )}
          </div>

          <button
            className={`btn btn-lg ${isRecording ? 'btn-danger' : 'btn-secondary'} w-full`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <><Square size={16} /> Stop Recording</> : <><Mic size={16} /> Start Recording</>}
          </button>
        </div>
      </div>

      {/* Storage Summary */}
      <div className="card stagger-2" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Storage Usage</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>12.4 MB / 500 MB</span>
        </div>
        <div style={{ height: 6, background: 'var(--gray-100)', overflow: 'hidden' }}>
          <div style={{ width: '2.48%', height: '100%', background: 'var(--primary)', transition: 'width 0.6s ease' }} />
        </div>
        <div className="flex gap-6 mt-3">
          {[
            { label: 'Audio Files', value: '9.8 MB', color: 'var(--primary)' },
            { label: 'Sheet Music (PDF)', value: '2.1 MB', color: '#16a34a' },
            { label: 'Recordings', value: '0.5 MB', color: 'var(--error)' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div style={{ width: 8, height: 8, background: item.color }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.label}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-sub)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Files */}
      <div className="card stagger-3" style={{ padding: 0 }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2.25rem 1fr 100px 160px 80px',
          gap: '1rem',
          padding: '0.6rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.7rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--text-muted)', background: 'var(--gray-50)',
          alignItems: 'center',
        }}>
          <span></span>
          <span>File Name</span>
          <span>Size</span>
          <span>Added</span>
          <span>Actions</span>
        </div>

        {RECENT_FILES.map((file, i) => {
          const Icon = file.icon;
          return (
            <div
              key={file.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2.25rem 1fr 100px 160px 80px',
                gap: '1rem',
                padding: '0.875rem 1.25rem',
                borderBottom: i < RECENT_FILES.length - 1 ? '1px solid var(--border)' : 'none',
                alignItems: 'center',
                transition: 'background var(--transition)',
                cursor: 'default',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 34, height: 34, minWidth: 34,
                background: file.bg, color: file.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} />
              </div>

              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{file.name}</div>
                <div>
                  <span className={`badge ${file.type === 'pdf' ? 'badge-success' : 'badge-blue'}`}>
                    {file.type === 'pdf' ? 'PDF' : 'AUDIO'}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{file.size}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{file.added}</div>

              <div className="flex gap-1">
                {file.type === 'audio'
                  ? <button className="btn btn-icon btn-secondary btn-sm" title="Play"><Play size={14} /></button>
                  : <button className="btn btn-icon btn-secondary btn-sm" title="View"><FileText size={14} /></button>
                }
                <button className="btn btn-icon btn-secondary btn-sm" title="Download"><Download size={14} /></button>
                <button className="btn btn-icon btn-outline-danger btn-sm" title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileManager;
