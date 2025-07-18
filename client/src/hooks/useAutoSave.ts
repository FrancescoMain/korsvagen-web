import { useState, useEffect, useMemo } from "react";
import debounce from "debounce";
import toast from "react-hot-toast";

export const useAutoSave = (
  data: any,
  saveFunction: (data: any) => Promise<void>,
  delay: number = 2000
) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const debouncedSave = useMemo(
    () =>
      debounce(async (dataToSave: any) => {
        setIsSaving(true);
        try {
          await saveFunction(dataToSave);
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
          toast.success("Modifiche salvate automaticamente");
        } catch (error) {
          toast.error("Errore nel salvataggio automatico");
          console.error("Auto-save error:", error);
        } finally {
          setIsSaving(false);
        }
      }, delay),
    [saveFunction, delay]
  );

  useEffect(() => {
    if (data) {
      setHasUnsavedChanges(true);
      debouncedSave(data);
    }
  }, [data, debouncedSave]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSave.clear();
    };
  }, [debouncedSave]);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    saveNow: () => {
      debouncedSave.clear();
      if (data) {
        debouncedSave(data);
      }
    },
  };
};
