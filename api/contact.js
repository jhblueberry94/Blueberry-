export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, company, email, message, website, ts } = req.body;

  // Honeypot: real visitors never populate this field, since it's hidden
  // off-screen and never shown to a human. Non-empty = bot filling every
  // field it finds in the DOM. Reply 200 so the bot thinks it worked and
  // doesn't retry or escalate.
  if (website) {
    return res.status(200).json({ success: true });
  }

  // Timing token: the current frontend always sends the page-load timestamp.
  // Missing ts means the request didn't come from the real form (a script
  // hitting this endpoint directly). Reject rather than silently accept,
  // since accepting would let scripts skip the check by omitting the field.
  if (!ts || typeof ts !== 'number') {
    return res.status(400).json({ error: 'Invalid submission' });
  }
  const elapsed = Date.now() - ts;
  if (elapsed < 2000) {
    return res.status(200).json({ success: true }); // fail silently, same as honeypot
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Blueberry Media Website <noreply@blueberry-media.co.uk>',
        to: ['josh@blueberry-media.co.uk'],
        reply_to: email,
        subject: `New enquiry from ${name}${company ? ` at ${company}` : ''}`,
        html: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Company:</strong> ${company || '—'}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
