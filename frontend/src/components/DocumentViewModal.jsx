import React from 'react';
import { X, Printer, Download } from 'lucide-react';

const DocumentViewModal = ({ song, isOpen, onClose }) => {
  if (!isOpen || !song) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)', 
      backdropFilter: 'blur(3px)',
      display: 'flex', flexDirection: 'column', 
      overflow: 'hidden'
    }}>
      {/* Top Toolbar (like Google Docs) */}
      <div style={{
        background: 'var(--surface, #fff)',
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid var(--border, #e5e7eb)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600, color: 'var(--text-main, #111)' }}>
             {song.title} - File View
           </h2>
           <span style={{ fontSize: '0.75rem', background: 'var(--primary-subtle, #eff6ff)', color: 'var(--primary, #2563eb)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>
             Read Only
           </span>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" title="Print (Mock)" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <Printer size={15} /> Print
          </button>
          <button className="btn btn-secondary btn-sm" title="Download (Mock)" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <Download size={15} /> Download PDF
          </button>
          <button 
            className="btn btn-icon btn-secondary btn-sm" 
            onClick={onClose} 
            title="Close"
            style={{ marginLeft: '1rem' }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Document Viewer Area (Gray background) */}
      <div style={{
        flex: 1, overflowY: 'auto', 
        background: '#f3f4f6', 
        padding: '2rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        {/* The "Bond Paper" */}
        <div style={{
          background: 'white',
          width: '100%', maxWidth: '816px', // Standard letter width approx (8.5in at 96dpi)
          minHeight: '1056px', // Letter height approx
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          borderRadius: '2px', // Slight rounding or straight edges
          padding: '4rem 5rem', // 1 inch padding equivalent
          fontFamily: "'Times New Roman', Times, serif", // Classic document font
          color: '#000',
          lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
           <h1 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '8px', fontWeight: 'bold' }}>
             {song.title}
           </h1>
           <div style={{ textAlign: 'center', fontSize: '13px', color: '#555', marginBottom: '3rem', fontStyle: 'italic' }}>
              Category: {song.category} | Tempo: {song.tempo} | Language: {song.language || 'Unknown'}
           </div>

           <div style={{ fontSize: '15px' }}>
              {song.lyrics ? (
                song.lyrics.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#999', marginTop: '4rem', fontStyle: 'italic' }}>
                  No lyrics available for this song.
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewModal;
