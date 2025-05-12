import { Schema, type } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("string")
  id!: string;

  @type("string")
  name!: string;

  @type("number")
  level: number = 1;

  @type("number")
  exp: number = 0;

  @type("number")
  gold: number = 0;

  @type("number")
  diamond: number = 0;
  
  @type("number")
  hp: number = 100;

  @type("number")
  maxHp: number = 100;

  @type("number")
  mp: number = 50;

  @type("number")
  maxMp: number = 50;

  @type("number")
  statPoints: number = 10;
  // Equipment slots (8 total: 5 weapons + 3 armor)
  @type("string")
  weapon1: string = "";

  @type("string")
  weapon2: string = "";

  @type("string")
  weapon3: string = "";

  @type("string")
  weapon4: string = "";

  @type("string")
  weapon5: string = "";

  @type("string")
  head: string = "";

  @type("string")
  body: string = "";

  @type("string")
  legs: string = "";

  // Spell slots (5 total)
  @type("string")
  spell1: string = "";

  @type("string")
  spell2: string = "";

  @type("string")
  spell3: string = "";

  @type("string")
  spell4: string = "";

  @type("string")
  spell5: string = "";

  // Stats
  @type("number")
  str: number = 10;

  @type("number")
  int: number = 10;

  @type("number")
  agi: number = 10;

  @type("number")
  dex: number = 10;

  @type("number")
  luk: number = 10;

  // Helper methods for equipment management
  public getEquipmentSlot(slot: number): string {
    switch (slot) {
      case 0: return this.weapon1;
      case 1: return this.weapon2;
      case 2: return this.weapon3;
      case 3: return this.weapon4;
      case 4: return this.weapon5;
      case 5: return this.head;
      case 6: return this.body;
      case 7: return this.legs;
      default: return "";
    }
  }

  public setEquipmentSlot(slot: number, itemId: string): void {
    switch (slot) {
      case 0: this.weapon1 = itemId; break;
      case 1: this.weapon2 = itemId; break;
      case 2: this.weapon3 = itemId; break;
      case 3: this.weapon4 = itemId; break;
      case 4: this.weapon5 = itemId; break;
      case 5: this.head = itemId; break;
      case 6: this.body = itemId; break;
      case 7: this.legs = itemId; break;
    }
  }

  // Helper methods for spell management
  public getSpellSlot(slot: number): string {
    switch (slot) {
      case 0: return this.spell1;
      case 1: return this.spell2;
      case 2: return this.spell3;
      case 3: return this.spell4;
      case 4: return this.spell5;
      default: return "";
    }
  }

  public setSpellSlot(slot: number, spellId: string): void {
    switch (slot) {
      case 0: this.spell1 = spellId; break;
      case 1: this.spell2 = spellId; break;
      case 2: this.spell3 = spellId; break;
      case 3: this.spell4 = spellId; break;
      case 4: this.spell5 = spellId; break;
    }
  }
} 