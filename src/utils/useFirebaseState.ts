import { useState, useEffect, useRef } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from './firebase';

// A drop-in replacement for useState that automatically saves to,
// and loads from, Firebase Realtime Database at the given path.
// Any change made here (by this device or any other device viewing
// the site) will sync to everyone.
export function useFirebaseState<T>(
  path: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const isFirstLoad = useRef(true);
  const skipNextWrite = useRef(false);

  useEffect(() => {
    const dbRef = ref(db, path);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data === null) {
        set(dbRef, initialValue);
      } else {
        skipNextWrite.current = true;
        setValue(data);
      }
      isFirstLoad.current = false;
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => {
    if (isFirstLoad.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const dbRef = ref(db, path);
    set(dbRef, value);
  }, [value, path]);

  return [value, setValue];
}
