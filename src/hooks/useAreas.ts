import { useEffect } from 'react';
import {
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db, isConfigured } from '@/firebase/config';
import { areasCollection } from '@/firebase/collections';
import { useAppStore } from '@/store/useAppStore';
import type { Area, AreaColor, AreaIcon } from '@/domain/types';
import { areaConverter } from '@/firebase/converters';

export function useAreas() {
  const { areas, setAreas, addArea, updateArea, removeArea, setLoading, setError } = useAppStore();

  useEffect(() => {
    const col = areasCollection();
    if (!col) return;

    setLoading(true);
    const unsubscribe = onSnapshot(
      col,
      (snapshot) => {
        const data = snapshot.docs.map((d) => d.data());
        setAreas(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [setAreas, setLoading, setError]);

  const createArea = async (input: {
    name: string;
    color: AreaColor;
    icon: AreaIcon;
  }) => {
    const col = areasCollection();
    if (!col) {
      // Offline mode: add to local store only
      const area: Area = {
        id: `local-${Date.now()}`,
        ...input,
        createdAt: new Date(),
        isActive: true,
      };
      addArea(area);
      return area;
    }

    const area: Omit<Area, 'id'> = {
      ...input,
      createdAt: new Date(),
      isActive: true,
    };
    const docRef = await addDoc(col, area as Area);
    return { id: docRef.id, ...area };
  };

  const toggleArea = async (id: string, isActive: boolean) => {
    if (!isConfigured || !db) {
      updateArea(id, { isActive });
      return;
    }
    await updateDoc(doc(db, 'areas', id).withConverter(areaConverter), { isActive });
  };

  const editArea = async (id: string, partial: { name?: string; color?: AreaColor; icon?: AreaIcon }) => {
    if (!isConfigured || !db) {
      updateArea(id, partial);
      return;
    }
    await updateDoc(doc(db, 'areas', id).withConverter(areaConverter), partial);
    updateArea(id, partial);
  };

  const deleteArea = async (id: string) => {
    if (!isConfigured || !db) {
      removeArea(id);
      return;
    }
    await deleteDoc(doc(db, 'areas', id));
  };

  return { areas, createArea, editArea, toggleArea, deleteArea };
}
