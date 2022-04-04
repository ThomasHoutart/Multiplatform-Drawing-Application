import { KeyModifier } from 'src/interface/key-modifier';

export const DEFAULT_TOOL = 0;
export const FIRST_CHILD = 0;

export const TOOL_TABLE = [
    'TRACE',
    'ERASER',
];

export const DEFAULT_BUTTON_BACKGROUND_COLOR: string[] = ['lightgrey', 'white', 'white',
    'white', 'white', 'white', 'white', 'white', 'black'];
export const TRACE_COMPONENT = 0;
export const SHAPE_COMPONENT = 1;
export const TEXT_COMPONENT  = 2;
export const WRONG_VALUE = 23;
export const TRACE_COMPONENT_INDEX = 0;

export const WHITE = 'white';
export const LIGHTGREY = 'lightgrey';

export const TOOL_SELECTED = 'tool_selected';
export const FAKE_LENGTH = '2';

export const FAKE_KEY_MODIFIER: KeyModifier = {
    shift: false,
    leftKey: false,
    rightKey: false,
};

export const LEFT_KEY = 0;
export const RIGHT_KEY = 2;
export const NUMBER_ONLY_REGEX = '[0-9]*';
export const NAME_REGEX = '[a-zA-Z0-9]*';

export const MIN_PAGE = 0;
export const MAX_PAGE = 2;

export const Z_KEY = 90;
export const Y_KEY = 89;

export const COLOR_TAB = 2;
