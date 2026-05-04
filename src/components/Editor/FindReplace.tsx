'use client';

import { useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { X, ChevronUp, ChevronDown, Replace } from 'lucide-react';

interface FindReplaceProps {
  editor: Editor;
  onClose: () => void;
}

/** Build a case-aware regex from a literal search string. */
function buildRegex(text: string, caseSensitive: boolean): RegExp {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, caseSensitive ? 'g' : 'gi');
}

/**
 * Collect all match positions ({from, to}) by walking the ProseMirror document tree.
 * This avoids operating on raw HTML and works safely at the node level.
 */
function findAllMatches(editor: Editor, pattern: RegExp): Array<{ from: number; to: number }> {
  const results: Array<{ from: number; to: number }> = [];
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;
    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(node.text)) !== null) {
      results.push({ from: pos + m.index, to: pos + m.index + m[0].length });
    }
  });
  return results;
}

/** Select a match in the editor and scroll it into view. */
function selectMatch(editor: Editor, match: { from: number; to: number }) {
  editor.chain().focus().setTextSelection({ from: match.from, to: match.to }).scrollIntoView().run();
}

export default function FindReplace({ editor, onClose }: FindReplaceProps) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [matches, setMatches] = useState<Array<{ from: number; to: number }>>([]);

  /**
   * Recompute matches and immediately jump to the first result.
   * Returns the updated match list so callers can use it without waiting for state.
   */
  const computeMatches = useCallback(
    (text: string, cs: boolean) => {
      if (!text) {
        setMatches([]);
        setCurrentIndex(-1);
        return [];
      }
      const found = findAllMatches(editor, buildRegex(text, cs));
      setMatches(found);
      if (found.length > 0) {
        setCurrentIndex(0);
        selectMatch(editor, found[0]);
      } else {
        setCurrentIndex(-1);
      }
      return found;
    },
    [editor]
  );

  const handleFindChange = (val: string) => {
    setFindText(val);
    computeMatches(val, caseSensitive);
  };

  const handleCaseChange = (cs: boolean) => {
    setCaseSensitive(cs);
    computeMatches(findText, cs);
  };

  const findNext = useCallback(() => {
    if (matches.length === 0) return;
    const next = (currentIndex + 1) % matches.length;
    setCurrentIndex(next);
    selectMatch(editor, matches[next]);
  }, [editor, matches, currentIndex]);

  const findPrev = useCallback(() => {
    if (matches.length === 0) return;
    const prev = (currentIndex - 1 + matches.length) % matches.length;
    setCurrentIndex(prev);
    selectMatch(editor, matches[prev]);
  }, [editor, matches, currentIndex]);

  const replaceNext = useCallback(() => {
    if (matches.length === 0 || currentIndex < 0) return;
    const { from, to } = matches[currentIndex];
    editor.chain().focus().setTextSelection({ from, to }).deleteSelection().insertContent(replaceText).run();
    const newMatches = computeMatches(findText, caseSensitive);
    const next = Math.min(currentIndex, newMatches.length - 1);
    if (newMatches.length > 0) {
      setCurrentIndex(next);
      selectMatch(editor, newMatches[next]);
    }
  }, [editor, matches, currentIndex, replaceText, findText, caseSensitive, computeMatches]);

  /**
   * Replace all occurrences using a single ProseMirror transaction so the
   * operation is atomic and positions stay correct (processed ascending with offset).
   */
  const replaceAll = useCallback(() => {
    if (!findText || matches.length === 0) return;
    const sorted = [...matches].sort((a, b) => a.from - b.from);
    const { tr, schema } = editor.state;
    let offset = 0;
    sorted.forEach(({ from, to }) => {
      const af = from + offset;
      const at = to + offset;
      if (replaceText) {
        tr.replaceWith(af, at, schema.text(replaceText));
      } else {
        tr.delete(af, at);
      }
      offset += replaceText.length - (to - from);
    });
    editor.view.dispatch(tr);
    computeMatches(findText, caseSensitive);
  }, [editor, findText, caseSensitive, replaceText, matches, computeMatches]);

  const matchLabel =
    findText && matches.length > 0
      ? `${currentIndex + 1} / ${matches.length}`
      : findText
      ? 'No matches'
      : '';

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
          <p className={`text-xs ${matches.length === 0 ? 'text-red-500' : 'text-gray-500'}`}>
            {matchLabel}
          </p>
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
              onChange={(e) => handleCaseChange(e.target.checked)}
              className="rounded"
            />
            Case sensitive
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={replaceNext}
            disabled={matches.length === 0}
            className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Replace
          </button>
          <button
            onClick={replaceAll}
            disabled={matches.length === 0}
            className="flex-1 px-3 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Replace All
          </button>
        </div>
      </div>
    </div>
  );
}
