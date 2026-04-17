import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Activity, WifiOff, Wifi, Video, UploadCloud, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useDashboardStore from '../../store/useDashboardStore';
import { VIDEO_FEED, BACKEND_URL } from '../../config';

// ── Upload Status Badge ───────────────────────────────────────────────────────
const NEON_CYAN  = '#00FFC2';
const NEON_AMBER = '#FFB300';
const NEON_RED   = '#FF3B3B';

const UploadStatus = ({ status, filename }) => {
  if (!status) return null;
  const cfg = {
    uploading: { icon: <Loader size={12} className="animate-spin" />, text: 'Uploading…',        color: NEON_AMBER },
    success:   { icon: <CheckCircle size={12} />,                      text: `Playing: ${filename}`, color: NEON_CYAN },
    error:     { icon: <AlertCircle size={12} />,                      text: 'Upload failed',         color: NEON_RED },
  }[status];
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex items-center gap-1.5 text-[9px] font-mono px-3 py-1 rounded-lg"
      style={{ color: cfg.color, backgroundColor: 'rgba(13,13,13,0.8)', border: `1px solid ${cfg.color}30` }}
    >
      {cfg.icon} {cfg.text}
    </motion.div>
  );
};

// ── Primary Live Feed (large, full-width) ─────────────────────────────────────
const PrimaryFeed = ({ isUpload }) => {
  const { systemStatus, personCount } = useDashboardStore();
  const [timestamp, setTimestamp] = useState(
    new Date().toISOString().replace('T', ' ').substring(0, 19)
  );
  const [feedOk, setFeedOk] = useState(true);

  useEffect(() => {
    const t = setInterval(
      () => setTimestamp(new Date().toISOString().replace('T', ' ').substring(0, 19)),
      1000
    );
    return () => clearInterval(t);
  }, []);

  const borderColor =
    systemStatus === 'CRITICAL' ? 'border-[#FF3B3B] shadow-[0_0_20px_rgba(255,59,59,0.4)]' :
    systemStatus === 'RED'      ? 'border-[#FF3B3B]/70' :
    systemStatus === 'YELLOW'   ? 'border-[#FFB300]/70' :
    'border-[#00FFC2]/15';

  // Add cache-busting param so browser re-fetches after source switch
  const feedSrc = `${VIDEO_FEED}?t=${Date.now()}`;

  return (
    <div
      className={`relative w-full flex-1 group overflow-hidden rounded-xl shadow-xl transition-all duration-500 border-2 ${borderColor}`}
      style={{ aspectRatio: '16/9', backgroundColor: '#0D0D0D' }}
    >
      {feedOk ? (
        <img
          key={isUpload ? 'upload' : 'live'}        // force remount on source switch
          src={VIDEO_FEED}
          alt="Live CCTV Feed"
          className="w-full h-full object-cover"
          onError={() => setFeedOk(false)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full gap-2"
          style={{ color: 'rgba(0,255,194,0.5)' }}>
          <Wifi size={30} style={{ color: NEON_CYAN, opacity: 0.4 }} />
          <span className="text-[10px] tracking-widest font-mono">CONNECTING TO CAM…</span>
          <span className="text-[8px] font-mono opacity-40">{VIDEO_FEED}</span>
          <button
            onClick={() => setFeedOk(true)}
            className="mt-2 text-[8px] font-mono font-bold px-3 py-1 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: 'rgba(0,255,194,0.08)',
              border: `1px solid ${NEON_CYAN}50`,
              color: NEON_CYAN,
            }}
          >
            RETRY
          </button>
        </div>
      )}

      {/* Status bar overlay with gradient */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none z-10 bg-gradient-to-t from-black/80 via-black/10 to-black/60">
        {/* Top bar */}
        <div className="flex justify-between items-start">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 flex items-center gap-2 rounded-lg shadow-lg">
            <div className={`w-2 h-2 rounded-full ${feedOk ? 'bg-[#388E3C] animate-pulse' : 'bg-[#D32F2F]'}`} />
            <span className="text-[11px] font-mono tracking-tight text-white">LIVE // CAM_01 ★</span>
          </div>
          <span className="text-[10px] font-mono bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-white shadow-lg">
            {isUpload ? 'FOOTAGE MODE' : 'SOUTH_GATE'}
          </span>
        </div>

        {/* Bottom bar — person count LARGE */}
        <div className="flex justify-between items-end">
          <div className="text-[10px] font-mono bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white/80">{timestamp}</div>
          <div
            className="font-mono font-black backdrop-blur-md bg-black/50 px-4 py-2 rounded-xl border-2 shadow-2xl"
            style={{
              fontSize: '1.6rem',
              lineHeight: 1,
              color: personCount > 20 ? NEON_RED : personCount > 10 ? NEON_AMBER : NEON_CYAN,
              borderColor: personCount > 20 ? `${NEON_RED}40` : personCount > 10 ? `${NEON_AMBER}40` : `${NEON_CYAN}30`,
              textShadow: `0 0 10px ${personCount > 20 ? NEON_RED : personCount > 10 ? NEON_AMBER : NEON_CYAN}`,
            }}
          >
            {personCount} <span style={{ fontSize: '0.7rem', fontWeight: 'normal', letterSpacing: '0.1em' }} className="text-white/70">PERSONS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Secondary Camera Tile (small) ─────────────────────────────────────────────
const SecondaryFeed = ({ id, name, density, status, risk }) => {
  const [timestamp, setTimestamp] = useState(
    new Date().toISOString().replace('T', ' ').substring(0, 19)
  );
  useEffect(() => {
    const t = setInterval(
      () => setTimestamp(new Date().toISOString().replace('T', ' ').substring(0, 19)),
      1000
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="relative aspect-video border group overflow-hidden rounded-xl transition-all duration-500 shadow-md"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-faint)',
      }}
    >
      {status === 'LIVE' ? (
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=40&w=400')" }}
        />
      ) : (
        /* Offline — Aero-Tech style */
        <div
          className="flex flex-col items-center justify-center h-full gap-1.5"
          style={{ backgroundColor: '#0A0A0A' }}
        >
          <WifiOff size={20} style={{ color: '#FF3B3B', opacity: 0.5 }} />
          <span
            className="text-[8px] font-mono font-bold tracking-[0.25em] uppercase"
            style={{ color: 'rgba(255,59,59,0.55)' }}
          >
            SIGNAL_LOST
          </span>
        </div>
      )}

      {/* Overlay — always dark so it's readable over video */}
      <div
        className="absolute inset-0 p-2 flex flex-col justify-between pointer-events-none z-10"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 45%, rgba(0,0,0,0.45) 100%)' }}
      >
        {/* Top: status badge + camera name */}
        <div className="flex justify-between items-start">
          {/* LIVE / OFFLINE badge */}
          <div
            className="px-1.5 py-0.5 flex items-center gap-1 rounded-md"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status === 'LIVE' ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: status === 'LIVE' ? '#00FFC2' : '#FF3B3B' }}
            />
            <span
              className="text-[8px] font-mono font-black tracking-[0.18em]"
              style={{
                color: status === 'LIVE' ? '#00FFC2' : '#FF3B3B',
                textShadow: `0 0 6px ${status === 'LIVE' ? '#00FFC2' : '#FF3B3B'}`,
              }}
            >
              {status}
            </span>
          </div>
          {/* Camera name */}
          <span
            className="text-[7px] font-mono px-1.5 py-0.5 rounded-md tracking-[0.15em]"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', color: '#7A7A7A' }}
          >
            {name}
          </span>
        </div>

        {/* Bottom: timestamp + density/status label */}
        <div className="flex justify-between items-end">
          {/* Timestamp */}
          <span
            className="text-[7px] font-mono px-1.5 py-0.5 rounded-md"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#7A7A7A' }}
          >
            {timestamp.slice(-8)}
          </span>
          {/* NORMAL / SIGNAL_LOSS label */}
          <span
            className="text-[8px] font-mono font-black px-1.5 py-0.5 rounded-md tracking-[0.15em]"
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: density === 'SIGNAL_LOSS' || risk > 80 ? '#FF3B3B' : '#00FFC2',
              textShadow: `0 0 6px ${density === 'SIGNAL_LOSS' || risk > 80 ? '#FF3B3B' : '#00FFC2'}`,
            }}
          >
            {density}
          </span>
        </div>
      </div>

      {/* Hover maximize */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <button
          className="p-1.5 rounded-full transition-all"
          style={{
            backgroundColor: 'rgba(0,0,0,0.75)',
            border: '1px solid rgba(0,255,194,0.5)',
            color: '#00FFC2',
            boxShadow: '0 0 8px rgba(0,255,194,0.25)',
          }}
        >
          <Maximize2 size={11} />
        </button>
      </div>
    </div>
  );
};

