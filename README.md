# 🏝️ Holidate

Plan a holiday **together** — two people (or a whole crew) share calendars, wishlists, comfort preferences and flight finders, then get proposed trips that actually work for everyone.

**Live:** https://cloudetteai.github.io/Holidate/

Static single-page app (vanilla JS, no build step), styled after The Roster's honey-gold / plum luxe DNA — reimagined tropical: sunset hero, turquoise & coral, bubble chips, tap-cycle thumbs 👍 → 👉 sideways → 👎, business-card crew cards, elegant serif headings, sticky person switcher, phone bottom tab bar + responsive desktop grid.

## Demo mode
Until `firebase-config.js` is filled in, the app runs in **DEMO MODE**: everything (crew, trips, calendars, votes, comments, deals) is stored in this browser's `localStorage`. Use the **"Acting as"** switcher at the top to answer, vote and comment as each person — both sides of a trip live in the same browser in demo. Invite links/codes work in this browser. Tap **Load sample data** in the footer to reseed.

## Features
- **Pairing / groups, invite-only:** create a trip (Couple, Girls trip, Friends, Family, Work crew, Custom), invite via share link + code (`#join=SUN-1234`). No public discovery — only invited people can join. Trips are 2+ people.
- **My Travel Crew:** Roster-style business cards for your travel partners — code names, travel-style tags, past trips, comfort prefs at a glance. Add/remove crew members per trip.
- **Calendar upload per person:** upload a `.ics` export (parsed in-browser), add busy blocks by date, or paste text containing `YYYY-MM-DD` busy dates. Combined 6-week availability heatmap finds where **everyone** is free. Google / Apple Calendar direct sync is a "coming soon" placeholder (needs OAuth).
- **Vacation choices per person:** destinations, hotels/Airbnbs, restaurants, activities/add-ins with budget + vibe tags. Everyone votes with the Roster tap-thumb (👍 love / 👉 sideways-maybe / 👎 pass); cards flag **💚 MATCH** when everyone loves something.
- **Comfort questionnaire per person:** shared room vs same room/separate beds vs separate rooms, budget-split style, flight times, seat prefs, pace, nightlife, food, and add-ins (spa, excursions, rental car, childcare, pet care…). Produces a group compatibility summary + a "talk about it" list where answers differ.
- **Flight price finder / alerts:** set finder rules (origin, destination/anywhere, max price, date window, min trip days). In demo, **Find deals** generates sample deal cards matching your rules.
- **Proposed holidays:** generated from overlapping free windows + matched destinations + budget (e.g. "You're all free Dec 18–27 · everyone loved Aruba · est. $1,100/person"). Each person Accepts / Tweaks / Declines; when everyone accepts it becomes an itinerary stub.
- **Social layer:** per-trip activity feed (who added / voted / commented), comments + ❤️🌴🔥 reactions on destinations and proposals, `@mentions` in comments (demo), and shareable Moments / photo stubs.

## Turning on real accounts & sharing (Firebase)
1. Go to https://console.firebase.google.com → **Add project** (e.g. `holidate`).
2. **Build → Authentication → Get started → Sign-in method**: enable **Google**. (Apple requires a paid Apple Developer account + Services ID/key, same as The Roster.)
3. **Authentication → Settings → Authorized domains** → add `cloudetteai.github.io`.
4. **Build → Firestore Database → Create database** (production mode). Open **Rules**, paste [`firestore.rules`](firestore.rules), **Publish**. Trips are member-only, invite codes are fetchable only by exact code, and there is deliberately **no listing / no public discovery**.
5. **Project settings → General → Your apps → Web (</>)** → register app → copy the config into [`firebase-config.js`](firebase-config.js), replacing the placeholders. Commit & push; Pages redeploys.
   Then wire the demo's localStorage layer to Auth + Firestore (`users/{uid}`, `trips/{tripId}` with `memberUids`, `invites/{code}`) — the rules already match that shape.

(The Firebase web config is not secret — security comes from the rules.)

## Real flight deals (later)
Demo deals are sample data. For live prices/alerts you need a flight API key and a small backend/scheduled job (API keys must not ship in this static page):
- **Amadeus** (self-service test keys) or **Skyscanner / Travelpayouts** affiliate APIs.
- Store finder rules in Firestore, poll prices server-side (Cloud Functions / GitHub Actions cron), and write deal cards + alerts back to the trip.

## Local dev
`python3 -m http.server` in this folder, then open http://localhost:8000
