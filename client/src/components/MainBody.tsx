import React from 'react';
import CharacterPanel from './character/CharacterPanel';
import { authService } from '../services/authService';

const MainBody: React.FC = () => {
  const player = authService.getCurrentPlayer() || {
    username: 'player',
    level: 1,
    hp: 150,
    maxHp: 150,
    mp: 65,
    maxMp: 65,
    exp: 0,
    maxExp: 100,
    str: 10,
    agi: 5,
    int: 5,
    dex: 5,
    luk: 5,
    attack: 32,
    defense: 12,
    critRate: 7,
    speed: 110
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-3 p-2">
      <CharacterPanel player={player} />
    </div>
  );
};

export default MainBody; 