# GitHub Repository Setup

## Option 1: Create New Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `turmeric-chain`
3. Description: `TurmericChain - AI-powered platform connecting turmeric farmers and buyers`
4. Choose **Public** or **Private**
5. **Don't** initialize with README (we already have one)
6. Click "Create repository"

## Option 2: Use Existing Repository

If you already have a GitHub repository, use its URL.

## Connect to GitHub

After creating the repository, run these commands:

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/turmeric-chain.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Or Set Up Manually

1. Copy the repository URL from GitHub
2. Run: `git remote add origin <YOUR_REPO_URL>`
3. Run: `git push -u origin master`

