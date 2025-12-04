import { doc, updateDoc, increment, arrayUnion, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { Achievement } from '../types'
import { ACHIEVEMENTS } from '../types'

/**
 * XP System Configuration
 * - 100 XP = 1 Level
 * - Adding a review: 120 XP
 * - Adding a new place: 360 XP
 * - Making a friend: 60 XP
 * - Saving a place: 10 XP
 */

export const XP_CONFIG = {
  REVIEW: 120,
  NEW_PLACE: 360,
  FRIEND: 60,
  SAVE_PLACE: 10,
  XP_PER_LEVEL: 100
}

/**
 * Calculate level from total XP
 */
export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_CONFIG.XP_PER_LEVEL) + 1
}

/**
 * Calculate XP needed for next level
 */
export function calculateXPForNextLevel(currentXP: number): { current: number; needed: number; progress: number } {
  const currentLevelXP = currentXP % XP_CONFIG.XP_PER_LEVEL
  const neededXP = XP_CONFIG.XP_PER_LEVEL
  const progress = (currentLevelXP / neededXP) * 100
  
  return {
    current: currentLevelXP,
    needed: neededXP,
    progress
  }
}

/**
 * Award XP to user and check for level ups and achievements
 */
export async function awardXP(
  userId: string,
  xpAmount: number,
  category: 'foodie' | 'explorer' | 'curator' | 'social'
): Promise<{
  leveledUp: boolean
  newLevel: number
  achievementsUnlocked: Achievement[]
}> {
  const userRef = doc(db, 'user_profiles', userId)
  
  try {
    // Get current user data
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
      throw new Error('User not found')
    }
    
    const userData = userSnap.data()
    const currentXP = userData.xp || 0
    const currentLevel = userData.level || 1
    const newXP = currentXP + xpAmount
    const newLevel = calculateLevel(newXP)
    const leveledUp = newLevel > currentLevel
    
    // Update XP and level
    const updates: any = {
      xp: increment(xpAmount),
      updatedAt: new Date()
    }
    
    if (leveledUp) {
      updates.level = newLevel
    }
    
    // Update category-specific level
    const categoryLevelField = `${category}Level`
    const currentCategoryXP = userData[`${category}XP`] || 0
    const newCategoryXP = currentCategoryXP + xpAmount
    const newCategoryLevel = calculateLevel(newCategoryXP)
    
    updates[`${category}XP`] = increment(xpAmount)
    if (calculateLevel(newCategoryXP) > (userData[categoryLevelField] || 1)) {
      updates[categoryLevelField] = newCategoryLevel
    }
    
    await updateDoc(userRef, updates)
    
    // Check for achievement unlocks
    const achievementsUnlocked = await checkAchievements(userId, userData)
    
    return {
      leveledUp,
      newLevel,
      achievementsUnlocked
    }
  } catch (error) {
    console.error('Error awarding XP:', error)
    throw error
  }
}

/**
 * Check and unlock achievements
 */
async function checkAchievements(userId: string, userData: any): Promise<Achievement[]> {
  const unlockedAchievements: Achievement[] = []
  const currentAchievements = userData.achievements || []
  
  const userRef = doc(db, 'user_profiles', userId)
  
  // Check each achievement
  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (currentAchievements.includes(achievement.id)) {
      continue
    }
    
    let shouldUnlock = false
    
    // Check conditions based on achievement ID
    switch (achievement.id) {
      case 'first_place':
        shouldUnlock = (userData.placesCount || 0) >= 1
        break
      case 'first_review':
        shouldUnlock = (userData.reviewCount || 0) >= 1
        break
      case 'foodie_10':
        shouldUnlock = (userData.reviewCount || 0) >= 10
        break
      case 'explorer_25':
        shouldUnlock = (userData.placesCount || 0) >= 25
        break
      case 'social_5':
        shouldUnlock = (userData.friendCount || 0) >= 5
        break
    }
    
    if (shouldUnlock) {
      // Unlock achievement
      await updateDoc(userRef, {
        achievements: arrayUnion(achievement.id),
        unlockedAchievements: increment(1),
        xp: increment(achievement.xpReward)
      })
      
      unlockedAchievements.push(achievement)
    }
  }
  
  return unlockedAchievements
}

/**
 * Award XP for adding a review
 */
export async function awardReviewXP(userId: string) {
  return awardXP(userId, XP_CONFIG.REVIEW, 'curator')
}

/**
 * Award XP for adding a new place
 */
export async function awardPlaceXP(userId: string) {
  return awardXP(userId, XP_CONFIG.NEW_PLACE, 'explorer')
}

/**
 * Award XP for making a friend
 */
export async function awardFriendXP(userId: string) {
  return awardXP(userId, XP_CONFIG.FRIEND, 'social')
}

/**
 * Award XP for saving a place
 */
export async function awardSavePlaceXP(userId: string) {
  return awardXP(userId, XP_CONFIG.SAVE_PLACE, 'foodie')
}

/**
 * Get achievement by ID
 */
export function getAchievement(achievementId: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === achievementId)
}

/**
 * Get user's unlocked achievements
 */
export function getUserAchievements(userAchievementIds: string[]): Achievement[] {
  return ACHIEVEMENTS.filter(a => userAchievementIds.includes(a.id))
}
