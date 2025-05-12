import { Schema, MapSchema, type } from "@colyseus/schema";
import { PlayerState } from "./PlayerState";

export class GameState extends Schema {
  @type({ map: PlayerState })
  players = new MapSchema<PlayerState>();

  @type("string")
  gameStatus: string = "waiting";

  @type("number")
  lastUpdateTime: number = Date.now();
} 