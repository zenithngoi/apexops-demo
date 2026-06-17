# ApexOps Demo — Deploy to Vercel

## Option A: GitHub → Vercel (Recommended — auto-deploys on every push)

### Step 1: Push to GitHub
Open **Git Bash** or **Terminal** in `C:\Users\ngoil\Claude\Projects\ApexOps-Demo\` and run:

```bash
# Create a new repo on GitHub first at https://github.com/new
# Name it: apexops-demo (set to Private or Public — your choice)
# Then link and push:

git remote add origin https://github.com/YOUR_USERNAME/apexops-demo.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select **apexops-demo**
4. Vercel auto-detects Vite — no settings to change (vercel.json handles it)
5. Click **"Deploy"**
6. Done — you get a live URL like `https://apexops-demo.vercel.app`

### Step 3: Every future update
```bash
git add -A
git commit -m "feat: your change"
git push
# Vercel auto-deploys in ~30 seconds
```

---

## Option B: Vercel CLI Direct Deploy (no GitHub needed)

Open **Node.js command prompt** or **Git Bash** in `C:\Users\ngoil\Claude\Projects\ApexOps-Demo\` and run:

```bash
npx vercel login
# Opens browser — log in with GitHub/Google/email

npx vercel --prod
# Follow the prompts (accept defaults — vercel.json handles config)
# You get a live URL immediately
```

---

## What gets deployed

- `dist/` folder (Vite production build)
- SPA rewrite rule handles all routes (set in vercel.json)
- API key is entered at runtime in the browser — never in the build

## After deploy

- Open your Vercel URL
- Click 🔑 Set Key → enter your Anthropic API key
- Click ▶ Run Loop
- Agents run live in the browser via CORS-enabled Claude API
