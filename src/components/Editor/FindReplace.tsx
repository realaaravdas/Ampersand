'use client';

import { useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { X, ChevronUp, ChevronDown, Replace } from 'lucide-react';

interface FindReplaceProps {
  editor: Editor;
  onClose: () => void;
}

export default function FindReplace({ editor, onClose }: FindReplaceProps) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

  const getContent = useCallback(() => {
    return editor.getText();
  }, [editor]);

  const countMatches = useCallback((text: string) => {
    if (!text) return 0;
    const content = getContent();
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    return (content.match(regex) || []).length;
  }, [getContent, caseSensitive]);

  const handleFindChange = (val: string) => {
    setFindText(val);
    setMatchCount(countMatches(val));
  };

  const findNext = () => {
    if (!findText) return;
    // Use browser's find API as TipTap doesn't have built-in find
    (window as Window & { find?: (...args: unknown[]) => boolean }).find?.(findText, caseSensitive, false, true, false, false, false);
  };

  const findPrev = () => {
    if (!findText) return;
    (window as Window & { find?: (...args: unknown[]) => boolean }).find?.(findText, caseSensitive, true, true, false, false, false);
  };

  const replaceNext = () => {
    if (!findText) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    const match = caseSensitive ? selectedText === findText : selectedText.toLowerCase() === findText.toLowerCase();
    if (match) {
      editor.chain().focus().deleteSelection().insertContent(replaceText).run();
    }
    findNext();
  };

  const replaceAll = () => {
    if (!findText) return;
    const html = editor.getHTML();
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    const newHtml = html.replace(regex, replaceText);
    editor.commands.setContent(newHtml);
    setMatchCount(0);
  };

  return (
    <div className="absolute top-2 right-4 bg-white border border-gray-200 rounded-xl shadow-2xl z-40 w-96 p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Replace size={16} />
          Find &amp; Replace
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={findText}
            onChange={(e) => handleFindChange(e.target.value)}
            placeholder="Find..."
            className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
            onKeyDown={(e) => e.key === 'Enter' && findNext()}
            autoFocus
          />
          <button onClick={findPrev} title="Previous" className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
            <ChevronUp size={16} />
          </button>
          <button onClick={findNext} title="Next" className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
            <ChevronDown size={16} />
          </button>
        </div>
        {findText && (
          <p className="text-xs text-gray-500">{matchCount} match{matchCount !== 1 ? 'es' : ''} found</p>
        )}
        <input
          type="text"
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          placeholder="Replace with..."
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="rounded"
            />
            Case sensitive
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={replaceNext}
            className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
          >
            Replace
          </button>
          <button
            onClick={replaceAll}
            className="flex-1 px-3 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Replace All
          </button>
        </div>
      </div>
    </div>
  );
}
