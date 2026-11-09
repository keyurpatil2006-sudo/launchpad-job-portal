# Launchpad — internship & job opportunities

A small MERN platform for discovering opportunities and collecting applications.

## Stack

- React + Vite + Lucide icons
- Node.js + Express
- MongoDB + Mongoose

## Run locally

1. Make sure MongoDB is running locally, or set `MONGO_URI` to a hosted MongoDB connection string.
2. Copy `server/.env.example` to `server/.env` and update the connection string if needed.
3. Install dependencies:

   ```bash
   npm run install:all
   ```

4. Seed the database with example opportunities:

   ```bash
   npm run seed
   ```

5. Start the API and client together:

   ```bash
   npm run dev
   ```

The client runs at `http://localhost:5173` and the API at `http://localhost:5000`.

## Included flows

- Search and filter by role, company, domain, and type
- Opportunity detail pages with an external listing link
- Application submission with confirmation toast
- Employer workspace for adding, editing, and deleting listings
- Application inbox backed by MongoDB

The client includes a small fallback dataset so the browsing experience remains visible while the API or database is unavailable. Writes are sent to the API whenever it is running.
