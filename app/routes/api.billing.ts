import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';

type BillingBody = {
  email?: string;
  model?: string;
  total_used_tokens?: number;
};

export async function action({ request }: ActionFunctionArgs) {
  const { email, model, total_used_tokens: totalUsedTokens } = (await request.json()) as BillingBody;

  if (!email || !model || !totalUsedTokens) {
    return json(
      {
        status: false,
        action: 'error',
        message: 'Missing required parameters.',
      },
      { status: 400 },
    );
  }

  try {
    const externalRes = await fetch('https://createstudio.app/api/alpha-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_email: email,
        model,
        total_used_tokens: totalUsedTokens,
      }),
    });

    const data = await externalRes.json();

    return json(data, { status: externalRes.status });
  } catch (err) {
    console.error('Billing API Error:', err);

    return json(
      {
        status: false,
        action: 'error',
        message: 'Something went wrong while charging usage.',
      },
      { status: 500 },
    );
  }
}
