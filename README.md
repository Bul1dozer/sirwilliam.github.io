---
title: Code & Clippers Portfolio ✂️💻
colorFrom: pink
colorTo: yellow
emoji: 🐳
sdk: static
pinned: false
tags:
  - deepsite-v3
---

# Sir William — Portfolio

A static, no-build portfolio site (HTML + Tailwind CDN + vanilla JS). Hosted as a Hugging Face **static** Space, so there is no server: contact-form delivery uses a hosted form provider (Formspree).

## Run locally

```bash
npm install          # only needed for the tests (installs jsdom)
npm start            # serves the site at http://localhost:8080  (python3 http.server)
npm test             # 34 automated tests (validation, submission logic, DOM behaviour, links, content)
```

There is no production build step — deploy the files as they are.

## Project layout

| Path | Purpose |
|---|---|
| `index.html` | All sections: Home, About, Skills, Projects & Products, Services (+ The Royals Barbers_CK), Contact, footer |
| `assets/site.css` | Design tokens (dark/light), components, responsive rules |
| `assets/config.js` | **Contact-form endpoint** and public contact details |
| `assets/content.js` | **Barbering prices** and **project card data** (edit here, no code changes) |
| `assets/projects.js` | Reusable project-card + details-dialog renderer |
| `assets/contact.js`, `assets/validation.js` | Form validation and Formspree submission |
| `images/projects/` | Project screenshots (see `SCREENSHOTS.md`) |
| `tests/` | Automated tests |
| `style.css` | Original DeepSite template stylesheet — unused by the page, left untouched |

## Activate the contact form (required before launch)

Until this is done the form deliberately **sends nothing** and tells visitors to use email/WhatsApp — it never shows a false success.

1. Create a free account at https://formspree.io and sign in with (or verify) `liamroyalty9@gmail.com`.
2. Click **New Form**, name it "Sir William enquiries", and set the recipient to `liamroyalty9@gmail.com`. Confirm the verification email Formspree sends.
3. Copy the form URL — it looks like `https://formspree.io/f/abcdwxyz`.
4. Open `assets/config.js` and replace `https://formspree.io/f/YOUR_FORM_ID` with that URL.
5. In the Formspree dashboard, enable **reCAPTCHA / spam filtering** for the form (free-tier option) and add your site's domain under the form's allowed domains if offered.
6. Deploy, then verify delivery (below).

Why `config.js` and not an environment variable: this is a static site with no build step, so nothing can inject env vars. A Formspree form URL is public by design (like a form `action`). **Never** place SMTP passwords, API keys or tokens in this repo.

How a submission works: the browser POSTs JSON (`name`, `email`, `_replyto`, `phone`, `service`, `message`, `_subject`) to the endpoint. Formspree emails it to the recipient configured in the dashboard and sets the visitor's address as reply-to. Success is shown only if Formspree answers HTTP 2xx with no error payload. A hidden honeypot field plus client limits (message ≤ 2000 chars) reduce spam; Formspree applies its own server-side validation and spam filtering.

### Verify real delivery
1. Open the deployed site, submit one real enquiry using your own second email address as the visitor.
2. Confirm it arrives at `liamroyalty9@gmail.com` (check Spam the first time) and that **Reply** goes to the visitor's address.
3. Check Formspree → Submissions shows the entry.

## Editing content
- **Prices:** `assets/content.js` → `prices`.
- **Projects:** `assets/content.js` → `projects`. Set `repoUrl` / `liveUrl` only to real public URLs; a button appears automatically. Leave `null` and no button is shown.
- **Contact details:** `assets/config.js`, plus the links in `index.html` (search for `liamroyalty9@gmail.com` and `264817813918`).

## Screenshots
Drop PNGs into `images/projects/` using the filenames in `SCREENSHOTS.md`; cards update automatically. Missing files show a labelled placeholder.

## Social sharing (still to configure)
Add once the production URL exists: `<link rel="canonical">` and `og:image` (absolute URL to a 1200×630 branded image). A TODO marks the spot in `<head>`. No domain or social URLs were invented.

## Notes
- Tailwind is loaded from its CDN (pinned to 3.4.17). Browsers log a "do not use in production" console *warning* for this; it is not an error. Switching to a compiled stylesheet is optional later.
- Binary files on Hugging Face: if a push is rejected for binary files, `.gitattributes` already includes `*.png`, `*.jpg`, `*.webp` for Git LFS/Xet.
