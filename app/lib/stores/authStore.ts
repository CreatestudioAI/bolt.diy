// src/stores/authStore.js
import { map } from 'nanostores';

/*
 * interface AuthStore {
 *     set(arg0: { user: any; accessToken: any; error: null; isLoading: boolean; }): unknown;
 *     setKey(arg0: string, arg1: boolean): unknown;
 *     user: any | null;
 *     accessToken: string | null;
 *     error: string | null;
 *     isLoading: boolean;
 * }
 */
export const authStore = map<{
  user: any; // user can now be any type
  accessToken: string | null;
  hasAccess: boolean;
  error: string | null;
  isLoading: boolean;
}>({
  user: null,
  accessToken: null,
  hasAccess: false,
  error: null,
  isLoading: true,
});
