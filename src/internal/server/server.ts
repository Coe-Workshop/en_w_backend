import express from "express";
import session from "express-session";
import passport from "@/config/passport";
import setupRoutes from "./router";
import { db } from "@/config/drizzle";

const makeServer = () => {
  const app = express();

  const corsWhitelist = new Set([
    'https://dev-coe.ionize13.com',
    'http://localhost:3000',
  ]);

  app.use((req, res, next) => {
    const origin = req.headers.origin
    if (origin && corsWhitelist.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    }

    // Handle Preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "fallback-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "lax",
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const run = () => {
    const port = process.env.PORT || 8080;

    setupRoutes(app, db);

    app.listen(port, () => {
      console.log(`COE Workshop Backend Service listening on port ${port}`);
    });
  };

  return { run };
};

export default makeServer;
