import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const { username, email, password } = req.body;

            // Validate input
            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "MISSING_FIELDS",
                        message: "Username, email, and password are required"
                    }
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "INVALID_EMAIL",
                        message: "Invalid email format"
                    }
                });
            }

            // Validate password strength
            if (password.length < 8) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "WEAK_PASSWORD",
                        message: "Password must be at least 8 characters long"
                    }
                });
            }

            const { player, token } = await AuthService.register(username, email, password);

            return res.status(201).json({
                success: true,
                data: {
                    player: {
                        id: player.id,
                        username: player.username,
                        email: player.email,
                        userType: player.userType,
                        status: player.status
                    },
                    token
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "REGISTRATION_FAILED",
                        message: error.message
                    }
                });
            }
            return res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An unexpected error occurred"
                }
            });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "MISSING_FIELDS",
                        message: "Username and password are required"
                    }
                });
            }

            const { player, token } = await AuthService.login(username, password);

            return res.status(200).json({
                success: true,
                data: {
                    player: {
                        id: player.id,
                        username: player.username,
                        email: player.email,
                        userType: player.userType,
                        status: player.status,
                        gold: player.gold,
                        diamond: player.diamond
                    },
                    token
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: "LOGIN_FAILED",
                        message: error.message
                    }
                });
            }
            return res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An unexpected error occurred"
                }
            });
        }
    }
} 