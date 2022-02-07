import { PRIMARY_COLOR, SECONDARY_COLOR } from '../constant';

export const DRAWING_HEIGHT = 'drawingHeight';
export const DRAWING_WIDTH = 'drawingWidth';

export const OPTION_GRID_SIZE = 'option_grid_size';
export const OPTION_GRID_OPACITY = 'option_grid_opacity';
export const OPTION_GRID_SHOWN = 'option_grid_shown';

export const ERASER_DIAMETER = 'eraser_diameter';

export const TRACE_SELECTED = 'trace_selected';

export const PENCIL_OPTION_THICKNESS = 'trace_pencil_option_thickness';

export const TUTORIAL = 'tutorial';
export const ENABLE = 'true';
export const DISABLE = 'false';
export const NOT_DEACTIVATED = false;
export const DEACTIVATED = true;
export const LOCAL_STORAGE = false;
export const SESSION_STORAGE = true;
export const ERROR = 'ERROR';

export const ALL_STORAGE_ELEMENT: string[] = [
    PENCIL_OPTION_THICKNESS,
    PRIMARY_COLOR,
    SECONDARY_COLOR,
    TUTORIAL,
    ERASER_DIAMETER,
    OPTION_GRID_OPACITY,
    OPTION_GRID_SHOWN,
    OPTION_GRID_SIZE,
];

export const DEFAULT_STORAGE_VALUE: string[] = [
    '5',
    'black',
    'white',
    'true',
    '5',
    '100',
    'true',
    '10',
];
