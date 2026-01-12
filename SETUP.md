# Setup Guide

## Initial Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up PostgreSQL Database

#### Option A: Local PostgreSQL
Create a database:
```bash
createdb pos_db
```

#### Option B: Vercel Postgres (Recommended for Production)
1. Go to your Vercel project dashboard
2. Navigate to Storage → Create Database → Postgres
3. Copy the connection string

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pos_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-string-here"

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_TOKEN="your-api-token"
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Set Up Sanity CMS

1. Create a Sanity account at https://www.sanity.io
2. Create a new project
3. Copy your Project ID and Dataset name
4. Generate an API token with Editor permissions
5. Add these to your `.env.local` file

### 5. Initialize Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Run the Application

```bash
# Terminal 1: Run Next.js app
npm run dev

# Terminal 2: Run Sanity Studio (optional, for local CMS)
npm run sanity
```

Visit:
- App: http://localhost:3000
- Sanity Studio: http://localhost:3333

### 7. Create Your First User

1. Go to http://localhost:3000/signup
2. Create an account
3. Login at http://localhost:3000/login

### 8. Add Products

1. Go to http://localhost:3333 (Sanity Studio)
2. Click "Create" → "Product"
3. Fill in product details:
   - Name
   - Barcode (unique)
   - Category (Beer, Wine, Spirits, Cider, Other)
   - Price
   - Stock Quantity
   - ABV (optional)
4. Click "Publish"

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `DATABASE_URL` (from Vercel Postgres)
   - `NEXTAUTH_URL` (your Vercel URL)
   - `NEXTAUTH_SECRET` (generate a new one)
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_API_TOKEN`
5. Click "Deploy"

### 3. Run Database Migrations

After deployment, run:
```bash
npx prisma migrate deploy
```

Or use Vercel's CLI:
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### 4. Deploy Sanity Studio

```bash
npm run sanity:deploy
```

This will deploy Sanity Studio to a public URL where you can manage products.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists

### Sanity Connection Issues
- Verify project ID and dataset match your Sanity project
- Check API token has correct permissions
- Ensure CORS settings allow your domain

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

### Build Errors
- Run `npx prisma generate` before building
- Check all environment variables are set
- Verify Node.js version is 18+

## Next Steps

1. Add more products through Sanity Studio
2. Process test transactions
3. Review sales history
4. Customize the UI to match your brand

