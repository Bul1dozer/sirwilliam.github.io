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
npm test             # automated tests (validation, submission logic, DOM behaviour, links, content, carousel)
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
| `assets/gallery.js` | Auto-discovers `images/gallery/1.jpg, 2.png, …` |
| `assets/about-carousel.js` | Auto-rotating, accessible glass carousel in About |
| `assets/contact.js`, `assets/validation.js` | Form validation and Formspree submission |
| `images/projects/` | Project screenshots (see `SCREENSHOTS.md`) |
| `images/gallery/` | Barbering photos — just upload `3.jpg`, `4.png`, … |
| `tests/` | Automated tests |
| `style.css` | Original DeepSite template stylesheet — unused by the page, left untouched |

## Contact form setup and verification

The form endpoint is already set in `assets/config.js` to `https://formspree.io/f/xqpenapv` (the endpoint supplied for this project). The code is wired to submit to it, but a repository configuration alone cannot prove that the Formspree form is active or that delivery to the recipient works.

Before launch, sign in to https://formspree.io and verify:
1. The form ID `xqpenapv` exists in the account.
2. The recipient is `liamroyalty9@gmail.com` and any required recipient verification has been completed.
3. The form is enabled and spam filtering is configured. Add the deployed site domain to allowed domains if the dashboard offers that option.
4. After deploying, submit one controlled test enquiry from a different email address. Confirm it appears under Formspree submissions and reaches the inbox (check Spam too); use Reply to confirm the visitor address is set correctly.

If `xqpenapv` is not the form ID for the correct account/form, replace `formEndpoint` in `assets/config.js` with the exact form URL shown in your Formspree dashboard.

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

## Screenshots and gallery
- Project screenshots: drop PNGs into `images/projects/` using the filenames in `SCREENSHOTS.md`; cards update automatically. The AV, network and Linux cards currently show labelled online stand-in photos until you add the real ones.
- Barbering gallery: upload `3.jpg`, `4.webp`, … to `images/gallery/` (continuous numbers, lowercase extension). See `SCREENSHOTS.md`.
- About carousel: add your own photos as `images/about/profile.jpg`, `images/about/it-support.jpg`, and `images/about/barbering.jpg`. The carousel automatically uses whichever of these files exist; until then it shows the two existing barbering photos. Update the matching alt text and captions in `assets/content.js` if you use different images.

## Social sharing (still to configure)
Add once the production URL exists: `<link rel="canonical">` and `og:image` (absolute URL to a 1200×630 branded image). A TODO marks the spot in `<head>`. No domain or social URLs were invented.

## Notes
- Tailwind is loaded from its CDN (pinned to 3.4.17). Browsers log a "do not use in production" console *warning* for this; it is not an error. Switching to a compiled stylesheet is optional later.
- Binary files on Hugging Face: if a push is rejected for binary files, `.gitattributes` already includes `*.png`, `*.jpg`, `*.webp` for Git LFS/Xet.
