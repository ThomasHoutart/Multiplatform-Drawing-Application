export const WORD_IMAGE_PAIR_KEYS = [
    "hashSocketId",
    "word",
    "canvasSize",
    "paths",
    "hints",
    "difficulty",
]

export type WordImagePair = {
    artist: string,
    word: string,
    canvasSize: number,
    paths: string,
    hints: string,
    difficulty: string,
}

export type WordImagePairQuery = {
    artist?: string,
    word?: string,
    difficulty?: string,
}