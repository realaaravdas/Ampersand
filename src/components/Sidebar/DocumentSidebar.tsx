'use client';

import { AmpDocument } from '@/types/document';
import {
  FileText, Plus, Trash2, ChevronRight,
  Clock, FileEdit,
} from 'lucide-react';

interface DocumentSidebarProps {
  documents: AmpDocument[];
  activeDocId: string | null;
  loading: boolean;
  onSelect: (doc: AmpDocument) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    const hours = Math.floor(diff / 3600000);
    if (hours === 0) {
      const mins = Math.floor(diff / 60000);
      return mins <= 1 ? 'Just now' : `${mins}m ago`;
    }
    return `${hours}h ago`;
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function DocumentSidebar({
  documents,
  activeDocId,
  loading,
  onSelect,
  onNew,
  onDelete,
}: DocumentSidebarProps) {
  return (
    <div className="w-64 bg-[#1a1a2e] flex flex-col h-full border-r border-gray-700/50">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-700/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">&amp;</span>
          </div>
          <span className="text-white font-semibold text-sm">Ampersand</span>
        </div>
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-3 rounded-lg transition-colors"
        >
          <Plus size={15} />
          New Document
        </button>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-3 mb-1">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold px-1">Documents</p>
        </div>

        {loading ? (
          <div className="px-4 py-8 text-center">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 text-xs mt-2">Loading...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <FileText size={24} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-xs">No documents yet</p>
            <p className="text-gray-600 text-xs mt-1">Click &ldquo;New Document&rdquo; to start</p>
          </div>
        ) : (
          <div className="space-y-0.5 px-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onSelect(doc)}
                className={`group flex items-start gap-2.5 px-2 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  activeDocId === doc.id
                    ? 'bg-purple-600/20 border border-purple-500/30'
                    : 'hover:bg-gray-700/40 border border-transparent'
                }`}
              >
                <FileEdit
                  size={15}
                  className={`mt-0.5 flex-shrink-0 ${activeDocId === doc.id ? 'text-purple-400' : 'text-gray-500'}`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium truncate ${
                      activeDocId === doc.id ? 'text-purple-200' : 'text-gray-300'
                    }`}
                  >
                    {doc.title || 'Untitled Document'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={10} className="text-gray-600" />
                    <p className="text-[10px] text-gray-600">{formatDate(doc.updatedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                    className="p-0.5 hover:text-red-400 text-gray-500 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 size={12} />
                  </button>
                  <ChevronRight size={12} className="text-gray-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-700/50">
        <p className="text-[10px] text-gray-600 text-center">
          {documents.length} document{documents.length !== 1 ? 's' : ''} · .amp format
        </p>
      </div>
    </div>
  );
}
