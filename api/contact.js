export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fullName, phoneNumber, email, projectType, propertyAddress, message } = req.body;

    // Validate required fields
    if (!fullName || !phoneNumber || !email) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Send email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('[EMAIL] No RESEND_API_KEY found');
      return res.status(500).json({ success: false, error: 'Email service not configured' });
    }

    const emailBody = `New Painting Lead from Website

Name: ${fullName}
Phone: ${phoneNumber}
Email: ${email}

Project Type: ${projectType || 'Not specified'}
Address: ${propertyAddress || 'Not provided'}

Message:
${message || 'No message provided'}

Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} Pacific`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Tastinski Website <onboarding@resend.dev>',
        to: ['kapodze@gmail.com'],
        reply_to: email,
        subject: `New Lead: ${fullName} - ${projectType || 'General Inquiry'}`,
        text: emailBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[EMAIL] Resend failed:', response.status, errorText);
      return res.status(500).json({ success: false, error: 'Failed to send email' });
    }

    console.log('[EMAIL] Resend sent successfully');

    return res.status(200).json({
      success: true,
      message: "Thank you for your inquiry! We'll be in touch shortly."
    });

  } catch (error) {
    console.error('[CONTACT] Error:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
}
