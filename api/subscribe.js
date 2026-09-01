// /api/subscribe.js
// Vercel serverless function: receives an email from the popup form and
// creates a subscriber in beehiiv via their v2 API. The API key lives only
// in the Vercel environment variable BEEHIIV_API_KEY, never in client code.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, source, website, ts } = req.body || {};

  // Honeypot: real visitors never populate this field, since it's hidden
  // off-screen and never shown to a human. Non-empty = bot filling every
  // field it finds in the DOM. Reply 200 so the bot thinks it worked and
  // doesn't retry or escalate.
  if (website) {
    return res.status(200).json({ ok: true });
  }

  // Timing token: the current frontend always sends the page-load timestamp.
  // Missing ts means the request didn't come from the real form (a script
  // hitting this endpoint directly with just an email). Reject rather than
  // silently accept, since accepting would let scripts skip the check
  // entirely just by omitting the field.
  if (!ts || typeof ts !== 'number') {
    return res.status(400).json({ error: 'Invalid submission' });
  }
  const elapsed = Date.now() - ts;
  if (elapsed < 2000) {
    return res.status(200).json({ ok: true }); // fail silently, same as honeypot
  }

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
