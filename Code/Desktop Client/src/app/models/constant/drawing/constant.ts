import { ParamPath, Path } from 'src/interface/trace/pencil';
import { GridParam } from '../../interface/grid-element';

export const EMPTY_PATH: Path = {} as Path;

export const DEFAULT_PATH_PARAM: ParamPath = {
    thickness: 5,
    color: '#000000',
    opacity: 1,
}

export const DEFAULT_GRID_PARAM: GridParam = {
    size: 25,
    opacity: 1,
}

export const SERVER_LINK = 'https://draw-hub.herokuapp.com';
