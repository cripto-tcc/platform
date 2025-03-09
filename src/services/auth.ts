import { auth } from "../config/firebase";
import { onAuthStateChanged, signInAnonymously, signOut as firebaseSignOut, updateProfile } from "firebase/auth";

export interface AuthSession {
  address: string;
  network: string;
  timestamp: number;
}

export class AuthService {
  static async testConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        console.log("Firebase Auth Status:", {
          isInitialized: !!auth,
          currentUser: user,
          isConnected: !!auth.app,
        });
        resolve(!!auth.app);
      });
    });
  }

  static async loginWithPhantom(address: string, network: string): Promise<AuthSession> {
    try {
      const provider = window.phantom?.ethereum;
      if (!provider) throw new Error("Phantom não está instalada");

      const { user } = await signInAnonymously(auth);

      await updateProfile(user, {
        displayName: address,
      });

      const session: AuthSession = {
        address,
        network,
        timestamp: Date.now(),
      };

      return session;
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Erro no logout:", error);
      throw error;
    }
  }

  static getCurrentUser() {
    return auth.currentUser;
  }

  static onAuthStateChange(callback: (user: any) => void) {
    return onAuthStateChanged(auth, callback);
  }

  static isAuthenticated(): boolean {
    const user = auth.currentUser;
    return !!user && !!user.displayName;
  }
}
