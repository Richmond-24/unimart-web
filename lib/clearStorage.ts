/**
 * Clear all app localStorage data for testing/debugging
 */
import { clearAuthCookie } from './authCookie';

export function clearAppStorage() {
  try {
    const keysToRemove = [
      'unimart:token',
      'unimart:user',
      'unimart:splashSeen',
      'unimart:guest',
      'unimart:onboarded',
      'unimart:university',
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    clearAuthCookie();

    console.log('✅ App localStorage cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear localStorage:', error);
    return false;
  }
}

/**
 * Clear ALL localStorage (including third-party items)
 */
export function clearAllStorage() {
  try {
    localStorage.clear();
    console.log('✅ All localStorage cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear localStorage:', error);
    return false;
  }
}

/**
 * Get current stored data for debugging
 */
export function debugAppStorage() {
  const data = {
    token: localStorage.getItem('unimart:token'),
    user: localStorage.getItem('unimart:user'),
    splashSeen: localStorage.getItem('unimart:splashSeen'),
    guest: localStorage.getItem('unimart:guest'),
  };
  console.table(data);
  return data;
}
