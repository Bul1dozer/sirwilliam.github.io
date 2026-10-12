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
| `livestream-av.png` | Livestream and AV Systems (e.g. OBS/ATEM/ProPresenter screen) | **Needed** |
| `network-diagnostics.png` | Network Performance Diagnostics (e.g. link-speed / speed-test result with IPs hidden) | **Needed** |
| `linux-server.png` | Linux Server and Hosting Setup (terminal session, no secrets) | **Needed** |

Also update each project's `alt` text in `assets/content.js` to describe the real image once you add it.
