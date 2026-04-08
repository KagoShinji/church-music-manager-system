import React, { useState, useRef } from 'react';
import { Upload, Mic, Play, FileText, Music2, Square, Trash2, Download, CheckCircle, Loader2 } from 'lucide-react';
import RecordingModal from '../components/RecordingModal';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

const INITIAL_FILES = [
  {
    id: '1',
    name: 'Here I Am Lord - Sheet Music.pdf',
    size: '1.2 MB',
    added: 'Today, 2:30 PM',
    type: 'pdf',
    color: '#16a34a',
    bg: '#f0fdf4',
    url: null,
  },
  {
    id: '2',
    name: 'Soprano Practice - Gloria',
    size: '3.4 MB',
    added: 'Yesterday, 10:15 AM',
    type: 'audio',
    color: 'var(--primary)',
    bg: 'var(--blue-50)',
    url: null,
  },
  {
    id: '3',
    name: 'On Eagles Wings - Accompaniment.mp3',
    size: '4.8 MB',
    added: 'Apr 5, 2026',
    type: 'audio',
    color: '#d97706',
    bg: '#fef3c7',
    url: null,
  },
];

const FileManager = () => {
  const [files, setFiles] = useState(INITIAL_FILES);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const getIconForType = (type) => {
    if (type === 'audio') return Music2;
    if (type === 'video') return Play;
    return FileText;
  };

  const getColorForType = (type) => {
    if (type === 'audio') return { color: 'var(--primary)', bg: 'var(--blue-50)' };
    if (type === 'video') return { color: '#d97706', bg: '#fef3c7' };
    return { color: '#16a34a', bg: '#f0fdf4' }; // pdf and default
  };

  const handleFiles = async (selectedFiles) => {
    setIsUploading(true);
    for (let i = 0; i < selectedFiles.length; i++) {
       let file = selectedFiles[i];
       
       // Image Compression if it's an image
       if (file.type.startsWith('image/')) {
          const options = {
            maxSizeMB: 1, // Compress to less than 1MB
            maxWidthOrHeight: 1920,
            useWebWorker: true
          }
          try {
            file = await imageCompression(file, options);
          } catch (error) {
            console.error("Image compression error", error);
          }
       }

       await uploadToFirebase(file);
    }
    setIsUploading(false);
  };

  const uploadToFirebase = async (file, overrideType = null) => {
    try {
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      let type = overrideType || 'document';
      if (file.type.startsWith('audio/')) type = 'audio';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type === 'application/pdf') type = 'pdf';

      const newFileObj = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        added: 'Just now',
        type: type,
        ...getColorForType(type),
        url: downloadURL,
      };

      setFiles(prev => [newFileObj, ...prev]);
    } catch (err) {
      console.error("Error uploading to Firebase:", err);
      // Fallback: Use local ObjectURL if firebase fails (e.g. missing keys or permission denied)
      alert("Firebase upload failed, storing locally instead. Check console for details.");
      const type = overrideType || (file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('video/') ? 'video' : 'document');
      const newFileObj = {
         id: Date.now().toString(),
         name: file.name,
         size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
         added: 'Just now (Local)',
         type: type,
         ...getColorForType(type),
         url: URL.createObjectURL(file), // Local storage only
       };
       setFiles(prev => [newFileObj, ...prev]);
    }
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = () => { setIsDragOver(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleManualUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleRecordSave = async (file, mode) => {
      setIsRecordingModalOpen(false);
      setIsUploading(true);
      await uploadToFirebase(file, mode);
      setIsUploading(false);
  };

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
            position: 'relative',
            overflow: 'hidden'
          }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {isUploading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
               <Loader2 className="animate-spin" size={32} color="var(--primary)" />
               <span style={{ marginTop: '0.5rem', fontWeight: 600 }}>Uploading & Compressing...</span>
            </div>
          )}
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
              Supports MP3, WAV, PDF, FLAC, Image — limits apply depending on tier
            </p>
          </div>
          <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()} disabled={isUploading}>
            Browse Files
          </button>
          <input 
            type="file" 
            multiple 
            hidden 
            ref={fileInputRef} 
            onChange={handleManualUpload} 
            accept="audio/*,video/*,.pdf,image/*" 
          />
        </div>

        {/* Record Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
          <div
            style={{
              position: 'relative', width: 64, height: 64,
              background: 'var(--gray-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s',
            }}
            onClick={() => setIsRecordingModalOpen(true)}
          >
            <Mic size={28} />
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>
              Record Media
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Record compressed audio/video right in your browser
            </p>
          </div>

          <button
            className="btn btn-secondary w-full"
            onClick={() => setIsRecordingModalOpen(true)}
            disabled={isUploading}
          >
            <Mic size={16} /> Open Recorder
          </button>
        </div>
      </div>

      {/* Storage Summary */}
      <div className="card stagger-2" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Storage Usage (Estimated)</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Firebase Storage Limit</span>
        </div>
        <div style={{ height: 6, background: 'var(--gray-100)', overflow: 'hidden' }}>
          <div style={{ width: '4.8%', height: '100%', background: 'var(--primary)', transition: 'width 0.6s ease' }} />
        </div>
      </div>

      {/* Recent Files */}
      <div className="card stagger-3" style={{ padding: 0 }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2.25rem 1fr 100px 160px 80px',
          gap: '1rem', padding: '0.6rem 1.25rem', borderBottom: '1px solid var(--border)',
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--text-muted)', background: 'var(--gray-50)', alignItems: 'center',
        }}>
          <span></span>
          <span>File Name</span>
          <span>Size</span>
          <span>Added</span>
          <span>Actions</span>
        </div>

        {files.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No files available. Drop a file or record audio to add one.
          </div>
        )}

        {files.map((file, i) => {
          const Icon = getIconForType(file.type);
          return (
            <div
              key={file.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2.25rem 1fr 100px 160px 80px',
                gap: '1rem', padding: '0.875rem 1.25rem',
                borderBottom: i < files.length - 1 ? '1px solid var(--border)' : 'none',
                alignItems: 'center', transition: 'background var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 34, height: 34, minWidth: 34,
                background: file.bg, color: file.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '0.5rem'
              }}>
                <Icon size={16} />
              </div>

              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{file.name}</div>
                <div>
                  <span className={`badge ${file.type === 'pdf' ? 'badge-success' : 'badge-blue'}`}>
                    {file.type.toUpperCase()}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{file.size}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{file.added}</div>

              <div className="flex gap-1">
                {['audio', 'video'].includes(file.type)
                  ? <button className="btn btn-icon btn-secondary btn-sm" title="Play" onClick={() => file.url && window.open(file.url, '_blank')}><Play size={14} /></button>
                  : <button className="btn btn-icon btn-secondary btn-sm" title="View" onClick={() => file.url && window.open(file.url, '_blank')}><FileText size={14} /></button>
                }
                <button className="btn btn-icon btn-secondary btn-sm" title="Download" onClick={() => {
                   if (file.url) {
                       const a = document.createElement('a'); 
                       a.href = file.url; 
                       a.download = file.name; 
                       a.click();
                   } else {
                       alert('Download not available for mock item');
                   }
                }}><Download size={14} /></button>
                <button className="btn btn-icon btn-outline-danger btn-sm" title="Delete" onClick={() => setFiles(files.filter(f => f.id !== file.id))}><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recording Modal Render */}
      <RecordingModal 
         isOpen={isRecordingModalOpen} 
         onClose={() => setIsRecordingModalOpen(false)} 
         onSave={handleRecordSave}
      />
    </div>
  );
};

export default FileManager;
