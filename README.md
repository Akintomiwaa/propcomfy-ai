# PropComfy AI — Fresh MVP

Landing-first flow similar to Revi: category tags (Service Apartment, Land, Rent), location cards with specifics, laws and payment options summaries, and a chat helper.

Run locally
- `cd propcomfy-ai && npm i`
- `npm run dev` and open the URL

No‑terminal preview (open directly)
- Open `propcomfy-ai/no-build.html` in your browser (or with Live Server).
- This mirrors the simple, clean landing with four action cards and a chat bar.

What’s inside
- `src/App.tsx`: Landing, tags, locations, chat
- `src/data/locations.ts`: Location specifics, laws, payments
- `src/data/properties.ts`: Sample listings per category
- `src/styles.css`: Minimal dark theme styling

Next steps
- Hook media gallery per location (images/videos)
- Listings page per location + filters
- Auth: create account and save inquiries/payment plans
- Payment plans: collect deposit, schedule installments
- Legal: richer, city-specific law guides with citations/links
