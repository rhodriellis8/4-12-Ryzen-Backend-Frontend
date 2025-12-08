
import React, { useState } from 'react';
import { Search, PenLine, Calendar, MoreHorizontal, Plus, Trash2, ImagePlus, X } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { uploadImageToStorage, deleteImageFromStorage } from '../lib/storage';
import type { JournalEntry, UploadedImage } from '../types/data';

interface JournalViewProps {
  entries: JournalEntry[];
  userId: string;
  onCreateEntry: () => Promise<JournalEntry>;
  onUpdateEntry: (entryId: string, updates: Partial<Pick<JournalEntry, 'title' | 'content' | 'preview' | 'images'>>) => void;
  onDeleteEntry: (entryId: string) => Promise<void>;
}

const JournalView: React.FC<JournalViewProps> = ({
  entries,
  userId,
  onCreateEntry,
  onUpdateEntry,
  onDeleteEntry,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(entries.length > 0 ? entries[0].id : null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const selectedEntry = entries.find(e => e.id === selectedId);

  const handleCreateEntry = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const newEntry = await onCreateEntry();
      setSelectedId(newEntry.id);
    } catch (err) {
      console.error('Failed to create entry:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEntry = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this journal entry?")) return;
    
    const entry = entries.find(item => item.id === id);
    if (entry?.images?.length) {
      await Promise.all(entry.images.map(image => deleteImageFromStorage(image.path)));
    }
    
    await onDeleteEntry(id);
    
    if (selectedId === id) {
      const remaining = entries.filter(e => e.id !== id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleUpdateField = (id: string, field: 'title' | 'content', value: string) => {
    const updates: Partial<Pick<JournalEntry, 'title' | 'content' | 'preview'>> = { [field]: value };
    if (field === 'content') {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = value;
      const text = tmp.textContent || tmp.innerText || "";
      updates.preview = text.slice(0, 50) + (text.length > 50 ? '...' : '');
    }
    onUpdateEntry(id, updates);
  };

  const handleEntryImageUpload = async (file: File) => {
    if (!selectedEntry) {
      throw new Error('Select a journal entry before uploading images.');
    }
    if (!userId) {
      throw new Error('Missing user session.');
    }
    setImageError(null);

    const uploaded = await uploadImageToStorage(file, {
      userId,
      entity: 'journals',
      entityId: selectedEntry.id,
    });

    onUpdateEntry(selectedEntry.id, {
      images: [...(selectedEntry.images ?? []), uploaded],
    });

    return uploaded.url;
  };

  const handleRemoveImage = async (entryId: string, image: UploadedImage) => {
    await deleteImageFromStorage(image.path);
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      onUpdateEntry(entryId, {
        images: (entry.images || []).filter(img => img.path !== image.path),
      });
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6">
      {/* Sidebar List */}
      <div className="w-80 flex flex-col gap-4">
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Search entries..." 
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={handleCreateEntry}
                disabled={isCreating}
                className="p-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
                title="New Entry"
            >
                <Plus size={16} className={isCreating ? 'animate-spin' : ''} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {entries.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase())).map(entry => (
                <div 
                    key={entry.id}
                    onClick={() => setSelectedId(entry.id)}
                    className={`group relative p-4 pr-10 rounded-xl border cursor-pointer transition-all ${
                        selectedId === entry.id 
                        ? 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-sm' 
                        : 'bg-transparent border-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50'
                    }`}
                >
                    <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-medium text-sm truncate flex-1 pr-2 ${selectedId === entry.id ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}>{entry.title}</h4>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 whitespace-nowrap">{entry.date}</span>
                            <button 
                                onClick={(e) => handleDeleteEntry(e, entry.id)}
                                className="p-1 text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete Entry"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2">{entry.preview}</p>
                    {entry.images.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {entry.images.slice(0, 2).map(img => (
                          <div key={img.path} className="w-8 h-8 rounded border border-zinc-200 dark:border-white/10 overflow-hidden">
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {entry.images.length > 2 && (
                          <span className="text-[10px] text-zinc-400">+{entry.images.length - 2}</span>
                        )}
                      </div>
                    )}
                </div>
            ))}
            {entries.length === 0 && (
                <div className="text-center py-10 text-zinc-400 text-xs">
                    No entries found.
                </div>
            )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        {selectedEntry ? (
            <>
                <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
                    <div className="flex flex-col gap-1 w-full mr-4">
                        <input 
                            type="text" 
                            value={selectedEntry.title}
                            onChange={(e) => handleUpdateField(selectedEntry.id, 'title', e.target.value)}
                            className="bg-transparent text-xl font-geist font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none placeholder-zinc-500 w-full"
                        />
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Calendar size={12} />
                            <span>{selectedEntry.date}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    <RichTextEditor 
                        initialContent={selectedEntry.content}
                        onChange={(content) => handleUpdateField(selectedEntry.id, 'content', content)}
                        className="flex-1 border-none rounded-none"
                        placeholder="Write your journal entry here..."
                        onUploadImage={(file) =>
                          handleEntryImageUpload(file).catch(err => {
                            setImageError(err.message || 'Unable to upload image.');
                            throw err;
                          })
                        }
                    />
                    {(selectedEntry.images.length > 0 || imageError) && (
                      <div className="border-t border-zinc-100 dark:border-white/5 bg-zinc-50/60 dark:bg-zinc-900/40 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-zinc-500">
                            <ImagePlus size={14} />
                            Attachments
                          </div>
                          <span className="text-[10px] text-zinc-400">{selectedEntry.images.length} files</span>
                        </div>
                        {imageError && (
                          <p className="text-[11px] text-rose-500 mb-2">{imageError}</p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {selectedEntry.images.map(image => (
                            <div key={image.path} className="relative group rounded-lg border border-zinc-200 dark:border-white/10 overflow-hidden">
                              <img src={image.url} alt="" className="w-full h-28 object-cover" />
                              <button
                                onClick={() => handleRemoveImage(selectedEntry.id, image)}
                                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove image"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {selectedEntry.images.length === 0 && !imageError && (
                            <div className="text-xs text-zinc-400">No screenshots added yet.</div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-4">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-2">
                    <PenLine size={24} className="text-zinc-400" />
                </div>
                <p>Select an entry or create a new one</p>
                <button 
                    onClick={handleCreateEntry}
                    disabled={isCreating}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-60"
                >
                    <Plus size={16} className={isCreating ? 'animate-spin' : ''} />
                    <span>Create Entry</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default JournalView;
