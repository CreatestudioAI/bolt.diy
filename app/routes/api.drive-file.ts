import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';

export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();

    const res = await fetch('https://drive.createstudio.app/api/v1/drive-custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('Content-Type') || 'application/octet-stream';
    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      status: res.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('Drive File API Error:', error);
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
