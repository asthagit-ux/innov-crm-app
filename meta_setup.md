# Meta (Facebook) Leads Webhook Setup Guide

**Webhook Endpoint:** `/api/webhook/meta`  
**Trigger:** Facebook Lead Ad form submission  
**Result:** Lead auto-created in CRM with status `NEW`

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [How the Flow Works](#2-how-the-flow-works)
3. [Step 1 — Deploy the App](#3-step-1--deploy-the-app)
4. [Step 2 — Set Up Meta Developer App](#4-step-2--set-up-meta-developer-app)
5. [Step 3 — Register the Webhook](#5-step-3--register-the-webhook)
6. [Step 4 — Get a Long-Lived Page Access Token](#6-step-4--get-a-long-lived-page-access-token)
7. [Step 5 — Connect Your Facebook Page](#7-step-5--connect-your-facebook-page)
8. [Step 6 — Test the Webhook](#8-step-6--test-the-webhook)
9. [Environment Variables Reference](#9-environment-variables-reference)
10. [What Data Gets Captured](#10-what-data-gets-captured)
11. [Troubleshooting](#11-troubleshooting)
12. [Important Limitations & Known Issues](#12-important-limitations--known-issues)

---

## 1. Prerequisites

Before starting, make sure you have:

- [ ] App deployed on a public URL (Vercel or any hosting)
- [ ] A **Facebook Developer Account** — [developers.facebook.com](https://developers.facebook.com)
- [ ] A **Facebook Page** that runs your Lead Ads
- [ ] A **Meta App** created in the developer portal (or create one during setup)
- [ ] A valid **Page Access Token** for that Facebook Page
- [ ] The `DEFAULT_USER_ID` in `.env` must match a real user in your Neon database

---

## 2. How the Flow Works

```
User submits Facebook Lead Ad form
        ↓
Facebook sends POST to /api/webhook/meta
        ↓
Webhook receives leadgen_id
        ↓
App calls Meta Graph API to fetch full lead details
https://graph.facebook.com/v19.0/{leadgen_id}?access_token=...
        ↓
Lead is created in CRM database (status: NEW, platform: Meta)
        ↓
Lead appears in CRM dashboard
```

**Verification Flow (one-time, on webhook registration):**
```
Meta sends GET /api/webhook/meta?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
        ↓
App checks verify token matches META_WEBHOOK_VERIFY_TOKEN
        ↓
App returns hub.challenge value → Meta confirms webhook
```

---

## 3. Step 1 — Deploy the App

Facebook webhooks require a **publicly accessible HTTPS URL**. `localhost` will not work.

### Option A: Deploy to Vercel (Recommended)

1. Push your code to GitHub (`asthagit-ux/innov-crm-app`)
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Select the `innov-crm-app` repository
4. Set **Root Directory** to `innov-crm-app` (since it's nested)
5. Add all environment variables from your `.env` file in the Vercel dashboard:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL` ← update this to your Vercel production URL
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
   - `META_WEBHOOK_VERIFY_TOKEN`
   - `META_PAGE_ACCESS_TOKEN`
   - `DEFAULT_USER_ID`
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `CRON_SECRET`
6. Deploy → your URL will be something like `https://innov-crm-app.vercel.app`

### Option B: Test Locally with ngrok (for development only)

If you want to test webhooks locally before deploying:

```bash
# Install ngrok
brew install ngrok

# Start your dev server
npm run dev

# In a new terminal, expose port 3000
ngrok http 3000
```

ngrok will give you a temporary public URL like `https://abc123.ngrok.io`.  
Use this as your webhook URL during testing. Note: this URL changes every time you restart ngrok.

---

## 4. Step 2 — Set Up Meta Developer App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click **My Apps** → **Create App**
3. Select app type: **Business**
4. Fill in:
   - App Name: `Innov CRM` (or any name)
   - Contact Email: your email
   - Business Account: select your business
5. Click **Create App**
6. Once created, note down your **App ID** and **App Secret** (Settings → Basic)

### Add Required Products

In your app dashboard, add these products:
- **Webhooks** — for receiving lead notifications
- **Facebook Login** — for Page access token generation
- **Lead Ads** (if not already added)

---

## 5. Step 3 — Register the Webhook

1. In your Meta App dashboard, go to **Webhooks** (left sidebar)
2. Click **Add Subscriptions** → select **Page** as the object type
3. Click **Subscribe to this object**
4. Fill in:
   - **Callback URL:** `https://your-domain.com/api/webhook/meta`
   - **Verify Token:** `innovcrm_webhook_2024` (matches `META_WEBHOOK_VERIFY_TOKEN` in `.env`)
5. Click **Verify and Save**
   - Meta will send a GET request to your endpoint
   - If your app is running and the token matches, it will return the challenge and verification will succeed
6. After saving, find the **leadgen** field in the subscription list and click **Subscribe**

> If verification fails, double check:
> - Your app is deployed and accessible
> - `META_WEBHOOK_VERIFY_TOKEN` in `.env` exactly matches what you entered in the portal
> - No trailing spaces in the token

---

## 6. Step 4 — Get a Long-Lived Page Access Token

Short-lived tokens expire in ~1 hour. For production, you need a **long-lived token** or a **System User token**.

### Method A: Generate Long-Lived Token via Graph API Explorer

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your App from the dropdown
3. Click **Generate Access Token** → select your Facebook Page
4. Grant permissions: `pages_show_list`, `leads_retrieval`, `pages_read_engagement`
5. Copy the short-lived token
6. Exchange for long-lived token by calling:

```
GET https://graph.facebook.com/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id={APP_ID}
  &client_secret={APP_SECRET}
  &fb_exchange_token={SHORT_LIVED_TOKEN}
```

7. You'll get a token valid for ~60 days
8. Update `META_PAGE_ACCESS_TOKEN` in your `.env` and Vercel environment variables

### Method B: System User Token (Never Expires — Recommended for Production)

1. Go to [Meta Business Suite](https://business.facebook.com) → Settings → System Users
2. Create a new System User with **Admin** role
3. Assign your Facebook Page to the System User
4. Generate token with permissions: `leads_retrieval`, `pages_show_list`, `pages_read_engagement`
5. This token **never expires** — ideal for production
6. Update `META_PAGE_ACCESS_TOKEN` in your `.env`

---

## 7. Step 5 — Connect Your Facebook Page

1. In your Meta App dashboard, go to **Webhooks**
2. Under **Page** subscriptions, click **Add Page**
3. Select the Facebook Page that runs your Lead Ads
4. Confirm the Page Access Token has the required permissions

### Required Permissions for the Page Access Token

| Permission | Purpose |
|---|---|
| `leads_retrieval` | Fetch lead form data |
| `pages_show_list` | List pages |
| `pages_read_engagement` | Read page activity |

---

## 8. Step 6 — Test the Webhook

### Test with Meta's Lead Ad Testing Tool

1. Go to your Meta App → **Lead Ads Testing Tool**
   - URL: `https://developers.facebook.com/tools/lead-ads-testing`
2. Select your Page and Lead Form
3. Click **Create Lead** to simulate a form submission
4. Check your CRM — a new lead should appear within seconds with:
   - Platform: `Meta`
   - Status: `NEW`
   - Assigned to the user set in `DEFAULT_USER_ID`

### Verify via Prisma Studio

```bash
npm run prisma:studio
```

Open `http://localhost:5555` and check the `Lead` table for the new entry.

### Check Webhook Logs

On Vercel: go to your project → **Functions** tab → find `/api/webhook/meta` → view logs

---

## 9. Environment Variables Reference

| Variable | Value in .env | Description |
|---|---|---|
| `META_WEBHOOK_VERIFY_TOKEN` | `innovcrm_webhook_2024` | Must match the token entered in Meta Developer Portal during webhook registration |
| `META_PAGE_ACCESS_TOKEN` | `EAANN6g...` | Page Access Token for calling Meta Graph API to fetch lead data |
| `DEFAULT_USER_ID` | `c0710c7e-3345-45a4-9913-e762d3111930` | CRM user ID that new Facebook leads get assigned to |

> **Important:** `DEFAULT_USER_ID` must be a valid user ID that exists in your Neon database. If this user doesn't exist, lead creation will fail silently.

---

## 10. What Data Gets Captured

### Currently captured from Facebook lead form:

| CRM Field | Facebook Field |
|---|---|
| `customerName` | `full_name` or `name` |
| `contactNumber` | `phone_number` or `phone` |
| `platform` | hardcoded as `"Meta"` |
| `status` | hardcoded as `"NEW"` |
| `leadCreatedDate` | current timestamp |
| `userId` | `DEFAULT_USER_ID` from env |

### Fields available from Facebook but NOT yet captured:

If your lead ad form collects these fields, the code can be updated to save them:

| Facebook Field Name | CRM Field |
|---|---|
| `email` | `email` |
| `city` | `city` |
| `state` | `state` |
| `zip_code` | — |
| `street_address` | — |
| `country` | — |
| `company_name` | — |
| `job_title` | — |

To capture more fields, update the `prisma.lead.create` call in `app/api/webhook/meta/route.ts`.

---

## 11. Troubleshooting

### Webhook verification fails
- Ensure app is deployed and URL is publicly accessible
- Confirm `META_WEBHOOK_VERIFY_TOKEN` in `.env` exactly matches what you entered in Meta portal
- Check there are no extra spaces or quote characters in the token

### Leads not appearing in CRM after form submission
- Check that the `leadgen` field subscription is active in your webhook settings
- Verify `META_PAGE_ACCESS_TOKEN` is valid and not expired (test it in Graph API Explorer)
- Verify `DEFAULT_USER_ID` exists in the database
- Check Vercel function logs for errors at `/api/webhook/meta`

### `403 Forbidden` on webhook verification
- The verify token doesn't match — update either the `.env` value or the Meta portal entry

### `Foreign key constraint failed` error in logs
- `DEFAULT_USER_ID` does not exist in the database — run the seed or create a user manually

### Page Access Token expired
- Short-lived tokens expire in ~1 hour
- Exchange for a long-lived token (60 days) or use a System User token (never expires)
- Update `META_PAGE_ACCESS_TOKEN` in both `.env` and Vercel environment variables

---

## 12. Important Limitations & Known Issues

1. **No duplicate check** — if the same person submits the form twice, two leads will be created
2. **Only 2 fields captured** — name and phone only; email, city, state are ignored even if collected
3. **Single assignee** — all Facebook leads go to one user (`DEFAULT_USER_ID`); no round-robin or rule-based assignment
4. **No error alerting** — webhook errors are only logged to console; no email/Slack alert on failure
5. **Token expiry** — if the Page Access Token expires, leads will silently stop importing (Graph API call fails but webhook returns 200)
6. **No retry mechanism** — if the CRM is down when Facebook sends the webhook, the lead is lost (Facebook retries for ~24 hours but there's no queue)
