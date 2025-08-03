import { auth } from '../config/firebase'
import {
  onAuthStateChanged,
  signInAnonymously,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import { AuthSession } from '../types/auth'

export class AuthService {
  static async testConnection(): Promise<boolean> {
    return new Promise(resolve => {
      const unsubscribe = onAuthStateChanged(auth, () => {
        unsubscribe()
        resolve(!!auth.app)
      })
    })
  }

  static async loginWithPhantom(
    address: string,
    network: string
  ): Promise<AuthSession> {
    try {
      const provider = window.phantom?.ethereum
      if (!provider) throw new Error('Phantom não está instalada')

      const { user } = await signInAnonymously(auth)

      await updateProfile(user, {
        displayName: address,
      })

      const session: AuthSession = {
        address,
        network,
        timestamp: Date.now(),
      }

      return session
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  static async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Erro no logout:', error)
      throw error
    }
  }

  static getCurrentUser() {
    return auth.currentUser
  }

  static onAuthStateChange(callback: (user: any) => void) {
    return onAuthStateChanged(auth, callback)
  }

  static isAuthenticated(): boolean {
    const user = auth.currentUser
    return !!user && !!user.displayName
  }
}
