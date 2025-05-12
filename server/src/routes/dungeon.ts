import express from "express";
import { DungeonController } from "../controllers/DungeonController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Apply authentication middleware to all dungeon routes
router.use(authMiddleware);

// Get all dungeons
router.get("/", DungeonController.getAllDungeons);

// Get dungeons by type
router.get("/type/:type", DungeonController.getDungeonsByType);

// Get dungeon details
router.get("/:id", DungeonController.getDungeonDetails);

export default router; 