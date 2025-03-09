import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

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
}
