import { NewDrawing } from 'src/interface/new-drawing';

export const ZERO = 0;
export const ONE = 1;
export const TWO = 2;
export const THREE = 3;
export const FIVE = 5;
export const SEVEN = 7;
export const FIFTEEN = 15;
export const TIRTHY = 30;
export const FORTY_FIVE = 45;
export const THREE_HUNDRED_SIXTY = 360;
export const MINUS_EIGHT = -8;
export const SPACE = ' ';
export const COMMA = ',';
export const LEFT_PARENTHESIS = '(';
export const RIGHT_PARENTHESIS = ')';
export const IS_NOT_IN_ARRAY = -1;

export const DECIMAL = 10;
export const HEXADECIMAL = 16;

export const NO_VALUE = '';

export const PRIMARY_COLOR = 'primaryColor';
export const SECONDARY_COLOR = 'secondaryColor';

export class MockElementRef {
  nativeElement: {
  };
  getBoundingClientRect(): string {
  	return 'abc';
  }
}

export const BASIC_INFO: NewDrawing = {
    height: 550,
    width: 650,
    color: "white"
}

export const COMPONENT_TEST_DEFAULT_TIMEOUT = 30000;
