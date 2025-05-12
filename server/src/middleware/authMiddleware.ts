import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

// Extend Express Request type to include auth property
declare global {
    namespace Express {
        interface Request {
            auth?: {
                playerId: string;
            };
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get the token from the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication token is required'
                }
            });
        }

        const token = authHeader.split(' ')[1];
        
        try {
            // Verify the token and get player
            const player = await AuthService.verifyToken(token);
            
            // Add player id to the request object
            req.auth = {
                playerId: player.id
            };
    
            next();
            return; // Explicitly return to satisfy TypeScript
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: error instanceof Error ? error.message : 'Invalid authentication token'
                }
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'AUTH_ERROR',
                message: 'Authentication error'
            }
        });
    }
}; 