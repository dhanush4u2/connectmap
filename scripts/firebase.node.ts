import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Load .env file for Node.js environment
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../.env') })

// Initialize Firebase Admin SDK with application default credentials
// This will use the Firebase CLI credentials automatically
const app = initializeApp({
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
})

export const db = getFirestore(app)
