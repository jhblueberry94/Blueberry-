// /api/subscribe.js
// Vercel serverless function: receives an email from the popup form and
// creates a subscriber in beehiiv via their v2 API. The API key lives only
// in the Vercel environment variable BEEHIIV_API_KEY, never in client code.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, source } = req.body || {};

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !publicationId) {
    // Fails safely and logs server-side only, no internals leaked to the client
    console.error('Missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID env vars');
    return res.status(500).json({ error: 'Subscription service is not configured' });
  }

  try {
    const beehiivRes = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          email: email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: 'blueberry-website',
          utm_medium: 'popup',
          utm_campaign: source || 'popup-nav-bar',
        }),
      }
    );

    const data = await beehiivRes.json();

    if (!beehiivRes.ok) {
      console.error('beehiiv API error', beehiivRes.status, data);
      return res.status(502).json({ error: 'Could not complete subscription' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Subscribe handler error', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
