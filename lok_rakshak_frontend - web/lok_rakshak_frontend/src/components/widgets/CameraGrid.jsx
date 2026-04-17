import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Activity, WifiOff, Wifi, Video, UploadCloud, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useDashboardStore from '../../store/useDashboardStore';
import { VIDEO_FEED, BACKEND_URL } from '../../config';

// ── Upload Status Badge ───────────────────────────────────────────────────────
const UploadStatus = ({ status, filename }) => {
  if (!status) return null;
  const config = {
    uploading: { icon: <Loader size={12} className="animate-spin" />, text: 'Uploading…', color: 'text-[#F9A825]' },
    success:   { icon: <CheckCircle size={12} />,                      text: `Playing: ${filename}`, color: 'text-[#388E3C]' },
    error:     { icon: <AlertCircle size={12} />,                      text: 'Upload failed',         color: 'text-[#FF1744]' },
  }[status];
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className={`flex items-center gap-1.5 text-[9px] font-mono ${config.color} bg-[#0B1E2D] border border-[#1B3F63] px-2 py-1 rounded`}
    >
      {config.icon} {config.text}
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
    systemStatus === 'CRITICAL' ? 'border-[#FF1744] shadow-[0_0_20px_rgba(255,23,68,0.5)]' :
    systemStatus === 'RED'      ? 'border-[#FF1744]' :
    systemStatus === 'YELLOW'   ? 'border-[#F9A825]' :
    'border-[#1B3F63]';

  // Add cache-busting param so browser re-fetches after source switch
  const feedSrc = `${VIDEO_FEED}?t=${Date.now()}`;

  return (
    <div className={`relative w-full bg-[#071622] border-2 group overflow-hidden rounded transition-all duration-500 ${borderColor}`}
         style={{ aspectRatio: '16/9' }}>
      {feedOk ? (
        <img
          key={isUpload ? 'upload' : 'live'}        // force remount on source switch
          src={VIDEO_FEED}
          alt="Live CCTV Feed"
          className="w-full h-full object-cover"
          onError={() => setFeedOk(false)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full text-[#78909C] gap-2">
          <Wifi size={32} className="opacity-40 text-[#4FC3F7]" />
          <span className="text-[10px] tracking-widest font-mono">CONNECTING TO CAM…</span>
          <span className="text-[8px] font-mono opacity-50">{VIDEO_FEED}</span>
          <button
            onClick={() => setFeedOk(true)}
            className="mt-2 text-[9px] bg-[#132F4C] px-3 py-1 rounded border border-[#4FC3F7] text-[#4FC3F7] hover:bg-[#4FC3F7] hover:text-[#132F4C] transition-colors"
          >
            RETRY
          </button>
        </div>
      )}

      {/* Status bar overlay */}
      <div className="absolute inset-0 p-2 flex flex-col justify-between pointer-events-none z-10">
        {/* Top bar */}
        <div className="flex justify-between items-start">
          <div className="bg-black/75 px-2 py-1 flex items-center gap-2 rounded">
            <div className={`w-2 h-2 rounded-full ${feedOk ? 'bg-[#388E3C] animate-pulse' : 'bg-[#D32F2F]'}`} />
            <span className="text-[11px] font-mono tracking-tight text-white">LIVE // CAM_01 ★</span>
          </div>
          <span className="text-[10px] font-mono bg-black/75 px-2 py-1 rounded text-white">
            {isUpload ? 'FOOTAGE MODE' : 'SOUTH_GATE'}
          </span>
        </div>

        {/* Bottom bar — person count LARGE */}
        <div className="flex justify-between items-end">
          <div className="text-[10px] font-mono bg-black/75 px-2 py-1 rounded text-white">{timestamp}</div>
          <div
            className={`font-mono font-black bg-black/80 px-3 py-1.5 rounded border ${
              personCount > 20 ? 'text-[#FF1744] border-[#FF1744]' :
              personCount > 10 ? 'text-[#F9A825] border-[#F9A825]' :
              'text-[#4FC3F7] border-[#4FC3F7]'
            }`}
            style={{ fontSize: '1.4rem', lineHeight: 1 }}
          >
            {personCount} <span style={{ fontSize: '0.6rem', fontWeight: 'normal', letterSpacing: '0.1em' }}>PERSONS</span>
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
    <div className={`relative aspect-video bg-[#071622] border group overflow-hidden rounded transition-all duration-500 border-[#1B3F63]`}>
      {status === 'LIVE' ? (
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=40&w=400')" }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-[#78909C]">
          <WifiOff size={28} className="mb-1 opacity-20" />
          <span className="text-[9px] tracking-widest font-mono">SIGNAL LOST</span>
        </div>
      )}

      <div className="absolute inset-0 p-1.5 flex flex-col justify-between pointer-events-none z-10">
        <div className="flex justify-between items-start">
          <div className="bg-black/70 px-1.5 py-0.5 flex items-center gap-1 rounded">
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'LIVE' ? 'bg-[#388E3C] animate-pulse' : 'bg-[#D32F2F]'}`} />
            <span className="text-[9px] font-mono">{status} // {id}</span>
          </div>
          <span className="text-[8px] font-mono bg-black/70 px-1.5 py-0.5 rounded">{name}</span>
        </div>
        <div className="flex justify-between items-end">
          <div className="text-[8px] font-mono bg-black/70 px-1.5 py-0.5 rounded">{timestamp}</div>
          <div className={`text-[9px] font-mono bg-black/70 px-1.5 py-0.5 rounded font-bold ${risk > 80 ? 'text-[#FF1744]' : 'text-[#4FC3F7]'}`}>
            {density}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <button className="bg-[#132F4C] p-1.5 rounded-full border border-[#4FC3F7] text-[#4FC3F7] hover:bg-[#4FC3F7] hover:text-[#132F4C] transition-all">
          <Maximize2 size={12} />
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
        <h3 className="text-xs font-bold tracking-widest text-[#B0BEC5] flex items-center gap-2">
          <Activity size={14} className="text-[#4FC3F7]" />
          LIVE INTELLIGENCE FEED
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLiveCamera}
            className={`text-[9px] px-2 py-1 flex items-center gap-1 rounded border transition-colors ${
              !isUploadMode
                ? 'bg-[#4FC3F7] text-[#132F4C] border-[#4FC3F7] font-bold'
                : 'bg-[#132F4C] text-[#4FC3F7] border-[#1B3F63] hover:bg-[#4FC3F7] hover:text-[#132F4C]'
            }`}
          >
            <Video size={10} /> LIVE CAM
          </button>

          <label
            className={`text-[9px] px-2 py-1 flex items-center gap-1 rounded border cursor-pointer transition-colors ${
              isUploadMode
                ? 'bg-[#4FC3F7] text-[#132F4C] border-[#4FC3F7] font-bold'
                : 'bg-[#132F4C] text-[#4FC3F7] border-[#1B3F63] hover:bg-[#4FC3F7] hover:text-[#132F4C]'
            }`}
          >
            <UploadCloud size={10} /> UPLOAD REC
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleUpload}
            />
          </label>

          <span className="text-[9px] font-mono text-[#78909C] ml-1">CH: 04/12</span>
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

      {/* Anomaly index bar */}
      <div className="bg-[#132F4C] border border-[#1B3F63] rounded p-3 flex flex-col gap-1.5 flex-shrink-0">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-[#78909C]">AI RISK INDEX</span>
          <span className="text-[#4FC3F7] font-mono font-bold text-sm">
            {personCount > 0 ? `${Math.min(personCount * 3, 99)}.${personCount % 10}%` : '0.0%'}
          </span>
        </div>
        <div className="w-full h-2 bg-[#0B1E2D] rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${Math.min(personCount * 3, 100)}%` }}
            transition={{ type: 'spring', stiffness: 60, damping: 20 }}
            className="h-full bg-gradient-to-r from-[#388E3C] via-[#F9A825] to-[#FF1744]"
          />
        </div>
        <p className="text-[9px] text-[#78909C] leading-tight">
          {isUploadMode ? 'FOOTAGE MODE — ' : 'LIVE — '}
          {personCount > 0 ? `${personCount} persons detected via YOLO.` : 'No persons in frame.'}
        </p>
      </div>
    </div>
  );
};

export default CameraGrid;
