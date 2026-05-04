'use client';

import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough, Code, Code2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Minus,
  Link, Image, Table, Undo, Redo,
  Highlighter, Palette, Type, ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

interface ToolbarProps {
  editor: Editor | null;
  onInsertLink: () => void;
  onInsertTable: () => void;
  onInsertImage: () => void;
  onExport: () => void;
}

const FONT_FAMILIES = ['Arial', 'Times New Roman', 'Georgia', 'Courier New', 'Verdana', 'Helvetica', 'Trebuchet MS'];
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96];

const TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc',
  '#d9d9d9', '#ffffff', '#ff0000', '#ff4500', '#ff9900', '#ffff00',
  '#00ff00', '#00ffff', '#0000ff', '#9900ff', '#ff00ff', '#e91e63',
  '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
  '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffc107', '#ff9800',
];

const HIGHLIGHT_COLORS = [
  '#ffff00', '#00ff00', '#00ffff', '#ff69b4', '#ffa500', '#da70d6',
  '#90ee90', '#add8e6', '#ffb6c1', '#ffe4b5', '#e0e0e0', '#ffffff',
];

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors text-sm ${
        active
          ? 'bg-purple-600 text-white'
          : disabled
          ? 'text-gray-500 cursor-not-allowed'
          : 'text-gray-200 hover:bg-gray-600 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-gray-600 mx-1" />;
}

