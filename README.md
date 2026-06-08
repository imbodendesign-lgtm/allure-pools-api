# Allure Pools — Contact Form API

A single Vercel serverless function that receives the website's contact form
and sends a **branded HTML email** (logo + navy/gold) via [Resend](https://resend.com).

The Resend API key lives **only** here as an environment variable — never in the
public website.

```
Customer submits form  →  /api/contact (this function)  →  Resend  →  email to inbox
```

## Environment variables (set in Vercel → Project → Settings → Environment Variables)

| Name | Required | Example | Notes |
|------|----------|---------|-------|
| `RESEND_API_KEY` | ✅ yes | `re_xxxxxxxx` | From resend.com → API Keys |
| `TO_EMAIL` | optional | `allurepools@gmail.com` | Where leads are delivered. Defaults to `imbodendesign@gmail.com` (test inbox). |
| `FROM_EMAIL` | optional | `Allure Pools <quotes@allurepoolslv.com>` | Defaults to `Allure Pools <onboarding@resend.dev>` (works before the domain is verified in Resend). |

## Deploy (no CLI needed)

1. Push this repo to GitHub (already done if you're reading this on GitHub).
2. Go to **vercel.com → Add New → Project**, import this repo.
3. **Project Name:** `allure-pools-api` (gives the URL `https://allure-pools-api.vercel.app`).
4. Add the env var `RESEND_API_KEY` (and optionally `TO_EMAIL` / `FROM_EMAIL`).
5. **Deploy.** Your endpoint is `https://allure-pools-api.vercel.app/api/contact`.

## Going live (after allurepoolslv.com is verified in Resend)

- Add the domain in Resend → Domains, add the DNS records they give you.
- Set `FROM_EMAIL=Allure Pools <quotes@allurepoolslv.com>` and `TO_EMAIL=allurepools@gmail.com` in Vercel, then redeploy.

## Local field mapping

The function accepts both pretty labels and lowercase keys:
`Name/name`, `Email/email`, `Phone/phone`, `Service Area/area`, `Service Requested/service`, `Message/message`.
A hidden `botcheck` field acts as a spam honeypot.
