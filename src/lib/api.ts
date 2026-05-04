import { AmpDocument } from '@/types/document';

const BASE_URL = '/api/documents';

export async function listDocuments(): Promise<AmpDocument[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Failed to list documents');
  return res.json();
}

export async function createDocument(doc: Omit<AmpDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<AmpDocument> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc),
  });
  if (!res.ok) throw new Error('Failed to create document');
  return res.json();
}

export async function getDocument(id: string): Promise<AmpDocument> {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to get document');
  return res.json();
}

export async function updateDocument(id: string, updates: Partial<AmpDocument>): Promise<AmpDocument> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update document');
  return res.json();
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete document');
}
