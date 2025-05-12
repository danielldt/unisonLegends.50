import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { AuthService } from "../services/AuthService";

const router = Router();

// Auth routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Test endpoint to verify tokens
router.post("/verify-token", async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "MISSING_TOKEN",
                    message: "Token is required"
                }
            });
        }

        const player = await AuthService.verifyToken(token);
        
        return res.status(200).json({
            success: true,
            data: {
                player: {
                    id: player.id,
                    username: player.username,
                    email: player.email,
                    userType: player.userType,
                    status: player.status
                }
            }
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: {
                code: "TOKEN_VERIFICATION_FAILED",
                message: error instanceof Error ? error.message : "Token verification failed"
            }
        });
    }
});

export default router; 