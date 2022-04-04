import { ColorRGBA } from 'src/interface/colors';

export const CANVAS_BACKGROUND_COLOR = '#808080FF';
export const MAX_OPACITY_VALUE = 255;
export const ZERO = 0;
export const ONE = 1;
export const TWO = 2;
export const BASE_TEN = 10;
export const NUMBER_OF_USED_COLORS = 9;
export const OPACITY_MAX = 1;
export const OPACITY_MIN = 1;
export const DEFAULT_COLOR = {red: 255, green: 255, blue: 255, opacity: OPACITY_MAX} as ColorRGBA;
export const MAX_X_CANVAS_POSITION = 159;
export const MIN_X_CANVAS_POSITION = 0;
export const MAX_Y_CANVAS_POSITION = 0;
export const MIN_Y_CANVAS_POSITION = 159;
export const COLOR_GRADIENT_START = 0;
export const COLOR_GRADIENT_END = 1;

export const MAX_COLOR_POSITION = 1;
export const RAINBOW_GRADIENT_ARRAY = [
    {position: 0,    color: 'rgba(255, 0, 0, 1)'},
    {position: 0.17, color: 'rgba(255, 255, 0, 1)'},
    {position: 0.34, color: 'rgba(0, 255, 0, 1)'},
    {position: 0.51, color: 'rgba(0, 255, 255, 1)'},
    {position: 0.68, color: 'rgba(0, 0, 255, 1)'},
    {position: 0.85, color: 'rgba(255, 0, 255, 1)'},
    {position: 1,    color: 'rgba(255, 0, 0, 1)'},
];

export const COLOR_SLIDER_DIMENSIONS = {
    x: 0,
    y: 0,
    lineWidth: 5,
    height: 10,
    middle: 10,
};

export const MAX_OPACITY_POSITION = 0;
export const OPACITY_SLIDER_DIMENSIONS = {
    x: 0,
    y: 0,
    lineWidth: 5,
    height: 10,
};
export const USED_COLORS = ['usedColor0',
    'usedColor1',
    'usedColor2',
    'usedColor3',
    'usedColor4',
    'usedColor5',
    'usedColor6',
    'usedColor7',
    'usedColor8',
    'usedColor9'];
export const INITIAL_COLOR_ARRAY = [
    {red: 255, green: 0, blue: 0, opacity: 255} as ColorRGBA,
    {red: 255, green: 255, blue: 0, opacity: 255} as ColorRGBA,
    {red: 255, green: 0, blue: 255, opacity: 255} as ColorRGBA,
    {red: 255, green: 122, blue: 123, opacity: 255} as ColorRGBA,
    {red: 0, green: 255, blue: 0, opacity: 255} as ColorRGBA,
    {red: 122, green: 255, blue: 123, opacity: 255} as ColorRGBA,
    {red: 122, green: 255, blue: 0, opacity: 255} as ColorRGBA,
    {red: 0, green: 0, blue: 255, opacity: 255} as ColorRGBA,
    {red: 255, green: 0, blue: 255, opacity: 255} as ColorRGBA,
    {red: 255, green: 123, blue: 255, opacity: 255} as ColorRGBA,
];

export const INITIAL_PRIMARY_COLOR   = '#000000ff';
export const INITIAL_SECONDARY_COLOR = '#999999ff';

export const DEFAULT_BWSELECTOR_POSITION = {x: 159, y: 0};
export const BWSELECTOR_CANVAS_COORDIANTES = {x: 0, y: 0, width: 160, height: 160};
export const BWSELECTOR_GRADIENT_START = 0.05;
export const BWSELECTOR_GRADIENT_END = 0.95;
export const BWSELECTOR_SLIDER_DIMENSIONS = {
    lineWidth: 3,
    radius: 5,
    startAngle: 0,
    endAngle: 2 * Math.PI,
};

export const WHITE_OPAQUE = 'rgba(255,255,255,1)';
export const WHITE_CLEAR  = 'rgba(255,255,255,0)';
export const BLACK_OPAQUE = 'rgba(0,0,0,1)';
export const BLACK_CLEAR  = 'rgba(0,0,0,0)';
export const RGBA = 'rgba(';
export const COMMA = ',';
export const BRACKET_ONE = ',1)';
export const BRACKET_ZERO = ',0)';
export const HEX_REGEX = '([0-9]|[abcdef]|[#])*';
export const HEX_REGEX_FLAG = 'gi';
export const HEX_LENGTH = 9;
export const PRIMARY_CANVAS = 'primaryCanvas';
export const SECONDARY_CANVAS = 'secondaryCanvas';
export const KEYBOARD_ARROW_UP = 'ArrowUp';
export const KEYBOARD_ARROW_DOWN = 'ArrowDown';
export const KEYBOARD_ARROW_RIGHT = 'ArrowRight';
export const KEYBOARD_ARROW_LEFT = 'ArrowLeft';
