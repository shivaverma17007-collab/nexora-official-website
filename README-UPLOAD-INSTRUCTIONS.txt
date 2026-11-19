# NEXORA Premium Website Redesign

This package replaces the website's visual system with a premium dark, purple/blue-gradient direction inspired by the approved glowing-orb reference.

## Files to upload to the GitHub repository
Upload/replace these paths exactly:

- `index.html`
- `features.html`
- `about.html`
- `vision.html` (new file)
- `calm.html`
- `faq.html`
- `contact.html`
- `install.html`
- `404.html`
- `assets/css/styles.css`
- `assets/js/main.js`
- `assets/img/favicon.svg`
- `assets/img/s-monogram.svg` (new file)
- `site.webmanifest`
- `robots.txt`
- `sitemap.xml`
- `llms.txt`

Keep the existing `privacy.html` and `terms.html` unchanged. Their draft/legal substance is deliberately not rewritten; the new shared stylesheet will restyle their existing layout. Keep `assets/img/social-preview.png` and `README.md` as they are.

## Remove old experience files
After the replacement pages and shared stylesheet are uploaded, delete:

- `assets/css/experience.css`
- `calm.html` is replaced by the new Calm Corner page (do not delete it).

If a separate root-level `experience.css` exists again, delete that too. The new site does not load either experience stylesheet.

## Important
- The live app at `https://nexora-2ab.pages.dev/` is not modified.
- No Supabase settings, keys, database or authentication settings are changed.
- Privacy Policy and Terms remain explicitly marked DRAFT.
- The new Vision page clearly labels profiles, optional sign-in, community and NOVA AI as future directions.
- Creator credit is shown as `Shiva Verma`; no parent-company name is invented.

## Suggested GitHub commit messages
- `Launch premium NEXORA website redesign`
- `Add NEXORA vision roadmap page`
- `Replace old seasonal experience styles`
- `Refresh NEXORA brand monogram and site metadata`

Cloudflare Pages/Workers should pick up the commits through the existing GitHub deployment connection.
