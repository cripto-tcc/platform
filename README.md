# Cryptocurrency Trading Chatbot Frontend

<img width="1200" height="1200" alt="image" src="https://github.com/user-attachments/assets/9eb86e0f-65b9-40db-8a5c-b0bad39d1e88" />

## Project Summary

This is the **frontend application** for the cryptocurrency trading chatbot platform. It provides a user-friendly web interface that allows users to interact with the cryptocurrency trading system through natural language. The frontend features:

- **Web3 Integration**: Secure wallet connection using Phantom wallet
- **Firebase Authentication**: Seamless authentication combining Web3 security with Firebase convenience
- **Natural Language Interface**: Chat-based interface for cryptocurrency operations (swaps, transfers, quotes)
- **Real-time Updates**: Live cryptocurrency quotes and transaction status

Users can connect their Phantom wallet, authenticate securely, and perform cryptocurrency operations using conversational language, making complex DeFi operations accessible to everyone.

---

## 🚀 How to Run

### Prerequisites

- Node.js (v18 or higher)
- NPM or Yarn
- Phantom wallet installed in the browser
- Project created in Firebase Console

### Environment Setup

1. Clone the repository:

```bash
git clone <your-repository>
cd platform
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   Create a `.env` file in the project root with the variables present in `.env.example`:

4. Start the development server:

```bash
npm run dev
```

## 🔐 Login System (Firebase + Phantom)

The authentication system combines Web3 security with Firebase convenience, following this flow:

### Authentication Flow

1. **Initial Connection**
   - User clicks "Connect with Phantom"
   - System checks if Phantom wallet is installed
   - If not installed, redirects to installation page

2. **Firebase Authentication**
   - After connecting with Phantom, system creates an anonymous session in Firebase
   - The wallet address is associated with the user profile
   - Firebase maintains authentication state between sessions

3. **State Management**
   - System monitors changes in wallet connection
   - Wallet disconnection causes automatic logout
   - Authentication state is synchronized between Firebase and application
