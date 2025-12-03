
import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, X, ChevronRight, CheckSquare, ListChecks, ImagePlus, Loader2 } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { uploadImageToStorage, deleteImageFromStorage } from '../lib/storage';
import type { Playbook, UploadedImage } from '../types/data';

interface PlaybookRule {
  id: string;
  text: string;
  completed: boolean;
}

interface PlaybooksViewProps {
  playbooks: Playbook[];
  userId: string;
  onCreatePlaybook: (playbook: Omit<Playbook, 'id' | 'user_id' | 'created_at'>) => Promise<Playbook>;
  onUpdatePlaybook: (playbookId: string, updates: Partial<Pick<Playbook, 'title' | 'description' | 'tags' | 'rules' | 'images'>>) => void;
  onDeletePlaybook: (playbookId: string) => Promise<void>;
}

const PlaybooksView: React.FC<PlaybooksViewProps> = ({
  playbooks,
  userId,
  onCreatePlaybook,
  onUpdatePlaybook,
  onDeletePlaybook,
}) => {
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Creation State
  const [newPlaybookTitle, setNewPlaybookTitle] = useState('');
  const [newPlaybookDesc, setNewPlaybookDesc] = useState('');
  const [newRules, setNewRules] = useState<string[]>(['']);
  const [newPlaybookImages, setNewPlaybookImages] = useState<UploadedImage[]>([]);
  const [newPlaybookIdSeed, setNewPlaybookIdSeed] = useState<string | null>(null);
  const [creationImageError, setCreationImageError] = useState<string | null>(null);
  const [playbookImageError, setPlaybookImageError] = useState<string | null>(null);
  const [uploadingPlaybookId, setUploadingPlaybookId] = useState<string | null>(null);
  const detailUploadInputRef = useRef<HTMLInputElement>(null);
  const skipDraftCleanupRef = useRef(false);

  // Keep selected playbook in sync with playbooks array
  useEffect(() => {
    if (selectedPlaybook) {
      const refreshed = playbooks.find(pb => pb.id === selectedPlaybook.id);
      if (refreshed) {
        setSelectedPlaybook(refreshed);
      } else {
        setSelectedPlaybook(null);
      }
    }
  }, [playbooks, selectedPlaybook?.id]);

  // Clean up draft images if modal is closed without saving
  useEffect(() => {
    if (!isCreating && newPlaybookImages.length && !skipDraftCleanupRef.current) {
      (async () => {
        await Promise.all(newPlaybookImages.map(image => deleteImageFromStorage(image.path)));
        setNewPlaybookImages([]);
      })();
    }
    if (!isCreating) {
      skipDraftCleanupRef.current = false;
    }
  }, [isCreating, newPlaybookImages]);

  const handleCreate = async () => {
    if (!newPlaybookTitle.trim() || isSubmitting) return;
    
    const rules: PlaybookRule[] = newRules
      .filter(r => r.trim() !== '')
      .map((r, i) => ({
        id: `rule-${Date.now()}-${i}`,
        text: r,
        completed: false,
      }));

    const playbookData: Omit<Playbook, 'id' | 'user_id' | 'created_at'> = {
      title: newPlaybookTitle,
      description: newPlaybookDesc || '<p>No description provided.</p>',
      tags: ['New'],
      rules: rules.length > 0 ? rules : [{ id: 'default-rule', text: 'Define your first rule...', completed: false }],
      images: newPlaybookImages,
    };

    setIsSubmitting(true);
    skipDraftCleanupRef.current = true;
    
    try {
      await onCreatePlaybook(playbookData);
      setIsCreating(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create playbook:', err);
      skipDraftCleanupRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewPlaybookTitle('');
    setNewPlaybookDesc('');
    setNewRules(['']);
    setNewPlaybookImages([]);
    setNewPlaybookIdSeed(null);
    setCreationImageError(null);
  };

  const handleDeletePlaybook = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this playbook?")) return;

    const target = playbooks.find(pb => pb.id === id);
    if (target?.images?.length) {
      await Promise.all(target.images.map(image => deleteImageFromStorage(image.path)));
    }
    
    await onDeletePlaybook(id);
    
    if (selectedPlaybook?.id === id) {
      setSelectedPlaybook(null);
    }
  };

  const handleAddRuleInput = () => setNewRules([...newRules, '']);
  
  const handleRuleChange = (index: number, val: string) => {
    const updated = [...newRules];
    updated[index] = val;
    setNewRules(updated);
  };

  const openCreationModal = () => {
    setNewPlaybookIdSeed(Date.now().toString());
    setNewPlaybookImages([]);
    setCreationImageError(null);
    skipDraftCleanupRef.current = false;
    setIsCreating(true);
  };

  const ensureDraftPlaybookId = () => {
    if (!newPlaybookIdSeed) {
      const generated = Date.now().toString();
      setNewPlaybookIdSeed(generated);
      return generated;
    }
    return newPlaybookIdSeed;
  };

  const handleDraftImageUpload = async (file: File) => {
    if (!userId) {
      throw new Error('Missing user session.');
    }
    const draftId = ensureDraftPlaybookId();
    const uploaded = await uploadImageToStorage(file, {
      userId,
      entity: 'playbooks',
      entityId: draftId,
    });
    setNewPlaybookImages(prev => [...prev, uploaded]);
    return uploaded.url;
  };

  const handleRemoveDraftImage = async (image: UploadedImage) => {
    await deleteImageFromStorage(image.path);
    setNewPlaybookImages(prev => prev.filter(img => img.path !== image.path));
  };

  const handleExistingPlaybookImageUpload = async (playbookId: string, file: File) => {
    if (!userId) {
      throw new Error('Missing user session.');
    }
    setPlaybookImageError(null);
    setUploadingPlaybookId(playbookId);
    try {
      const uploaded = await uploadImageToStorage(file, {
        userId,
        entity: 'playbooks',
        entityId: playbookId,
      });
      const playbook = playbooks.find(pb => pb.id === playbookId);
      if (playbook) {
        onUpdatePlaybook(playbookId, { images: [...playbook.images, uploaded] });
      }
    } catch (err: any) {
      setPlaybookImageError(err?.message || 'Failed to upload screenshot.');
      throw err;
    } finally {
      setUploadingPlaybookId(null);
      if (detailUploadInputRef.current) {
        detailUploadInputRef.current.value = '';
      }
    }
  };

  const handleRemovePlaybookImage = async (playbookId: string, image: UploadedImage) => {
    await deleteImageFromStorage(image.path);
    const playbook = playbooks.find(pb => pb.id === playbookId);
    if (playbook) {
      onUpdatePlaybook(playbookId, {
        images: playbook.images.filter(img => img.path !== image.path),
      });
    }
  };

  return (
    <div className="relative pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-2xl font-geist font-light text-zinc-900 dark:text-white mb-1">Trading Playbooks</h2>
            <p className="text-sm text-zinc-500">Codify your edge with strict rule-based checklists.</p>
        </div>
        <button 
            onClick={openCreationModal}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
        >
            <Plus size={14} />
            <span>New Strategy</span>
        </button>
      </div>

      {/* Grid Layout - Static cards that open modal */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {playbooks.map(pb => (
            <div 
                key={pb.id} 
                onClick={() => setSelectedPlaybook(pb)}
                className="group relative bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all duration-300 rounded-lg flex flex-col cursor-pointer hover:shadow-md h-[180px]"
            >
                {/* Delete Button */}
                <div className="absolute top-3 right-3 z-[60]">
                    <button
                        onClick={(e) => handleDeletePlaybook(e, pb.id)}
                        className="p-1.5 bg-white dark:bg-zinc-800 text-zinc-400 hover:text-white hover:bg-rose-500 rounded-md transition-all shadow-sm border border-zinc-200 dark:border-zinc-700 opacity-60 hover:opacity-100 cursor-pointer"
                        title="Delete Playbook"
                        type="button"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>

                <div className="p-5 flex flex-col h-full">
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap pr-8">
                        {pb.tags.map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 rounded-[4px] text-[9px] uppercase font-bold tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                {tag}
                            </span>
                        ))}
                    </div>
                    
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2 leading-tight pr-6 font-geist">{pb.title}</h3>
                    
                    {/* Preview Description */}
                    <div className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-auto" 
                         dangerouslySetInnerHTML={{ __html: pb.description }} 
                    />
                    
                    <div className="pt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <ListChecks size={14} />
                            <span>{pb.rules.length} Rules</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors font-medium">
                            View Details <ChevronRight size={12} />
                        </div>
                    </div>
                </div>
            </div>
        ))}
        
        {/* Add New Placeholder */}
        {!isCreating && (
            <div 
                onClick={openCreationModal}
                className="h-[180px] border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center p-4 text-zinc-400 dark:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-500 transition-all cursor-pointer group"
            >
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus size={20} />
                </div>
                <span className="text-sm font-medium">Create Strategy</span>
            </div>
        )}
      </div>

      {/* View/Edit Modal */}
      {selectedPlaybook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={() => setSelectedPlaybook(null)}
            ></div>
            
            <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl p-0 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] overflow-hidden">
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-white/5 flex justify-between items-start bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div>
                        <div className="flex gap-2 mb-2">
                            {selectedPlaybook.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white font-geist">{selectedPlaybook.title}</h2>
                    </div>
                    <button 
                        onClick={() => setSelectedPlaybook(null)} 
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="mb-8">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Strategy Description</h4>
                        <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed prose dark:prose-invert max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: selectedPlaybook.description }} />
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Rules & Execution Checklist</h4>
                        <div className="space-y-3 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            {selectedPlaybook.rules.map((rule, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-2 rounded hover:bg-white dark:hover:bg-zinc-800/50 transition-colors">
                                    <div className="mt-0.5 text-zinc-400 dark:text-zinc-500">
                                        <CheckSquare size={16} />
                                    </div>
                                    <span className="text-sm text-zinc-700 dark:text-zinc-200 font-medium">{rule.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Screenshots & References</h4>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="file" 
                                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                                    className="hidden"
                                    ref={detailUploadInputRef}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file && selectedPlaybook) {
                                        handleExistingPlaybookImageUpload(selectedPlaybook.id, file).catch(() => {});
                                      }
                                    }}
                                />
                                <button
                                    onClick={() => detailUploadInputRef.current?.click()}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                    disabled={uploadingPlaybookId === selectedPlaybook.id}
                                >
                                    {uploadingPlaybookId === selectedPlaybook.id ? (
                                      <>
                                        <Loader2 size={12} className="animate-spin" />
                                        Uploading...
                                      </>
                                    ) : (
                                      <>
                                        <ImagePlus size={12} />
                                        Add Screenshot
                                      </>
                                    )}
                                </button>
                            </div>
                        </div>
                        {playbookImageError && (
                          <p className="text-[11px] text-rose-500 mb-2">{playbookImageError}</p>
                        )}
                        {selectedPlaybook.images.length === 0 ? (
                          <p className="text-xs text-zinc-400">No screenshots added yet.</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {selectedPlaybook.images.map(image => (
                              <div key={image.path} className="relative group rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                <img src={image.url} alt="" className="w-full h-24 object-cover" />
                                <button
                                  onClick={() => handleRemovePlaybookImage(selectedPlaybook.id, image)}
                                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remove image"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                </div>
                
                <div className="p-4 border-t border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/30 flex justify-end">
                    <button 
                        onClick={() => setSelectedPlaybook(null)}
                        className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={() => setIsCreating(false)}
            ></div>
            
            <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Create New Strategy</h3>
                    <button 
                        onClick={() => setIsCreating(false)} 
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
                
                <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Strategy Name</label>
                        <input 
                            type="text" 
                            value={newPlaybookTitle}
                            onChange={(e) => setNewPlaybookTitle(e.target.value)}
                            placeholder="e.g. 5-Minute Pullback" 
                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-1 focus:ring-zinc-400/20"
                            autoFocus
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Rules & Checklist</label>
                        <div className="space-y-2">
                            {newRules.map((rule, idx) => (
                                <input 
                                    key={idx}
                                    type="text"
                                    value={rule}
                                    onChange={(e) => handleRuleChange(idx, e.target.value)}
                                    placeholder={`Rule ${idx + 1}`}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-800 dark:text-zinc-300 focus:outline-none focus:border-zinc-400"
                                />
                            ))}
                            <button 
                                onClick={handleAddRuleInput}
                                className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1 mt-1"
                            >
                                <Plus size={12} /> Add another rule
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Strategy Narrative & Screenshots</label>
                        <RichTextEditor 
                            initialContent={newPlaybookDesc}
                            onChange={setNewPlaybookDesc}
                            placeholder="Briefly describe the edge..." 
                            className="min-h-[200px]"
                            onUploadImage={(file) =>
                              handleDraftImageUpload(file).catch(err => {
                                setCreationImageError(err.message || 'Unable to upload image.');
                                throw err;
                              })
                            }
                        />
                        {creationImageError && (
                          <p className="text-[11px] text-rose-500 mt-2">{creationImageError}</p>
                        )}
                        {newPlaybookImages.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">
                              <ImagePlus size={12} />
                              Draft Attachments
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {newPlaybookImages.map(image => (
                                <div key={image.path} className="relative group border border-zinc-200 dark:border-white/10 rounded-lg overflow-hidden">
                                  <img src={image.url} alt="" className="w-full h-24 object-cover" />
                                  <button
                                    onClick={() => handleRemoveDraftImage(image)}
                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove image"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-white/5 mt-4 shrink-0">
                    <button 
                        onClick={() => setIsCreating(false)} 
                        className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreate}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity font-medium shadow-sm disabled:opacity-60"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Strategy'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PlaybooksView;
