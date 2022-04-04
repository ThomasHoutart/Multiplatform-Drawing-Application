import { Leaderboard } from 'src/app/models/interface/leaderboard';

export const DAILY = 'Day';
export const WEEKLY = 'Week';
export const ALL_TIME = 'Total';

export const MOCK_LEADERBOARD_1: Leaderboard[] = [
    {
        rank: 1,
        username: 'TomEasy',
        nWins: 9000,
        difficulty: 'Easy',
        mode: 'FFA',
        time: 'Today',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomEasyWeekly',
        nWins: 9000,
        difficulty: 'Easy',
        mode: 'FFA',
        time: 'Week',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomEasyAll',
        nWins: 9000,
        difficulty: 'Easy',
        mode: 'FFA',
        time: 'All',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomMedium',
        nWins: 9000,
        difficulty: 'Normal',
        mode: 'FFA',
        time: 'Today',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomMediumWeekly',
        nWins: 9000,
        difficulty: 'Normal',
        mode: 'FFA',
        time: 'Week',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomMediumAll',
        nWins: 9000,
        difficulty: 'Normal',
        mode: 'FFA',
        time: 'All',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomRare',
        nWins: 9000,
        difficulty: 'Hard',
        mode: 'FFA',
        time: 'Today',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomRareWeekly',
        nWins: 9000,
        difficulty: 'Hard',
        mode: 'FFA',
        time: 'Week',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomRareAll',
        nWins: 9000,
        difficulty: 'Hard',
        mode: 'FFA',
        time: 'All',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomSweety',
        nWins: 9000,
        difficulty: 'Easy',
        mode: 'BR',
        time: 'Today',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomSweetyWeekly',
        nWins: 9000,
        difficulty: 'Easy',
        mode: 'BR',
        time: 'Week',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomSweetyAll',
        nWins: 9000,
        difficulty: 'Easy',
        mode: 'BR',
        time: 'All',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomBloody',
        nWins: 9000,
        difficulty: 'Normal',
        mode: 'BR',
        time: 'Today',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomBloodyWeekly',
        nWins: 9000,
        difficulty: 'Normal',
        mode: 'BR',
        time: 'Week',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomBloodyAll',
        nWins: 9000,
        difficulty: 'Normal',
        mode: 'BR',
        time: 'All',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomPlosion',
        nWins: 9000,
        difficulty: 'Hard',
        mode: 'BR',
        time: 'Today',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomPlosionWeekly',
        nWins: 9000,
        difficulty: 'Hard',
        mode: 'BR',
        time: 'Week',
        avatar: 1
    },
    {
        rank: 1,
        username: 'TomPlosionAll',
        nWins: 9000,
        difficulty: 'Hard',
        mode: 'BR',
        time: 'All',
        avatar: 1
    },
]

export interface PlayerLeaderboard {
    username: string,
    nbOfGameWon: number
}