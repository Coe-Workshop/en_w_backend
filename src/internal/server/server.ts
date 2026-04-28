import express from "express";
import session from "express-session";
import passport from "@/config/passport";
import setupRoutes from "./router";
import { db } from "@/config/drizzle";
import { TransactionScheduler } from "@/pkg/scheduler/transaction-scheduler";
import makeTransactionRepository from "@/pkg/transaction/repository";
import { createLoggerMiddleware } from "@/internal/logger/logger";

const makeServer = () => {
  const app = express();
  app.set('trust proxy', 1);

  const corsWhitelist = new Set([
    'https://dev-coe.ionize13.com',
    'https://en-workshop.com',
    'http://localhost:3000',
  ]);

  app.use((req, res, next) => {
    const origin = req.headers.origin
    if (origin && corsWhitelist.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    }

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
  });

  app.use(createLoggerMiddleware());

  app.use((req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      return next();
    }
    express.json()(req, res, next);
  });
  app.use((req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      return next();
    }
    express.urlencoded({ extended: true })(req, res, next);
  });

  const isProduction = process.env.NODE_ENV === "production";

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "fallback-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: isProduction ? "none" : "lax",
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const run = () => {
    const port = process.env.PORT || 8080;

    setupRoutes(app, db);

    const transactionRepository = makeTransactionRepository();
    const transactionScheduler = new TransactionScheduler(db, transactionRepository);
    transactionScheduler.start();

    app.listen(port, () => {
      console.log(`COE Workshop Backend Service listening on port ${port}`);
    });
  };

  return { run };
};

export default makeServer;
