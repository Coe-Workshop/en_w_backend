import { GoogleUser } from "@/pkg/models";

declare global {
  namespace Express {
    interface User extends GoogleUser {}
  }
}

export {};
