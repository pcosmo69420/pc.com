# petercosmopoulos.com — Portfolio

A minimal Next.js portfolio for Peter Cosmopoulos.

## Local development

Install dependencies and run dev server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Install the Vercel CLI (optional):

```bash
npm i -g vercel
```

2. From project root run:

```bash
vercel login
vercel --prod
```

Vercel will build and deploy the site. Add `petercosmopoulos.com` as a custom domain in your Vercel project settings.

## AI Assistant

This project includes a simple serverless AI assistant at `/assistant` that answers questions about the included profile and projects. It now uses Groq as the primary provider and can fall back to Gemini.

1. Create a local `.env.local` from the example and add your key:

```bash
cp .env.local.example .env.local
# then edit .env.local and set GROQ_API_KEY
```

2. In Vercel, add environment variable `GROQ_API_KEY` so the serverless API can call Groq.

Optional fallback:
- Add `GEMINI_API_KEY` if you also want Gemini fallback.
- Add `GROQ_MODEL` to override the default model (`llama-3.1-8b-instant`).

Security: Keep your key private. Do not commit `.env.local` to Git.

## Initialize private GitHub repo (CLI)

Requires Git and GitHub CLI (`gh`).

```bash
git init
git add .
git commit -m "Initial site"
gh auth login
gh repo create petercosmopoulos/petercosmopoulos.com --private --source=. --remote=origin --push
```

If you prefer the web UI, create a private repo and push the existing repo as remote.

## DNS (point domain to Vercel)

- In your domain registrar, add the records Vercel recommends when you add the domain to the Vercel dashboard (usually an `A` record and/or `CNAME`).
- Recommended: use Vercel's nameservers or the A records they supply.

## Next steps

- Replace placeholder images in `public/images`.
- Add individual project pages and case studies.
- Integrate contact form or Netlify Forms / Formspree / Vercel serverless function.
