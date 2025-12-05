'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { authStore } from '~/lib/stores/authStore';
import { loadUserFromStorage } from '~/utils/auth';

type Status = 'checking' | 'login' | 'ok' | 'no-space';

export function DriveLoginOverlay() {
  const { hasAccess, isLoading } = useStore(authStore);
  const [status, setStatus] = useState<Status>('checking');
  const checkedOnce = useRef(false);

  useEffect(() => {
    const user = loadUserFromStorage();

    if (isLoading && !checkedOnce.current) {
      checkedOnce.current = true;
      setStatus('checking');

      return;
    }

    if (!user) {
      setStatus('login');

      return;
    }

    setStatus(hasAccess ? 'ok' : 'no-space');
  }, [hasAccess, isLoading]);

  if (status === 'ok' || status === 'checking') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[99999] flex items-center justify-center pointer-events-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
        {status === 'login' && (
          <>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Please log in to continue</h2>
            <a
              href="https://createstudio.app/login?source=cs-code"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Login with CS
            </a>
          </>
        )}

        {status === 'no-space' && (
          <>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your storage is full</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please upgrade your storage to continue using this app.
            </p>
            <a
              href="https://drive.createstudio.app/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Upgrade Space
            </a>
          </>
        )}
      </div>
    </div>
  );
}
