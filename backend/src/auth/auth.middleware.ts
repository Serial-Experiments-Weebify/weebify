import { Request } from 'express';
import { AuthService } from './auth.service';

/*
    Middleware that puts the user object on the request object
*/

export const authenticateUser = (
    authService: AuthService,
    request: Request,
) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    return authService.me(token);
};
