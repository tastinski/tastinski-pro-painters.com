import { Hono } from 'hono';
import { cors } from "hono/cors"
import { drizzle } from "drizzle-orm/d1"
import { contactLeads } from "./database/schema"

const app = new Hono<{ Bindings: Env }>()
  .basePath('api');

app.use(cors({
  origin: "*"
}))

app.get('/ping', (c) => c.json({ message: `Pong! ${Date.now()}` }));

// Contact form submission endpoint
app.post('/contact', async (c) => {
  try {
    const body = await c.req.json()
    
    const { fullName, phoneNumber, email, projectType, propertyAddress, message } = body
    
    // Validate required fields
    if (!fullName || !phoneNumber || !email) {
      return c.json({ success: false, error: "Missing required fields" }, 400)
    }
    
    // Store in database
    const db = drizzle(c.env.DB)
    await db.insert(contactLeads).values({
      fullName,
      phoneNumber,
      email,
      projectType: projectType || null,
      propertyAddress: propertyAddress || null,
      message: message || null,
      createdAt: new Date().toISOString(),
      emailSent: false,
    })
    
    // Send email notification via Resend
    try {
      const resendApiKey = (c.env as any).RESEND_API_KEY
      
      if (resendApiKey) {
        const emailBody = `New Painting Lead from Website

Name: ${fullName}
Phone: ${phoneNumber}
Email: ${email}

Project Type: ${projectType || 'Not specified'}
Address: ${propertyAddress || 'Not provided'}

Message:
${message || 'No message provided'}

Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} Pacific`

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
        })

        if (!response.ok) {
          console.error('[EMAIL] Resend failed:', response.status, await response.text())
        } else {
          console.log('[EMAIL] Resend sent successfully')
        }
      }
    } catch (emailError) {
      console.error('Email notification failed:', emailError)
    }
    
    return c.json({ 
      success: true, 
      message: "Thank you for your inquiry! We'll be in touch shortly." 
    })
    
  } catch (error) {
    console.error('Contact form error:', error)
    return c.json({ success: false, error: "Something went wrong. Please try again." }, 500)
  }
})

// Email notification helper function
async function sendEmailNotification(
  env: Env,
  to: string,
  subject: string,
  body: string,
  replyTo: string
): Promise<{ success: boolean; error?: string }> {
  // Use AI Gateway if available for sending notifications
  // Or use a simple HTTPS request to an email service
  
  // Method 1: Use Cloudflare Email Workers if configured
  // Method 2: Use external email API (Resend, SendGrid, etc.)
  // Method 3: Use a webhook to trigger email
  
  // For this implementation, we'll try to use a simple MailChannels approach
  // which works with Cloudflare Workers
  
  try {
    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to, name: 'Tastinski Pro Painters' }],
          },
        ],
        from: {
          email: 'noreply@tastinski.com',
          name: 'Tastinski Pro Painters Website',
        },
        reply_to: {
          email: replyTo,
          name: 'Customer',
        },
        subject: subject,
        content: [
          {
            type: 'text/plain',
            value: body,
          },
        ],
      }),
    })
    
    if (response.ok || response.status === 202) {
      return { success: true }
    } else {
      const errorText = await response.text()
      console.error('MailChannels error:', errorText)
      return { success: false, error: errorText }
    }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: String(error) }
  }
}

export default app;
