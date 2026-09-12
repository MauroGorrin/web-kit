// SDK cliente de Firebase — seguro de importar tanto en Server como en Client
// Components. Las variables `NEXT_PUBLIC_FIREBASE_*` las inyecta el bundler de
// Next.js en build time (ver `apps/template/.env.example`); nunca son secretas.
import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

interface FirebaseClientServices {
  auth: Auth;
  db: Firestore;
}

let services: FirebaseClientServices | undefined;

function initFirebaseClient(): FirebaseClientServices {
  const config: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const app = getApps()[0] ?? initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Conecta a los emuladores locales cuando el proyecto los declara — nunca
  // contra un proyecto de Firebase real. Envuelto en try/catch porque el hot
  // reload de desarrollo puede reinicializar y `connect*Emulator` lanza si ya
  // había una conexión activa; eso no es un error real.
  const authEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const firestoreEmulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
  if (authEmulatorHost && firestoreEmulatorHost) {
    try {
      const [fsHost, fsPort] = firestoreEmulatorHost.split(":");
      connectAuthEmulator(auth, `http://${authEmulatorHost}`);
      connectFirestoreEmulator(db, fsHost!, Number(fsPort));
    } catch {
      // ya conectado — ver comentario arriba.
    }
  }

  return { auth, db };
}

/**
 * Perezoso a propósito — nunca se llama a `initializeApp`/`getAuth` solo por
 * importar este módulo. Un `apiKey` ausente o con forma inválida (ver
 * `auth/invalid-api-key` de la SDK) rompería cualquier página que
 * transitivamente importe el barrel del paquete, incluso una que nunca toca
 * Firebase — confirmado por ejecución real durante E1-T3.
 */
function getFirebaseClient(): FirebaseClientServices {
  if (!services) services = initFirebaseClient();
  return services;
}

export function getFirebaseAuth(): Auth {
  return getFirebaseClient().auth;
}

export function getFirebaseDb(): Firestore {
  return getFirebaseClient().db;
}
