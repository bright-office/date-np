# Cloudflare Pages Deployment Guide

## Overview
This documentation site is deployed to Cloudflare Pages using Wrangler CLI.

## URLs
- **Production URL**: https://date-np-docs.pages.dev
- **Latest Deployment**: https://88575e90.date-np-docs.pages.dev

## Deployment Commands

### Quick Deploy
```bash
npm run pages:publish
```
This command builds the site and deploys it in one step.

### Manual Deploy Steps
```bash
# Build the documentation
npm run build

# Deploy to Cloudflare Pages
npm run pages:deploy
```

## Project Configuration
- **Project Name**: `date-np-docs`
- **Build Output Directory**: `build`
- **Build Command**: `docusaurus build`

## Files
- `wrangler.toml` - Cloudflare configuration
- `static/_headers` - HTTP headers configuration
- `static/_redirects` - URL redirect rules

## Setup from Scratch
If you need to recreate the project:

1. Install wrangler: `npm install -g wrangler` or `npm install --save-dev wrangler`
2. Login to Cloudflare: `wrangler login`
3. Create project: `wrangler pages project create date-np-docs`
4. Deploy: `wrangler pages deploy build --project-name=date-np-docs`

## Custom Domain (Optional)
To use a custom domain:
1. Go to Cloudflare Pages dashboard
2. Navigate to your project settings
3. Add custom domain under "Custom domains"
4. Update the `url` field in `docusaurus.config.ts`
