import { Request, Response } from "express";
import { DungeonService } from "../services/DungeonService";
import { DungeonType } from "../entities/Dungeon";

export class DungeonController {
    static async getAllDungeons(req: Request, res: Response) {
        try {
            const dungeons = await DungeonService.getAllDungeons();
            
            return res.status(200).json({
                success: true,
                data: {
                    dungeons
                }
            });
        } catch (error) {
            console.error("Error in getAllDungeons:", error);
            return res.status(500).json({
                success: false,
                error: {
                    code: "FETCH_FAILED",
                    message: "Failed to fetch dungeons"
                }
            });
        }
    }

    static async getDungeonsByType(req: Request, res: Response) {
        try {
            const { type } = req.params;
            
            // Validate dungeon type
            const validTypes = Object.values(DungeonType);
            if (!validTypes.includes(type as DungeonType)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "INVALID_TYPE",
                        message: `Invalid dungeon type. Valid types are: ${validTypes.join(', ')}`
                    }
                });
            }
            
            const dungeons = await DungeonService.getDungeonsByType(type);
            
            return res.status(200).json({
                success: true,
                data: {
                    dungeons
                }
            });
        } catch (error) {
            console.error("Error in getDungeonsByType:", error);
            return res.status(500).json({
                success: false,
                error: {
                    code: "FETCH_FAILED",
                    message: "Failed to fetch dungeons by type"
                }
            });
        }
    }

    static async getDungeonDetails(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "MISSING_ID",
                        message: "Dungeon ID is required"
                    }
                });
            }
            
            const dungeon = await DungeonService.getDungeonDetails(id);
            
            return res.status(200).json({
                success: true,
                data: {
                    dungeon
                }
            });
        } catch (error) {
            if (error instanceof Error && error.message === "Dungeon not found") {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: "Dungeon not found"
                    }
                });
            }
            
            console.error("Error in getDungeonDetails:", error);
            return res.status(500).json({
                success: false,
                error: {
                    code: "FETCH_FAILED",
                    message: "Failed to fetch dungeon details"
                }
            });
        }
    }
} 