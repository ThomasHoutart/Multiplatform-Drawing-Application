import { ChatMessage, ChatMessageDesktop } from 'src/app/models/interface/chat-message-desktop';

export const IMAGE_PROTOTYPE_1 = 'assets/Images/PROTOTYPE_AVATAR_1.png';
export const IMAGE_PROTOTYPE_2 = 'assets/Images/PROTOTYPE_AVATAR_2.png';

export const DEFAULT_MESSAGE = 'Tom est une beast!';
export const DEFAULT_USERNAME_1 = 'Tom';
export const DEFAULT_USERNAME_2 = 'Willy';

export const TEXT_BOX = 'TextBox';
export const RECEIVER_TEXTBOX = 'received';
export const TYPE_SENDER = 0;
export const TYPE_RECEIVER = 1;
export const TYPE_SYSTEM = 2;
export const DIV = 'div';
export const IMG = 'img';
export const SRC = 'src';
export const P = 'p';
export const SPAN = 'span';
export const TIME_STAMP = 'timeStamp';
export const RECEIVER_TEXT = 'white';
export const RECEIVER_IMAGE = 'right';
export const NAME = 'name';
export const SYSTEM = 'system';

export const TIME_SEPARATOR = ':';

export const DEFAULT_SENT_MESSAGE: ChatMessage = {
    content: 'Salut bonjour',
    author: 'tommy',
    timestamp: '5 o clock somewhere Am I right hehehehehhehehe',
    roomName: 'NoneOfYaBizz',
    avatar: 1,
};

export const MOCK_DESKTOP_CHAT_MESSAGE: ChatMessageDesktop = {
    chatMessage: DEFAULT_SENT_MESSAGE,
    type: 0,
};

export const EMPTY = '';
