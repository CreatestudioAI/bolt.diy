import { ClientOnly } from 'remix-utils/client-only';
import { LoadingOverlay } from './ui/LoadingOverlay';
import { useStore } from '@nanostores/react';
import { authStore } from '~/lib/stores/authStore';

interface UnAuthorizeProps {
  loginUrl: string;
  accessUrl: string;
}

export const UnAuthorize = ({}: UnAuthorizeProps) => {
  const { isLoading } = useStore(authStore);

  if (isLoading) {
    return (
      <>
        <LoadingOverlay />
      </>
    );
  } else {
    return (
      <>
        <ClientOnly>
          {() => (
            <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
              <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1 items-center">
                <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
                  <div className="flex justify-center mb-4">
                    <svg
                      className="w-20 h-20 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01M9.172 16.828a4 4 0 010-5.656l5.656-5.656a4 4 0 015.656 5.656l-5.656 5.656a4 4 0 01-5.656 0z"
                      />
                    </svg>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-800 mb-4">403 - Unauthorized</h1>
                  <p className="text-gray-600 mb-6">Please login on CSAI to continue access this.</p>

                  <div className="flex flex-col space-y-4">
                    <a
                      href="https://createstudio.app/login"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
                    >
                      Click here to login
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ClientOnly>
      </>
    );
  }
};
