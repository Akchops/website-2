# Putting this website live on prayatnonline.org

Follow this once and the new site replaces the old one. It takes about half an
hour, most of which is waiting. Everything here is free.

You need two things before starting:

1. The **login for wherever prayatnonline.org was bought** (the domain
   registrar — GoDaddy, BigRock, Namecheap or similar). This is where the
   domain's DNS settings live.
2. A **GitHub account** with this repository, which you already have.

---

## Quickest option: a link to send for review (5 minutes)

If all you need right now is a web address your grandmother can open — no
account, no sign-in, nothing to install — use GitHub Pages. This repository is
public, so it is free.

1. Merge the open pull request into `main` (or skip this and pick the working
   branch in step 3 instead).
2. On github.com open the repository → **Settings** → **Pages**.
3. Under **Build and deployment**, set Source to **Deploy from a branch**,
   choose branch **main** and folder **/ (root)**, then **Save**.
4. Wait two or three minutes. The address will be:

   **https://akchops.github.io/website-2/**

Anyone with that link can open the site on any device. Send it to her as it is.

This is only for review — it does not use the redirect rules in this
repository, so the old website's addresses would not forward. For the real
thing on prayatnonline.org, follow the steps below.

---

## Step 1 — Publish the site (10 minutes)

We will use **Netlify**. It is free, it gives the site HTTPS (the padlock in the
address bar) automatically, and every time the repository is updated the live
site updates by itself.

1. Go to **https://app.netlify.com/signup** and sign up with your GitHub
   account.
2. Click **Add new site → Import an existing project → GitHub**, authorise
   Netlify, and choose the **website-2** repository.
3. Netlify will ask for build settings. Leave them exactly as they are:
   - Build command: **empty**
   - Publish directory: **`.`**

   (The `netlify.toml` file in this repository already tells Netlify what to do.)
4. Click **Deploy**.

Within a minute Netlify gives the site a temporary address like
`sparkly-koala-123abc.netlify.app`. **Open it and check the site works.** This
temporary address is also a good way to share the site for review before the
real domain is switched over.

## Step 2 — Point prayatnonline.org at it (10 minutes, then wait)

1. In Netlify: **Domain settings → Add a domain** → type `prayatnonline.org` →
   **Verify** → **Add domain**.
2. Netlify will show you the DNS records to create. Choose the option to
   **keep your existing DNS provider** — it is the simpler path.
3. Log in to the registrar where the domain was bought, find **DNS settings**
   (sometimes "DNS management" or "Manage DNS"), and set these two records
   exactly as Netlify tells you:

   | Type | Name / Host | Value |
   | --- | --- | --- |
   | `A` | `@` | the IP address Netlify shows you |
   | `CNAME` | `www` | the `.netlify.app` address Netlify shows you |

   **Delete or replace any existing `A` or `CNAME` records for `@` and `www`** —
   those are what currently point at the old website. Leave the `MX` records
   alone: those are the email records, and deleting them would stop email
   working.
4. Save.

Now wait. DNS changes take anywhere from a few minutes to 24 hours to reach
everyone (usually under an hour). During this time some people will see the new
site and some the old one — this is normal and it sorts itself out.

Once it has taken effect, Netlify issues an HTTPS certificate automatically.
Check that **https://www.prayatnonline.org** loads the new site with a padlock.

## Step 3 — Tell Google about it (5 minutes)

Searching for "Prayatn" should eventually bring up the new site, but Google
needs to be told to re-check:

1. Go to **https://search.google.com/search-console** and sign in.
2. Add `prayatnonline.org` as a property and verify it (the DNS verification
   method uses the same registrar page as Step 2).
3. Under **Sitemaps**, submit: `sitemap.xml`
4. Under **URL Inspection**, paste `https://www.prayatnonline.org/` and click
   **Request indexing**.

Google usually refreshes within a few days. Old pages disappearing from search
results can take a few weeks — the redirects in this repository make sure anyone
following an old link still lands somewhere sensible in the meantime.

---

## Setting up donations

The Donate page is built and in the menu, but no payment details are in it yet
— on purpose. Nothing on that page is invented: no account number, no UPI ID,
no payment link. Until real details are added, the page asks people to call or
email instead, which is true and works today.

Everything lives in one place: the `DONATION` block at the top of the generator
(and, if you edit the HTML directly, on `donate.html`). Fill in whatever exists
and the page builds itself around it. Anything left blank is simply not shown.

### Getting a payment link that works

This has to be done by the trust, because it needs the trust's own bank account
and identity documents. Nobody else can do it for you.

**Razorpay** is the usual choice for Indian charities and does not need a
developer:

1. Go to **https://razorpay.com** and sign up as a **non-profit / NGO**.
2. Complete KYC. You will need the trust deed, PAN, the trust's bank account
   details, and address proof. Approval usually takes a few working days.
3. Registered charities get a reduced transaction fee — ask their support to
   apply the NGO rate.
4. Inside Razorpay choose **Payment Links** or **Payment Pages**, create one
   for donations, and copy the address it gives you.
5. Paste that address into `payment_link` in the `DONATION` block.

Alternatives: **Instamojo** (simpler, slightly higher fees) or **Give.do**
(built for Indian non-profits, handles 80G receipts for you).

### UPI

If the trust already has a UPI ID on its bank account, put it in `upi_id`. The
page will show it and add a button that opens the donor's UPI app on a phone.
This is free — no transaction fee — so it is worth having even alongside a
payment link.

### 80G

Put the 80G registration number in `tax_80g` and the trust's PAN in `pan`, and
they appear on the Donate page. Most Indian donors look for these before
giving, so this is worth chasing if the registration exists but the number is
not to hand.

### Before you publish real details

Check every character of the account number, IFSC and UPI ID against a bank
statement — not from memory, and not from an old document. A wrong digit sends
donations to a stranger.

---

## Making the contact forms send email

Until this is done, the forms open the visitor's own email app with the message
filled in. To have messages arrive in the inbox directly:

1. Go to **https://formspree.io**, sign up free, and create a form. Give it the
   address that should receive messages and confirm that address.
2. Formspree gives you an endpoint URL like `https://formspree.io/f/abcdwxyz`.
3. Open `contact.html` and `get-involved.html`, find `data-endpoint=""`, and
   paste the URL between the quotes.
4. Save and push. That is the only change needed.

## Updating the site later

Any change pushed to this repository goes live automatically within a minute.
To edit text without any software:

1. Open the repository on github.com and click the file (for example
   `about.html`).
2. Click the pencil icon, change the words between the tags, and click
   **Commit changes**.

Netlify redeploys on its own. If something goes wrong, Netlify keeps every
previous version — **Deploys → older deploy → Publish deploy** puts the site
back exactly as it was.

---

## If you would rather not use Netlify

The site is plain HTML, so it will work on anything:

- **Cloudflare Pages** — same process, also free; it reads the `_redirects`
  file in this repository.
- **GitHub Pages** — free, but does not support the redirect rules, so old
  links would break.
- **The existing hosting**, if the domain came with any — upload every file in
  this repository to the `public_html` folder over FTP. The redirects will not
  apply, but the site itself will work.

## A note on the old website

Once the domain points at Netlify, the old site is no longer reachable, but it
still exists wherever it was hosted. **Do not cancel that old hosting until the
new site has been live and working for a week or two** — and if the old site has
any photographs worth keeping, download them first.
