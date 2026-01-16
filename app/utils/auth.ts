import { authStore } from '~/lib/stores/authStore';
import { profileStore, updateProfile } from '~/lib/stores/profile';
import { checkDriveSpace } from '~/lib/services/drive';

const CS_USER_KEY = 'cs_user';

export interface DriveUser {
  email: string;
  name?: string;
}

const saveUser = (user: DriveUser) => {
  localStorage.setItem(CS_USER_KEY, JSON.stringify(user));

  authStore.setKey('user', user);

  if (user.name) {
    updateProfile({ username: user.name });
  }
};

export const loadUserFromStorage = (): DriveUser | null => {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(CS_USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DriveUser;
  } catch {
    return null;
  }
};

export const bootstrapDriveAuth = async () => {
  authStore.setKey('isLoading', true);

  // 1. Capture email/name from query params if present
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const name = params.get('name');

    if (email) {
      saveUser({ email, name: name || undefined });

      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  const user = loadUserFromStorage();

  if (!user) {
    authStore.setKey('user', null);
    authStore.setKey('hasAccess', false);
    authStore.setKey('isLoading', false);

    return;
  }

  authStore.setKey('user', user);

  if (!profileStore.get().username && user.name) {
    updateProfile({ username: user.name });
  }

  try {
    const hasSpace = await checkDriveSpace(user.email);
    authStore.setKey('hasAccess', hasSpace);
  } catch (err: any) {
    authStore.setKey('error', err.message || 'Failed to verify storage');
    authStore.setKey('hasAccess', false);
  } finally {
    authStore.setKey('isLoading', false);
  }
};

export const updateToken = async (inputData: { email: string; model: string; total_used_tokens: number }) => {
  try {
    const response = await fetch('/api/billing', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputData),
    });

    if (!response.ok) {
      throw new Error('Billing request failed');
    }
  } catch (error) {
    console.log('error', error);
  }
};
