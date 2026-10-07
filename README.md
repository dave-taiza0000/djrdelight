# 🍰 DJR Delights

A mobile-style dessert ordering app prototype (static HTML/CSS/JS, no build step needed).

## Pages

| Page | File |
|---|---|
| Log in | `index.html` |
| Sign up | `signup.html` |
| Home | `homeDJR.html` |
| Categories | `categoriesDJR.html` |
| Favorites | `favoriteDJR.html` |
| Cart | `orderDJR.html` |
| Order History | `orderHistory.html` |
| Checkout | `checkout.html` |
| Receipt | `receipt.html` |
| Thank you | `thankyou.html` |
| Account | `accountDJR.html` |
| Edit Profile | `editProfile.html` |
| Delivery Address | `deliveryAddress.html` |
| Payment Method | `paymentMethod.html` |
| Settings | `settings.html` |
| Help Center | `helpCenter.html` |

## Ordering flow

Home/Categories (Add to cart) → Orders (review, edit qty, remove) → Checkout (address, payment, place order) → Receipt (order confirmation) → Thank You (order again or sign out).

"Order Again" loops back to Home with an empty cart, ready for a new order — the loop continues until the user signs out from the Account page.

`index.html` is the entry point so it loads automatically on GitHub Pages / Netlify.

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/djr-delights.git
git push -u origin main
```

(If this folder is already a git repo — check by running `git log` — skip `git init` and just add your remote and push.)

## Deploy to Netlify

**Option A — drag and drop (fastest):**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag this whole folder onto the page
3. Done — Netlify gives you a live URL instantly

**Option B — connect your GitHub repo (auto-deploys on every push):**
1. Push this folder to GitHub (see above)
2. In Netlify: **Add new site → Import an existing project → GitHub**
3. Pick the `djr-delights` repo
4. Build command: leave blank · Publish directory: `.`
5. Click **Deploy site**

No build tools, frameworks, or environment variables are required — it's plain HTML/CSS/JS.

## Viewing new user registrations (Netlify Forms)

`signup.html` is wired into **Netlify Forms** — no backend or database needed. Once the site is deployed on Netlify (drag-and-drop or GitHub-connected, either works), every sign-up is captured automatically.

**To see registrations:** Netlify dashboard → your site → **Forms** tab → **signup**. Each submission shows the name, email, and terms-agreement — new ones appear within seconds of someone signing up.

A few things worth knowing:
- **Passwords are never sent to Netlify.** Only full name, email, and terms-agreement are submitted — this is a demo/prototype, not real authentication, and storing plain-text passwords anywhere isn't safe practice.
- Netlify Forms **only works once the site is actually deployed on Netlify** — opening `signup.html` locally (double-clicking the file, or a non-Netlify host) will skip straight to the Home page without recording anything.
- A hidden honeypot field (`bot-field`) is included for basic spam filtering.
- If submissions aren't showing up after deploying, check **Site settings → Forms** in Netlify to confirm form detection is enabled (it is by default).

## Signed-in profile

Signing up or logging in now actually changes what you see in the app:

- **Sign up** saves the name/email as a "registered" account (in `localStorage`, see caveat below) and immediately signs that person in.
- **Home page** greets them by name ("Welcome, Maria!") and **Account page** shows their real name and email instead of the old hardcoded "Juan Dela Cruz".
- **Log in** looks up the email against anyone who's signed up before on that device/browser; if it matches, it greets them by their real name. If the email's never been seen before, it guesses a friendly name from the email (e.g. `maria@gmail.com` → "Maria") so the app never just says generic "User".
- **Log out** clears the active session, so the Account page reverts to a "Guest" placeholder until someone logs in or signs up again.

## Order history

Every completed checkout is now saved to a real history, not just the most recent one. Account → **My Orders** shows every past order (newest first), each with:

- Order # and date
- An itemized summary
- Total and payment method
- A **status badge** — since there's no real backend tracking deliveries, this is simulated purely from how long ago the order was placed: **Preparing** (first 5 min) → **Out for Delivery** (5–15 min) → **Delivered** (15+ min). It's for demo purposes, not a real courier integration.

The Cart page (bottom nav 🛒) also has a "View past orders →" link to the same page.

## Account page rows — what each one actually does

- **Edit Profile** — update your name/email; updates the Home greeting and Account header immediately.
- **Delivery Address** — save a real address; it now shows up on the Checkout page automatically (with a "Change address" link back here), instead of the old hardcoded placeholder.
- **Payment Method** — add GCash / Card / Cash on Delivery methods, set a default, remove one. Checkout now lists *these* saved methods instead of generic ones, once you've added at least one.
- **Settings** — toggles for push/email/promo notifications (saved, but don't trigger real notifications — there's no backend to send them). Also includes **Clear App Data**, a one-tap reset of cart, favorites, address, payment methods, and session — handy for demoing from a clean slate.
- **Help Center** — a static FAQ accordion plus feedback/email contact links.

## Notes

- This is still a front-end prototype, not real authentication: accounts and sessions live in `localStorage`, so they're per-browser/per-device, there's no password checking, and clearing site data wipes them. (Sign-ups are also separately recorded via Netlify Forms once deployed, see above, for a durable record visible to you as the site owner.)
- "Continue with Google / Facebook" buttons are placeholders — wire up real OAuth later if needed.
