import { Room, Client } from "colyseus";

interface GameState {
  players: Record<string, any>;
  // Add other state properties as needed
}

export class GameService {
  private room: Room | null = null;
  private playerState: GameState = { players: {} };

  constructor() {
    // Constructor now only initializes the service
  }

  setRoom(room: Room) {
    this.room = room;
  }

  // Used by GameRoom to broadcast messages to clients
  broadcastMessage(type: string, message: any) {
    if (this.room) {
      this.room.broadcast(type, message);
    }
  }

  // Used by GameRoom to send message to a specific client
  sendMessage(client: Client, type: string, message: any) {
    if (this.room) {
      client.send(type, message);
    }
  }

  // Update player state from the room
  updatePlayerState(state: GameState) {
    this.playerState = state;
  }

  getPlayerState() {
    return this.playerState;
  }

  isConnected() {
    return !!this.room;
  }
} 