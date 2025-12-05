import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();

    const res = await fetch('https://drive.createstudio.app/api/v1/drive-custom', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    return json(data, { status: res.status });
  } catch (error) {
    console.error('Drive Upload API Error:', error);

    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
