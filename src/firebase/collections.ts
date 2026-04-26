import { collection } from 'firebase/firestore';
import { db } from './config';
import { areaConverter, conceptConverter, sessionConverter, flashcardConverter, linkConverter } from './converters';

export const areasCollection = () => {
  if (!db) return null;
  return collection(db, 'areas').withConverter(areaConverter);
};

export const conceptsCollection = () => {
  if (!db) return null;
  return collection(db, 'concepts').withConverter(conceptConverter);
};

export const sessionsCollection = () => {
  if (!db) return null;
  return collection(db, 'sessions').withConverter(sessionConverter);
};

export const flashcardsCollection = () => {
  if (!db) return null;
  return collection(db, 'flashcards').withConverter(flashcardConverter);
};

export const linksCollection = () => {
  if (!db) return null;
  return collection(db, 'links').withConverter(linkConverter);
};
