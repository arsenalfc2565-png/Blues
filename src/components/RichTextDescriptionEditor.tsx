import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading,
  Quote,
  Sparkles,
  Eye,
  Edit3,
  Tag,
  RotateCcw,
  Check,
  Layers,
  HelpCircle
} from 'lucide-react';

interface RichTextDescriptionEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  label?: string;
  category?: string;
}

export const RichTextDescriptionEditor: React.FC<RichTextDescriptionEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter comprehensive wholesale footwear specifications, material grade, sole flexion, sizing notes...',
  label = 'Product Description (Wholesale Specs & Boutique Appeal)',
  category,
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to insert or wrap markdown formatting around selection
  const applyFormat = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = value || '';
    const selectedText = currentText.substring(start, end);

    let replacement = '';
    if (selectedText.length > 0) {
      replacement = `${prefix}${selectedText}${suffix}`;
    } else {
      replacement = `${prefix}sample text${suffix}`;
    }

    const newText =
      currentText.substring(0, start) +
      replacement +
      currentText.substring(end);

    onChange(newText);

    // Restore cursor position inside formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + replacement.length - suffix.length
      );
    }, 10);
  };

  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange((value ? `${value}\n\n` : '') + snippet);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = value || '';

    const newText =
      currentText.substring(0, start) +
      snippet +
      currentText.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 10);
  };

  const insertBulletList = () => {
    applyFormat('\n• ', '');
  };

  const insertNumberedList = () => {
    applyFormat('\n1. ', '');
  };

  // Convert raw text/markdown to formatted HTML preview
  const renderFormattedPreview = (raw: string) => {
    if (!raw.trim()) {
      return (
        <div className="text-neutral-500 italic p-4 text-center">
          No description entered yet. Switch to "Write" mode to compose footwear details.
        </div>
      );
    }

    // Split paragraphs
    const paragraphs = raw.split(/\n\n+/);

    return (
      <div className="space-y-3 text-xs leading-relaxed text-neutral-200">
        {paragraphs.map((para, pIdx) => {
          const lines = para.split('\n');

          // Check if paragraph is a heading
          if (para.startsWith('### ') || para.startsWith('## ')) {
            const cleanHeading = para.replace(/^#+\s*/, '');
            return (
              <h4 key={pIdx} className="font-display font-bold text-sm text-blue-400 border-b border-neutral-800 pb-1 pt-1">
                {cleanHeading}
              </h4>
            );
          }

          // Check if lines are bullet lists
          if (lines.some((l) => l.trim().startsWith('•') || l.trim().startsWith('- '))) {
            return (
              <ul key={pIdx} className="list-disc list-inside space-y-1 pl-1 text-neutral-300">
                {lines.map((l, lIdx) => {
                  const itemText = l.replace(/^[\s•\-]+/, '');
                  return <li key={lIdx} dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />;
                })}
              </ul>
            );
          }

          // Check if numbered list
          if (lines.some((l) => /^\d+\.\s/.test(l.trim()))) {
            return (
              <ol key={pIdx} className="list-decimal list-inside space-y-1 pl-1 text-neutral-300">
                {lines.map((l, lIdx) => {
                  const itemText = l.replace(/^\d+\.\s*/, '');
                  return <li key={lIdx} dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />;
                })}
              </ol>
            );
          }

          // Regular paragraph with inline formatting
          return (
            <p key={pIdx} className="text-neutral-300" dangerouslySetInnerHTML={{ __html: formatInline(para) }} />
          );
        })}
      </div>
    );
  };

  const formatInline = (text: string) => {
    return text
      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      // Italic *text*
      .replace(/\*(.*?)\*/g, '<em class="italic text-neutral-300">$1</em>')
      // Underline <u>text</u>
      .replace(/<u>(.*?)<\/u>/g, '<u class="underline decoration-blue-400">$1</u>')
      // Badges [Tag]
      .replace(/\[(.*?)\]/g, '<span class="inline-block bg-blue-950/80 text-blue-300 border border-blue-800/80 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mx-0.5">$1</span>')
      // Linebreaks
      .replace(/\n/g, '<br />');
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div className="space-y-2">
      {/* Editor Top Bar: Label + Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-neutral-300 font-bold text-xs flex items-center gap-1.5">
          <Edit3 className="w-3.5 h-3.5 text-blue-400" />
          <span>{label}</span>
        </label>

        <div className="flex items-center gap-2">
          {/* Write / Preview Tab Pill */}
          <div className="flex items-center bg-neutral-950 p-0.5 rounded-xl border border-neutral-800 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                activeTab === 'write'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Live Preview</span>
            </button>
          </div>

          <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">
            {wordCount} words · {charCount} chars
          </span>
        </div>
      </div>

      {/* Editor Frame */}
      <div className="bg-neutral-950 border border-neutral-700 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all shadow-md">
        {/* Formatting Toolbar */}
        <div className="p-2 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => applyFormat('**', '**')}
              title="Bold (**text**)"
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('*', '*')}
              title="Italic (*text*)"
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('<u>', '</u>')}
              title="Underline (<u>text</u>)"
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-neutral-800 mx-1" />

            <button
              type="button"
              onClick={() => applyFormat('### ', '')}
              title="Section Heading (### Title)"
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-0.5 text-[11px] font-bold"
            >
              <Heading className="w-3.5 h-3.5" />
              <span>H3</span>
            </button>
            <button
              type="button"
              onClick={insertBulletList}
              title="Bullet List"
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={insertNumberedList}
              title="Numbered List"
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('> ', '')}
              title="Highlight Quote Box"
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-neutral-800 mx-1" />

            <button
              type="button"
              onClick={() => applyFormat('[', ']')}
              title="Spec Badge ([Grade A])"
              className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-neutral-800 transition-colors flex items-center gap-1 text-[11px] font-bold"
            >
              <Tag className="w-3 h-3" />
              <span>[Badge]</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onChange('')}
            title="Clear text"
            className="p-1 text-neutral-500 hover:text-red-400 text-[10px] flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>

        {/* Editor Body */}
        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            rows={5}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 bg-transparent text-white text-xs leading-relaxed focus:outline-none placeholder:text-neutral-600 font-sans resize-y min-h-[130px]"
          />
        ) : (
          <div className="p-4 bg-neutral-900/60 min-h-[130px] overflow-y-auto max-h-56">
            {renderFormattedPreview(value)}
          </div>
        )}

        {/* Fast Snippet Presets Bar */}
        <div className="p-2.5 bg-neutral-900/90 border-t border-neutral-800 flex items-center gap-1.5 flex-wrap text-[10px]">
          <span className="text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Quick Inserts:</span>
          </span>

          <button
            type="button"
            onClick={() => insertSnippet(' [Genuine Calfskin Leather]')}
            className="px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            + Calfskin Leather
          </button>
          <button
            type="button"
            onClick={() => insertSnippet(' [Memory Foam Cushioning]')}
            className="px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            + Memory Foam
          </button>
          <button
            type="button"
            onClick={() => insertSnippet(' [Non-Slip Rubber Sole]')}
            className="px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            + Non-Slip Sole
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('\n\n### Wholesale Sizing Distribution:\n• Mandatory matched pairing ratio (42↔37, 41↔38, 40↔39) applies to carton orders.')}
            className="px-2 py-0.5 rounded-md bg-blue-950 border border-blue-800 text-blue-300 hover:bg-blue-900 transition-colors"
          >
            + Sizing Ratio Note
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('\n\n### Kisumu Depot Dispatch:\n• Same-day parcel loading onto 4:00 PM Western Kenya bus couriers.')}
            className="px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 transition-colors"
          >
            + Dispatch Guarantee
          </button>
        </div>
      </div>
    </div>
  );
};
