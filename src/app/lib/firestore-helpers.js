import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase-config.js';

/**
 * Save survey data to Firestore
 * @param {string} userId - The user's UID from Firebase Auth
 * @param {object} surveyData - The complete survey data object
 */
export async function saveSurveyData(userId, surveyData) {
  try {
    const userDocRef = doc(db, 'users', userId);
    
    await updateDoc(userDocRef, {
      surveyData: surveyData,
      surveyCompleted: true,
      surveyCompletedAt: new Date().toISOString()
    });
    
    console.log('Survey data saved successfully');
    return { success: true };
  } catch (error) {
    console.error('Error saving survey data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get survey data from Firestore
 * @param {string} userId - The user's UID from Firebase Auth
 */
export async function getSurveyData(userId) {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return { 
        success: true, 
        data: data.surveyData || null,
        completed: data.surveyCompleted || false
      };
    } else {
      return { success: false, error: 'User document not found' };
    }
  } catch (error) {
    console.error('Error getting survey data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save chat message to Firestore
 * @param {string} userId - The user's UID
 * @param {object} message - The message object
 */
export async function saveChatMessage(userId, message) {
  try {
    const chatRef = doc(db, 'chats', userId);
    const chatDoc = await getDoc(chatRef);
    
    if (chatDoc.exists()) {
      // Append to existing messages
      const existingMessages = chatDoc.data().messages || [];
      await updateDoc(chatRef, {
        messages: [...existingMessages, {
          ...message,
          timestamp: new Date().toISOString()
        }],
        lastUpdated: new Date().toISOString()
      });
    } else {
      // Create new chat document
      await setDoc(chatRef, {
        userId: userId,
        messages: [{
          ...message,
          timestamp: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving chat message:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get chat history from Firestore
 * @param {string} userId - The user's UID
 */
export async function getChatHistory(userId) {
  try {
    const chatRef = doc(db, 'chats', userId);
    const chatDoc = await getDoc(chatRef);
    
    if (chatDoc.exists()) {
      return { 
        success: true, 
        messages: chatDoc.data().messages || []
      };
    } else {
      return { success: true, messages: [] };
    }
  } catch (error) {
    console.error('Error getting chat history:', error);
    return { success: false, error: error.message, messages: [] };
  }
}