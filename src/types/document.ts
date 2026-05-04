export interface AmpDocument {
  id: string;
  title: string;
  content: string; // TipTap JSON as string
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  charCount: number;
}

export interface SaveLocation {
  type: 'local' | 'server';
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';
