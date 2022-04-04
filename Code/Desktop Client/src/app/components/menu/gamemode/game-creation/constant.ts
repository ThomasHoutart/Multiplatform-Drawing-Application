import { Lobby } from 'src/app/models/interface/lobby';

export const EASY = 'Easy';
export const NORMAL = 'Normal';
export const HARD = 'Hard';

export const FREE_FOR_ALL = 'FFA';
export const BATTLE_ROYALE = 'BR';

export const MOCK_LOBBY_LIST: Lobby[] = [
    {gameName: "lobby1", playerCount: 2},
    {gameName: "lobby1", playerCount: 4},
    {gameName: "lobby1", playerCount: 4},
    {gameName: "LE LOBBY DES COOLS", playerCount: 1},
    {gameName: "lobby2", playerCount: 6},
    {gameName: "lobby3", playerCount: 0}]