# Campus Buddy – Smart Lost & Found Tracker

A beginner-friendly MERN full-stack application.

## Features
- Register/login with hashed passwords and JWT
- Create, browse, search and filter lost/found items
- Upload images to Cloudinary
- Edit/delete your own posts
- Send claim requests and manage requests on your own items
- Mark items returned
- Admin moderation via `ADMIN_EMAIL`
- Responsive UI

## Prerequisites
- Node.js 20+ and npm
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image uploads)

## 1. Configure the backend
```bash
cd server
npm install
cp .env.example .env
```
Edit `server/.env` and add your MongoDB URI, JWT secret, Cloudinary credentials, and admin email.

For MongoDB Atlas, create a database user and allow your development IP in Network Access. Use the connection string in `MONGODB_URI`. Do not commit `.env`.

For Cloudinary, copy Cloud Name, API Key and API Secret from your dashboard. Never expose the API secret in frontend code.

## 2. Run backend
```bash
npm run dev
```
Backend defaults to `http://localhost:5000`. Check `http://localhost:5000/api/health`.

## 3. Configure and run frontend
Open a second terminal:
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

## 4. Make an admin account
Set `ADMIN_EMAIL` in `server/.env` to the email you will register with. Register with that email. The backend grants admin privileges only when the registered/login email matches this environment setting. Keep that email private and use a strong password.

## 5. Test checklist
1. Register a student account and log in.
2. Create a lost item with a photo.
3. Log out and register a second account.
4. Find the item and submit a claim request.
5. Log back into the first account and review the claim on My Dashboard.
6. Approve/decline the claim and mark the item returned when appropriate.
7. Test search, filters, editing, deleting, and responsive layout.
8. Register with the configured admin email and verify the admin panel.

## API overview
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/items`, `GET /api/items/:id`, `POST /api/items`, `PUT /api/items/:id`, `DELETE /api/items/:id`, `PATCH /api/items/:id/returned`
- `POST /api/items/:id/claims`, `GET /api/claims/mine`, `PATCH /api/claims/:claimId`
- `GET /api/admin/items`, `PATCH /api/admin/items/:id/moderate`, `GET /api/admin/stats`

## Free deployment
### MongoDB Atlas
Create a free cluster if currently available, create a database user, configure Network Access, and copy the connection string.

### Cloudinary
Create an account and copy Cloud Name, API Key, and API Secret.

### Backend on Render
1. Push this folder to a GitHub repository.
2. Create a new **Web Service** from that repository; set Root Directory to `server`.
3. Build command: `npm install`; Start command: `npm start`.
4. Add environment variables from `.env.example`, setting `NODE_ENV=production`, `CLIENT_URL` to your deployed frontend URL, and `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and Cloudinary credentials.
5. Render free services may sleep after inactivity and cold starts can take time. Check the current pricing/limits before deploying.

### Frontend on Vercel
1. Import the same GitHub repository.
2. Set Root Directory to `client` and framework preset to Vite.
3. Add `VITE_API_URL` as the deployed backend URL plus `/api`, e.g. `https://your-service.onrender.com/api`.
4. Deploy, then update backend `CLIENT_URL` to the exact Vercel origin and redeploy/restart the backend.

## Security notes
- Never commit `.env` or expose `JWT_SECRET`, MongoDB credentials, or Cloudinary API secret.
- Use HTTPS in production and a long random JWT secret.
- Public listings must not expose students' private phone numbers by default.
- This is an educational starter. Before real college-wide use, add email verification, rate limiting, stronger moderation/audit logging, image-size limits, and a privacy policy.
