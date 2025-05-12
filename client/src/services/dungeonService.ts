import axios from 'axios';
import { authService } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Dungeon types from the server
export enum DungeonType {
    NORMAL = "normal",
    ELITE = "elite",
    RAID = "raid",
    EVENT = "event"
}

// Define the interface for a dungeon
export interface Dungeon {
    id: string;
    name: string;
    description: string;
    type: string;
    difficulty: string;
    status: string;
    minLevel: number;
    maxLevel: number;
    minPlayers: number;
    maxPlayers: number;
    timeLimit: number;
    requiredTicketId?: string;
}

class DungeonService {
    private getHeaders() {
        const token = authService.getCurrentToken();
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    }

    async getAllDungeons(): Promise<Dungeon[]> {
        try {
            const response = await axios.get(`${API_URL}/dungeons`, this.getHeaders());
            return response.data.data.dungeons;
        } catch (error) {
            console.error('Error fetching dungeons:', error);
            throw error;
        }
    }

    async getDungeonsByType(type: string): Promise<Dungeon[]> {
        try {
            const response = await axios.get(`${API_URL}/dungeons/type/${type}`, this.getHeaders());
            return response.data.data.dungeons;
        } catch (error) {
            console.error(`Error fetching ${type} dungeons:`, error);
            throw error;
        }
    }

    async getDungeonDetails(dungeonId: string): Promise<any> {
        try {
            const response = await axios.get(`${API_URL}/dungeons/${dungeonId}`, this.getHeaders());
            return response.data.data.dungeon;
        } catch (error) {
            console.error('Error fetching dungeon details:', error);
            throw error;
        }
    }
}

export const dungeonService = new DungeonService(); 