# AgriAI Backend

Backend API for AgriAI - an agriculture e-commerce platform.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Environment Configuration
NODE_ENV=production
PORT=3600

# MongoDB Connection
MONGO_CONNECTION_URL=mongodb://localhost:27017/agriai

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## Deployment on Render

1. Connect your GitHub repository to Render
2. Set the following environment variables in Render:
   - `NODE_ENV`: production
   - `PORT`: 3600 (or let Render set it automatically)
   - `MONGO_CONNECTION_URL`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `FRONTEND_URL`: Your frontend application URL

3. Build Command: `npm run build`
4. Start Command: `npm start`

## API Endpoints

- `GET /` - Health check
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/products` - Get products
- `POST /api/orders` - Create order
- `GET /api/orders` - Get orders

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- Socket.io for real-time communication
- JWT for authentication
- bcryptjs for password hashing
