# NEXORA Official Website

A separate, static marketing website for NEXORA. It is intentionally independent of the existing app at https://nexora-2ab.pages.dev/.

## Contents

- `index.html` — complete responsive landing page
- `privacy.html` — privacy policy draft, clearly marked for verification
- `terms.html` — terms and conditions draft, clearly marked for verification
- `install.html` — device-aware guide for opening NEXORA and using supported browser install / Add to Home Screen options
- `404.html` — branded not-found page
- `assets/css/styles.css` — all styles and responsive layouts
- `assets/js/main.js` — mobile navigation, scroll reveals, FAQ interaction
- `assets/img/` — favicon and social sharing image
- `robots.txt`, `sitemap.xml`, `site.webmanifest` — discovery and browser metadata

## Important before launch

1. Create a **new Cloudflare Pages project** for this website. Do not select, edit, or redeploy the existing `nexora-2ab` app project.
2. Upload the contents of this folder (not the ZIP file itself) to the new Pages project using Cloudflare Pages Direct Upload, or put these files in a new GitHub repository and connect that new repository to a new Pages project.
3. After Cloudflare assigns the website URL, replace every `REPLACE-WITH-YOUR-WEBSITE-DOMAIN` occurrence in `sitemap.xml` with the final hostname, including `https://` and no trailing slash after the hostname. For example, if the assigned address were `nexora-site.pages.dev`, use `https://nexora-site.pages.dev`.
4. Replace the placeholder hostname in the `Sitemap:` line in `robots.txt` (for example: `Sitemap: https://nexora-site.pages.dev/sitemap.xml`).
5. Add a canonical URL to each HTML page only after the final domain is known. The Open Graph and Twitter social-sharing metadata and preview image are already included.
6. Do not publish the Privacy Policy or Terms as final legal documents until the highlighted verification checklist on each page has been completed. The legal pages are drafts, not legal advice.
7. Submit the final sitemap in Google Search Console after the site is live. Indexing and rankings are not guaranteed.

## Design and technical notes

- No framework, package manager, build command, external font request, analytics SDK, ad pixel, or website form is required.
- The hero planet, cards, UI preview and ambient effects are made with CSS, keeping the site light and self-contained.
- The app showcase is explicitly labelled as an illustrative preview, not a screenshot or claim about exact in-app UI.
- Planned user profile and community features are identified as future plans, not live functionality.
- The site includes reduced-motion handling, a keyboard skip link, focus styles, semantic sections and a mobile navigation menu.

## Local preview

Open `index.html` in a browser, or serve the folder with any static web server. There is no build step.

## App installation note

The `install.html` page explains the supported browser pathways for Android, iPhone/iPad, Windows, Linux and Mac, and links to the existing app. It does not download a native APK/IPA or force-install the app. The website and app are on different origins, so a website cannot trigger the app-origin PWA install prompt. A real install prompt depends on the existing app having a valid web app manifest, service worker/offline setup and meeting each browser's install criteria. This package does not modify the existing live app. App Store / Google Play distribution requires separate store publishing.
