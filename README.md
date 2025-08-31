## Lost & Found – Full‑Stack MERN App

A full‑stack Lost & Found application built with React and Tailwind on the client, and Node.js/Express with MongoDB (Mongoose) on the server. It supports user authentication (JWT), item reporting, moderation workflow (approve/reject), and claiming items. Includes a simple insurance‑style claim module example.

---

### Tech Stack

- **Client**: React 18, React Router, Vite, Tailwind CSS, Lucide Icons, React Hot Toast
- **Server**: Node.js, Express, Mongoose, JSON Web Tokens, bcryptjs, CORS, dotenv
- **Database**: MongoDB

---

### Monorepo Layout

```
client/           # Vite + React frontend
server/           # Express + Mongoose backend
```

---

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or cloud, e.g., Atlas)

---

### Quick Start

1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

2. Configure environment

- Copy `server/env.example` to `server/.env` and update the values:

```bash
cp server/env.example server/.env
```

- Edit `server/.env` with your configuration:

```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/lostfound
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

3. Run the backend

```bash
cd server
npm start
```

Backend runs at `http://localhost:5000`.

4. Run the frontend (in another terminal)

```bash
cd client
npm run dev
```

Frontend runs by default at `http://localhost:5173`. Vite proxy forwards `/api` to `http://localhost:5000`.

---

### Client Overview (client/)

- Entry: `src/main.jsx`, `src/App.jsx`
- Routing: `react-router-dom`
- Context: `src/context/AuthContext.jsx`, `src/context/ItemsContext.jsx`
- Components: `Navbar`, `ItemCard`, `ProtectedRoute`
- Pages: `Home`, `Login`, `Register`, `SubmitItem`, `ModeratorDashboard`
- Dev scripts:
  - `npm run dev` – start Vite dev server
  - `npm run build` – production build
  - `npm run preview` – preview built app
  - `npm run lint` – run ESLint

Vite dev server proxies API requests via `vite.config.ts`:

```ts
server: { proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } } }
```

---

### Server Overview (server/)

- Entry: `server.js`
- Scripts:
  - `npm start` – start Express API

Middleware

- JSON body parsing: `express.json()`
- CORS: allows `http://localhost:5173` and `http://127.0.0.1:5173`
- Auth: `protect` verifies `Authorization: Bearer <token>` with `JWT_SECRET`
- Authorization: `authorize(role)` for role‑based access

Database

- Mongoose connection uses `MONGO_URI`

---

### Data Models (server/models)

User (`User.js`)

```js
name: string, required
email: string, unique, required
passwordHash: string, required
role: 'user' | 'moderator' (default 'user')
timestamps: true
```

Item (`Item.js`)

```js
title, description, category, location
dateReported: Date (default now)
status: 'Pending' | 'Approved' | 'Claimed' | 'Rejected' (default 'Pending')
reportedBy: ObjectId<User>
claimantId?: ObjectId<User>
claimDate?: Date
approvedBy?: ObjectId<User>
```

Item Claiming – integrated into Item model

```js
claimantId: ObjectId<User> (when item is claimed)
claimDate: Date (when item was claimed)

```

---

### Authentication

- Register: POST `/api/auth/register`
- Login: POST `/api/auth/login` → returns `{ token, user: { id, name, role } }`
- Protected routes require header: `Authorization: Bearer <JWT>`

JWT Payload example: `{ id: <userId>, role: 'user' | 'moderator' }`, expires in 1 day.

---

### API Endpoints

Base URL: `http://localhost:5000/api`

- Auth (`/auth`)

  - `POST /register` – create account `{ name, email, password, role? }`
  - `POST /login` – authenticate `{ email, password }`
  - `GET /profile` – get current user (requires `protect`)

- Items (`/items`)

  - `POST /` – report new item (requires `protect`)
  - `GET /` – get all items (requires `protect` – intended for admin/debug)
  - `GET /approved` – list approved items (public)
  - `GET /:id` – get item by id (public)
  - `PUT /:id` – update item (approve/reject, general updates) (requires `protect`)
  - `DELETE /:id` – delete item (requires `protect`)
  - `POST /:id/claim` – claim an item (requires `protect`)

- Moderator (`/moderator`) – requires `protect` (and typically moderator role)

  - `GET /pending` – list pending items
  - `PUT /approve/:id` – approve item
  - `PUT /reject/:id` – reject item

- Item Claiming – integrated into items
  - `POST /items/:id/claim` – claim an item (requires `protect`)
  - `POST /moderator/claim/:id` – claim item with

Note: Some routes check only `protect` in code; for production, combine with role checks (e.g., moderators only for approvals) using `authorize('moderator')`.

---

### Example Requests

Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret","role":"user"}'
```

Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret"}'
```

Report Item (requires token)

```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{"title":"Wallet","description":"Black leather","location":"Cafeteria","category":"Accessories"}'
```

Approve Item (moderator)

```bash
curl -X PUT http://localhost:5000/api/moderator/approve/<ITEM_ID> \
  -H "Authorization: Bearer <JWT>"
```

---

### Development Notes

- The client dev server proxies `/api` to the backend; no need to hardcode backend URL.
- CORS allows localhost ports 5173 and 127.0.0.1:5173 by default.
- Update role protection as needed using `authorize('moderator')` for sensitive endpoints.

---

### Production

- Build client: `cd client && npm run build`. Serve the `dist/` via your hosting/CDN or reverse proxy through the API server.
- Configure environment variables on your hosting for `MONGO_URI` and `JWT_SECRET`.
- Behind a reverse proxy (e.g., Nginx), route `/api` to the Node server and static assets to the built client.

---

### Troubleshooting

- "Error connecting to MongoDB": verify `MONGO_URI` and Mongo instance availability.
- 401 Unauthorized: ensure `Authorization: Bearer <JWT>` header and a valid `JWT_SECRET`.
- CORS errors in browser: confirm frontend URL is allowed in `server.js` CORS config.

---

### License

This project is provided as‑is without a specific license declared. Add a license if you plan to distribute.
