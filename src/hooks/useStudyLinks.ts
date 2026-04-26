import { useEffect } from 'react';
import { onSnapshot, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db, isConfigured } from '@/firebase/config';
import { linksCollection } from '@/firebase/collections';
import { useAppStore } from '@/store/useAppStore';
import type { StudyLink, LinkMediaType } from '@/domain/types';

export function useStudyLinks(areaId?: string) {
  const { studyLinks, setStudyLinks, addStudyLink, removeStudyLink } = useAppStore();

  useEffect(() => {
    const col = linksCollection();
    if (!col) return;

    const q = areaId ? query(col, where('areaId', '==', areaId)) : col;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => d.data());
      if (areaId) {
        const others = studyLinks.filter((l) => l.areaId !== areaId);
        setStudyLinks([...others, ...data]);
      } else {
        setStudyLinks(data);
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId]);

  const createLink = async (input: { areaId: string; title: string; url: string; mediaType: LinkMediaType }) => {
    const col = linksCollection();
    const link: StudyLink = { id: `local-${Date.now()}`, ...input };

    if (!col) {
      addStudyLink(link);
      return link;
    }

    const docRef = await addDoc(col, link);
    return { ...link, id: docRef.id };
  };

  const deleteLink = async (id: string) => {
    if (!isConfigured || !db) {
      removeStudyLink(id);
      return;
    }
    await deleteDoc(doc(db, 'links', id));
    removeStudyLink(id);
  };

  const filtered = areaId ? studyLinks.filter((l) => l.areaId === areaId) : studyLinks;

  return { links: filtered, createLink, deleteLink };
}
