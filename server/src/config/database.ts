import { DataSource } from "typeorm";
import { Player } from "../entities/Player";
import { Item } from "../entities/Item";
import { Spell } from "../entities/Spell";
import { PlayerItem } from "../entities/PlayerItem";
import { PlayerSpell } from "../entities/PlayerSpell";
import { Announcement } from "../entities/Announcement";
import { Mob } from "../entities/Mob";
import { MobSkill } from "../entities/MobSkill";
import { MobSkillMapping } from "../entities/MobSkillMapping";
import { Dungeon } from "../entities/Dungeon";
import { DungeonWave } from "../entities/DungeonWave";
import { DungeonReward } from "../entities/DungeonReward";
import { DungeonRewardItem } from "../entities/DungeonRewardItem";
import path from "path";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: path.join(__dirname, "../../database.sqlite"),
    synchronize: true, // Be careful with this in production
    logging: false, // Disable SQL query logging
    entities: [Player, Item, Spell, PlayerItem, PlayerSpell, Announcement, Mob, MobSkill, MobSkillMapping, Dungeon, DungeonWave, DungeonReward, DungeonRewardItem],
    migrations: [],
    subscribers: [],
}); 