// ── Camera Grid ────────────────────────────────────────────────────────────────
const CameraGrid = () => {
  const { cameras, personCount } = useDashboardStore();
  const [uploadStatus, setUploadStatus] = useState(null); // null | 'uploading' | 'success' | 'error'
  const [uploadFilename, setUploadFilename] = useState('');
  const [isUploadMode, setIsUploadMode] = useState(false);
  const fileInputRef = useRef(null);

  // Secondary feeds = cameras 1,2,3 (skip index 0 = primary)
  const secondaryCams = cameras.slice(1);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadFilename(file.name);
    setUploadStatus('uploading');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${BACKEND_URL}/api/upload_video`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUploadStatus('success');
      setIsUploadMode(true);
      // Clear status after 5 seconds
      setTimeout(() => setUploadStatus(null), 5000);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadStatus('error');
      setTimeout(() => setUploadStatus(null), 4000);
    }

    // Reset file input so the same file can be re-uploaded
    e.target.value = '';
  };

  const handleLiveCamera = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/set_camera`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setIsUploadMode(false);
      setUploadStatus(null);
    } catch (err) {
      console.error('Set camera failed:', err);
    }
  };

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1 flex-shrink-0">
        <h3 className="text-[11px] font-mono font-black tracking-[0.25em] flex items-center gap-2"
          style={{ color: NEON_CYAN }}>
          <Activity size={13} style={{ color: NEON_CYAN }} />
          LIVE INTELLIGENCE FEED
        </h3>
        <div className="flex items-center gap-1.5">
          {/* LIVE CAM button */}
          <button
            onClick={handleLiveCamera}
            className="text-[8px] font-mono font-bold px-2.5 py-1 flex items-center gap-1 rounded-lg border transition-all duration-200"
            style={!isUploadMode ? {
              backgroundColor: NEON_CYAN,
              color: '#0D0D0D',
              borderColor: NEON_CYAN,
              boxShadow: `0 0 8px rgba(0,255,194,0.4)`,
            } : {
              backgroundColor: 'rgba(0,255,194,0.06)',
              color: NEON_CYAN,
              borderColor: 'rgba(0,255,194,0.25)',
            }}
          >
            <Video size={9} /> LIVE CAM
          </button>

          {/* UPLOAD REC button */}
          <label
            className="text-[8px] font-mono font-bold px-2.5 py-1 flex items-center gap-1 rounded-lg border cursor-pointer transition-all duration-200"
            style={isUploadMode ? {
              backgroundColor: NEON_CYAN,
              color: '#0D0D0D',
              borderColor: NEON_CYAN,
              boxShadow: `0 0 8px rgba(0,255,194,0.4)`,
            } : {
              backgroundColor: 'rgba(0,255,194,0.06)',
              color: NEON_CYAN,
              borderColor: 'rgba(0,255,194,0.25)',
            }}
          >
            <UploadCloud size={9} /> UPLOAD REC
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleUpload}
            />
          </label>

          <span className="text-[8px] font-mono ml-1" style={{ color: 'rgba(0,255,194,0.35)' }}>CH: 04/12</span>
        </div>
      </div>

      {/* Upload status badge */}
      <AnimatePresence>
        {uploadStatus && (
          <UploadStatus status={uploadStatus} filename={uploadFilename} />
        )}
      </AnimatePresence>

      {/* Primary Feed — large */}
      <div className="flex-shrink-0">
        <PrimaryFeed isUpload={isUploadMode} />
      </div>

      {/* Secondary feeds — 3 small tiles in a row */}
      <div className="grid grid-cols-3 gap-2 flex-shrink-0">
        {secondaryCams.map((cam) => (
          <SecondaryFeed key={cam.id} {...cam} />
        ))}
      </div>

    </div>
  );
};

export default CameraGrid;
