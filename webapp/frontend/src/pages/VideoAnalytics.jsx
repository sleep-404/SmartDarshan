import { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import {
  Video,
  Camera,
  AlertCircle,
  Activity,
  Maximize2,
  Grid3X3,
  List
} from 'lucide-react';

function VideoPlayer() {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // For HLS streaming, we'd use hls.js in production
    // For now, we'll show a placeholder or use the video directly
    const loadVideo = async () => {
      try {
        // Check if HLS stream is available
        const response = await fetch('http://localhost:3001/hls/stream.m3u8');
        if (response.ok) {
          if (videoRef.current) {
            // In production, use hls.js for HLS playback
            // For demo, we'll try direct video
            setIsLoading(false);
          }
        } else {
          setError('Stream initializing...');
          setIsLoading(false);
        }
      } catch (err) {
        setError('Connecting to stream...');
        setIsLoading(false);
      }
    };

    loadVideo();
    const interval = setInterval(loadVideo, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <Video size={48} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm opacity-75">{error}</p>
            <p className="text-xs opacity-50 mt-1">FFmpeg stream starting...</p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="http://localhost:3001/hls/stream.m3u8" type="application/x-mpegURL" />
      </video>
      {/* Overlay with detection boxes (simulated) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
          LIVE • CAM-001 Temple Core
        </div>
      </div>
    </div>
  );
}

function CameraThumbnail({ camera, isSelected, onClick }) {
  const getDensityColor = (density) => {
    if (density >= 85) return 'border-red-500 bg-red-500/10';
    if (density >= 70) return 'border-orange-500 bg-orange-500/10';
    if (density >= 50) return 'border-amber-500 bg-amber-500/10';
    return 'border-emerald-500 bg-emerald-500/10';
  };

  return (
    <button
      onClick={onClick}
      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
        isSelected ? 'ring-2 ring-primary-500' : ''
      } ${getDensityColor(camera.density)}`}
    >
      <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
        <Camera size={24} className="text-slate-500" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="text-white text-xs font-medium">{camera.id}</p>
        <p className="text-white/75 text-xs">{camera.density}% density</p>
      </div>
      {camera.anomaly && (
        <div className="absolute top-2 right-2">
          <AlertCircle size={16} className="text-red-500 animate-pulse" />
        </div>
      )}
    </button>
  );
}

function HotspotCard({ hotspot }) {
  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getSeverityStyles(hotspot.severity)}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium capitalize">{hotspot.zone.replace('-', ' ')}</span>
        <span className="text-xs uppercase font-medium">{hotspot.severity}</span>
      </div>
      <p className="text-xs mt-1 opacity-75">
        {hotspot.coordinates[0].toFixed(4)}, {hotspot.coordinates[1].toFixed(4)}
      </p>
    </div>
  );
}

export default function VideoAnalytics() {
  const { data } = useData();
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-slate-500 mt-4">Loading video analytics...</p>
        </div>
      </div>
    );
  }

  const { videoAnalytics } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Video Analytics</h1>
          <p className="text-slate-500 mt-1">AI-powered crowd density and anomaly detection</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-slate-200' : 'bg-slate-100'}`}
          >
            <Grid3X3 size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-slate-200' : 'bg-slate-100'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-slate-500">Processing FPS</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{videoAnalytics?.processingFps}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Detection Accuracy</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{videoAnalytics?.detectionAccuracy}%</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Anomalies Detected</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">{videoAnalytics?.anomaliesDetected}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Crowd Flow</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1 capitalize">{videoAnalytics?.crowdFlowDirection}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-700">Live Feed</h3>
              <button className="p-2 hover:bg-slate-100 rounded-lg">
                <Maximize2 size={16} />
              </button>
            </div>
            <VideoPlayer />
          </div>

          {/* Camera Grid */}
          <div className="card">
            <h3 className="card-header">Camera Grid</h3>
            <div className="grid grid-cols-4 gap-3">
              {videoAnalytics?.cameras?.map((camera) => (
                <CameraThumbnail
                  key={camera.id}
                  camera={camera}
                  isSelected={selectedCamera === camera.id}
                  onClick={() => setSelectedCamera(camera.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Hotspots */}
          <div className="card">
            <h3 className="card-header">Congestion Hotspots</h3>
            <div className="space-y-3">
              {videoAnalytics?.hotspots?.map((hotspot, index) => (
                <HotspotCard key={index} hotspot={hotspot} />
              ))}
            </div>
          </div>

          {/* Anomaly Feed */}
          <div className="card">
            <h3 className="card-header">Anomaly Detection</h3>
            <div className="space-y-3">
              {videoAnalytics?.cameras?.filter(c => c.anomaly).map((camera) => (
                <div
                  key={camera.id}
                  className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <AlertCircle size={20} className="text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{camera.id}</p>
                    <p className="text-xs text-red-600">High density anomaly detected</p>
                  </div>
                </div>
              ))}
              {!videoAnalytics?.cameras?.some(c => c.anomaly) && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No anomalies detected
                </p>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="card">
            <h3 className="card-header">Density Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span className="text-sm text-slate-600">Critical (85%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span className="text-sm text-slate-600">High (70-84%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500"></div>
                <span className="text-sm text-slate-600">Moderate (50-69%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500"></div>
                <span className="text-sm text-slate-600">Normal (&lt;50%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
