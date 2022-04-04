export interface Path {
    uniqueId: number;
    shareId: number;
    path: string;
    thickness: number;
    color: string;
    opacity: number;
    canvasSize?: number;
}

export interface ParamPath {
    thickness: number;
    color: string;
    opacity: number;
}
