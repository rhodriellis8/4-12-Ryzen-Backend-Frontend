
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import JournalView from './components/JournalView';
import PlaybooksView from './components/PlaybooksView';
import NotebookView from './components/NotebookView';
import TradesView from './components/TradesView';
import TasksView from './components/TasksView';
import SettingsView from './components/SettingsView';
import ProfileView from './components/ProfileView';
import SubscriptionView from './components/SubscriptionView';
import LoginView from './components/LoginView';
import PricingView from './components/PricingView';
import AccountManagerModal from './components/AccountManagerModal';
import { supabase } from './lib/supabaseClient';
import * as dataService from './lib/dataService';
import type { Session } from '@supabase/supabase-js';
import type { JournalEntry, Playbook, Notebook, NotebookPage } from './types/data';

export type ViewState = 'dashboard' | 'trades' | 'journal' | 'notebook' | 'playbooks' | 'tasks' | 'settings' | 'pricing' | 'profile' | 'subscription';

const REMEMBER_KEY = 'ryzen_remember_until';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Data State - now starts empty, loaded from Supabase
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Account State
  const [accounts, setAccounts] = useState<any[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      return storedTheme === 'light' ? false : true;
    }
    return true;
  });

  // Supabase auth: keep React state in sync with Supabase session
  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      // Check "remember session" expiry
      const rememberUntil = localStorage.getItem(REMEMBER_KEY);
      if (rememberUntil && data.session) {
        const expiryTime = parseInt(rememberUntil, 10);
        if (Date.now() > expiryTime) {
          // Session expired based on user preference, sign out
          await supabase.auth.signOut();
          localStorage.removeItem(REMEMBER_KEY);
          setSession(null);
          setAuthChecked(true);
          return;
        }
      }

      setSession(data.session ?? null);
      setAuthChecked(true);
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load user data from Supabase when session becomes available
  useEffect(() => {
    if (!session?.user?.id) {
      // Clear data on logout
      setJournalEntries([]);
      setPlaybooks([]);
      setNotebooks([]);
      return;
    }

    const loadData = async () => {
      setDataLoading(true);
      try {
        const [journals, pbs, nbs] = await Promise.all([
          dataService.fetchJournalEntries(session.user.id),
          dataService.fetchPlaybooks(session.user.id),
          dataService.fetchNotebooks(session.user.id),
        ]);
        setJournalEntries(journals);
        setPlaybooks(pbs);
        setNotebooks(nbs);
      } catch (err) {
        console.error('Failed to load user data:', err);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [session?.user?.id]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('dashboard');
  };

  const handleUpdateProfile = async (data: any) => {
    const { error } = await supabase.auth.updateUser(data);
    if (error) throw error;
    // Session update handled by onAuthStateChange
  };

  // ============ JOURNAL HANDLERS ============
  const handleCreateJournalEntry = useCallback(async (): Promise<JournalEntry> => {
    if (!session?.user?.id) throw new Error('Not authenticated');
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newEntry = await dataService.createJournalEntry(session.user.id, {
      title: 'Untitled Entry',
      preview: 'No content yet...',
      date: today,
      content: '',
      images: [],
    });
    setJournalEntries((prev) => [newEntry, ...prev]);
    return newEntry;
  }, [session?.user?.id]);

  const handleUpdateJournalEntry = useCallback(async (
    entryId: string,
    updates: Partial<Pick<JournalEntry, 'title' | 'content' | 'preview' | 'images'>>
  ) => {
    // Optimistic update
    setJournalEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, ...updates } : e))
    );
    try {
      await dataService.updateJournalEntry(entryId, updates);
    } catch (err) {
      console.error('Failed to update journal entry:', err);
    }
  }, []);

  const handleDeleteJournalEntry = useCallback(async (entryId: string) => {
    setJournalEntries((prev) => prev.filter((e) => e.id !== entryId));
    try {
      await dataService.deleteJournalEntry(entryId);
    } catch (err) {
      console.error('Failed to delete journal entry:', err);
    }
  }, []);

  // ============ PLAYBOOK HANDLERS ============
  const handleCreatePlaybook = useCallback(async (
    playbook: Omit<Playbook, 'id' | 'user_id' | 'created_at'>
  ): Promise<Playbook> => {
    if (!session?.user?.id) throw new Error('Not authenticated');
    const created = await dataService.createPlaybook(session.user.id, playbook);
    setPlaybooks((prev) => [created, ...prev]);
    return created;
  }, [session?.user?.id]);

  const handleUpdatePlaybook = useCallback(async (
    playbookId: string,
    updates: Partial<Pick<Playbook, 'title' | 'description' | 'tags' | 'rules' | 'images'>>
  ) => {
    setPlaybooks((prev) =>
      prev.map((p) => (p.id === playbookId ? { ...p, ...updates } : p))
    );
    try {
      await dataService.updatePlaybook(playbookId, updates);
    } catch (err) {
      console.error('Failed to update playbook:', err);
    }
  }, []);

  const handleDeletePlaybook = useCallback(async (playbookId: string) => {
    setPlaybooks((prev) => prev.filter((p) => p.id !== playbookId));
    try {
      await dataService.deletePlaybook(playbookId);
    } catch (err) {
      console.error('Failed to delete playbook:', err);
    }
  }, []);

  // ============ NOTEBOOK HANDLERS ============
  const handleCreateNotebook = useCallback(async (title: string): Promise<Notebook> => {
    if (!session?.user?.id) throw new Error('Not authenticated');
    setIsSyncing(true);
    try {
      const created = await dataService.createNotebook(session.user.id, title);
      setNotebooks((prev) => [created, ...prev]);
      return created;
    } finally {
      setIsSyncing(false);
    }
  }, [session?.user?.id]);

  const handleDeleteNotebook = useCallback(async (notebookId: string) => {
    setIsSyncing(true);
    setNotebooks((prev) => prev.filter((nb) => nb.id !== notebookId));
    try {
      await dataService.deleteNotebook(notebookId);
    } catch (err) {
      console.error('Failed to delete notebook:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleCreatePage = useCallback(async (notebookId: string): Promise<NotebookPage> => {
    if (!session?.user?.id) throw new Error('Not authenticated');
    setIsSyncing(true);
    try {
      const newPage = await dataService.createNotebookPage(notebookId, session.user.id);
      setNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === notebookId ? { ...nb, pages: [...nb.pages, newPage] } : nb
        )
      );
      return newPage;
    } finally {
      setIsSyncing(false);
    }
  }, [session?.user?.id]);

  const handleDeletePage = useCallback(async (notebookId: string, pageId: string) => {
    setIsSyncing(true);
    setNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === notebookId
          ? { ...nb, pages: nb.pages.filter((p) => p.id !== pageId) }
          : nb
      )
    );
    try {
      await dataService.deleteNotebookPage(pageId);
    } catch (err) {
      console.error('Failed to delete page:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleUpdatePage = useCallback((
    notebookId: string,
    pageId: string,
    updates: { title?: string; content?: string }
  ) => {
    // Optimistic update
    setNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === notebookId
          ? {
              ...nb,
              pages: nb.pages.map((p) =>
                p.id === pageId ? { ...p, ...updates } : p
              ),
            }
          : nb
      )
    );
    // Debounced save to Supabase (fire and forget)
    dataService.updateNotebookPage(pageId, updates).catch((err) =>
      console.error('Failed to update page:', err)
    );
  }, []);

  const handleAddResource = useCallback(async (
    notebookId: string,
    resource: { title: string; url: string }
  ) => {
    setIsSyncing(true);
    try {
      const created = await dataService.createNotebookResource(notebookId, resource);
      setNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === notebookId
            ? { ...nb, resources: [...nb.resources, created] }
            : nb
        )
      );
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleDeleteResource = useCallback(async (notebookId: string, resourceId: string) => {
    setIsSyncing(true);
    setNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === notebookId
          ? { ...nb, resources: nb.resources.filter((r) => r.id !== resourceId) }
          : nb
      )
    );
    try {
      await dataService.deleteNotebookResource(resourceId);
    } catch (err) {
      console.error('Failed to delete resource:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const renderView = () => {
    if (dataLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
            <span className="text-sm text-zinc-500">Loading your data...</span>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'trades':
        return <TradesView />;
      case 'journal':
        return (
          <JournalView
            userId={session!.user.id}
            entries={journalEntries}
            onCreateEntry={handleCreateJournalEntry}
            onUpdateEntry={handleUpdateJournalEntry}
            onDeleteEntry={handleDeleteJournalEntry}
          />
        );
      case 'notebook':
        return (
          <NotebookView
            notebooks={notebooks}
            onCreateNotebook={handleCreateNotebook}
            onDeleteNotebook={handleDeleteNotebook}
            onCreatePage={handleCreatePage}
            onDeletePage={handleDeletePage}
            onUpdatePage={handleUpdatePage}
            onAddResource={handleAddResource}
            onDeleteResource={handleDeleteResource}
            isSyncing={isSyncing}
          />
        );
      case 'playbooks':
        return (
          <PlaybooksView
            userId={session!.user.id}
            playbooks={playbooks}
            onCreatePlaybook={handleCreatePlaybook}
            onUpdatePlaybook={handleUpdatePlaybook}
            onDeletePlaybook={handleDeletePlaybook}
          />
        );
      case 'tasks':
        return (
          <TasksView
            userId={session!.user.id}
            onNavigate={(view, payload) => {
              setCurrentView(view as ViewState);
              // If needed, could handle selecting specific items via payload
            }}
          />
        );
      case 'settings':
        return <SettingsView 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          user={session?.user} 
          onUpdateProfile={handleUpdateProfile}
        />;
      case 'profile':
        return <ProfileView user={session?.user} onUpdateProfile={handleUpdateProfile} />;
      case 'subscription':
        return <SubscriptionView />;
      case 'pricing':
        return <PricingView />;
      default:
        return <DashboardView />;
    }
  };

  // While auth status is being checked, show login screen
  if (!authChecked) {
    return <LoginView accentColor="white" />;
  }

  if (!session) {
    return <LoginView accentColor="white" />;
  }

  const activeAccount = accounts.find(a => a.id === activeAccountId);

  return (
    <div className="min-h-screen flex antialiased bg-white dark:bg-black text-zinc-900 dark:text-zinc-200 overflow-hidden selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-black dark:selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onLogout={handleLogout}
        user={session?.user ? {
            name: session.user.user_metadata?.full_name || 'User',
            email: session.user.email || '',
            avatar: session.user.user_metadata?.avatar_url
        } : undefined}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative h-screen overflow-y-auto bg-grid scroll-smooth">
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white dark:from-zinc-900/20 to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col min-h-screen">
            <Header 
              title={currentView.charAt(0).toUpperCase() + currentView.slice(1)} 
              isDarkMode={isDarkMode}
              toggleTheme={() => setIsDarkMode(!isDarkMode)}
              onNavigate={setCurrentView}
              onOpenAccountManager={() => setIsAccountModalOpen(true)}
              activeAccountName={activeAccount ? activeAccount.name : undefined}
            />
            
            <div className="flex-1 px-8 pt-4 pb-20 max-w-7xl mx-auto w-full">
                {renderView()}
            </div>
        </div>
      </main>

      {/* Global Account Manager Modal */}
      <AccountManagerModal 
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accounts={accounts}
        onAddAccount={(acc) => {
          setAccounts([...accounts, acc]);
          if (!activeAccountId) setActiveAccountId(acc.id);
        }}
        onSelectAccount={setActiveAccountId}
        activeAccountId={activeAccountId}
      />
    </div>
  );
};

export default App;
