export interface UploadedImage {
  url: string;
  path: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  preview: string;
  date: string;
  content: string;
  user_id: string;
  created_at: string;
  images: UploadedImage[];
}

export interface PlaybookRule {
  id: string;
  text: string;
  completed: boolean;
}

export interface Playbook {
  id: string;
  title: string;
  description: string;
  tags: string[];
  rules: PlaybookRule[];
  user_id: string;
  created_at: string;
  images: UploadedImage[];
}

export interface NotebookPage {
  id: string;
  title: string;
  content: string;
  created_at: string;
  notebook_id: string;
}

export interface NotebookResource {
  id: string;
  title: string;
  url: string;
  notebook_id: string;
  created_at: string;
}

export interface Notebook {
  id: string;
  title: string;
  color: string;
  pages: NotebookPage[];
  resources: NotebookResource[];
  user_id: string;
  created_at: string;
}

export interface BrokerAccount {
  id: string;
  name: string;
  broker: string;
  balance: string;
  type: string;
  server?: string | null;
  login?: string | null;
  user_id: string;
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  account_id: string | null;
  symbol: string;
  tv_symbol: string;
  type: 'Long' | 'Short';
  entry_date: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  pnl: number;
  status: 'Win' | 'Loss' | 'Breakeven';
  created_at: string;
}

