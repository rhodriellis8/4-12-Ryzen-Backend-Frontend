
import React, { useEffect, useMemo, useState } from 'react';
import { Book, Plus, ArrowLeft, Link as LinkIcon, FileText, Trash2, X } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import type { Notebook, NotebookPage } from '../types/data';

interface NotebookViewProps {
  notebooks: Notebook[];
  onCreateNotebook: (title: string) => Promise<Notebook>;
  onDeleteNotebook: (id: string) => Promise<void>;
  onCreatePage: (notebookId: string) => Promise<NotebookPage>;
  onDeletePage: (notebookId: string, pageId: string) => Promise<void>;
  onUpdatePage: (notebookId: string, pageId: string, updates: { title?: string; content?: string }) => void;
  onAddResource: (notebookId: string, resource: { title: string; url: string }) => Promise<void>;
  onDeleteResource: (notebookId: string, resourceId: string) => Promise<void>;
  isSyncing?: boolean;
}

const NotebookView: React.FC<NotebookViewProps> = ({
  notebooks,
  onCreateNotebook,
  onDeleteNotebook,
  onCreatePage,
  onDeletePage,
  onUpdatePage,
  onAddResource,
  onDeleteResource,
  isSyncing = false,
}) => {
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [pageTitleDraft, setPageTitleDraft] = useState('');
  const [pageContentDraft, setPageContentDraft] = useState('');
  const [pendingNotebookAction, setPendingNotebookAction] = useState<string | null>(null);
  const [pendingPageAction, setPendingPageAction] = useState<string | null>(null);

  const selectedNotebook = useMemo(
    () => notebooks.find(nb => nb.id === selectedNotebookId) ?? null,
    [notebooks, selectedNotebookId]
  );

  const selectedPage = useMemo(
    () => selectedNotebook?.pages.find(page => page.id === selectedPageId) ?? null,
    [selectedNotebook, selectedPageId]
  );

  useEffect(() => {
    if (!notebooks.length) {
      // No notebooks at all – ensure we're on the grid view
      setSelectedNotebookId(null);
      setSelectedPageId(null);
      return;
    }

    // If a notebook is currently selected but no longer exists (e.g. deleted),
    // fall back to the first available notebook.
    if (selectedNotebookId && !notebooks.some(nb => nb.id === selectedNotebookId)) {
      setSelectedNotebookId(notebooks[0].id);
    }
    // If selectedNotebookId is null, stay on the grid view – don't auto‑open.
  }, [notebooks, selectedNotebookId]);

  useEffect(() => {
    if (!selectedNotebook) {
      setSelectedPageId(null);
      return;
    }
    if (selectedNotebook.pages.length === 0) {
      setSelectedPageId(null);
      return;
    }
    if (!selectedPageId || !selectedNotebook.pages.some(page => page.id === selectedPageId)) {
      setSelectedPageId(selectedNotebook.pages[0].id);
    }
  }, [selectedNotebook, selectedPageId]);

  useEffect(() => {
    setPageTitleDraft(selectedPage?.title ?? '');
    setPageContentDraft(selectedPage?.content ?? '');
  }, [selectedPage?.id]);

  const handleCreateNotebook = async () => {
    if (!newNotebookTitle.trim()) return;
    const created = await onCreateNotebook(newNotebookTitle.trim());
    setIsCreatingNotebook(false);
    setNewNotebookTitle('');
    setSelectedNotebookId(created.id);
    if (created.pages.length) {
      setSelectedPageId(created.pages[0].id);
    } else {
      setSelectedPageId(null);
    }
  };

  const handleDeleteNotebook = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this notebook?')) return;
    setPendingNotebookAction(id);
    await onDeleteNotebook(id);
    setPendingNotebookAction(null);
    if (selectedNotebookId === id) {
      setSelectedNotebookId(null);
      setSelectedPageId(null);
    }
  };

  const openNotebook = (id: string) => {
    setSelectedNotebookId(id);
  };

  const handleCreatePage = async () => {
    if (!selectedNotebook) return;
    setPendingPageAction('create');
    try {
      const newPage = await onCreatePage(selectedNotebook.id);
      setSelectedPageId(newPage.id);
    } catch (err) {
      console.error('Failed to create notebook page:', err);
      alert('Could not create page. Check console for details.');
    } finally {
      setPendingPageAction(null);
    }
  };

  const handleDeletePage = async (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    if (!selectedNotebook) return;
    if (!confirm('Delete this page?')) return;
    setPendingPageAction(pageId);
    await onDeletePage(selectedNotebook.id, pageId);
    setPendingPageAction(null);
    if (selectedPageId === pageId) {
      const remaining = selectedNotebook.pages.filter(page => page.id !== pageId);
      setSelectedPageId(remaining.length ? remaining[0].id : null);
    }
  };

  const handlePageTitleChange = (value: string) => {
    setPageTitleDraft(value);
    if (!selectedNotebook || !selectedPage) return;
    onUpdatePage(selectedNotebook.id, selectedPage.id, { title: value });
  };

  const handleContentChange = (value: string) => {
    setPageContentDraft(value);
    if (!selectedNotebook || !selectedPage) return;
    onUpdatePage(selectedNotebook.id, selectedPage.id, { content: value });
  };

  const handleAddResource = async () => {
    if (!selectedNotebook || !resourceName.trim()) return;
    await onAddResource(selectedNotebook.id, {
      title: resourceName.trim(),
      url: resourceUrl.trim(),
    });
    setResourceName('');
    setResourceUrl('');
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!selectedNotebook) return;
    if (!confirm('Delete this resource?')) return;
    await onDeleteResource(selectedNotebook.id, resourceId);
  };

  if (selectedNotebook) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              setSelectedNotebookId(null);
              setSelectedPageId(null);
            }}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Back to Notebooks</span>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400">{isSyncing ? 'Syncing...' : 'Auto-saved'}</span>
            <button
              onClick={(e) => handleDeleteNotebook(e, selectedNotebook.id)}
              className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-60"
              title="Delete Notebook"
              disabled={pendingNotebookAction === selectedNotebook.id}
            >
              <Trash2 size={18} className={pendingNotebookAction === selectedNotebook.id ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-6 h-[calc(100vh-180px)]">
          <div className="w-64 flex flex-col gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
              <div className="p-4 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Entries</span>
                <button onClick={handleCreatePage} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500 disabled:opacity-50" disabled={!!pendingPageAction}>
                  <Plus size={14} className={pendingPageAction === 'create' ? 'animate-spin' : ''} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {selectedNotebook.pages.length === 0 && (
                  <p className="text-xs text-zinc-400 text-center py-4">No entries yet.</p>
                )}
                {selectedNotebook.pages.map(page => (
                  <div
                    key={page.id}
                    onClick={() => setSelectedPageId(page.id)}
                    className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                      selectedPageId === page.id
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={14} className={selectedPageId === page.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'} />
                      <span className="text-xs font-medium truncate">{page.title || 'Untitled'}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeletePage(e, page.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-500 p-1 disabled:opacity-60"
                      disabled={pendingPageAction === page.id}
                    >
                      <X size={12} className={pendingPageAction === page.id ? 'animate-spin' : ''} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl flex flex-col overflow-hidden shadow-sm">
            {selectedPage ? (
              <>
                <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex items-center gap-3 bg-zinc-50/30 dark:bg-zinc-900/30 shrink-0">
                  <div className={`w-2 h-6 ${selectedNotebook.color} rounded-sm`}></div>
                  <input
                    type="text"
                    value={pageTitleDraft}
                    onChange={(e) => handlePageTitleChange(e.target.value)}
                    className="bg-transparent text-xl font-geist font-medium text-zinc-900 dark:text-white focus:outline-none w-full placeholder-zinc-400"
                    placeholder="Page Title"
                  />
                </div>
                <div className="flex-1 overflow-hidden relative">
                  <RichTextEditor initialContent={pageContentDraft} onChange={handleContentChange} className="h-full border-none rounded-none" />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                <Book size={48} className="mb-4 opacity-20" />
                <p>{selectedNotebook.pages.length ? 'Select a page to start writing.' : 'Create your first page to begin writing.'}</p>
              </div>
            )}
          </div>

          <div className="w-64 flex flex-col gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl p-4 h-full flex flex-col">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                <LinkIcon size={14} />
                Resources
              </h3>

              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {selectedNotebook.resources.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">No resources added.</p>
                ) : (
                  selectedNotebook.resources.map(res => (
                    <div key={res.id} className="group flex justify-between items-center p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                      <div className="overflow-hidden">
                        <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">{res.title}</p>
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline truncate block">
                          {res.url || 'No URL'}
                        </a>
                      </div>
                      <button onClick={() => handleDeleteResource(res.id)} className="text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-white/5 space-y-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded focus:outline-none focus:border-zinc-400"
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded focus:outline-none focus:border-zinc-400"
                />
                <button
                  onClick={handleAddResource}
                  className="w-full py-1.5 bg-zinc-200 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-geist font-light text-zinc-900 dark:text-white mb-1">Notebooks</h2>
          <p className="text-sm text-zinc-500">{notebooks.length ? 'Organize your research, reviews, and forecasts.' : 'Create your first notebook to get started.'}</p>
        </div>
        <button
          onClick={() => setIsCreatingNotebook(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          disabled={isSyncing}
        >
          <Plus size={16} />
          <span>New Notebook</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {notebooks.map(book => (
          <div key={book.id} className="group relative isolate">
            <div className="absolute top-4 right-4 z-[60]">
              <button
                onClick={(e) => handleDeleteNotebook(e, book.id)}
                className="p-2 bg-white dark:bg-zinc-800 text-zinc-400 hover:text-white hover:bg-rose-500 rounded-lg shadow-sm opacity-60 hover:opacity-100 transition-all border border-zinc-200 dark:border-zinc-700 cursor-pointer disabled:opacity-60"
                title="Delete Notebook"
                type="button"
                disabled={pendingNotebookAction === book.id}
              >
                <Trash2 size={16} className={pendingNotebookAction === book.id ? 'animate-spin' : ''} />
              </button>
            </div>

            <div
              onClick={() => openNotebook(book.id)}
              className="cursor-pointer relative h-64 rounded-r-xl rounded-l-sm bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-white/10 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-3 ${book.color} rounded-l-sm opacity-80 z-20`}></div>
              <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-none">
                <div className={`w-8 h-8 ${book.color} rounded-lg bg-opacity-20 flex items-center justify-center mb-3 text-white`}>
                  <Book size={16} className="opacity-75" />
                </div>
                <h3 className="font-geist font-medium text-lg text-zinc-800 dark:text-zinc-100 leading-tight mb-1">{book.title}</h3>
                <p className="text-xs text-zinc-500">{book.pages.length} entries</p>
              </div>
            </div>
          </div>
        ))}

        {!isCreatingNotebook && (
          <div
            onClick={() => setIsCreatingNotebook(true)}
            className="h-64 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-500 transition-all cursor-pointer"
          >
            <Plus size={32} className="mb-2 opacity-50" />
            <span className="text-sm font-medium">Create Notebook</span>
          </div>
        )}
      </div>

      {isCreatingNotebook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCreatingNotebook(false)}></div>

          <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Create New Notebook</h3>
              <button
                onClick={() => setIsCreatingNotebook(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Notebook Title</label>
              <input
                type="text"
                placeholder="e.g. Daily Reflections"
                value={newNotebookTitle}
                onChange={(e) => setNewNotebookTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-1 focus:ring-zinc-400/20 mb-6"
                autoFocus
              />
              <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100 dark:border-white/5">
                <button
                  onClick={() => setIsCreatingNotebook(false)}
                  className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNotebook}
                  className="px-4 py-2 text-sm bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity font-medium shadow-sm"
                >
                  Create Notebook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotebookView;

