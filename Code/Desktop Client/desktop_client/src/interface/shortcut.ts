
export interface Shortcut {
    key: string;
    isCtrl: boolean;
}

export enum optionShortcut {
    'o' = 0,
    'O' = 0,
    's' = 1,
    'S' = 1,
    'g' = 2,
    'G' = 2,
    'e' = 3,
    'E' = 3,
    't' = 4,
    'T' = 4,
}

export enum toolShortcut {
    'c' = 0,
    'C' = 0,
    'w' = 0,
    'W' = 0,
    'p' = 0,
    'P' = 0,
    'y' = 0,
    'Y' = 0,
    'a' = 0,
    'A' = 0,
    'l' = 1,
    'L' = 1,
    't' = 3,
    'T' = 3,
    'r' = 2,
    'R' = 2,
    'e' = 7,
    'E' = 7,
    'i' = 4,
    'I' = 4,
    'u' = 5,
    'U' = 5,
    's' = 6,
    'S' = 6,
    'b' = 8,
    'B' = 8,
}

export enum traceShortcut {
    'c' = 'trace_pencil',
    'C' = 'trace_pencil',
    'w' = 'trace_brush',
    'W' = 'trace_brush',
    'y' = 'trace_pen',
    'Y' = 'trace_pen',
    'p' = 'trace_feather',
    'P' = 'trace_feather',
    'a' = 'trace_spray',
    'A' = 'trace_spray',
}

export enum gridOptionShortcut {
    'q' = 0,
    'Q' = 0,
    'g' = 1,
    'G' = 1,
    'm' = 2,
    'M' = 2,
}
