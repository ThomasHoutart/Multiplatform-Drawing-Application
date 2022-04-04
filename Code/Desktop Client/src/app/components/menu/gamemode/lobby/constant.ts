import { UserInLobby } from 'src/app/models/interface/lobby';

export const PLAYER_LIST_MOCK: UserInLobby[] = [{username: "Maxime", avatar: 1, role: "Host", host: true},{username: "Micheline", avatar: 1,  role: "", host: false},{username: "Lola", avatar: 1,  role: "Spectator", host: false}];
export const LOBBY_INFOS_MOCK = {gameName: "Lobby des cools", difficulty: "Hard", username: "test12", gameMode: "Free For All" }
