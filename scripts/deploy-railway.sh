#!/bin/bash

echo "🚀 Railway Deployment Helper"
echo "=============================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway:"
    railway login
fi

echo ""
echo "📋 Pre-deployment checklist:"
echo "1. ✅ GitHub repository is pushed"
echo "2. ✅ Railway CLI is installed and logged in"
echo "3. ⚠️  Make sure you have created a GitHub OAuth App"
echo "4. ⚠️  Have your environment variables ready"
echo ""

read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🏗️  Initializing Railway project..."
railway init

echo ""
echo "📦 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📝 Next steps:"
echo "1. Go to your Railway dashboard: https://railway.app/dashboard"
echo "2. Add PostgreSQL database service"
echo "3. Configure environment variables:"
echo "   - NEXTAUTH_URL (your Railway app URL)"
echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
echo "   - GITHUB_ID (from GitHub OAuth App)"
echo "   - GITHUB_SECRET (from GitHub OAuth App)"
echo "   - GITHUB_TOKEN (optional)"
echo "4. Update your GitHub OAuth App with the Railway URL"
echo ""
echo "📖 Full guide: ./RAILWAY_DEPLOYMENT.md" 