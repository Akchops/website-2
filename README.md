# Prayatn — website

A new website for **Prayatn**, a registered Public Charitable Trust working with
disadvantaged communities in Kalkaji, New Delhi since 1992.

Plain HTML, CSS and JavaScript — no frameworks and no build step. Open any
`.html` file in a browser and it works. That keeps it fast, free to host
anywhere, and easy for anyone to maintain years from now.

Animation uses [Motion](https://motion.dev) (MIT), vendored locally at
`assets/js/vendor/motion.min.js` so the site has no external dependencies at
runtime. If it ever fails to load, the pages stay complete and readable.

**To put this live on prayatnonline.org, follow [DEPLOY.md](DEPLOY.md).**

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home |
| `about.html` | About Us — story, beliefs, how we work, governance |
| `our-work.html` | Our Work — education, healthcare, women development |
| `gallery.html` | Photo gallery (click any photo to enlarge) |
| `get-involved.html` | Volunteer, partner, support + enquiry form |
| `contact.html` | Address, phone, email, map + contact form |
| `404.html` | Page-not-found |

The navigation is deliberately flat: five links and nothing nested inside them.

```
assets/css/style.css        all styling (design tokens at the top)
assets/js/main.js           menu, lightbox, forms, animation
assets/js/vendor/           Motion, vendored (MIT)
assets/img/                 images — currently placeholders
netlify.toml, _redirects    hosting config and old-URL redirects
DEPLOY.md                   how to publish on prayatnonline.org
```

## Viewing it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Things still to do

Search the project for `TODO` — every spot that needs real information is
marked in the HTML with a comment explaining what to put there. The main ones:

1. **Photographs.** Everything in `assets/img/` is a coloured placeholder.
   Replace them with real photos, keeping the same filenames (any web format
   works — change the `src` extension in the HTML if you use `.jpg`). Suggested
   sizes: hero `900×1100`, cards `900×650`, gallery `800×800`.
2. **Real numbers.** The stats on the home page currently show what we could
   verify. Children enrolled, patients seen, women supported — those numbers
   are far more persuasive. Set `data-count="…"` on the stat and edit the label.
3. **Registration details.** `trustees.html` should list the trust registration
   number and any 12A / 80G / FCRA / CSR numbers. Donors and grant-makers look
   for these first.
4. **Founding story.** The 1992 details on `about.html` came from public NGO
   directory listings, not from Prayatn directly — please check them.
5. **Trustee names and photos** on `trustees.html`, if the board is happy to be
   listed publicly.
6. **Donations.** `get-involved.html` has a marked spot for a UPI ID, bank
   details or a payment link when you are ready to accept money online.

## Making the forms actually send email

Right now the contact and volunteer forms open the visitor's own email app with
the message filled in. To receive submissions directly instead:

1. Create a free form endpoint at [formspree.io](https://formspree.io) and
   confirm the email address it should forward to.
2. Paste the endpoint URL into the `data-endpoint=""` attribute on the `<form>`
   in both `contact.html` and `get-involved.html`.

That's the only change needed — the JavaScript handles the rest, including the
success and error messages.

## Hosting

The site is static, so any of these work and are free:

- **Netlify** or **Cloudflare Pages** — connect this repository, no build
  command, publish directory `/`. Gives free HTTPS and a deploy on every push.
- **GitHub Pages** — Settings → Pages → deploy from this branch.

Then point `prayatnonline.org` at the host by updating the domain's DNS records.
Keep the existing page addresses in mind: the old site used paths like
`/about-us` and `/board-details`, so set up redirects to `/about.html` and
`/trustees.html` if any old links are still circulating.

## Editing content

The header and footer are repeated in each HTML file — if you change a menu
item or the phone number, update it in every page (search and replace works
well). Colours, fonts and spacing are all defined once as variables at the top
of `assets/css/style.css`.
