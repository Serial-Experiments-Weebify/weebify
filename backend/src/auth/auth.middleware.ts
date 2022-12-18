import { Request } from 'express';
import { AuthService } from './auth.service';

/*
    Middleware that puts the user object on the request object
*/

export const authenticateUser = async (
    authService: AuthService,
    request: Request,
) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    return await authService.me(token);
};
