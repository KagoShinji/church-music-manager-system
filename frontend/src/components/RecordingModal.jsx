import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Square, X, Play, RefreshCw, Save } from 'lucide-react';

const RecordingModal = ({ isOpen, onClose, onSave }) => {
  const [mode, setMode] = useState('audio'); // 'audio' or 'video'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [stream, setStream] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const liveVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    } else {
      setMode('audio');
      setRecordedBlob(null);
      setErrorMsg('');
      startPreview('audio');
    }
  }, [isOpen]);

  useEffect(() => {
    // Re-attach stream to video element when mode changes or stream changes, if not recording a blob yet
    if (stream && liveVideoRef.current && mode === 'video' && !recordedBlob) {
      liveVideoRef.current.srcObject = stream;
    }
  }, [stream, mode, recordedBlob]);

  const cleanup = () => {
    stopStream();
    clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
    setRecordedBlob(null);
    setIsCompressing(false);
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startPreview = async (selectedMode) => {
    stopStream();
    setRecordedBlob(null);
    setErrorMsg('');
    try {
      const constraints = {
        audio: true,
        video: selectedMode === 'video' ? { facingMode: 'user' } : false
      };
      const previewStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(previewStream);
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setErrorMsg('Could not access camera or microphone. Please check permissions.');
    }
  };

  const handleModeChange = (newMode) => {
    if (isRecording) return;
    setMode(newMode);
    startPreview(newMode);
  };

  const handleStartRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    
    // Setting compression bits: lower value = more compressed.
    const options = {
        audioBitsPerSecond: 64000, // 64kbps audio
    };
    if (mode === 'video') {
        options.videoBitsPerSecond = 500000; // 500kbps video (highly compressed but okay for testing)
        // options.mimeType = 'video/webm;codecs=vp8,opus'; 
        // using default mime type helps prevent support issues across browsers
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const type = mode === 'video' ? 'video/webm' : 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        setRecordedBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
      setErrorMsg('Failed to start recording. MediaRecorder options might not be supported.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      stopStream(); // Stop live camera
    }
  };

  const handleRetake = () => {
    setRecordedBlob(null);
    startPreview(mode);
  };

  const handleSave = async () => {
    if (recordedBlob) {
      setIsCompressing(true);
      // Wait a moment for UX
      await new Promise(r => setTimeout(r, 500)); 
      // The MediaRecorder was already set to capture at a low bitrate, so it is inherently compressed.
      // E.g., Audio at 64kbps, Video at 500kbps.
      
      const fileName = `recording_${Date.now()}.${mode === 'video' ? 'webm' : 'webm'}`;
      const file = new File([recordedBlob], fileName, { type: recordedBlob.type });
      
      onSave(file, mode);
      setIsCompressing(false);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="card" style={{ width: '90%', maxWidth: 500, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Record Media</h2>
          <button onClick={onClose} className="btn btn-icon btn-secondary btn-sm" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.75rem', background: 'var(--error-surface, #fee2e2)', color: 'var(--error-text, #991b1b)', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Toggle Mode */}
        {!recordedBlob && !isRecording && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem', background: 'var(--gray-100)', borderRadius: '0.5rem' }}>
            <button
              onClick={() => handleModeChange('audio')}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: '0.25rem', border: 'none',
                background: mode === 'audio' ? 'white' : 'transparent',
                fontWeight: mode === 'audio' ? 600 : 400,
                color: mode === 'audio' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: mode === 'audio' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <Mic size={16} /> Audio Only
            </button>
            <button
              onClick={() => handleModeChange('video')}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: '0.25rem', border: 'none',
                background: mode === 'video' ? 'white' : 'transparent',
                fontWeight: mode === 'video' ? 600 : 400,
                color: mode === 'video' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: mode === 'video' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <Camera size={16} /> Camera + Audio
            </button>
          </div>
        )}

        {/* Preview / Playback Area */}
        <div style={{ 
          background: 'var(--gray-900)', borderRadius: '0.5rem', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: mode === 'video' ? 300 : 150, position: 'relative'
        }}>
          {recordedBlob ? (
            /* Review Phase */
            mode === 'video' ? (
              <video src={URL.createObjectURL(recordedBlob)} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <audio src={URL.createObjectURL(recordedBlob)} controls style={{ width: '90%' }} />
            )
          ) : (
            /* Live Stream Phase */
            mode === 'video' ? (
              stream && <video ref={liveVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', background: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: isRecording ? '#ef4444' : '#9ca3af',
                  animation: isRecording ? 'pulse-ring 1.2s ease-out infinite' : 'none'
                }}>
                  <Mic size={32} />
                </div>
                {isRecording && (
                   <span style={{ color: '#ef4444', fontVariantNumeric: 'tabular-nums', fontWeight: 'bold' }}>
                      {formatTime(recordingTime)}
                   </span>
                )}
             </div>
            )
          )}

          {/* Time overlay for video */}
          {mode === 'video' && isRecording && !recordedBlob && (
            <div style={{
               position: 'absolute', top: '1rem', right: '1rem',
               background: 'rgba(0,0,0,0.6)', color: '#ef4444', padding: '0.25rem 0.75rem',
               borderRadius: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
               <div style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }} />
               {formatTime(recordingTime)}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          {!recordedBlob ? (
             <button
               disabled={!stream}
               className={`btn w-full ${isRecording ? 'btn-danger' : 'btn-primary'}`}
               style={{ height: '3rem', fontSize: '1rem' }}
               onClick={isRecording ? handleStopRecording : handleStartRecording}
             >
               {isRecording ? <><Square size={20} /> Stop Recording</> : <><Play size={20} /> Start Recording</>}
             </button>
          ) : (
            <>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1 }} 
                onClick={handleRetake}
                disabled={isCompressing}
              >
                <RefreshCw size={18} /> Retake
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 2 }} 
                onClick={handleSave}
                disabled={isCompressing}
              >
                 {isCompressing ? 'Compressing...' : <><Save size={18} /> Save & Upload</>}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default RecordingModal;
