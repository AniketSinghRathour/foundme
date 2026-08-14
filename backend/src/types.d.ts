import "express";
import { auth } from "./app/modules/auth/auth.config.js";

type AuthUser = typeof auth.$Infer.Session.user;
type AuthSession = typeof auth.$Infer.Session.session;

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
    session?: AuthSession;
  }
}

declare module "express" {
  export interface Request {
    user?: AuthUser;
    session?: AuthSession;
  }
}
