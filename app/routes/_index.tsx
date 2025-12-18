import { useStore } from '@nanostores/react';
import { json, type LoaderFunction, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useEffect } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { DriveLoginOverlay } from '~/components/auth/DriveLoginOverlay.client';
import { authStore } from '~/lib/stores/authStore';
import { bootstrapDriveAuth } from '~/utils/auth';

export const meta: MetaFunction = () => {
  return [
    { title: 'Create Studio' },
    { name: 'description', content: 'Talk with Code, an AI assistant from StackBlitz' },
  ];
};

//export const loader = () => json({});

export const loader: LoaderFunction = async ({}) => {
  const response: any = {
    loginUrl: process.env.VITE_API_URL,
    accessUrl: process.env.VITE_APP_URL,
  };
  return json(response);
};

export default function Index() {
  useLoaderData<any>();

  const { hasAccess } = useStore(authStore);

  /*
   * const [hasAccess,setHasAccess] = useState(false);
   * const [loading, setLoading] =  useState(true);
   */
  useEffect(() => {
    bootstrapDriveAuth();
  }, []);

  if (!hasAccess) {
    return (
      <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
        <BackgroundRays />
        <Header />
        <ClientOnly>{() => <DriveLoginOverlay />}</ClientOnly>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <BackgroundRays />
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
    </div>
  );
}
