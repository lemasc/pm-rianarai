import axios from "axios";
import {
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
} from "firebase/auth";
import { getDoc, setDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import LogRocket from "logrocket";
import { useState, useEffect, useContext, createContext } from "react";
import { useCollection, Document } from "swr-firestore-v9";
import { auth, db } from "./firebase";
import { ClassroomSessionResult } from "./api";
import { useRouter } from "next/dist/client/router";

export interface UserMetadata {
  upgrade?: "v2";
  class: number | string;
  room?: number | string;
  name: string;
  displayName: string;
  email: string;
  provider: Provider[];
  announceId?: string[];
}

type FirebaseResult = {
  success: boolean;
  message?: string;
};

export type Provider = "facebook.com" | "google.com" | "password";

export type Announcement = {
  created_at: Date;
  enable: boolean;
  displayName: string;
  name: string;
  needs_login: boolean;
  target: string;
};

interface IAuthContext {
  isPWA: () => boolean;
  user: User | null;
  ready: boolean;
  setWelcome: (state: boolean) => Promise<void>;
  classroom: ClassroomSessionResult[] | null;
  remove: () => Promise<boolean>;
  announce: Document<Announcement>[];
  markAsRead: (announceId: string) => Promise<void>;
  metadata: UserMetadata | null;
  getMethods: (email: string) => Promise<Provider[]>;
  signUp: (email: string, password: string) => Promise<FirebaseResult>;
  signIn: (email: string, password: string) => Promise<FirebaseResult>;
  signInWithProvider: (provider: Provider) => Promise<FirebaseResult>;
  signOut: () => Promise<void>;
  updateMeta: (meta: UserMetadata) => Promise<boolean>;
}

export const authContext = createContext<IAuthContext | undefined>(undefined);

export const useAuth = (): IAuthContext | undefined => {
  return useContext(authContext);
};

// Provider hook that creates auth object and handles state
export function useProvideAuth(): IAuthContext {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [metadata, setMetadata] = useState<UserMetadata | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [classroom, setClassroom] = useState<ClassroomSessionResult[] | null>(
    null
  );
  const { data: announce } = useCollection<Announcement>(
    ready ? "announcement" : null,
    {
      where: [
        ["enable", "==", true],
        ["needs_login", "!=", !user ? true : ""],
      ],
      orderBy: [
        ["needs_login", "asc"],
        ["created_at", "desc"],
      ],
      parseDates: ["created_at", "released_at"],
      listen: true,
    }
  );
  const isPWA = (): boolean => {
    const isPWA =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;
    if (isPWA) {
      localStorage.setItem("lastPWA", new Date().valueOf().toString());
    }
    return isPWA;
  };

  const getMethods = async (email: string): Promise<Provider[]> => {
    return (await fetchSignInMethodsForEmail(auth, email)) as Provider[];
  };

  const signUp = async (
    email: string,
    password: string
  ): Promise<FirebaseResult> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      LogRocket.error(err);
      return { success: false, message: err.code };
    }
  };
  const signIn = async (
    email: string,
    password: string
  ): Promise<FirebaseResult> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      LogRocket.error(err);
      return { success: false, message: err.code };
    }
  };
  const signInWithProvider = async (p: Provider): Promise<FirebaseResult> => {
    let provider;
    switch (p) {
      case "google.com":
        provider = new GoogleAuthProvider();
        break;
      case "facebook.com":
        provider = new FacebookAuthProvider();
        break;
      default:
        return { success: false };
    }
    try {
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") return { success: true };
      LogRocket.error(err);
      return { success: false, message: err.code };
    }
  };
  const remove = async (): Promise<boolean> => {
    try {
      await user.delete();
      return true;
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        await signOut();
        return true;
      }
      return false;
    }
  };
  const signOut = async (): Promise<void> => {
    await auth.signOut();
    setUser(null);
    setMetadata(null);
  };
  const updateMeta = async (meta: UserMetadata): Promise<boolean> => {
    try {
      meta.name = user.displayName;
      meta.email = user.email;
      meta.provider = user.providerData.map((p) => p.providerId) as Provider[];
      if (metadata && metadata.announceId) {
        meta.announceId = metadata.announceId; //Preserve fields
      }
      if (metadata && metadata.upgrade) meta.upgrade = metadata.upgrade;
      await setDoc(doc(db, "users/" + user.uid), meta);
      LogRocket.log("Metadata update", meta);
      setMetadata(meta);
      return true;
    } catch (err) {
      return false;
    }
  };
  useEffect(() => {
    let _isMounted = true;
    let authReady = null;

    async function checkClassroom(token: string): Promise<void> {
      try {
        const api = await axios.get("/api/classroom/session", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        setClassroom(api.data.data);
      } catch (err) {
        console.error(err);
        setClassroom([]);
      }
    }

    return auth.onIdTokenChanged(async (curUser) => {
      if (!_isMounted) return;
      if (authReady) clearTimeout(authReady);
      if (curUser) {
        // Check previous state if user exists
        if (curUser !== user) {
          setReady(false);
        } else {
          authReady = setTimeout(() => setReady(false), 1000);
        }
        // Check if user metadata exists.
        LogRocket.identify(curUser.uid, {
          name: curUser.displayName,
          email: curUser.email,
          pwa: isPWA(),
        });
        const meta = await getDoc(doc(db, "users/" + curUser.uid));
        if (meta.exists) {
          setMetadata(meta.data() as UserMetadata);
          checkClassroom(await curUser.getIdToken());
        } else {
          setMetadata(null);
        }
        setUser(curUser);
        clearTimeout(authReady);
        const url = sessionStorage.getItem("url");
        if (url && router.pathname !== url) {
          return router.push(url);
        }
        sessionStorage.removeItem("url");
        setReady(true);
      } else {
        authReady = setTimeout(() => {
          if (router.pathname !== "/" && !user) {
            sessionStorage.setItem("url", router.pathname);
            router.replace("/");
          } else {
            setReady(true);
          }
        }, 1000);
        setUser(null);
      }
      return () => {
        _isMounted = false;
      };
    });
  }, [router, user]);

  const markAsRead = async (announceId: string): Promise<void> => {
    if (!user) return;
    const currentIds = new Set(
      metadata.announceId !== undefined ? metadata.announceId : []
    );
    currentIds.add(announceId);
    await updateDoc(doc(db, "users/" + user.uid), {
      announceId: arrayUnion(announceId),
    });
    setMetadata((meta) => ({ ...meta, announceId: Array.from(currentIds) }));
  };
  const setWelcome = async (state: boolean): Promise<void> => {
    if (!user) return;
    await updateDoc(doc(db, "users/" + user.uid), {
      upgrade: "v2",
    });
    setMetadata((meta) => ({ ...meta, update: "v2" }));
  };
  return {
    user,
    announce,
    markAsRead,
    metadata,
    setWelcome,
    classroom,
    remove,
    ready,
    isPWA,
    getMethods,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    updateMeta,
  };
}
