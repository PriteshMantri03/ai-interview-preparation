# Complete Deployment Guide: Render (Backend) & Vercel (Frontend)

This project consists of:
- **Backend (Express + MongoDB + Groq AI + Puppeteer PDF)**: Deployed to **Render**.
- **Frontend (React 19 + Vite + SCSS)**: Deployed to **Vercel**.

---

## 1. Backend Deployment (Render)

You can deploy the backend using **Option A (Docker - Recommended)** or **Option B (Node Web Service)**.

### Option A: Docker Web Service (Recommended for 100% Puppeteer PDF Support)
Because Puppeteer requires Linux system libraries (like `libnss3`, `libatk`, `libcups`), a Docker container ensures Chromium runs smoothly on Render without missing library errors.

1. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your GitHub repository (`PriteshMantri03/ai-interview-preparation`).
3. Configure the service:
   - **Name**: `yt-genai-api` (or any name you prefer)
   - **Region**: Oregon or Frankfurt
   - **Language / Runtime**: **Docker**
   - **Docker Context**: `Backend`
   - **Dockerfile Path**: `Backend/Dockerfile`
   - **Instance Type**: Free or Starter
4. Add the **Environment Variables** (see table below).
5. Click **Create Web Service**.

---

### Option B: Node Web Service
If you prefer not to use Docker:
1. In Render, select **Web Service** with runtime **Node**.
2. Settings:
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
3. Add the **Environment Variables**.
4. *Note*: In the standard Node runtime, if Render lacks Chromium shared libraries, users can still generate resumes and save/print them directly to PDF via the **"Preview & Print"** button in the app!

---

### Backend Environment Variables on Render

| Key | Example Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production security and cookie settings |
| `PORT` | `3000` | Port for Express server |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` | MongoDB connection string |
| `JWT_SECRET` | `your-secure-random-32-char-string` | Used to sign auth JWT tokens |
| `GROQ_API_KEY` | `gsk_...` | Groq API key for AI generation |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Your Vercel frontend URL (no trailing slash) |

> ⚠️ **Important MongoDB Atlas Setting**:
> In [MongoDB Atlas](https://cloud.mongodb.com/), go to **Network Access** → Click **Add IP Address** → Choose **Allow Access From Anywhere (`0.0.0.0/0`)**. Render uses dynamic IP addresses that will be blocked unless `0.0.0.0/0` is permitted.

Once deployed, visit `https://<your-service>.onrender.com/health` in your browser. It should return:
```json
{"status":"ok"}
```

---

## 2. Frontend Deployment (Vercel)

1. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New...** → **Project**.
2. Import your GitHub repository.
3. Configure Project Settings:
   - **Root Directory**: Click **Edit** and select `Frontend`.
   - **Framework Preset**: `Vite` (auto-detected).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<your-render-service>.onrender.com` *(your exact Render backend URL, with NO trailing slash)*
5. Click **Deploy**.

> 💡 **Remember**: Vite bakes environment variables into the static bundle at build time. If you ever change `VITE_API_URL` in Vercel, you must trigger a **Redeploy** (Redeploy with existing build cache disabled) for the new URL to take effect.

---

## 3. Post-Deployment Verification

1. Copy your live Vercel URL (e.g. `https://your-app.vercel.app`).
2. Go to Render → Your API service → **Environment** → Update `FRONTEND_URL` to match your Vercel URL.
3. Open your Vercel site:
   - Click **Register** → Create a new account.
   - You will automatically be logged in and taken to the Home page.
   - Enter a **Target Job Description**.
   - Either upload a **Resume (PDF)** or type a **Self-Description**.
   - Click **Generate My Interview Strategy & Resume**.
   - Review your custom match score, technical questions, behavioral questions, and preparation roadmap.
   - Click **Download PDF** or **Preview & Print** to get your AI-generated ATS-friendly resume!
