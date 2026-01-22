# CD Pipeline Setup Instructions

Follow these steps to enable the CD pipeline for automatic Cloudflare deployment.

---

## Step 1: Create Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Click **"Create Custom Token"**
4. Configure:
   - **Token name**: `GitHub Actions Deploy`
   - **Permissions**:
     - Account > Cloudflare Pages > Edit
     - Account > Workers Scripts > Edit
   - **Account Resources**: Include > Your Account
5. Click **"Continue to summary"** → **"Create Token"**
6. **Copy the token** (you won't see it again!)

---

## Step 2: Get Cloudflare Account ID

1. Go to https://dash.cloudflare.com
2. Look at the URL: `dash.cloudflare.com/[ACCOUNT_ID]/...`
3. **Copy the Account ID** from the URL

Or:
1. Go to Workers & Pages in the sidebar
2. Find "Account ID" on the right side
3. Click to copy

---

## Step 3: Add Secrets to GitHub

1. Go to your GitHub repository: https://github.com/tigredonorte/bingo
2. Click **Settings** (tab at the top)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **"New repository secret"**

Add these two secrets:

| Name | Value |
|------|-------|
| `CLOUDFLARE_API_TOKEN` | (paste the token from Step 1) |
| `CLOUDFLARE_ACCOUNT_ID` | (paste the account ID from Step 2) |

---

## Step 4: Verify Next.js Config

Ensure `apps/web/next.config.js` has static export enabled:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
};

module.exports = nextConfig;
```

---

## Step 5: Merge and Deploy

Option A - Via GitHub UI:
1. Go to https://github.com/tigredonorte/bingo/pulls
2. Find the PR for your CD setup changes
3. Click **"Merge pull request"**

Option B - Via command line:
```bash
git checkout main
git pull origin main
git merge your-feature-branch
git push origin main
```

---

## Step 6: Monitor Deployment

1. Go to https://github.com/tigredonorte/bingo/actions
2. Watch the **CD** workflow run
3. Once complete, find your app URL in Cloudflare Pages dashboard

---

## Troubleshooting

### "Missing required secrets" error
→ Go back to Step 3 and verify both secrets are added correctly

### "Project not found" error
→ The first deployment creates the project. If it fails, manually create a Pages project named `bingo-web` in Cloudflare dashboard

### Build fails with "output: 'export' required"
→ Go back to Step 4 and update next.config.js

---

## Expected Result

After successful deployment:
- Your app will be live at: `https://bingo-web.pages.dev`
- Future pushes to `main` will auto-deploy
- The CD workflow will show green checkmarks
