# 🚀 Helper.io — Vercel Deployment Guide

This guide walks you through deploying **both the client (Vite + React) and server (Express.js)** to Vercel using GitHub Actions CI/CD.

---

## 📁 Project Structure

```
(repo root)/
├── client/              # Vite + React frontend
├── server/              # Express.js backend (deployed as serverless)
├── vercel.json          # Vercel config for the server project
└── .github/
    └── workflows/
        ├── deploy-client.yml
        └── deploy-server.yml
```

---

## ✅ Prerequisites

- A **Vercel account** at [vercel.com](https://vercel.com)
- Your code pushed to a **GitHub repository**
- The Vercel CLI installed locally (for the initial project setup only):
  ```bash
  npm install -g vercel
  ```

---

## 🔧 Step 1 — Create Two Vercel Projects

You need **two separate Vercel projects**: one for the client and one for the server.

### Option A: Via Vercel Dashboard (Recommended for beginners)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. When prompted for the **Root Directory**, set it to `client`
4. Give the project a name like `helperio-client`
5. Click **Deploy** — this creates the first project
6. Repeat the above steps, this time setting the **Root Directory** to `server`
7. Give this project a name like `helperio-server`
8. Click **Deploy**

### Option B: Via Vercel CLI (Faster)

Run these commands from the root of your project:

```bash
# Link the client project
cd client
vercel link
# Follow the prompts — create a NEW project named "helperio-client"

# Link the server project
cd ../server
vercel link
# Follow the prompts — create a NEW project named "helperio-server"
```

---

## 🔑 Step 2 — Get Your Vercel Credentials

You need three values from Vercel to configure GitHub Secrets.

### 2a. Vercel Token

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **Create Token**
3. Give it a name (e.g., `github-actions`) and set scope to **Full Account**
4. Copy and save the token — **you won't see it again**

### 2b. Vercel Org ID

1. Go to your Vercel dashboard → **Settings** (top right avatar)
2. Navigate to **General**
3. Copy the **Team ID** (starts with `team_`) — this is your `VERCEL_ORG_ID`

> **Note:** If you're on a personal account (no team), use your personal **User ID** instead. Run `vercel whoami --token=<your-token>` and then check via the Vercel API or inspect your project settings URL.

### 2c. Project IDs

For **each** Vercel project (client and server):

1. Go to your Vercel dashboard
2. Click on the project (e.g., `helperio-client`)
3. Go to **Settings** → **General**
4. Copy the **Project ID** (starts with `prj_`)

---

## 🔐 Step 3 — Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of the following:

| Secret Name | Value | Description |
|---|---|---|
| `VERCEL_TOKEN` | `xxxxxxxxxxxxxxxx` | Your Vercel personal access token |
| `VERCEL_ORG_ID` | `team_xxxxxxxxx` | Your Vercel Team/Org ID |
| `VERCEL_CLIENT_PROJECT_ID` | `prj_xxxxxxxxx` | Project ID of `helperio-client` |
| `VERCEL_SERVER_PROJECT_ID` | `prj_xxxxxxxxx` | Project ID of `helperio-server` |
| `VITE_API_BASE_URL` | `https://helperio-server.vercel.app` | The deployed server URL (add after server is deployed) |

---

## 🌐 Step 4 — Set Environment Variables on Vercel

### For the Server project (`helperio-server`)

Go to Vercel → `helperio-server` → **Settings** → **Environment Variables**, and add all the variables from your `.env` file:

| Variable | Example |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | `your_jwt_secret` |
| `AWS_ACCESS_KEY_ID` | `your_r2_access_key` |
| `AWS_SECRET_ACCESS_KEY` | `your_r2_secret_key` |
| `AWS_ENDPOINT_URL` | `https://<account>.r2.cloudflarestorage.com` |
| `AWS_BUCKET_NAME` | `your_bucket_name` |
| `GEMINI_API_KEY` | `your_gemini_api_key` |
| `OPENROUTER_API_KEY` | `your_openrouter_key` |
| `CLIENT_URL` | `https://helperio-client.vercel.app` |

> Set all variables for **Production**, **Preview**, and **Development** environments.

### For the Client project (`helperio-client`)

Go to Vercel → `helperio-client` → **Settings** → **Environment Variables**, and add:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://helperio-server.vercel.app` |

---

## 🔄 Step 5 — Update CORS in Your Server

Since the server is now deployed, update the CORS origin in `server/index.js` to allow your deployed client URL:

```js
// server/index.js
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
```

---

## 🚢 Step 6 — Trigger Your First Deployment

Push a commit to your `main` branch:

```bash
git add .
git commit -m "chore: add vercel deployment workflows"
git push origin main
```

This will automatically trigger:
- `deploy-server.yml` (if files in `server/` changed)
- `deploy-client.yml` (if files in `client/` changed)

You can monitor the deployment progress in your GitHub repository under the **Actions** tab.

---

## 🧠 How the Workflows Work

### `deploy-client.yml`
- Triggers on pushes to `main` that modify files inside `client/`
- Installs dependencies and builds the Vite app
- Uses the Vercel CLI to deploy the prebuilt output to production

### `deploy-server.yml`
- Triggers on pushes to `main` that modify files inside `server/`
- Installs dependencies (no build step needed for Node.js)
- Uses `server/vercel.json` to configure Express as a Vercel serverless function
- Deploys to production via the Vercel CLI

---

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| `VERCEL_TOKEN` invalid | Regenerate token at vercel.com/account/tokens |
| Wrong `VERCEL_PROJECT_ID` | Double-check in Vercel → Project → Settings → General |
| CORS errors on client | Ensure `CLIENT_URL` env var is set on Vercel server project |
| 404 on API routes | Verify `server/vercel.json` is committed and routes are correct |
| Build fails on client | Check `VITE_API_BASE_URL` is set in Vercel client project env vars |
| `npm ci` fails | Ensure `package-lock.json` is committed (not in `.gitignore`) |

---

## 📌 Final Deployed URLs

After a successful deployment your apps will be live at:

- **Client:** `https://helperio-client.vercel.app`
- **Server:** `https://helperio-server.vercel.app`

> **Tip:** Vercel also provides preview deployments for every PR automatically!
