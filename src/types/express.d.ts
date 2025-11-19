import { GoogleUser } from './user';

declare global {
    namespace Express {
        interface User extends GoogleUser {}
    }
}

export {};