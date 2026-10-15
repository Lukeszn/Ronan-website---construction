RONAN O'TOOLE CONCRETE CUTTING WEBSITE
======================================

Upload the contents of this folder to your host. Netlify is the simplest option
(drag the folder into app.netlify.com/drop): HTTPS, the quote form and spam
filtering all work with no extra setup and no API keys.

BEFORE GOING LIVE, REPLACE THESE PLACEHOLDERS
- Phone number 087 123 4567 / +353871234567 (index.html, main.js, privacy.html, thank-you.html)
- Email info@ronanotooleconcretecutting.ie
- FAQ answers (index.html #faq): confirm they match how Ronan works
- About section: confirm it is accurate
- Capability figures (cut depths, core sizes): confirm they match Ronan's equipment
- Images in /img are free stock photos from Unsplash (Unsplash License, free for
  commercial use, no attribution required). Credits: Alex Gallegos (roadsaw),
  infinity lifespaces (slabcut), Glenov Brankovic (cutoffsaw), Annie Spratt (breakout).
  Replace with Ronan's own job photos when available (same file names,
  1400x1050 and 720x540 small versions, JPEG quality around 80).
- Google Analytics: put your GA4 ID in assets/main.js (GA_ID). It only loads after cookie consent.

LAUNCH CHECKLIST: WHAT IS INCLUDED
 1 Privacy policy ............ privacy.html
 2 Terms and conditions ...... terms.html
 3 No secrets in frontend .... Netlify Forms, no keys in any file
 4 Force HTTPS ............... netlify.toml redirects + HSTS (.htaccess for Apache hosts)
 5 Cookie consent banner ..... analytics blocked until accepted, Reject equally prominent
 6 Meta titles/descriptions .. every page
 7 Social preview image ...... assets/og-image.jpg (1200x630)
 8 Favicon ................... favicon.svg, .ico, 32px PNG, apple-touch-icon, manifest icons
 9 Sitemap + robots.txt ...... sitemap.xml, robots.txt
10 Alt text .................. every image
11 Compressed images ......... all JPEGs optimised, small versions for grids, lazy loading
12 Page load speed ........... one CSS, one small JS file, hero preloaded, fonts swap
13 Colour contrast ........... all text pairs pass WCAG AA (most AAA)
14 Mobile friendly ........... tested at 390px, sticky Call / Free quote bar
15 Custom 404 page ........... 404.html
16 Broken links .............. checked, none found
17 Form validation ........... inline errors, phone/email checks, photo size limits
18 Spam protection ........... honeypot field + 3 second time check + Netlify spam filter
19 Analytics ................. GA4, consent-gated (add your ID)
20 One clear call to action .. "Get a free quote" throughout

After launch: submit sitemap.xml in Google Search Console and set up a
Google Business Profile for Gorey; ask real customers to leave reviews there.
