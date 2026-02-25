# Email Notification Setup Guide

Your contact form is currently saving all submissions to the database, but email delivery needs additional configuration.

## Current Status
✅ Contact form submissions are saved to database  
❌ Email notifications need configuration  

## Quick Solutions (Pick One)

### Option 1: Use Resend (Recommended - Free tier available)

1. Go to https://resend.com and sign up
2. Verify your domain (tastinski.com) or use their free testing domain
3. Get your API key from the dashboard
4. Add it to your Cloudflare Worker environment variables:
   - Variable name: `RESEND_API_KEY`
   - Value: `re_xxxxxxxxxx` (your API key)

**Pros:** Reliable, easy setup, free tier includes 100 emails/day

### Option 2: Use Make.com Webhook (No coding required)

1. Go to https://make.com (free account)
2. Create a new scenario
3. Use "Webhooks" module to receive data
4. Add "Gmail" or "Email" module to send email
5. Copy the webhook URL from Make.com
6. Add it to Cloudflare Worker environment variables:
   - Variable name: `WEBHOOK_URL`
   - Value: `https://hook.us1.make.com/xxxxxxxx`

**Pros:** Visual automation builder, can add additional actions (SMS, Slack, etc.)

### Option 3: Use Zapier Webhook

1. Go to https://zapier.com (free tier available)
2. Create a new Zap with "Webhooks by Zapier" trigger
3. Add Gmail or Email action
4. Copy the webhook URL
5. Add to environment variable `WEBHOOK_URL`

**Pros:** Many integrations available

## Check Submissions

Visit this URL to see all form submissions (even without emails):
https://your-website.com/api/leads

This will show you all captured leads in JSON format so you can verify the form is working.

## Current Email Configuration

**Recipient:** kapodze@gmail.com (test mode)  
**Fallback:** MailChannels (may not deliver reliably without domain setup)  

Once you configure one of the above methods, emails will automatically start delivering to kapodze@gmail.com, then you can change it back to contact@tastinski.com.

## Need Help?

Let me know which option you want to use and I can help you set it up!
