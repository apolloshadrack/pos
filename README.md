# Liquor Store POS System

A modern Point of Sale (POS) system built with Next.js, Sanity CMS, and PostgreSQL, designed for liquor stores.

## Features

- **Point of Sale**: Add products to cart, process transactions with multiple payment methods
- **Inventory Management**: View and manage products through Sanity Studio
- **Sales History**: Track all transactions with filtering by date
- **Authentication**: Secure login/signup with NextAuth.js
- **Headless CMS**: Sanity CMS for product management
- **Responsive Design**: Modern UI that works on all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **CMS**: Sanity (Headless CMS)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Sanity account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd pos-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pos_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_TOKEN="your-api-token"
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Set up Sanity:
```bash
npx sanity init
```

Follow the prompts to create a new Sanity project or link to an existing one.

6. Run the development server:
```bash
npm run dev
```

7. Open Sanity Studio (in a new terminal):
```bash
npm run sanity
```

Visit:
- App: http://localhost:3000
- Sanity Studio: http://localhost:3333

## Deployment on Vercel

1. Push your code to GitHub

2. Import your project in Vercel

3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` (use Vercel Postgres)
   - `NEXTAUTH_URL` (your Vercel URL)
   - `NEXTAUTH_SECRET` (generate a random string)
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_API_TOKEN`

4. Deploy Sanity Studio:
```bash
npm run sanity:deploy
```

5. Run database migrations:
```bash
npx prisma migrate deploy
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── inventory/         # Inventory page
│   ├── sales-history/     # Sales history page
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── studio/            # Sanity Studio
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/                # Prisma schema
├── sanity/                # Sanity configuration
└── store/                 # Zustand stores
```

## Usage

1. **Sign Up**: Create an account at `/signup`
2. **Login**: Sign in at `/login`
3. **Add Products**: Use Sanity Studio to add products
4. **Process Sales**: Use the Point of Sale page to add items and complete transactions
5. **View Inventory**: Check stock levels and manage products
6. **View Sales**: Review transaction history and revenue

## License

MIT

