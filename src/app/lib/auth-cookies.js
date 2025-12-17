'use client';

export function saveUserToCookies(uid) {
  if (typeof window === 'undefined') return;
  const expiresIn = 120 * 24 * 60 * 60 * 1000; 
  const expiryDate = new Date(Date.now() + expiresIn);
  document.cookie = `promptbiotics_uid=${uid}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
}

export function getUserFromCookies() {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'promptbiotics_uid') return value || null;
  }
  return null;
}

export function clearUserCookies() {
  if (typeof window === 'undefined') return;
  document.cookie = 'promptbiotics_uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict';
}
