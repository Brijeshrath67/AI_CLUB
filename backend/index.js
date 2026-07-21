import express from 'express';
import dotenv from 'dotenv';
import helmet from "helmet";
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from "./src/routes/index.js"
import webhookRoutes from "./src/routes/webhookRoutes.js"
import { redisConnection } from './src/config/redis.js';
import { cleanPending } from './src/jobs/cleaningPending.js';
import { globalLimiter } from './src/middleware/ratelimiter.js';
import passport from "./src/config/passport.js"

dotenv.config();
const app = express();

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'https://fundo-doe.pages.dev'
    ],
    credentials: true
  }
})


// CORS first
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'https://fundo-doe.pages.dev'
  ],
  credentials: true,
}));

// Webhook routes must come BEFORE express.json() (needs raw body)
app.use('/api/webhooks', webhookRoutes);

app.use(express.json({ limit: '10kb'}));
app.use(cookieParser());
app.use(passport.initialize()) 
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://fundo-w77b.onrender.com"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  frameguard: { action: 'deny' },
}));
app.set('trust proxy', 1)  
app.use(globalLimiter)

app.use('/api', routes);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT,async () => {
  cleanPending();
  await redisConnection();
  console.log(`Server running on port ${PORT}`);
});