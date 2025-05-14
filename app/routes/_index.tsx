import { useStore } from '@nanostores/react';
import { json, type LoaderFunction, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useEffect } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { UnAuthorize } from '~/components/UnAuthorize';
import { authStore } from '~/lib/stores/authStore';
import { getTokendetails } from '~/utils/auth';

export const meta: MetaFunction = () => {
  return [
    { title: 'Create Studio' },
    { name: 'description', content: 'Talk with Bolt, an AI assistant from StackBlitz' },
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
  const { loginUrl, accessUrl } = useLoaderData<any>();
  const { hasAccess } = useStore(authStore);

  /*
   * const [hasAccess,setHasAccess] = useState(false);
   * const [loading, setLoading] =  useState(true);
   */
  useEffect(() => {
    /*
     * const inputData: any = {
     *   user_id: '6',
     *   model: 'gpt-4',
     *   total_used_tokens: 4111,
     * };
     * updateToken(inputData);
     */
    getTokendetails();

    /*
     * let accessTokenCsai:any = Cookies.get("access_token_csai_id");
     * let refreshToken:any = Cookies.get("refresh_token_csai_id");
     * accessTokenCsai = accessTokenCsai !== null || accessTokenCsai !== undefined ?  accessTokenCsai : localStorage.getItem('accessTokenCsai');
     * if(accessTokenCsai && refreshToken !== undefined){
     *   localStorage.setItem('accessTokenCsai',accessTokenCsai.trim());
     *   localStorage.setItem('refreshTokenCsai',accessTokenCsai.trim());
     *   setHasAccess(true);
     *   setLoading(false);
     *   fetchUserData(accessTokenCsai)
     * }else {
     *     setHasAccess(false);
     *     setLoading(false);
     *   }
     */
  }, []);

  if (!hasAccess) {
    return (
      <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
        <BackgroundRays />
        <Header />
        <ClientOnly>{() => <UnAuthorize loginUrl={loginUrl} accessUrl={accessUrl} />}</ClientOnly>
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
