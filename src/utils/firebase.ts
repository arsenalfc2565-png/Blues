// Firebase initialization for the Blues Collection STOREFRONT app.
//
// IMPORTANT: This is a deliberately SEPARATE Firebase project from the
// Blues Collection POS. Do not point this at the POS project's config —
// the two are kept independent so changes here can never affect POS data.
//
// Note: the values below (apiKey, projectId, etc.) are the public Firebase
// "web config" — they are not secrets. Firebase docs are explicit that this
// config is safe to ship in client-side code; real protection comes from
// the Realtime Database security rules (see database.rules.json), not from
// hiding these values.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDG5pRka1UFGVADyjlr8jtY6ExbH_38Wkk',
  authDomain: 'blues-collection-storefront.firebaseapp.com',
  projectId: 'blues-collection-storefront',
  storageBucket: 'blues-collection-storefront.firebasestorage.app',
  messagingSenderId: '273578349646',
  appId: '1:273578349646:web:b0d88c7a481f306dc11f1f',
  // TODO: paste the Realtime Database URL here, e.g.:
  // databaseURL: 'https://blues-collection-storefront-default-rtdb.europe-west1.firebasedatabase.app',
  databaseURL: 'REPLACE_ME_WITH_YOUR_DATABASE_URL',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getDatabase(firebaseApp);
