
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, 
  Undo, Redo, 
  Type, Highlighter, 
  Link as LinkIcon, Image as ImageIcon, 
  Eraser, Trash,
  Heading1, Heading2
} from 'lucide-react';

interface RichTextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  onUploadImage?: (file: File) => Promise<string>;
}

type ImageSize = 'sm' | 'md' | 'lg';

const applyImageSizeStyle = (img: HTMLImageElement, size: ImageSize) => {
  img.style.display = 'block';
  img.style.margin = '16px auto';
  img.style.height = 'auto';
  img.style.maxWidth = '100%';
  img.style.borderRadius = '8px';

  switch (size) {
    case 'sm':
      img.style.maxWidth = '260px';
      break;
    case 'lg':
      img.style.maxWidth = '720px';
      break;
    case 'md':
    default:
      img.style.maxWidth = '480px';
      break;
  }

  img.dataset.size = size;
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  initialContent, 
  onChange, 
  placeholder = "Start typing...", 
  className = "",
  onUploadImage
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const highlightInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

  // Save current selection before clicking toolbar buttons
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, []);

  // Restore selection before executing commands
  const restoreSelection = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return false;
    
    editor.focus();
    
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
        return true;
      }
    }
    return false;
  }, []);

  // Handle content updates from parent
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialContent) {
      editorRef.current.innerHTML = initialContent;

      const imgs = Array.from(editorRef.current.querySelectorAll('img'));
      imgs.forEach((img) => {
        const imageEl = img as HTMLImageElement;
        const size = (imageEl.dataset.size as ImageSize | undefined) ?? 'md';
        applyImageSizeStyle(imageEl, size);
      });
    }
  }, [initialContent]);

  // Track image selection for resizing controls
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && target.tagName === 'IMG') {
        setSelectedImage(target as HTMLImageElement);
      } else {
        setSelectedImage(null);
      }
    };

    editor.addEventListener('click', handleClick);
    return () => {
      editor.removeEventListener('click', handleClick);
    };
  }, []);

  // Track selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editorRef.current?.contains(range.commonAncestorContainer)) {
          savedSelectionRef.current = range.cloneRange();
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const execCommand = useCallback((command: string, value: string | undefined = undefined) => {
    restoreSelection();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange, restoreSelection]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleClearContent = () => {
    if (editorRef.current) {
      if (confirm("Are you sure you want to clear all content?")) {
        editorRef.current.innerHTML = '';
        onChange('');
      }
    }
  };

  const triggerColorPicker = (type: 'foreColor' | 'hiliteColor') => {
    saveSelection();
    if (type === 'foreColor' && colorInputRef.current) {
      colorInputRef.current.click();
    } else if (type === 'hiliteColor' && highlightInputRef.current) {
      highlightInputRef.current.click();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>, command: string) => {
    restoreSelection();
    document.execCommand(command, false, e.target.value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertImageAtCursor = (url: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    
    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    applyImageSizeStyle(img, 'md');

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(img);
      range.setStartAfter(img);
      range.setEndAfter(img);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editor.appendChild(img);
    }

    setSelectedImage(img);
    onChange(editor.innerHTML);
  };

  const handleFiles = async (files: File[] | FileList) => {
    if (!onUploadImage) return;
    const list = Array.from(files as FileList | File[]);
    if (!list.length) return;
    setIsUploading(true);
    setUploadError(null);
    for (const file of list) {
      try {
        const url = await onUploadImage(file);
        if (url) {
          insertImageAtCursor(url);
        }
      } catch (err: any) {
        setUploadError(err?.message || 'Failed to upload image.');
      }
    }
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (!onUploadImage) return;
    const items = event.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length) {
      event.preventDefault();
      handleFiles(files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!onUploadImage) return;
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      handleFiles(files);
    }
  };

  const handleImageButtonClick = () => {
    saveSelection();
    if (onUploadImage && fileInputRef.current) {
      fileInputRef.current.click();
      return;
    }
    const url = prompt('Enter Image URL:');
    if (url) {
      restoreSelection();
      insertImageAtCursor(url);
    }
  };

  const handleLinkClick = () => {
    saveSelection();
    const url = prompt('Enter URL:');
    if (url) {
      restoreSelection();
      document.execCommand('createLink', false, url);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    icon: Icon, 
    active = false, 
    title,
    disabled = false
  }: { onClick: () => void, icon: any, active?: boolean, title: string, disabled?: boolean }) => (
    <button
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent losing focus/selection
        saveSelection();
      }}
      onClick={(e) => { 
        e.preventDefault(); 
        onClick(); 
      }}
      className={`p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ${
        active ? 'bg-zinc-200 dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={title}
      type="button"
      disabled={disabled}
    >
      <Icon size={16} />
    </button>
  );

  const Divider = () => <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1 self-center" />;

  return (
    <div className={`flex flex-col border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 ${className}`}>
      
      {/* Hidden Color Inputs */}
      <input 
        type="color" 
        ref={colorInputRef} 
        className="hidden" 
        onChange={(e) => handleColorChange(e, 'foreColor')} 
      />
      <input 
        type="color" 
        ref={highlightInputRef} 
        className="hidden" 
        onChange={(e) => handleColorChange(e, 'hiliteColor')} 
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-50 dark:bg-[#1a1a1a] border-b border-zinc-200 dark:border-zinc-800">
        <input 
          type="file" 
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        
        {/* History */}
        <div className="flex gap-0.5">
          <ToolbarButton onClick={() => execCommand('undo')} icon={Undo} title="Undo (Ctrl+Z)" />
          <ToolbarButton onClick={() => execCommand('redo')} icon={Redo} title="Redo (Ctrl+Y)" />
        </div>
        <Divider />

        {/* Structure */}
        <div className="flex gap-0.5">
          <ToolbarButton onClick={() => execCommand('formatBlock', '<p>')} icon={Type} title="Paragraph" />
          <ToolbarButton onClick={() => execCommand('formatBlock', '<h1>')} icon={Heading1} title="Heading 1" />
          <ToolbarButton onClick={() => execCommand('formatBlock', '<h2>')} icon={Heading2} title="Heading 2" />
        </div>
        <Divider />

        {/* Formatting */}
        <div className="flex gap-0.5">
          <ToolbarButton onClick={() => execCommand('bold')} icon={Bold} title="Bold (Ctrl+B)" />
          <ToolbarButton onClick={() => execCommand('italic')} icon={Italic} title="Italic (Ctrl+I)" />
          <ToolbarButton onClick={() => execCommand('underline')} icon={Underline} title="Underline (Ctrl+U)" />
          <ToolbarButton onClick={() => execCommand('strikeThrough')} icon={Strikethrough} title="Strikethrough" />
        </div>
        <Divider />

        {/* Colors */}
        <div className="flex gap-0.5 relative">
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => triggerColorPicker('foreColor')} 
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 group relative flex items-center justify-center"
            title="Text Color"
            type="button"
          >
            <div className="relative flex flex-col items-center">
              <Type size={14} />
              <div className="h-[3px] w-3 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full mt-[1px]"></div>
            </div>
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => triggerColorPicker('hiliteColor')}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 group relative flex items-center justify-center"
            title="Highlight"
            type="button"
          >
            <div className="relative flex flex-col items-center">
              <Highlighter size={14} />
              <div className="h-[3px] w-3 bg-yellow-400 rounded-full mt-[1px]"></div>
            </div>
          </button>
        </div>
        <Divider />

        {/* Lists & Alignment */}
        <div className="flex gap-0.5">
          <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} title="Bullet List" />
          <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={ListOrdered} title="Numbered List" />
          <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={AlignLeft} title="Align Left" />
          <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={AlignCenter} title="Align Center" />
          <ToolbarButton onClick={() => execCommand('justifyRight')} icon={AlignRight} title="Align Right" />
        </div>
        <Divider />

        {/* Media & Actions */}
        <div className="flex gap-0.5">
          <ToolbarButton onClick={handleLinkClick} icon={LinkIcon} title="Insert Link" />
          <ToolbarButton 
            onClick={handleImageButtonClick} 
            icon={ImageIcon} 
            title={onUploadImage ? 'Upload Image' : 'Insert Image URL'} 
            disabled={isUploading}
          />
          <ToolbarButton onClick={() => execCommand('removeFormat')} icon={Eraser} title="Clear Formatting" />
          
          <div className="ml-1 pl-1 border-l border-zinc-300 dark:border-zinc-700">
            <button
              onClick={handleClearContent}
              className="p-1.5 rounded hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-500 transition-colors"
              title="Clear All Content"
              type="button"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(event) => {
          if (onUploadImage) {
            event.preventDefault();
          }
        }}
        className="flex-1 p-6 focus:outline-none overflow-y-auto prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-300 min-h-[300px] outline-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_a]:text-emerald-500 [&_a]:underline"
        style={{ fontSize: '1rem' }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {/* Image size controls */}
      {selectedImage && (
        <div className="px-4 py-2 bg-zinc-50/80 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px]">
          <span className="text-zinc-500 dark:text-zinc-400 mr-3">
            Image size:
          </span>
          <div className="flex items-center gap-1">
            {(['sm', 'md', 'lg'] as ImageSize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  applyImageSizeStyle(selectedImage, size);
                  if (editorRef.current) {
                    onChange(editorRef.current.innerHTML);
                  }
                }}
                className={`px-2 py-0.5 rounded-full border text-[10px] ${
                  selectedImage.dataset.size === size
                    ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5'
                    : 'border-zinc-600/40 text-zinc-400 hover:border-zinc-400 hover:text-zinc-200'
                }`}
              >
                {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                applyImageSizeStyle(selectedImage, 'md');
                if (editorRef.current) {
                  onChange(editorRef.current.innerHTML);
                }
              }}
              className="ml-2 px-2 py-0.5 rounded-full text-[10px] text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/60"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="ml-2 px-2 py-0.5 rounded-full text-[10px] text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/60"
            >
              Done
            </button>
          </div>
        </div>
      )}
      
      {/* Footer Status */}
      <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-[10px] text-zinc-400">
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${isUploading ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`}></span>
          {isUploading ? 'Uploading image…' : 'Rich Text Mode'}
        </span>
        <span className={uploadError ? 'text-rose-500' : ''}>
          {uploadError || 'Auto-save enabled'}
        </span>
      </div>
    </div>
  );
};

export default RichTextEditor;
