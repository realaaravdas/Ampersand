import { useCallback, useRef } from 'react';
import { SaveStatus } from '@/types/document';

export function useAutosave(
  onSave: () => Promise<void>,
  setSaveStatus: (status: SaveStatus) => void,
  delay = 2000
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSave = useCallback(() => {
    setSaveStatus('unsaved');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await onSave();
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, delay);
  }, [onSave, setSaveStatus, delay]);

  const cancelSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { triggerSave, cancelSave };
}
