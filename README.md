# Charlie test app

<img width="2364" height="1854" alt="CleanShot 2025-10-02 at 15 50 48@2x" src="https://github.com/user-attachments/assets/50c416dd-df45-4837-8f73-5b469b89f7a4" />

Next.js app scaffold placed at `/apps/charlie` using:
- TypeScript + ESLint (Next core-web-vitals)
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- HeroUI (`@heroui/react`)

## Scripts

```bash
npm run dev     # start dev server
npm run build   # build
npm run start   # start production server
npm run lint    # run eslint
npm run typecheck # run TypeScript in noEmit mode
```

No shared workspace config is required; this app is self-contained like the existing apps in this repo.

## Config

- Optional: `NEXT_PUBLIC_CHARLIE_GIST_RAW_URL` can override the default gist JSON source used by the data explorer.
  - When unset, the app fetches the public raw URL from the TEL-101 gist.
