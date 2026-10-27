# Seivy AI

A premium dark-theme AI chat starter using Node.js, Express, and the OpenAI Responses API.

## Requirements

- Node.js 20 or newer
- An OpenAI API key for AI replies (API usage may cost money; a ChatGPT plan does not automatically include API credits)

## Run locally (Windows)

1. Install Node.js from https://nodejs.org/ (choose the LTS version).
2. Extract this folder and open it in Visual Studio Code.
3. In VS Code, select **Terminal → New Terminal**.
4. Run:

   ```bash
   npm install
   ```

5. Copy `.env.example` to a new file named `.env`.
6. Open `.env` and replace `put_your_secret_key_here` with your API key.
7. Run:

   ```bash
   npm start
   ```

8. Open http://localhost:3000 in your browser.

## API key safety

- Keep the key only in `.env` or the hosting provider's server-side environment variables.
- `.env` is excluded by `.gitignore`; do not upload it to GitHub.
- Never add the key to files inside `public/`.
- Do not share screenshots or messages that reveal your key.
- For public launch, add stronger abuse protection, authentication, usage limits, and monitoring.

## Deploy to Vercel

This project uses Express. Vercel supports Express deployments; follow its current guide:
https://vercel.com/docs/frameworks/backend/express

1. Push this project to a private GitHub repository (without `.env`).
2. Import the repository at https://vercel.com/new.
3. In the Vercel project settings, add these Environment Variables:
   - `OPENAI_API_KEY` = your secret key
   - `OPENAI_MODEL` = `gpt-4.1-mini` (or a model available to your API account)
4. Deploy and open the URL Vercel provides.

If the project settings require redeployment after environment-variable changes, redeploy the project.

## Troubleshooting

- `npm is not recognized`: close and reopen the terminal after installing Node.js.
- AI says not configured: confirm `.env` exists in the project root, then restart `npm start`.
- API key rejected: create/check your key in the OpenAI platform and check that API billing/permissions are set up.
- Model not found: set `OPENAI_MODEL` to a model available to your API account.
- Port in use: change `PORT=3001` in `.env` and open `http://localhost:3001`.

## Current limitations

This starter keeps chat history in the current browser session only. It does not include accounts, a database, file uploads, web search, or streaming responses.
