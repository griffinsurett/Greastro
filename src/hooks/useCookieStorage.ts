// src/hooks/useCookieStorage.ts
import { useCallback } from 'react';

interface CookieOptions {
  expires?: number; // days
  path?: string;
  sameSite?: 'Strict' | 'Lax' | 'None';
  secure?: boolean;
}

export function useCookieStorage() {
  const getCookie = useCallback((name: string): string | null => {
    try {
      const cookies = document.cookie.split(';');
      const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
      
      if (!cookie) return null;
      
      const value = cookie.split('=')[1];
      return decodeURIComponent(value);
    } catch (error) {
      console.error(`Error reading cookie ${name}:`, error);
      return null;
    }
  }, []);

  const setCookie = useCallback((
    name: string, 
    value: string, 
    options: CookieOptions = {}
  ): void => {
    try {
      const {
        expires = 365,
        path = '/',
        sameSite = 'Strict',
        secure = true,
      } = options;

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expires);

      const cookieParts = [
        `${name}=${encodeURIComponent(value)}`,
        `expires=${expiryDate.toUTCString()}`,
        `path=${path}`,
        `SameSite=${sameSite}`,
      ];

      if (secure) {
        cookieParts.push('Secure');
      }

      document.cookie = cookieParts.join('; ');
    } catch (error) {
      console.error(`Error setting cookie ${name}:`, error);
    }
  }, []);

  const deleteCookie = useCallback((name: string, path: string = '/'): void => {
    try {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
    } catch (error) {
      console.error(`Error deleting cookie ${name}:`, error);
    }
  }, []);

  return { getCookie, setCookie, deleteCookie };
}