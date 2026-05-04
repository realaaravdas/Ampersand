'use client';

import { useState, useCallback, useEffect } from 'react';
import { AmpDocument } from '@/types/document';
import { useDocuments } from '@/hooks/useDocuments';
import DocumentSidebar from '@/components/Sidebar/DocumentSidebar';
import AmpersandEditor from '@/components/Editor/AmpersandEditor';

export default function Home() {
  const { documents, loading, fetchDocuments, createDocument, updateDocument, deleteDocument } = useDocuments();
  const [activeDoc, setActiveDoc] = useState<AmpDocument | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleNew = useCallback(async () => {
    const doc = await createDocument('Untitled Document');
    setActiveDoc(doc);
  }, [createDocument]);

  const handleSelect = useCallback((doc: AmpDocument) => {
    setActiveDoc(doc);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Delete this document? This cannot be undone.')) return;
    await deleteDocument(id);
    if (activeDoc?.id === id) setActiveDoc(null);
  }, [deleteDocument, activeDoc]);

  const handleSave = useCallback(async (updates: Partial<AmpDocument>) => {
    if (!activeDoc) return;
    const updated = await updateDocument(activeDoc.id, updates);
    setActiveDoc(updated);
  }, [activeDoc, updateDocument]);

  const handleTitleChange = useCallback(async (title: string) => {
    if (!activeDoc) return;
    const updated = await updateDocument(activeDoc.id, { title });
    setActiveDoc(updated);
  }, [activeDoc, updateDocument]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#1a1a2e]">
      <div className="flex-shrink-0 no-print">
        <DocumentSidebar
          documents={documents}
          activeDocId={activeDoc?.id ?? null}
          loading={loading}
          onSelect={handleSelect}
          onNew={handleNew}
          onDelete={handleDelete}
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <AmpersandEditor
          document={activeDoc}
          onSave={handleSave}
          onTitleChange={handleTitleChange}
        />
      </div>
    </div>
  );
}
