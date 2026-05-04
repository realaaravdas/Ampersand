'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CharacterCount } from '@tiptap/extension-character-count';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AmpDocument, SaveStatus } from '@/types/document';
import { useAutosave } from '@/hooks/useAutosave';
import Toolbar from './Toolbar';
import StatusBar from './StatusBar';
import FindReplace from './FindReplace';
import LinkDialog from '../Dialogs/LinkDialog';
import TableDialog from '../Dialogs/TableDialog';
import ExportDialog from '../Dialogs/ExportDialog';
import { exportToHtml, exportToText } from '@/lib/ampFormat';
import { Save, Download, Search, Pencil, Check, X } from 'lucide-react';

interface AmpersandEditorProps {
  document: AmpDocument | null;
  onSave: (updates: Partial<AmpDocument>) => Promise<void>;
  onTitleChange: (title: string) => void;
}

export default function AmpersandEditor({ document, onSave, onTitleChange }: AmpersandEditorProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [zoom, setZoom] = useState(1);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(document?.title || 'Untitled Document');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const isLoadingRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: false,
        underline: false,
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' } }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full rounded' } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: 'Start typing your document…' }),
      CharacterCount,
    ],
    content: document?.content ? JSON.parse(document.content) : '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[600px] p-0',
        spellcheck: 'true',
      },
    },
    onUpdate: ({ editor: e }) => {
      if (!isLoadingRef.current) {
        triggerSave();
      }
    },
  });

  const performSave = useCallback(async () => {
    if (!editor || !document) return;
    const content = JSON.stringify(editor.getJSON());
    const text = editor.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = editor.storage.characterCount?.characters() ?? text.length;
    await onSave({ content, wordCount: words, charCount: chars });
  }, [editor, document, onSave]);

  const { triggerSave } = useAutosave(performSave, setSaveStatus, 2000);

  // Reload content when doc changes
  useEffect(() => {
    if (!editor || !document) return;
    isLoadingRef.current = true;
    const newContent = document.content ? JSON.parse(document.content) : { type: 'doc', content: [] };
    editor.commands.setContent(newContent, { emitUpdate: false });
    setTitleValue(document.title);
    setSaveStatus('saved');
    setTimeout(() => { isLoadingRef.current = false; }, 100);
  }, [document?.id, editor]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'h') { e.preventDefault(); setShowFindReplace((v) => !v); }
      if (mod && e.key === 'k') { e.preventDefault(); if (editor) setShowLinkDialog(true); }
      if (mod && e.key === '=') { e.preventDefault(); setZoom((z) => Math.min(z + 0.1, 2)); }
      if (mod && e.key === '-') { e.preventDefault(); setZoom((z) => Math.max(z - 0.1, 0.5)); }
      if (mod && e.key === 'p') { e.preventDefault(); window.print(); }
      if (mod && e.key === 's') { e.preventDefault(); performSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editor, performSave]);

  const handleInsertImage = () => {
    if (!editor) return;
    const url = window.prompt('Enter image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const handleExportHtml = () => {
    if (!editor) return;
    const html = exportToHtml(editor.getHTML(), titleValue);
    downloadFile(html, `${titleValue}.html`, 'text/html');
  };

  const handleExportText = () => {
    if (!editor) return;
    const text = exportToText(editor.getHTML());
    downloadFile(text, `${titleValue}.txt`, 'text/plain');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = editor
    ? editor.getText().trim()
      ? editor.getText().trim().split(/\s+/).length
      : 0
    : 0;
  const charCount = editor?.storage.characterCount?.characters() ?? 0;

  const titleConfirm = () => {
    setEditingTitle(false);
    if (titleValue.trim()) {
      onTitleChange(titleValue.trim());
    } else {
      setTitleValue(document?.title || 'Untitled Document');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#2d2d2d]">
      {/* Top Bar */}
      <div className="bg-[#1e1e2e] border-b border-gray-700/50 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {editingTitle ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                ref={titleInputRef}
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={titleConfirm}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') titleConfirm();
                  if (e.key === 'Escape') { setEditingTitle(false); setTitleValue(document?.title || 'Untitled Document'); }
                }}
                className="flex-1 bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500 max-w-xs"
                autoFocus
              />
              <button onClick={titleConfirm} className="text-green-400 hover:text-green-300">
                <Check size={16} />
              </button>
              <button onClick={() => { setEditingTitle(false); setTitleValue(document?.title || 'Untitled Document'); }} className="text-gray-400 hover:text-gray-300">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="flex items-center gap-2 text-white text-sm font-medium hover:text-purple-300 transition-colors group"
              title="Click to rename"
            >
              <span className="truncate max-w-xs">{titleValue || 'Untitled Document'}</span>
              <Pencil size={13} className="text-gray-500 group-hover:text-purple-400 flex-shrink-0" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowFindReplace((v) => !v)}
            title="Find & Replace (Ctrl+H)"
            className={`p-1.5 rounded transition-colors ${showFindReplace ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            <Search size={16} />
          </button>
          <button
            onClick={() => setShowExportDialog(true)}
            title="Export"
            className="p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white rounded transition-colors"
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => { performSave(); setSaveStatus('saving'); }}
            title="Save (Ctrl+S)"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors"
          >
            <Save size={14} />
            Save
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        editor={editor}
        onInsertLink={() => setShowLinkDialog(true)}
        onInsertTable={() => setShowTableDialog(true)}
        onInsertImage={handleInsertImage}
        onExport={() => setShowExportDialog(true)}
      />

      {/* Editor Area */}
      <div className="flex-1 overflow-auto bg-[#f0f0f0] relative" id="editor-scroll-area">
        {/* Find Replace */}
        {showFindReplace && editor && (
          <div className="relative">
            <FindReplace editor={editor} onClose={() => setShowFindReplace(false)} />
          </div>
        )}

        {/* A4 Page */}
        <div className="flex justify-center py-8 px-4 min-h-full">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              width: '794px',
              minHeight: '1123px',
            }}
          >
            <div
              className="bg-white shadow-2xl mx-auto"
              style={{
                width: '794px',
                minHeight: '1123px',
                padding: '72px 80px',
              }}
            >
              {document ? (
                <EditorContent editor={editor} />
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold text-gray-300">&amp;</span>
                    </div>
                    <p className="text-lg font-medium text-gray-500">No document selected</p>
                    <p className="text-sm mt-1">Select a document from the sidebar or create a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        wordCount={wordCount}
        charCount={charCount}
        saveStatus={saveStatus}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(z + 0.1, 2))}
        onZoomOut={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
        onZoomReset={() => setZoom(1)}
      />

      {/* Dialogs */}
      {showLinkDialog && editor && (
        <LinkDialog editor={editor} onClose={() => setShowLinkDialog(false)} />
      )}
      {showTableDialog && editor && (
        <TableDialog editor={editor} onClose={() => setShowTableDialog(false)} />
      )}
      {showExportDialog && (
        <ExportDialog
          title={titleValue}
          onClose={() => setShowExportDialog(false)}
          onExportHtml={handleExportHtml}
          onExportText={handleExportText}
          onPrint={() => window.print()}
        />
      )}
    </div>
  );
}
