# Hridoy Video Hub - Vercel Deployment Instructions

This project is configured to be deployed on Vercel as a full-stack application.

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **Vercel CLI** (Optional): Install with `npm i -g vercel`.

## Deployment Steps

1.  **Push to GitHub**: Push your code to a GitHub repository.
2.  **Import to Vercel**:
    -   Go to the Vercel Dashboard and click **"New Project"**.
    -   Import your repository.
3.  **Configure Environment Variables**:
    -   In the Vercel project settings, add the following environment variables:
        -   `JWT_SECRET`: A long random string for securing user sessions.
        -   `NODE_ENV`: Set to `production`.
4.  **Deploy**: Click **"Deploy"**.

## Important Notes

### SQLite Persistence
This app uses **SQLite** (`better-sqlite3`) for data storage. 
**Vercel's filesystem is read-only and non-persistent.** 
This means:
-   Any data uploaded or users created will be lost when the serverless function restarts (which happens frequently).
-   The initial seed data will be reset on every cold start.

**For Production:**
It is highly recommended to switch to a hosted database provider:
-   **PostgreSQL**: [Supabase](https://supabase.com) or [Neon](https://neon.tech).
-   **MongoDB**: [MongoDB Atlas](https://www.mongodb.com/atlas).

### Native Modules
`better-sqlite3` is a native C++ module. Vercel usually handles these, but if you encounter build errors, you may need to use a client-side database driver or a different database engine.

## Local Development
To run the project locally:
```bash
npm install
npm run dev
```
The app will be available at `http://localhost:3000`.
