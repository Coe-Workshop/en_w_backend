import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "@/config/passport";
import setupRoutes from "./router";
import { db } from "@/config/drizzle";

const makeServer = () => {
  const app = express();

  const allowedOrigins = [process.env.FRONTEND_URL , "http://localhost:3000"]

  const corsOptions = {  
    origin: (origin: string | undefined, callback: Function) => {  
      if (!origin) return callback(null, true);  

      if (allowedOrigins.includes(origin)) {  
	callback(null, true);
      } else {  
	callback(new Error('Not allowed by CORS')); 
      }  
    },  
    credentials: true,
  };

  app.use(cors(corsOptions));
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