export default function Toolbar({ editor, onInsertLink, onInsertTable, onInsertImage, onExport }: ToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showHeadings, setShowHeadings] = useState(false);
  const [customSize, setCustomSize] = useState('');

  if (!editor) return null;

  const currentFontFamily = editor.getAttributes('textStyle').fontFamily || 'Arial';
  const currentFontSize = editor.getAttributes('textStyle').fontSize || '16px';
  const currentSizeNum = parseInt(currentFontSize as string) || 16;

  const setFontSize = (size: number) => {
    editor.chain().focus().setFontSize(`${size}px`).run();
    setShowFontSize(false);
  };

  return (
    <div className="bg-[#2d2d2d] border-b border-gray-700 px-2 py-1.5 flex items-center gap-0.5 flex-wrap select-none">
      {/* Undo / Redo */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)" disabled={!editor.can().undo()}>
        <Undo size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)" disabled={!editor.can().redo()}>
        <Redo size={16} />
      </ToolbarButton>

      <Divider />

      {/* Font Family */}
      <div className="relative">
        <button
          onClick={() => { setShowFontFamily(!showFontFamily); setShowFontSize(false); setShowHeadings(false); }}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-200 hover:bg-gray-600 rounded min-w-[110px] justify-between"
          title="Font Family"
        >
          <span style={{ fontFamily: currentFontFamily }} className="truncate max-w-[85px]">{currentFontFamily}</span>
          <ChevronDown size={12} />
        </button>
        {showFontFamily && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[160px] py-1 max-h-48 overflow-y-auto">
            {FONT_FAMILIES.map((font) => (
              <button
                key={font}
                onClick={() => { editor.chain().focus().setFontFamily(font).run(); setShowFontFamily(false); }}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 ${currentFontFamily === font ? 'bg-purple-50 text-purple-700' : 'text-gray-800'}`}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Font Size */}
      <div className="relative">
        <button
          onClick={() => { setShowFontSize(!showFontSize); setShowFontFamily(false); setShowHeadings(false); }}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-200 hover:bg-gray-600 rounded w-16 justify-between"
          title="Font Size"
        >
          <span>{currentSizeNum}</span>
          <ChevronDown size={12} />
        </button>
        {showFontSize && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-24 py-1 max-h-48 overflow-y-auto">
            <div className="px-2 pb-1">
              <input
                type="number"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customSize) {
                    setFontSize(parseInt(customSize));
                    setCustomSize('');
                  }
                }}
                placeholder={String(currentSizeNum)}
                className="w-full border border-gray-300 rounded px-1.5 py-1 text-xs focus:outline-none"
              />
            </div>
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`w-full text-left px-3 py-1 text-sm hover:bg-gray-100 ${currentSizeNum === size ? 'bg-purple-50 text-purple-700' : 'text-gray-800'}`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      <Divider />

      {/* Headings */}
      <div className="relative">
        <button
          onClick={() => { setShowHeadings(!showHeadings); setShowFontFamily(false); setShowFontSize(false); }}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-200 hover:bg-gray-600 rounded"
          title="Heading"
        >
          <Type size={14} />
          <ChevronDown size={12} />
        </button>
        {showHeadings && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[140px] py-1">
            <button
              onClick={() => { editor.chain().focus().setParagraph().run(); setShowHeadings(false); }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 ${editor.isActive('paragraph') ? 'text-purple-700 bg-purple-50' : 'text-gray-800'}`}
            >
              Paragraph
            </button>
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <button
                key={level}
                onClick={() => { editor.chain().focus().toggleHeading({ level: level as 1|2|3|4|5|6 }).run(); setShowHeadings(false); }}
                className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 ${editor.isActive('heading', { level }) ? 'text-purple-700 bg-purple-50' : 'text-gray-800'}`}
                style={{ fontSize: `${Math.max(10, 18 - level * 2)}px`, fontWeight: 600 }}
              >
                Heading {level}
              </button>
            ))}
          </div>
        )}
      </div>

      <Divider />

      {/* Text formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">
        <Underline size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
        <Strikethrough size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code">
        <Code size={15} />
      </ToolbarButton>

      <Divider />

      {/* Text Color */}
      <div className="relative">
        <button
          onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); }}
          className="p-1.5 rounded hover:bg-gray-600 flex flex-col items-center"
          title="Text Color"
        >
          <Palette size={15} className="text-gray-200" />
          <div
            className="w-3.5 h-1 rounded-sm mt-0.5"
            style={{ backgroundColor: editor.getAttributes('textStyle').color || '#ffffff' }}
          />
        </button>
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-2 w-[184px]">
            <div className="text-xs text-gray-500 mb-1.5">Text Color</div>
            <div className="grid grid-cols-6 gap-1">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => { editor.chain().focus().setColor(color).run(); setShowColorPicker(false); }}
                  className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <button
              onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
              className="mt-2 w-full text-xs text-center text-gray-500 hover:text-gray-700"
            >
              Reset Color
            </button>
          </div>
        )}
      </div>

      {/* Highlight Color */}
      <div className="relative">
        <button
          onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); }}
          className="p-1.5 rounded hover:bg-gray-600 flex flex-col items-center"
          title="Highlight Color"
        >
          <Highlighter size={15} className="text-gray-200" />
          <div
            className="w-3.5 h-1 rounded-sm mt-0.5"
            style={{ backgroundColor: editor.getAttributes('highlight').color || '#ffff00' }}
          />
        </button>
        {showHighlightPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-2 w-[152px]">
            <div className="text-xs text-gray-500 mb-1.5">Highlight Color</div>
            <div className="grid grid-cols-6 gap-1">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => { editor.chain().focus().setHighlight({ color }).run(); setShowHighlightPicker(false); }}
                  className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <button
              onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowHighlightPicker(false); }}
              className="mt-2 w-full text-xs text-center text-gray-500 hover:text-gray-700"
            >
              No Highlight
            </button>
          </div>
        )}
      </div>

      <Divider />

      {/* Alignment */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
        <AlignLeft size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
        <AlignCenter size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
        <AlignRight size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
        <AlignJustify size={15} />
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
        <Quote size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
        <Code2 size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
        <Minus size={15} />
      </ToolbarButton>

      <Divider />

      {/* Insert */}
      <ToolbarButton onClick={onInsertLink} active={editor.isActive('link')} title="Insert Link (Ctrl+K)">
        <Link size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={onInsertImage} title="Insert Image">
        <Image size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={onInsertTable} title="Insert Table">
        <Table size={15} />
      </ToolbarButton>
    </div>
  );
}
