// Allure Pools — contact form endpoint (Vercel serverless function)
// Receives the website form POST, sends a branded email via Resend.
// The Resend API key lives ONLY here as an environment variable — never in the website.

const LOGO_URL = 'https://imbodendesign-lgtm.github.io/allure-pools/assets/logo.jpg';

// Allow the website origins to call this endpoint (CORS).
const ALLOWED_ORIGINS = [
  'https://imbodendesign-lgtm.github.io',
  'https://allurepoolslv.com',
  'https://www.allurepoolslv.com',
  'http://localhost:3000',
  'http://127.0.0.1:5500'
];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function row(label, value) {
  if (!value) return '';
  return (
    '<tr>' +
    '<td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;font-weight:bold;color:#0D1B3E;width:38%;vertical-align:top;text-transform:uppercase;letter-spacing:0.5px;">' +
    esc(label) +
    '</td>' +
    '<td style="padding:10px 0;border-bottom:1px solid #eee;font-size:15px;color:#3a4763;">' +
    esc(value) +
    '</td>' +
    '</tr>'
  );
}

function buildEmail(d) {
  const phoneDigits = (d.phone || '').replace(/[^0-9+]/g, '');
  const callBtn = d.phone
    ? '<a href="tel:' + esc(phoneDigits) + '" style="display:inline-block;background:#C9A84C;color:#0D1B3E;font-weight:bold;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:15px;">Call ' + esc(d.name || 'Customer') + '</a>'
    : '';
  const emailBtn = d.email
    ? '<a href="mailto:' + esc(d.email) + '" style="display:inline-block;background:#0D1B3E;color:#ffffff;font-weight:bold;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:15px;">Email Reply</a>'
    : '';
  const messageBlock = d.message
    ? '<tr><td style="padding:4px 28px 8px;"><div style="font-size:12px;font-weight:bold;color:#0D1B3E;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:8px;">Message</div><div style="background:#F8F6F1;border-left:4px solid #C9A84C;border-radius:8px;padding:16px 18px;color:#3a4763;font-size:15px;line-height:1.55;">' + esc(d.message).replace(/\n/g, '<br>') + '</div></td></tr>'
    : '';

  return (
'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
'<body style="margin:0;padding:0;background:#F8F6F1;">' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F6F1;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">' +
'<tr><td align="center">' +
'<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(13,27,62,0.10);">' +
'<tr><td style="height:6px;background:#C9A84C;line-height:6px;font-size:6px;">&nbsp;</td></tr>' +
'<tr><td align="center" style="padding:28px 24px 4px;"><img src="' + LOGO_URL + '" alt="Allure Pools Service &amp; Repair" width="140" style="display:block;width:140px;height:auto;border:0;"></td></tr>' +
'<tr><td align="center" style="padding:6px 24px 0;">' +
'<div style="font-family:Georgia,\'Times New Roman\',serif;font-size:24px;font-weight:bold;color:#0D1B3E;">New Pool Quote Request</div>' +
'<div style="font-size:12px;color:#6B7A99;padding-top:6px;letter-spacing:1.5px;text-transform:uppercase;">From the Allure Pools website</div>' +
'</td></tr>' +
'<tr><td style="padding:22px 28px 6px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">' +
row('Name', d.name) + row('Phone', d.phone) + row('Email', d.email) + row('Service Area', d.area) + row('Service Requested', d.service) +
'</table></td></tr>' +
messageBlock +
'<tr><td align="center" style="padding:20px 24px 28px;">' + callBtn + (callBtn && emailBtn ? '&nbsp;&nbsp;' : '') + emailBtn + '</td></tr>' +
'<tr><td style="background:#0D1B3E;padding:18px 24px;text-align:center;color:#cfd6e6;font-size:12px;line-height:1.6;">' +
'<strong style="color:#C9A84C;">Allure Pools Service &amp; Repair</strong><br>702-483-8424 &nbsp;·&nbsp; Henderson, NV &nbsp;·&nbsp; Mon–Fri 8AM–5PM' +
'</td></tr>' +
'</table></td></tr></table></body></html>'
  );
}

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.indexOf(origin) !== -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    if (!body || typeof body !== 'object') body = {};

    // Honeypot: bots tick this hidden checkbox.
    if (body.botcheck) return res.status(200).json({ success: true });

    const d = {
      name: (body.Name || body.name || '').toString().trim(),
      email: (body.Email || body.email || '').toString().trim(),
      phone: (body.Phone || body.phone || '').toString().trim(),
      area: (body['Service Area'] || body.area || '').toString().trim(),
      service: (body['Service Requested'] || body.service || '').toString().trim(),
      message: (body.Message || body.message || '').toString().trim()
    };

    if (!d.name || !d.email) {
      return res.status(400).json({ success: false, message: 'Please include at least a name and email.' });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ success: false, message: 'Server not configured (missing RESEND_API_KEY).' });
    }

    const fromEmail = process.env.FROM_EMAIL || 'Allure Pools <onboarding@resend.dev>';
    const toEmail = process.env.TO_EMAIL || 'imbodendesign@gmail.com';
    const subject = 'New Pool Quote Request — ' + d.name + (d.area ? ' (' + d.area + ')' : '');

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: d.email,
        subject: subject,
        html: buildEmail(d)
      })
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return res.status(502).json({ success: false, message: 'Email service error.', detail: data });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Unexpected error.' });
  }
};
