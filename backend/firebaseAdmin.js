import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";

const chave = JSON.parse(
  readFileSync(new URL("./serviceAccountKey.json", import.meta.url), "utf8")
);

const app = initializeApp({ credential: cert(chave) });

export const db = getFirestore(app);
export const auth = getAuth(app); 