import { AppDataSource } from "../config/database";
import { Dungeon, DungeonStatus } from "../entities/Dungeon";

export class DungeonService {
    /**
     * Get all active dungeons
     */
    static async getAllDungeons() {
        try {
            const dungeons = await AppDataSource.getRepository(Dungeon)
                .createQueryBuilder("dungeon")
                .where("dungeon.status = :status", { status: DungeonStatus.ACTIVE })
                .orderBy("dungeon.minLevel", "ASC")
                .getMany();
            
            return dungeons;
        } catch (error) {
            console.error("Error fetching dungeons:", error);
            throw new Error("Failed to fetch dungeons");
        }
    }

    /**
     * Get dungeons by type
     */
    static async getDungeonsByType(type: string) {
        try {
            const dungeons = await AppDataSource.getRepository(Dungeon)
                .createQueryBuilder("dungeon")
                .where("dungeon.status = :status", { status: DungeonStatus.ACTIVE })
                .andWhere("dungeon.type = :type", { type })
                .orderBy("dungeon.minLevel", "ASC")
                .getMany();
            
            return dungeons;
        } catch (error) {
            console.error(`Error fetching ${type} dungeons:`, error);
            throw new Error(`Failed to fetch ${type} dungeons`);
        }
    }

    /**
     * Get details of a specific dungeon including waves and rewards
     */
    static async getDungeonDetails(dungeonId: string) {
        try {
            const dungeon = await AppDataSource.getRepository(Dungeon)
                .createQueryBuilder("dungeon")
                .leftJoinAndSelect("dungeon.waves", "waves")
                .leftJoinAndSelect("dungeon.rewards", "rewards")
                .leftJoinAndSelect("rewards.rewardItems", "rewardItems")
                .where("dungeon.id = :id", { id: dungeonId })
                .andWhere("dungeon.status = :status", { status: DungeonStatus.ACTIVE })
                .orderBy("waves.waveNumber", "ASC")
                .getOne();
            
            if (!dungeon) {
                throw new Error("Dungeon not found");
            }
            
            return dungeon;
        } catch (error) {
            console.error("Error fetching dungeon details:", error);
            throw new Error("Failed to fetch dungeon details");
        }
    }
} 