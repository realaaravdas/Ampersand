'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { X } from 'lucide-react';

interface TableDialogProps {
  editor: Editor;
  onClose: () => void;
}

export default function TableDialog({ editor, onClose }: TableDialogProps) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [withHeader, setWithHeader] = useState(true);

  const insert = () => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: withHeader }).run();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Insert Table</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rows</label>
              <input
                type="number"
                value={rows}
                min={1}
                max={20}
                onChange={(e) => setRows(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
              <input
                type="number"
                value={cols}
                min={1}
                max={10}
                onChange={(e) => setCols(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="withHeader"
              checked={withHeader}
              onChange={(e) => setWithHeader(e.target.checked)}
              className="rounded border-gray-300 text-purple-600"
            />
            <label htmlFor="withHeader" className="text-sm text-gray-700">Include header row</label>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={insert}
              className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              Insert Table
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
