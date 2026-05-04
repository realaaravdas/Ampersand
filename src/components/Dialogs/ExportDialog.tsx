'use client';

import { X, Download } from 'lucide-react';

interface ExportDialogProps {
  onClose: () => void;
  onExportHtml: () => void;
  onExportText: () => void;
  onPrint: () => void;
  title: string;
}

export default function ExportDialog({ onClose, onExportHtml, onExportText, onPrint, title }: ExportDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Export Document</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Export &ldquo;{title}&rdquo; as:</p>
        <div className="space-y-2">
          <button
            onClick={() => { onExportHtml(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
              <Download size={16} className="text-orange-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">HTML Document</div>
              <div className="text-xs text-gray-500">Export as .html file</div>
            </div>
          </button>
          <button
            onClick={() => { onExportText(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              <Download size={16} className="text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">Plain Text</div>
              <div className="text-xs text-gray-500">Export as .txt file</div>
            </div>
          </button>
          <button
            onClick={() => { onPrint(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
              <Download size={16} className="text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">Print / Save as PDF</div>
              <div className="text-xs text-gray-500">Open print dialog (Ctrl+P)</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
