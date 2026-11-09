# LaunchPad — internship & job opportunities

LaunchPad is a MERN platform for discovering internships and early-career opportunities, submitting applications, and managing listings through an employer workspace.

## Stack

- React + Vite + Lucide icons
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication with bcrypt password hashing

## Run locally

1. Make sure MongoDB is running locally, or provide a hosted `MONGO_URI`.
2. Copy `server/.env.example` to `server/.env` and set the values.
3. Install all dependencies:

   ```bash
   npm run install:all
   ```

4. Seed example opportunities:

   ```bash
   npm run seed
   ```

5. Start the API and frontend together:

   ```bash
   npm run dev
   ```

The frontend runs at `http://localhost:5173` and the API at `http://localhost:5000`.

## Environment variables

Configure these in `server/.env` locally or in the backend Render service:

```text
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-private-jwt-secret
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-admin-password
```

Do not commit `.env` files or real credentials.

## Deploy on Render

### Backend Web Service

- Repository: `keyurpatil2006-sudo/launchpad-job-portal`
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Add the backend environment variables above.

### Frontend Static Site

- Repository: `keyurpatil2006-sudo/launchpad-job-portal`
- Root directory: `client`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Add `VITE_API_URL=https://launchpad-job-portal.onrender.com/api`.

Render automatically redeploys services when new commits are pushed to `main`.

## Included flows

- Search and filter by role, company, domain, and type
- Opportunity detail pages with external listing links
- User registration and login
- Dedicated admin login and logout
- Opportunity create, edit, and delete operations
- Application submission with confirmation feedback
- Employer application inbox backed by MongoDB
- Fallback opportunity data when the API is unavailable

## Validation

```bash
npm run build --prefix client
```

The production frontend build completes successfully.

## Screenshots and presentation

See [PROJECT_PRESENTATION.md](./PROJECT_PRESENTATION.md) and the [screenshots](./screenshots) folder.
