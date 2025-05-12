import { AppDataSource } from "../config/database";
import { Player, UserType, AccountStatus } from "../entities/Player";
import { Item, ItemCategory } from "../entities/Item";
import { Spell } from "../entities/Spell";
import { PlayerItem } from "../entities/PlayerItem";
import { PlayerSpell } from "../entities/PlayerSpell";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
    private static readonly SALT_ROUNDS = 10;
    private static readonly JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    private static readonly JWT_EXPIRES_IN = "24h";

    static async register(username: string, email: string, password: string): Promise<{ player: Player; token: string }> {
        const playerRepository = AppDataSource.getRepository(Player);
        const itemRepository = AppDataSource.getRepository(Item);
        const spellRepository = AppDataSource.getRepository(Spell);
        const playerItemRepository = AppDataSource.getRepository(PlayerItem);
        const playerSpellRepository = AppDataSource.getRepository(PlayerSpell);

        // Check if username or email already exists
        const existingPlayer = await playerRepository.findOne({
            where: [
                { username },
                { email }
            ]
        });

        if (existingPlayer) {
            throw new Error("Username or email already exists");
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

        // Create new player
        const player = playerRepository.create({
            username,
            email,
            passwordHash,
            userType: UserType.PLAYER,
            status: AccountStatus.ACTIVE
        });

        // Save player first to get the ID
        await playerRepository.save(player);

        // Get starter items by name (items with "Starter" in their name)
        const starterItems = await itemRepository.createQueryBuilder("item")
            .where("item.name LIKE :name", { name: 'Starter %' })
            .getMany();

        

        // Assign starter items to player's inventory
        for (const item of starterItems) {
            // Create player item entry (inventory)
            const playerItem = playerItemRepository.create({
                player,
                item,
                quantity: 1,
                enhancementLevel: 0,
                isEquipped: false
            });
            await playerItemRepository.save(playerItem);
            
    
        }

        // Get starter spells by name (basic spells)
        const starterSpells = await spellRepository.createQueryBuilder("spell")
            .where("spell.name LIKE :name", { name: 'Basic %' })
            .getMany();

        

        // Assign starter spells to player
        for (let i = 0; i < starterSpells.length; i++) {
            const spell = starterSpells[i];
            
            // Create player spell entry (known spells)
            const playerSpell = playerSpellRepository.create({
                player,
                spell,
                level: 1,
                isEquipped: false,
                cooldownRemaining: 0
            });
            await playerSpellRepository.save(playerSpell);
            
           
        }

        // Save player with equipped items and spells
        await playerRepository.save(player);

        // Generate JWT token
        const token = this.generateToken(player);

        return { player, token };
    }

    static async login(username: string, password: string): Promise<{ player: Player; token: string }> {
        const playerRepository = AppDataSource.getRepository(Player);

        // Find player by username
        const player = await playerRepository.findOne({
            where: { username }
        });

        if (!player) {
            throw new Error("Invalid credentials");
        }

        // Check if account is active
        if (player.status !== AccountStatus.ACTIVE) {
            throw new Error("Account is not active");
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, player.passwordHash);
        if (!isValidPassword) {
            // Increment login attempts
            player.loginAttempts += 1;
            player.lastLoginAttemptAt = new Date();
            await playerRepository.save(player);

            throw new Error("Invalid credentials");
        }

        // Reset login attempts on successful login
        player.loginAttempts = 0;
        player.lastLoginAt = new Date();
        await playerRepository.save(player);

        // Generate JWT token
        const token = this.generateToken(player);

        return { player, token };
    }

    static async verifyToken(token: string): Promise<Player> {
        try {
            
            
            // Verify the token
            const decoded = jwt.verify(token, this.JWT_SECRET) as { id: string };
            
            
            // Get the player from database
            const playerRepository = AppDataSource.getRepository(Player);
            const player = await playerRepository.findOne({
                where: { id: decoded.id }
            });

            if (!player) {
                console.error(`Player not found with ID: ${decoded.id}`);
                throw new Error("Player not found");
            }

            // Check if account is active
            if (player.status !== AccountStatus.ACTIVE) {
                console.error(`Player account is not active: ${player.id}`);
                throw new Error("Account is not active");
            }

            return player;
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                console.error(`JWT Error: ${error.message}`);
                throw new Error(`Invalid token: ${error.message}`);
            } else if (error instanceof jwt.TokenExpiredError) {
                console.error('Token expired');
                throw new Error("Token expired");
            } else {
                console.error(`Token verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                throw error;
            }
        }
    }

    private static generateToken(player: Player): string {
        return jwt.sign(
            { id: player.id, username: player.username, userType: player.userType },
            this.JWT_SECRET,
            { expiresIn: this.JWT_EXPIRES_IN }
        );
    }
} 