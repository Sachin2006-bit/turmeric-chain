#!/bin/bash

# GitHub Setup Script for TurmericChain

echo "🚀 Setting up GitHub for TurmericChain..."
echo ""

# Check if origin already exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ Remote 'origin' already exists"
    git remote -v
else
    echo "Please provide your GitHub username:"
    read -r USERNAME
    echo ""
    echo "Adding remote repository..."
    git remote add origin "https://github.com/$USERNAME/turmeric-chain.git"
    echo "✅ Remote added successfully!"
fi

echo ""
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Done! Your code is now on GitHub"
echo "Visit: https://github.com/$USERNAME/turmeric-chain"

