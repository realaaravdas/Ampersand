'use client';

import { SaveStatus } from '@/types/document';
import { ZoomIn, ZoomOut, CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';

interface StatusBarProps {
  wordCount: number;
  charCount: number;
  saveStatus: SaveStatus;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export default function StatusBar({
  wordCount,
  charCount,
  saveStatus,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: StatusBarProps) {
  const statusConfig = {
    saved: { icon: <CheckCircle size={14} />, text: 'Saved', color: 'text-green-400' },
    saving: { icon: <Loader2 size={14} className="animate-spin" />, text: 'Saving...', color: 'text-yellow-400' },
    unsaved: { icon: <Clock size={14} />, text: 'Unsaved changes', color: 'text-yellow-300' },
    error: { icon: <AlertCircle size={14} />, text: 'Save failed', color: 'text-red-400' },
  };

  const status = statusConfig[saveStatus];

  return (
    <div className="h-7 bg-[#1e1e2e] border-t border-gray-700/50 flex items-center justify-between px-4 text-xs text-gray-400 select-none">
      <div className="flex items-center gap-4">
        <span>{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
        <span className="w-px h-3 bg-gray-600" />
        <span>{charCount} character{charCount !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-1.5 ${status.color}`}>
          {status.icon}
          <span>{status.text}</span>
        </div>
        <span className="w-px h-3 bg-gray-600" />
        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            title="Zoom Out (Ctrl+-)"
            className="p-0.5 hover:bg-gray-700 rounded transition-colors"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={onZoomReset}
            title="Reset Zoom"
            className="px-2 hover:bg-gray-700 rounded transition-colors min-w-[3.5rem] text-center"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            title="Zoom In (Ctrl+=)"
            className="p-0.5 hover:bg-gray-700 rounded transition-colors"
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
