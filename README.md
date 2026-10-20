# Grace — Enquiry form

Static enquiry page for **GitHub Pages**: [sharon-iss/form](https://github.com/sharon-iss/form).

Submissions are emailed by your **Gmail** (Google Apps Script) with subject **enquiry**, protected by **Google reCAPTCHA v2**.

**Live site (after Pages is enabled):** https://sharon-iss.github.io/form/

## How it works

```
Visitor form  →  reCAPTCHA  →  Google Apps Script  →  Gmail  →  recipient inbox
(GitHub Pages)
```

## 1. Google reCAPTCHA

1. Open [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin).
2. Create a **reCAPTCHA v2** (“I’m not a robot”) key.
3. Add domains: `sharon-iss.github.io` and `localhost`.
4. Copy the **site key** into `config.js` → `recaptchaSiteKey`.
5. Copy the **secret key** into `apps-script/Code.gs` → `RECAPTCHA_SECRET`.

## 2. Gmail sending (Google Apps Script)

1. Sign in to [script.google.com](https://script.google.com) with your Gmail.
2. New project → paste `apps-script/Code.gs`.
3. Set `RECIPIENT_EMAIL` and `RECAPTCHA_SECRET`.
4. Deploy → New deployment → **Web app** (Execute as: Me, Who has access: Anyone).
5. Paste the Web App URL into `config.js` → `scriptURL`.
6. If you already deployed earlier, **update the deployment** after changing the script (so captcha verification is live).

## 3. GitHub Pages

1. Repo: https://github.com/sharon-iss/form
2. **Settings** → **Pages** → Source: **Deploy from a branch** → `main` / `/ (root)` → Save.
3. Site: https://sharon-iss.github.io/form/

## Files

| File | Purpose |
|------|---------|
| `index.html` | Enquiry form + reCAPTCHA |
| `config.js` | Apps Script URL + reCAPTCHA site key |
| `apps-script/Code.gs` | Gmail sender + captcha verify (secret key) |
| `thanks.html` | Success page |
