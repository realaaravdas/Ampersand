import { useState, useCallback } from 'react';
import { AmpDocument } from '@/types/document';
import * as api from '@/lib/api';

export function useDocuments() {
  const [documents, setDocuments] = useState<AmpDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await api.listDocuments();
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  const createDocument = useCallback(async (title: string): Promise<AmpDocument> => {
    const doc = await api.createDocument({
      title,
      content: '',
      wordCount: 0,
      charCount: 0,
    });
    setDocuments((prev) => [doc, ...prev]);
    return doc;
  }, []);

  const updateDocument = useCallback(async (id: string, updates: Partial<AmpDocument>): Promise<AmpDocument> => {
    const updated = await api.updateDocument(id, updates);
    setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  }, []);

  const deleteDocument = useCallback(async (id: string): Promise<void> => {
    await api.deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  };
}
