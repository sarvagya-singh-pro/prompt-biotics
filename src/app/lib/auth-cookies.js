
'use client';

/**
 * Save user UID to cookies with 4-month expiration
 * @param {string} uid - User's Firebase UID
 */
export function saveUserToCookies(uid) {
  if (typeof window === 'undefined') return;
  
  // Set cookie with 4 months (120 days) expiration
  const expiresIn = 120 * 24 * 60 * 60 * 1000; // 120 days in milliseconds
  const expiryDate = new Date(Date.now() + expiresIn);
  console.log(uid)
  document.cookie = `promptbiotics_uid=${uid}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
}

/**
 * Get user UID from cookies
 * @returns {string|null} User UID or null if not found
 */
export function getUserFromCookies() {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    
    if (name === 'promptbiotics_uid') {
      return value || null;
    }
  }
  
  return null;
}

/**
 * Remove user UID from cookies
 */
export function clearUserCookies() {
  if (typeof window === 'undefined') return;
  
  // Set expiry to past date to delete cookie
  document.cookie = 'promptbiotics_uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict';
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export function isUserLoggedIn() {
  return getUserFromCookies() !== null;
}