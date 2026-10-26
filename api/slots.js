// /api/slots.js
// Vercel serverless function: returns the next few free times for the
// 30-min call, read from Cal.com's public availability for the event type.
// No API key needed; this only reads public availability, the same times
// anyone sees on the booking page. Cached for 5 minutes at the edge.

const CAL_API = 'https://api.cal.eu/v2/slots';
const USERNAME = 'josh-huggins-mkwhu8';
const EVENT_SLUG = '30min';
const MIN_NOTICE_HOURS = 3; // don't offer a slot starting in the next few hours
const HOW_MANY = 3;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const start = new Date();
  const end = new Date(start.getTime() + 14 * 864e5);
  const url = CAL_API +
    '?eventTypeSlug=' + encodeURIComponent(EVENT_SLUG) +
    '&username=' + encodeURIComponent(USERNAME) +
    '&start=' + start.toISOString().slice(0, 10) +
    '&end=' + end.toISOString().slice(0, 10) +
    '&timeZone=UTC';

  try {
    const r = await fetch(url, { headers: { 'cal-api-version': '2024-09-04' } });
    if (!r.ok) throw new Error('Cal.com ' + r.status);
    const body = await r.json();
    const earliest = Date.now() + MIN_NOTICE_HOURS * 36e5;
    const slots = [];
    Object.keys(body.data || {}).sort().forEach(function (day) {
      (body.data[day] || []).forEach(function (s) {
        const t = typeof s === 'string' ? s : s && s.start;
        if (t && new Date(t).getTime() >= earliest) slots.push(new Date(t).toISOString());
      });
    });
    // One slot per day reads better than three back-to-back on the same morning.
    const picked = [];
    const days = {};
    slots.forEach(function (t) {
      const d = t.slice(0, 10);
      if (picked.length < HOW_MANY && !days[d]) { days[d] = 1; picked.push(t); }
    });
    slots.forEach(function (t) {
      if (picked.length < HOW_MANY && picked.indexOf(t) === -1) picked.push(t);
    });
    picked.sort();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ slots: picked });
  } catch (err) {
    console.error('slots error', err);
    // The page falls back to a plain "pick a time" button.
    res.setHeader('Cache-Control', 's-maxage=60');
    return res.status(200).json({ slots: [] });
  }
}
