# Project screenshots

Place files in `images/projects/`. The cards pick them up automatically by filename — no code changes. If a file is missing, the card shows a labelled "Screenshot placeholder".

**Format:** PNG (or replace the extension in `assets/content.js`), about **1400 px wide**, ideally **16:10** (e.g. 1400×875). Cards crop to 16:10 from the top (`object-fit: cover`); wide dashboards can use `fit: 'contain'` in `content.js`. Keep each file under ~800 KB.

**Privacy check before adding any screenshot:** no real names of learners/clients, no phone numbers, emails, IP addresses, tokens or credentials, no confidential institutional data.

| File | Project | Status |
|---|---|---|
| `lccca-ias-v2.png` | Institutional Administration System (LCCCA-IAS_V2) | Provided — cropped |
| `life-changers-hub.png` | Life Changers Family Radio & Hub | Provided |
| `barbersnap.png` | BarberSnap | Provided |
| `royalmind.png` | RoyalMind | Provided |
| `livestream-av.png` | Livestream and AV Systems (e.g. OBS/ATEM/ProPresenter screen) | Online stand-in until supplied |
| `network-diagnostics.png` | Network Performance Diagnostics (e.g. link-speed / speed-test result with IPs hidden) | Online stand-in until supplied |
| `linux-server.png` | Linux Server and Hosting Setup (terminal session, no secrets) | Online stand-in until supplied |

Also update each project's `alt` text in `assets/content.js` to describe the real image once you add it.

## Barbering gallery ("Recent work") — upload and done
Add photos to `images/gallery/` named **1, 2, 3, …** with a **lowercase** extension (`jpg`, `jpeg`, `png` or `webp`), e.g. `3.jpg`, `4.webp`. They appear automatically, in numeric order, as round thumbnails that open larger on click. No code edits.

- Numbering must be continuous: loading stops at the first missing number (if `5` is missing, `6` is not shown).
- Replace `1.png` / `2.png` (230×230 crops from the flyer) with the originals for sharper photos — square, 460×460 or larger, under ~500 KB each.
- Optional description for screen readers: add `3: 'Skin fade with a sharp line-up'` to `gallery.alts` in `assets/content.js`. Without it, the photo gets a generic description.
- Only publish photos of clients who have agreed. Browsers show harmless "404" lines in the console for numbers/extensions that don't exist — that is how discovery works.
- If nothing is found, the "Recent work" block hides itself.

## Online stand-in images
Until real screenshots exist, the three "Needed" projects show free-licence online photos (Unsplash / Pexels), labelled **"Illustrative image"** on the card. When you add the real file with the exact filename above, it takes over automatically and the label disappears. If an online image ever fails to load, the card shows the labelled placeholder instead.
